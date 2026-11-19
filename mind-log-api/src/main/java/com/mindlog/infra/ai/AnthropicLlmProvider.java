package com.mindlog.infra.ai;

import com.anthropic.client.AnthropicClient;
import com.anthropic.core.JsonValue;
import com.anthropic.errors.AnthropicException;
import com.anthropic.errors.AnthropicIoException;
import com.anthropic.errors.AnthropicServiceException;
import com.anthropic.errors.RateLimitException;
import com.anthropic.models.messages.JsonOutputFormat;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.OutputConfig;
import com.mindlog.services.exceptions.AIProviderException;
import com.mindlog.services.exceptions.AIRateLimitException;
import com.mindlog.services.exceptions.AIResponseParseException;
import com.mindlog.services.exceptions.AITimeoutException;
import lombok.extern.slf4j.Slf4j;

import java.net.SocketTimeoutException;
import java.net.http.HttpTimeoutException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/** Implementação do {@link LlmProvider} sobre a Claude API (SDK oficial). */
@Slf4j
public class AnthropicLlmProvider implements LlmProvider {

    private final AnthropicClient client;
    private final String model;

    public AnthropicLlmProvider(AnthropicClient client, String model) {
        this.client = client;
        this.model = model;
    }

    @Override
    public LlmResponse generateJson(LlmRequest request) {
        MessageCreateParams params = MessageCreateParams.builder()
                .model(model)
                .maxTokens((long) request.maxOutputTokens())
                .system(request.system())
                .addUserMessage(request.userContent())
                .outputConfig(OutputConfig.builder()
                        .effort(OutputConfig.Effort.LOW)
                        .format(JsonOutputFormat.builder().schema(toSchema(request.jsonSchema())).build())
                        .build())
                .build();

        Message message = call(params);

        String stopReason = message.stopReason().map(Object::toString).orElse("");
        if (stopReason.contains("refusal"))
            throw new AIProviderException("The AI provider declined the request.");
        if (stopReason.contains("max_tokens"))
            throw new AIResponseParseException("The AI response was cut off.");

        String json = message.content().stream()
                .flatMap(block -> block.text().stream())
                .map(text -> text.text())
                .collect(Collectors.joining());
        if (json.isBlank())
            throw new AIResponseParseException("The AI response was empty.");

        return new LlmResponse(json, model, message.usage().inputTokens(), message.usage().outputTokens());
    }

    private Message call(MessageCreateParams params) {
        try {
            return client.messages().create(params);
        } catch (RateLimitException e) {
            log.warn("AI provider rate limit reached");
            throw new AIRateLimitException("The AI provider is busy. Try again later.");
        } catch (AnthropicServiceException e) {
            log.warn("AI provider returned status {}", e.statusCode());
            throw new AIProviderException("The AI provider is unavailable.");
        } catch (AnthropicIoException e) {
            if (isTimeout(e)) {
                log.warn("AI provider timed out");
                throw new AITimeoutException("The AI provider took too long to answer.");
            }
            log.warn("AI provider connection failed: {}", e.getClass().getSimpleName());
            throw new AIProviderException("The AI provider is unreachable.");
        } catch (AnthropicException e) {
            log.warn("AI provider call failed: {}", e.getClass().getSimpleName());
            throw new AIProviderException("The AI provider call failed.");
        }
    }

    private boolean isTimeout(Throwable e) {
        for (Throwable t = e; t != null; t = t.getCause())
            if (t instanceof SocketTimeoutException || t instanceof HttpTimeoutException) return true;
        return false;
    }

    private JsonOutputFormat.Schema toSchema(Map<String, Object> schema) {
        Map<String, JsonValue> properties = new LinkedHashMap<>();
        schema.forEach((key, value) -> properties.put(key, JsonValue.from(value)));
        return JsonOutputFormat.Schema.builder().additionalProperties(properties).build();
    }
}

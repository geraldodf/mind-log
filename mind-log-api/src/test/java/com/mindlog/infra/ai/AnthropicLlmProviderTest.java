package com.mindlog.infra.ai;

import com.anthropic.client.AnthropicClient;
import com.anthropic.errors.AnthropicIoException;
import com.anthropic.errors.OverloadedException;
import com.anthropic.errors.RateLimitException;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.StopReason;
import com.anthropic.models.messages.TextBlock;
import com.anthropic.models.messages.Usage;
import com.anthropic.services.blocking.MessageService;
import com.mindlog.services.exceptions.AIProviderException;
import com.mindlog.services.exceptions.AIRateLimitException;
import com.mindlog.services.exceptions.AIResponseParseException;
import com.mindlog.services.exceptions.AITimeoutException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.net.SocketTimeoutException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AnthropicLlmProviderTest {

    private static final LlmRequest REQUEST = new LlmRequest("system", "<library_data>\n{}\n</library_data>",
            Map.of("type", "object", "properties", Map.of(), "additionalProperties", false), 500);

    private MessageService messages;
    private AnthropicLlmProvider provider;

    @BeforeEach
    void setUp() {
        AnthropicClient client = mock(AnthropicClient.class);
        messages = mock(MessageService.class);
        when(client.messages()).thenReturn(messages);
        provider = new AnthropicLlmProvider(client, "claude-haiku-5-5");
    }

    private Message reply(String text, String stopReason) {
        return Message.builder()
                .id("msg_test")
                .model("claude-haiku-5-5")
                .container(Optional.empty())
                .diagnostics(Optional.empty())
                .stopDetails(Optional.empty())
                .stopReason(StopReason.of(stopReason))
                .stopSequence(Optional.empty())
                .addContent(TextBlock.builder().text(text).citations(Optional.empty()).build())
                .usage(Usage.builder()
                        .inputTokens(120L)
                        .outputTokens(80L)
                        .outputTokensDetails(Optional.empty())
                        .speed(Optional.empty())
                        .cacheCreation(Optional.empty())
                        .cacheCreationInputTokens(Optional.empty())
                        .cacheReadInputTokens(Optional.empty())
                        .inferenceGeo(Optional.empty())
                        .serverToolUse(Optional.empty())
                        .serviceTier(Optional.empty())
                        .build())
                .build();
    }

    @Test
    void generateJson_returnsTextAndUsage_andSendsTheConfiguredModel() {
        when(messages.create(any(MessageCreateParams.class))).thenReturn(reply("{\"recommendations\":[]}", "end_turn"));

        LlmResponse response = provider.generateJson(REQUEST);

        assertThat(response.json()).isEqualTo("{\"recommendations\":[]}");
        assertThat(response.model()).isEqualTo("claude-haiku-5-5");
        assertThat(response.inputTokens()).isEqualTo(120L);
        assertThat(response.outputTokens()).isEqualTo(80L);

        ArgumentCaptor<MessageCreateParams> captor = ArgumentCaptor.forClass(MessageCreateParams.class);
        verify(messages).create(captor.capture());
        assertThat(captor.getValue().model().toString()).contains("claude-haiku-5-5");
        assertThat(captor.getValue().outputConfig()).isPresent();
    }

    @Test
    void generateJson_throwsProviderException_whenTheModelRefuses() {
        when(messages.create(any(MessageCreateParams.class))).thenReturn(reply("", "refusal"));

        assertThatThrownBy(() -> provider.generateJson(REQUEST)).isInstanceOf(AIProviderException.class);
    }

    @Test
    void generateJson_throwsParseException_whenTheResponseIsCutOffOrEmpty() {
        when(messages.create(any(MessageCreateParams.class))).thenReturn(reply("{\"recomm", "max_tokens"));
        assertThatThrownBy(() -> provider.generateJson(REQUEST)).isInstanceOf(AIResponseParseException.class);

        when(messages.create(any(MessageCreateParams.class))).thenReturn(reply("  ", "end_turn"));
        assertThatThrownBy(() -> provider.generateJson(REQUEST)).isInstanceOf(AIResponseParseException.class);
    }

    @Test
    void generateJson_mapsRateLimit() {
        when(messages.create(any(MessageCreateParams.class))).thenThrow(mock(RateLimitException.class));

        assertThatThrownBy(() -> provider.generateJson(REQUEST)).isInstanceOf(AIRateLimitException.class);
    }

    @Test
    void generateJson_mapsServiceErrorsToProviderException_withoutLeakingDetails() {
        when(messages.create(any(MessageCreateParams.class))).thenThrow(mock(OverloadedException.class));

        assertThatThrownBy(() -> provider.generateJson(REQUEST))
                .isInstanceOf(AIProviderException.class)
                .hasMessage("The AI provider is unavailable.");
    }

    @Test
    void generateJson_mapsTimeoutAndConnectionFailures() {
        when(messages.create(any(MessageCreateParams.class)))
                .thenThrow(new AnthropicIoException("timeout", new SocketTimeoutException("read timed out")));
        assertThatThrownBy(() -> provider.generateJson(REQUEST)).isInstanceOf(AITimeoutException.class);

        when(messages.create(any(MessageCreateParams.class)))
                .thenThrow(new AnthropicIoException("refused", new java.net.ConnectException("refused")));
        assertThatThrownBy(() -> provider.generateJson(REQUEST))
                .isInstanceOf(AIProviderException.class).isNotInstanceOf(AITimeoutException.class);
    }
}

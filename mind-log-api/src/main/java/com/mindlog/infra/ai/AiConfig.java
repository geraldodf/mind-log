package com.mindlog.infra.ai;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Escolhe o provedor de LLM por configuração. Sem provedor reconhecido ou sem chave, nenhum
 * {@link LlmProvider} existe e as funções de IA ficam desligadas (a aplicação sobe normal).
 *
 * <ul>
 *   <li>{@code ai.provider}: hoje só {@code anthropic}.</li>
 *   <li>{@code ai.model}: id do modelo do provedor (padrão {@code claude-haiku-5-5}).</li>
 *   <li>{@code ai.anthropic.api-key}: vem de {@code ANTHROPIC_API_KEY}; nunca vai para o repositório.</li>
 * </ul>
 */
@Configuration
public class AiConfig {

    private static final Duration TIMEOUT = Duration.ofSeconds(20);

    @Bean
    @ConditionalOnExpression("'${ai.provider:anthropic}' == 'anthropic' and !'${ai.anthropic.api-key:}'.isBlank()")
    public LlmProvider anthropicLlmProvider(@Value("${ai.anthropic.api-key}") String apiKey,
                                            @Value("${ai.model:claude-haiku-5-5}") String model) {
        AnthropicClient client = AnthropicOkHttpClient.builder()
                .apiKey(apiKey)
                .timeout(TIMEOUT)
                .maxRetries(1)
                .build();
        return new AnthropicLlmProvider(client, model);
    }
}

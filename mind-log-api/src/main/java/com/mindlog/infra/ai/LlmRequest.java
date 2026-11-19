package com.mindlog.infra.ai;

import java.util.Map;

/**
 * @param system          instruções fixas (nunca recebem dado do usuário)
 * @param userContent     dados delimitados, tratados pelo modelo como conteúdo e não como instrução
 * @param jsonSchema      JSON Schema (objeto) que a saída deve obedecer
 * @param maxOutputTokens teto de tokens de saída
 */
public record LlmRequest(String system, String userContent, Map<String, Object> jsonSchema, int maxOutputTokens) {
}

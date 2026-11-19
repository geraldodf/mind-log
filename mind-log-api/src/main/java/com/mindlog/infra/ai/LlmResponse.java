package com.mindlog.infra.ai;

/** Saída bruta do provedor: o JSON ainda precisa ser validado por quem o pediu. */
public record LlmResponse(String json, String model, long inputTokens, long outputTokens) {
}

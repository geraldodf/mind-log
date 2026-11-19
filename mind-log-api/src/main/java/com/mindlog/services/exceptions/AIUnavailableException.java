package com.mindlog.services.exceptions;

/** A função de IA está desligada (sem provedor ou sem chave configurada). */
public class AIUnavailableException extends AIProviderException {
    public AIUnavailableException(String msg) {
        super(msg);
    }
}

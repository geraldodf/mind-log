package com.mindlog.services.exceptions;

public class AIRateLimitException extends AIProviderException {
    public AIRateLimitException(String msg) {
        super(msg);
    }
}

package com.mindlog.services.exceptions;

public class PromptInjectionException extends RuntimeException {
    public PromptInjectionException(String msg) {
        super(msg);
    }
}

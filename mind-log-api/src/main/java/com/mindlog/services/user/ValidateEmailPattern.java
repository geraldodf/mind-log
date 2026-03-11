package com.mindlog.services.user;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.regex.Pattern;

@Slf4j
@Component
public class ValidateEmailPattern {

    private static final String EMAIL_REGEX = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

    public void perform(String email, UUID uuid) {
        log.info("perform: {} - Email: {}", uuid, email);
        if (!Pattern.compile(EMAIL_REGEX).matcher(email).matches()) {
            log.error("Email is invalid: {}", uuid);
            throw new IllegalArgumentException("E-mail inválido.");
        }
        log.info("Email is validate successfully");
    }

}

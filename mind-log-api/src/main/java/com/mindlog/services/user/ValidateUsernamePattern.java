package com.mindlog.services.user;

import com.mindlog.services.exceptions.FieldValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.regex.Pattern;

@Slf4j
@Component
public class ValidateUsernamePattern {

    private static final String USERNAME_REGEX = "^[a-z0-9._]+$";

    public void perform(String username, UUID uuid) {
        log.info("perform: {} - Username: {}", uuid, username);
        if (!Pattern.compile(USERNAME_REGEX).matcher(username).matches()) {
            log.error("Username is invalid: {}", uuid);
            throw new FieldValidationException("username", "username_invalid", "Invalid username.");
        }
        log.info("Username is validate successfully");
    }

}

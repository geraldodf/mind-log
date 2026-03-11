package com.mindlog.services.user;

import com.mindlog.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Transactional(readOnly = true)
@Component
@RequiredArgsConstructor
public class CheckAvailabilityUsername {

    private final UserRepository userRepository;

    public Boolean perform(String username) {
        if (username == null || username.isEmpty()) {
            return false;
        }
        return userRepository.checkUsernameAvailable(username);
    }

}

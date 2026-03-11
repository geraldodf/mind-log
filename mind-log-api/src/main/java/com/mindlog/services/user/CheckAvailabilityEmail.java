package com.mindlog.services.user;

import com.mindlog.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Transactional(readOnly = true)
@Component
@RequiredArgsConstructor
public class CheckAvailabilityEmail {

    private final UserRepository userRepository;

    public Boolean perform(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        return userRepository.checkEmailAvailable(email);
    }

}

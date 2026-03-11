package com.mindlog.services.user;

import com.mindlog.data.models.User;
import com.mindlog.repositories.UserRepository;
import com.mindlog.services.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Transactional(readOnly = true)
@Component
@RequiredArgsConstructor
public class GetUserById {

    private final UserRepository userRepository;

    public User perform(Long id, UUID uuid) {
        log.info("perform: {} - User Id: {}", uuid, id);
        return userRepository.findById(id).orElseThrow(() -> {
            log.error("User not found: {}", uuid);
            return new ResourceNotFoundException("Usuário não encontrado.");
        });
    }

}

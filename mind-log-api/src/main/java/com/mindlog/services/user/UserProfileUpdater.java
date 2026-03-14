package com.mindlog.services.user;

import com.mindlog.data.dtos.auth.TokenResponseDTO;
import com.mindlog.data.dtos.user.UserProfileUpdateDTO;
import com.mindlog.data.models.User;
import com.mindlog.repositories.UserRepository;
import com.mindlog.services.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Transactional
@Component
@RequiredArgsConstructor
public class UserProfileUpdater {

    private final UserRepository userRepository;
    private final GetUserById getUserById;
    private final ValidateEmailPattern validateEmailPattern;
    private final ValidateUsernamePattern validateUsernamePattern;
    private final CheckAvailabilityEmail checkAvailabilityEmail;
    private final CheckAvailabilityUsername checkAvailabilityUsername;
    private final AuthService authService;

    public TokenResponseDTO perform(Long id, UserProfileUpdateDTO dto, HttpServletRequest request, UUID uuid) {
        log.info("perform: {} - User Id: {}", uuid, id);
        authService.validateSelfOrAdmin(id);

        User user = getUserById.perform(id, uuid);

        validateEmailPattern.perform(dto.email(), uuid);
        validateUsernamePattern.perform(dto.username(), uuid);

        if (!user.getEmail().equals(dto.email())) {
            log.info("Email different from original, needs to be validated: {}", uuid);
            boolean emailUnavailable = !checkAvailabilityEmail.perform(dto.email());
            if (emailUnavailable) {
                log.error("Email is already in use: {}", uuid);
                throw new IllegalArgumentException("Este email já está em uso.");
            }
        }

        if (!user.getUsername().equals(dto.username())) {
            log.info("Username different from original, needs to be validated: {}", uuid);
            boolean usernameUnavailable = !checkAvailabilityUsername.perform(dto.username());
            if (usernameUnavailable) {
                log.error("Username is already in use: {}", uuid);
                throw new IllegalArgumentException("Este nome de usuário já está em uso.");
            }
        }

        user.setName(dto.name());
        user.setUsername(dto.username());
        user.setEmail(dto.email());
        userRepository.save(user);
        log.info("User updated successfully: {}", uuid);

        return authService.generateAccessTokenResponse(user, null, request, uuid);
    }

}

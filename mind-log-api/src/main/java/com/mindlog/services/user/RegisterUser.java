package com.mindlog.services.user;

import com.mindlog.services.exceptions.FieldValidationException;
import com.mindlog.data.dtos.user.UserSelfRegisterDTO;
import com.mindlog.data.enums.RolesENUM;
import com.mindlog.data.models.Role;
import com.mindlog.data.models.User;
import com.mindlog.repositories.RoleRepository;
import com.mindlog.repositories.UserRepository;
import com.mindlog.services.audit.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Transactional
@Component
@RequiredArgsConstructor
public class RegisterUser {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final CheckAvailabilityEmail checkAvailabilityEmail;
    private final CheckAvailabilityUsername checkAvailabilityUsername;
    private final AuditService auditService;

    public void perform(UserSelfRegisterDTO dto, UUID uuid) {
        log.info("perform: {}", uuid);

        if (!checkAvailabilityEmail.perform(dto.email())) {
            log.error("Email already in use: {}", uuid);
            throw new FieldValidationException("email", "email_in_use", "Email already in use.");
        }

        if (!checkAvailabilityUsername.perform(dto.username())) {
            log.error("Username already in use: {}", uuid);
            throw new FieldValidationException("username", "username_in_use", "Username already in use.");
        }

        Role userRole = roleRepository.findByAuthority(RolesENUM.USER.getValue())
                .orElseThrow(() -> new RuntimeException("Role não encontrada."));

        User user = new User();
        user.setName(dto.name());
        user.setEmail(dto.email());
        user.setUsername(dto.username());
        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setCreatedAt(Instant.now());
        user.setIsEnabled(true);
        user.getRoles().add(userRole);

        userRepository.save(user);
        auditService.log("ACCOUNT_CREATED");
        log.info("User registered successfully: {}", uuid);
    }
}

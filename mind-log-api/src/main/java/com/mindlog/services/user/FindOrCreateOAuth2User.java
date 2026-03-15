package com.mindlog.services.user;

import com.mindlog.data.enums.AuthProvider;
import com.mindlog.data.enums.RolesENUM;
import com.mindlog.data.models.Role;
import com.mindlog.data.models.User;
import com.mindlog.repositories.RoleRepository;
import com.mindlog.repositories.UserRepository;
import com.mindlog.services.audit.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Slf4j
@Transactional
@Component
@RequiredArgsConstructor
public class FindOrCreateOAuth2User {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditService auditService;

    public User perform(String email, String name, String googleId, String picture, UUID uuid) {
        log.info("perform: {}", uuid);

        Optional<User> byGoogleId = userRepository.findByGoogleId(googleId);
        if (byGoogleId.isPresent()) {
            log.info("User found by googleId: {}", uuid);
            User existing = byGoogleId.get();
            existing.setPicture(picture);
            return userRepository.save(existing);
        }

        Optional<User> byEmail = userRepository.findByEmail(email);
        if (byEmail.isPresent()) {
            log.info("Linking Google account to existing user: {}", uuid);
            User existing = byEmail.get();
            existing.setGoogleId(googleId);
            existing.setAuthProvider(AuthProvider.GOOGLE);
            existing.setPicture(picture);
            return userRepository.save(existing);
        }

        log.info("Creating new user from Google account: {}", uuid);
        Role userRole = roleRepository.findByAuthority(RolesENUM.USER.getValue())
                .orElseThrow(() -> new RuntimeException("Role não encontrada."));

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setUsername(generateUsername(name));
        user.setAuthProvider(AuthProvider.GOOGLE);
        user.setGoogleId(googleId);
        user.setPicture(picture);
        user.setCreatedAt(Instant.now());
        user.setIsEnabled(true);
        user.getRoles().add(userRole);

        User saved = userRepository.save(user);
        auditService.log("ACCOUNT_CREATED");
        return saved;
    }

    private String generateUsername(String name) {
        String base = name.toLowerCase().replaceAll("[^a-z0-9]", "");
        if (base.length() < 4) base = base + "user";
        Random random = new Random();
        String candidate;
        do {
            int suffix = 1000 + random.nextInt(9000);
            candidate = base + suffix;
        } while (!userRepository.checkUsernameAvailable(candidate));
        return candidate;
    }
}

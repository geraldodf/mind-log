package com.mindlog.services.user;

import com.mindlog.data.enums.AuthProvider;
import com.mindlog.data.enums.RolesENUM;
import com.mindlog.data.models.Role;
import com.mindlog.data.models.User;
import com.mindlog.repositories.RoleRepository;
import com.mindlog.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Transactional
@Component
@RequiredArgsConstructor
public class FindOrCreateOAuth2User {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

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
        user.setUsername(generateUsername(email));
        user.setAuthProvider(AuthProvider.GOOGLE);
        user.setGoogleId(googleId);
        user.setPicture(picture);
        user.setCreatedAt(Instant.now());
        user.setIsEnabled(true);
        user.getRoles().add(userRole);

        return userRepository.save(user);
    }

    private String generateUsername(String email) {
        String base = email.split("@")[0].toLowerCase().replaceAll("[^a-z0-9]", "");
        if (base.length() < 4) base = base + "user";
        if (userRepository.checkUsernameAvailable(base)) return base;
        return base + UUID.randomUUID().toString().substring(0, 6);
    }
}

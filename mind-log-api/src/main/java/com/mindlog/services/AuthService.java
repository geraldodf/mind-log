package com.mindlog.services;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.mindlog.data.dtos.auth.*;
import com.mindlog.data.enums.RolesENUM;
import com.mindlog.data.models.PasswordRecoverToken;
import com.mindlog.data.models.User;
import com.mindlog.infra.security.CustomUser;
import com.mindlog.infra.security.JWTUtil;
import com.mindlog.repositories.PasswordRecoverTokenRepository;
import com.mindlog.repositories.UserRepository;
import com.mindlog.services.exceptions.ForbiddenException;
import com.mindlog.services.exceptions.ResourceNotFoundException;
import com.mindlog.services.exceptions.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Transactional(readOnly = true)
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final PasswordRecoverTokenRepository passwordRecoverTokenRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    public final JWTUtil jwtUtil;

    @Value("${security.jwt.duration.access}")
    private Long accessTokenDuration;

    @Value("${security.password.recover.token.minutes}")
    private Long tokenExpirationTime;

    @Value("${security.password.recover.token.uri}")
    private String recoverUri;

    public TokenResponseDTO refreshToken(TokenRefreshTokenDTO dto, HttpServletRequest request) {
        UUID uuid = UUID.randomUUID();
        log.info("refreshToken: {}", uuid);

        try {
            String refreshToken = dto.refreshToken();
            DecodedJWT decodedJWT = jwtUtil.validateToken(refreshToken, true);

            String username = decodedJWT.getSubject();
            User user = repository.findByUsernameAndRoles(username).orElseThrow(() -> {
                log.error("User not found: {}", uuid);
                return new UnauthorizedException("Usuário não encontrado.");
            });

            if (!user.isEnabled()) {
                log.error("User not enabled: {}", uuid);
                throw new UnauthorizedException("Token inválido.");
            }

            return generateAccessTokenResponse(user, refreshToken, request, uuid);

        } catch (Exception e) {
            throw new UnauthorizedException("Token inválido.");
        }

    }

    public TokenResponseDTO generateAccessTokenResponse(User user, String refreshToken, HttpServletRequest request, UUID uuid) {
        log.info("generateAccessTokenResponse: {}", uuid);
        CustomUser customUser = new CustomUser(user, true, true, true);
        String accessToken = jwtUtil.generateAccessToken(customUser, request);

        if (refreshToken == null || refreshToken.isEmpty()) {
            refreshToken = jwtUtil.generateRefreshToken(customUser, request);
        }

        return new TokenResponseDTO(accessToken, refreshToken, Instant.now().plusSeconds(accessTokenDuration).toString());
    }

    public void recoverPassword(EmailDTO dto) {
        UUID uuid = UUID.randomUUID();
        log.info("Recovering password: {}\nEmail: {}", uuid, dto.email());

        Optional<User> user = repository.findByEmail(dto.email());

        if (user.isEmpty()) {
            log.error("Email not found: {}", uuid);
            throw new ResourceNotFoundException("Email não encontrado.");
        }

        String token = UUID.randomUUID().toString();

        PasswordRecoverToken passwordRecoverToken = new PasswordRecoverToken();
        passwordRecoverToken.setEmail(dto.email());
        passwordRecoverToken.setToken(token);
        passwordRecoverToken.setCreatedAt(Instant.now());
        passwordRecoverToken.setExpiration(Instant.now().plusSeconds(tokenExpirationTime * 60L));

        passwordRecoverTokenRepository.save(passwordRecoverToken);

        String uri = recoverUri + "/" + token;

//        TODO: Implement email service
//        emailService.sendPasswordRecoverEmail(email.getEmail(), uri, uuid);
    }

    @Transactional
    public void resetPassword(ResetPasswordDTO dto) {
        UUID uuid = UUID.randomUUID();
        log.info("resetPassword: {}\nEmail: {}", uuid, dto.token());

        List<PasswordRecoverToken> tokens = passwordRecoverTokenRepository.findValidTokens(dto.token(), Instant.now());

        if (tokens.isEmpty()) {
            log.error("Token not found: {}", uuid);
            throw new ResourceNotFoundException("Token inválido.");
        }

        String email = tokens.get(0).getEmail();
        log.info("Token found: {}\nToken Email: {}", uuid, email);

        Optional<User> user = repository.findByEmail(email);
        if (user.isEmpty()) {
            log.error("User not found: {}", uuid);
            throw new ResourceNotFoundException("Usuário não encontrado.");
        }

        if (!user.get().isEnabled()) {
            log.error("User not enabled: {}", uuid);
            throw new ResourceNotFoundException("Usuário não pode acessar sua conta. Entre em contato com o suporte.");
        }

        User userNewPassword = user.get();
        userNewPassword.setPassword(passwordEncoder.encode(dto.password()));
        repository.save(userNewPassword);
    }

    @Transactional
    public void changePassword(ChangePasswordDTO dto) {
        UUID uuid = UUID.randomUUID();
        User user = authenticated();
        log.info("Changing password: {}\nRequested by: {}", uuid, user.getUsername());

        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            log.error("Current password is incorrect: {}", uuid);
            throw new IllegalArgumentException("A senha atual está incorreta.");
        }

        if (dto.getCurrentPassword().equals(dto.getNewPassword())) {
            log.error("New password is the same as the current password: {}", uuid);
            throw new IllegalArgumentException("A nova senha não pode ser igual à senha atual.");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        repository.save(user);
    }

    public void validateSelfOrAdmin(Long userId) {
        User me = authenticated();
        if (!me.hasRole(RolesENUM.ADMIN.getValue()) && !me.getId().equals(userId)) {
            throw new ForbiddenException("Não autorizado");
        }
    }

    public User authenticated() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return repository.findUserByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
    }

    public Long authenticatedId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getDetails() != null) {
            return (Long) authentication.getDetails();
        }

        return authenticated().getId();
    }

    public void validateYourSelf(Long userId) {
        User me = authenticated();
        if (!me.getId().equals(userId)) {
            throw new ForbiddenException("Não autorizado.");
        }
    }

}

package com.mindlog.services;

import com.mindlog.data.dtos.auth.ResetPasswordDTO;
import com.mindlog.data.models.PasswordRecoverToken;
import com.mindlog.data.models.User;
import com.mindlog.repositories.PasswordRecoverTokenRepository;
import com.mindlog.repositories.UserRepository;
import com.mindlog.services.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository repository;
    @Mock private PasswordRecoverTokenRepository passwordRecoverTokenRepository;
    @Mock private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService service;

    @Test
    void resetPassword_shouldInvalidateTokensAfterUse() {
        PasswordRecoverToken token = new PasswordRecoverToken();
        token.setEmail("user@example.test");
        token.setToken("reset-token");
        token.setExpiration(Instant.now().plusSeconds(600));

        User user = new User();
        user.setId(1L);
        user.setEmail("user@example.test");
        user.setIsEnabled(true);

        when(passwordRecoverTokenRepository.findValidTokens(eq("reset-token"), any(Instant.class))).thenReturn(List.of(token));
        when(repository.findByEmail("user@example.test")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("new-password-1")).thenReturn("encoded");

        service.resetPassword(new ResetPasswordDTO("reset-token", "new-password-1"));

        verify(repository).save(user);
        verify(passwordRecoverTokenRepository).deleteByEmail("user@example.test");
    }

    @Test
    void resetPassword_shouldRejectTokenThatIsNoLongerValid() {
        when(passwordRecoverTokenRepository.findValidTokens(eq("used-token"), any(Instant.class))).thenReturn(List.of());

        assertThatThrownBy(() -> service.resetPassword(new ResetPasswordDTO("used-token", "new-password-1")))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(repository, never()).save(any());
    }
}

package com.mindlog.infra.security;

import com.mindlog.data.dtos.auth.TokenResponseDTO;
import com.mindlog.data.models.User;
import com.mindlog.services.AuthService;
import com.mindlog.services.user.FindOrCreateOAuth2User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final FindOrCreateOAuth2User findOrCreateOAuth2User;
    private final AuthService authService;

    @Value("${security.oauth2.success-redirect-uri}")
    private String successRedirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        UUID uuid = UUID.randomUUID();
        log.info("OAuth2 authentication success: {}", uuid);

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        Map<String, Object> attributes = oauthToken.getPrincipal().getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String googleId = (String) attributes.get("sub");

        User user = findOrCreateOAuth2User.perform(email, name, googleId, uuid);
        TokenResponseDTO tokenResponse = authService.generateAccessTokenResponse(user, null, request, uuid);

        String redirectUrl = UriComponentsBuilder.fromUriString(successRedirectUri)
                .queryParam("accessToken", tokenResponse.accessToken())
                .queryParam("refreshToken", tokenResponse.refreshToken())
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}

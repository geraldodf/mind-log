package com.mindlog.infra.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.SerializationUtils;

import java.util.Base64;

@Component
public class CookieOAuth2AuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    private static final String COOKIE_NAME = "oauth2_auth_request";
    private static final int COOKIE_MAX_AGE = 180;

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        return getCookieValue(request, COOKIE_NAME)
                .map(this::deserialize)
                .orElse(null);
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest,
                                         HttpServletRequest request, HttpServletResponse response) {
        if (authorizationRequest == null) {
            deleteCookie(request, response, COOKIE_NAME);
            return;
        }
        boolean secure = request.isSecure();
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, serialize(authorizationRequest))
                .path("/")
                .httpOnly(true)
                .maxAge(COOKIE_MAX_AGE)
                .secure(secure)
                .sameSite(secure ? "None" : "Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request,
                                                                  HttpServletResponse response) {
        OAuth2AuthorizationRequest authRequest = loadAuthorizationRequest(request);
        deleteCookie(request, response, COOKIE_NAME);
        return authRequest;
    }

    private String serialize(OAuth2AuthorizationRequest request) {
        return Base64.getUrlEncoder().encodeToString(SerializationUtils.serialize(request));
    }

    private OAuth2AuthorizationRequest deserialize(String value) {
        return (OAuth2AuthorizationRequest) SerializationUtils.deserialize(
                Base64.getUrlDecoder().decode(value));
    }

    private java.util.Optional<String> getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (name.equals(cookie.getName())) {
                    return java.util.Optional.of(cookie.getValue());
                }
            }
        }
        return java.util.Optional.empty();
    }

    private void deleteCookie(HttpServletRequest request, HttpServletResponse response, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (name.equals(cookie.getName())) {
                    boolean secure = request.isSecure();
                    ResponseCookie delete = ResponseCookie.from(name, "")
                            .path("/")
                            .httpOnly(true)
                            .maxAge(0)
                            .secure(secure)
                            .sameSite(secure ? "None" : "Lax")
                            .build();
                    response.addHeader("Set-Cookie", delete.toString());
                }
            }
        }
    }
}

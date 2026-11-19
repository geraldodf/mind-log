package com.mindlog.infra.security;

import com.mindlog.data.dtos.auth.TokenResponseDTO;
import com.mindlog.data.models.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.time.Instant;

public class JWTAuthenticatorFilter extends UsernamePasswordAuthenticationFilter {

    private final JWTUtil jwtUtil;

    private final Long accessTokenDuration;

    @Override
    public void afterPropertiesSet() {
        super.afterPropertiesSet();
    }

    private final AuthenticationManager authenticationManager;

    private final ObjectMapper mapper;

    public JWTAuthenticatorFilter(AuthenticationManager authenticationManager, JWTUtil jwtUtil, Long accessTokenDuration,
                                  ObjectMapper mapper) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.accessTokenDuration = accessTokenDuration;
        this.mapper = mapper;
    }

    @Override
    public Authentication attemptAuthentication(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws AuthenticationException {
        try {

            User user = mapper.readValue(request.getInputStream(), User.class);

            return authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    user.getUsername(),
                    user.getPassword(),
                    user.getAuthorities()
            ));

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected void successfulAuthentication(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain,
            Authentication authResult
    ) throws IOException {

        CustomUser user = (CustomUser) authResult.getPrincipal();

        String accessToken = jwtUtil.generateAccessToken(user, request);
        String refreshToken = jwtUtil.generateRefreshToken(user, request);

        TokenResponseDTO responseDTO = new TokenResponseDTO(accessToken, refreshToken, Instant.now().plusSeconds(accessTokenDuration).toString());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        mapper.writeValue(response.getOutputStream(), responseDTO);
    }

}

package com.mindlog.data.dtos.auth;

public record TokenResponseDTO(
        String accessToken,
        String refreshToken,
        String expiresAt
){
}

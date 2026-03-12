package com.mindlog.resources;

import com.mindlog.data.dtos.auth.*;
import com.mindlog.data.dtos.user.UserSelfRegisterDTO;
import com.mindlog.services.AuthService;
import com.mindlog.services.user.RegisterUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthResource {

    private final AuthService service;
    private final RegisterUser registerUser;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody @Valid UserSelfRegisterDTO dto) {
        registerUser.perform(dto, UUID.randomUUID());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<TokenResponseDTO> refreshToken(@RequestBody @Valid TokenRefreshTokenDTO dto, HttpServletRequest request) {
        TokenResponseDTO response = service.refreshToken(dto, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/recover-password")
    public ResponseEntity<Void> recoverPassword(@RequestBody @Valid EmailDTO dto) {
        service.recoverPassword(dto);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody @Valid ResetPasswordDTO dto) {
        service.resetPassword(dto);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody @Valid ChangePasswordDTO changePasswordDTO) {
        service.changePassword(changePasswordDTO);
        return ResponseEntity.noContent().build();
    }

}

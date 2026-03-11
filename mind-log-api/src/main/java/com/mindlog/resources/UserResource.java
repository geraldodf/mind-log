package com.mindlog.resources;

import com.mindlog.data.dtos.auth.TokenResponseDTO;
import com.mindlog.data.dtos.user.RoleDTO;
import com.mindlog.data.dtos.user.UserDTO;
import com.mindlog.data.dtos.user.UserProfileUpdateDTO;
import com.mindlog.data.dtos.user.UserRegisterDTO;
import com.mindlog.services.user.CheckAvailabilityEmail;
import com.mindlog.services.user.CheckAvailabilityUsername;
import com.mindlog.services.user.UserService;
import com.mindlog.services.user.UserProfileUpdater;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
public class UserResource {

    private final UserService service;
    private final UserProfileUpdater userProfileUpdater;
    private final CheckAvailabilityEmail checkAvailabilityEmail;
    private final CheckAvailabilityUsername checkAvailabilityUsername;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Page<UserDTO>> getAll(Pageable pageable) {
        Page<UserDTO> result = service.getAll(pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe() {
        UserDTO me = service.getMe();
        return ResponseEntity.ok(me);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/form-resources")
    public ResponseEntity<List<RoleDTO>> getFormResources() {
        List<RoleDTO> dto = service.getFormResources();
        return ResponseEntity.ok(dto);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/availability-email")
    public ResponseEntity<Boolean> getAvailabilityEmail(@RequestParam(name = "term") String email) {
        return ResponseEntity.ok(checkAvailabilityEmail.perform(email));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/availability-username")
    public ResponseEntity<Boolean> getAvailabilityUsername(@RequestParam(name = "term") String username) {
        return ResponseEntity.ok(checkAvailabilityUsername.perform(username));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/sign-up")
    public ResponseEntity<UserDTO> createUser(@RequestBody @Valid UserRegisterDTO dto) {
        UserDTO userDTO = service.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(userDTO);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/enabled")
    public ResponseEntity<Void> updateEnabled(@PathVariable Long id, @RequestBody boolean enabled) {
        service.updateEnabled(id, enabled);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/profile/{id}")
    public ResponseEntity<TokenResponseDTO> updateProfile(@PathVariable Long id, @RequestBody UserProfileUpdateDTO dto, HttpServletRequest request) {
        UUID uuid = UUID.randomUUID();
        TokenResponseDTO token = userProfileUpdater.perform(id, dto, request, uuid);
        return ResponseEntity.ok(token);
    }

}

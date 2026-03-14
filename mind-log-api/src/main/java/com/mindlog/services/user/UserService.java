package com.mindlog.services.user;

import com.mindlog.data.dtos.user.RoleDTO;
import com.mindlog.data.dtos.user.UserDTO;
import com.mindlog.data.dtos.user.UserRegisterDTO;
import com.mindlog.data.dtos.user.UserSearchResultDTO;
import com.mindlog.data.enums.RolesENUM;
import com.mindlog.data.models.Role;
import com.mindlog.data.models.User;
import com.mindlog.repositories.*;
import com.mindlog.services.AuthService;
import com.mindlog.services.audit.AuditService;
import com.mindlog.services.exceptions.ForbiddenException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Transactional(readOnly = true)
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;
    private final RoleRepository roleRepository;
    private final AuthService authService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final AuditService auditService;
    private final FollowRepository followRepository;

    public Page<UserDTO> getAll(Pageable pageable) {
        return repository.findAllByOrderByNameAsc(pageable)
                .map(user -> modelMapper.map(user, UserDTO.class));
    }

    public UserDTO getMe() {
        return modelMapper.map(authService.authenticated(), UserDTO.class);
    }

    @Transactional
    public UserDTO createUser(UserRegisterDTO dto) {
        User authenticated = authService.authenticated();
        UUID uuid = UUID.randomUUID();
        log.info("createUser: {}\nRequested by: {}", uuid, authenticated.getUsername());

        if (!authenticated.hasRole(RolesENUM.ADMIN.getValue())) {
            log.error("User is not an admin: {}", uuid);
            throw new ForbiddenException("Você não tem permissão para tomar esta ação.");
        }

        log.info("Checking if email already exists: {}", uuid);
        if (!repository.checkEmailAvailable(dto.email())) {
            log.error("Email already exists: {}", uuid);
            throw new IllegalArgumentException("Este email já está em uso.");
        }

        log.info("Checking if username already exists: {}", uuid);
        if (!repository.checkUsernameAvailable(dto.username())) {
            log.error("Username already exists: {}", uuid);
            throw new IllegalArgumentException("Este username já está em uso.");
        }

        List<Role> roles = roleRepository.findAllById(
                dto.roles().stream().map(RoleDTO::getId).toList());

        User user = new User();
        user.setName(dto.name());
        user.setEmail(dto.email());
        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setUsername(dto.username());
        user.setCreatedAt(Instant.now());
        user.setIsEnabled(true);
        user.getRoles().addAll(roles);  // fixed: was called twice previously
        user = repository.save(user);

        List<RoleDTO> rolesDTO = roles.stream()
                .map(role -> new RoleDTO(role.getId(), role.getAuthority()))
                .toList();

        return new UserDTO(user.getId(), user.getName(), user.getUsername(),
                user.getEmail(), user.getPicture(), user.getIsEnabled(),
                rolesDTO, user.getCreatedAt());
    }

    public User findByEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<RoleDTO> getFormResources() {
        return roleRepository.findAllByOrderByAuthority().stream()
                .map(role -> new RoleDTO(role.getId(), role.getAuthority()))
                .toList();
    }

    /**
     * Deletes the authenticated user's account.
     * ACCOUNT_DELETED is logged before deletion so the user FK can be set.
     * system_events.user_id is then nullified automatically by ON DELETE SET NULL.
     * Everything else (user_media, notifications, media_types, statuses, users_roles, follows)
     * is handled by DB CASCADE.
     */
    @Transactional
    public void deleteAccount() {
        User user = authService.authenticated();
        log.info("deleteAccount: user {}", user.getId());

        auditService.log("ACCOUNT_DELETED");
        repository.delete(user);

        log.info("Account deleted: user {}", user.getId());
    }

    @Transactional
    public void updateEnabled(Long id, boolean enabled) {
        UUID uuid = UUID.randomUUID();
        log.info("updateEnabled: {}\nRequested by: {}", uuid, authService.authenticatedId());
        User user = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
        user.setIsEnabled(enabled);
        repository.save(user);
        log.info("User enabled updated: {}\nEnabled: {}", uuid, enabled);
    }

    /**
     * Searches users by username or display name.
     * Uses trigram ILIKE (requires pg_trgm extension + GIN indexes from V009).
     * Decorates results with the authenticated user's follow state via a single
     * batch query — no N+1.
     */
    @Transactional(readOnly = true)
    public Page<UserSearchResultDTO> searchUsers(String q, Pageable pageable) {
        if (q == null || q.isBlank()) {
            return Page.empty(pageable);
        }

        Page<User> users = repository.searchByUsernameOrName(q.trim(), pageable);

        Set<Long> followingIds = new HashSet<>();
        try {
            User me = authService.authenticated();
            List<Long> resultIds = users.getContent().stream().map(User::getId).toList();
            if (!resultIds.isEmpty()) {
                followingIds.addAll(followRepository.findFollowingIds(me.getId(), resultIds));
            }
        } catch (Exception ignored) {
            // unauthenticated callers receive isFollowing = false for all results
        }

        final Set<Long> finalFollowingIds = followingIds;
        return users.map(u -> new UserSearchResultDTO(
                u.getId(),
                u.getUsername(),
                u.getName(),
                u.getPicture(),
                finalFollowingIds.contains(u.getId())
        ));
    }
}

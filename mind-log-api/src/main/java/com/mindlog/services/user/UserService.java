package com.mindlog.services.user;

import com.mindlog.data.dtos.user.RoleDTO;
import com.mindlog.data.dtos.user.UserDTO;
import com.mindlog.data.dtos.user.UserRegisterDTO;
import com.mindlog.data.enums.RolesENUM;
import com.mindlog.data.models.Role;
import com.mindlog.data.models.User;
import com.mindlog.repositories.RoleRepository;
import com.mindlog.repositories.UserRepository;
import com.mindlog.services.AuthService;
import com.mindlog.services.exceptions.ForbiddenException;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Transactional(readOnly = true)
@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private ModelMapper modelMapper;

    public Page<UserDTO> getAll(Pageable pageable) {
        Page<User> users = repository.findAllByOrderByNameAsc(pageable);
        return users.map(user -> modelMapper.map(user, UserDTO.class));
    }

    public UserDTO getMe() {
        User user = authService.authenticated();
        return modelMapper.map(user, UserDTO.class);
    }

    @Transactional
    public UserDTO createUser(UserRegisterDTO dto) {
        User authenticated = authService.authenticated();
        UUID uuid = UUID.randomUUID();
        log.info("createUser: {}\nRequested by: {}", uuid, authenticated.getUsername());

        if (authenticated.hasRole(RolesENUM.ADMIN.name())) {
            log.error("User is not an admin: {}", uuid);
            throw new ForbiddenException("Você não tem permissão para tomar esta ação.");
        }

        log.info("Checking if email already exists: {}\nEmail: {}", uuid, dto.email());
        if (!repository.checkEmailAvailable(dto.email())) {
            log.error("Email already exists: {}", uuid);
            throw new IllegalArgumentException("Este email já está em uso.");
        }

        log.info("Checking if username already exists: {}\nUsername: {}", uuid, dto.username());
        if (!repository.checkUsernameAvailable(dto.username())) {
            log.error("Username already exists: {}", uuid);
            throw new IllegalArgumentException("Este username já está em uso.");
        }

        List<Role> roles = roleRepository.findAllById(dto.roles().stream().map(RoleDTO::getId).toList());

        User user = new User();
        user.setName(dto.name());
        user.setEmail(dto.email());
        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setUsername(dto.username());
        user.setCreatedAt(Instant.now());
        user.setIsEnabled(true);
        user.getRoles().addAll(roles);
        user.getRoles().addAll(roles);
        user = repository.save(user);

        List<RoleDTO> rolesDTO = roles.stream()
                .map(role -> new RoleDTO(role.getId(), role.getAuthority()))
                .toList();

        return new UserDTO(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getEmail(),
                user.isEnabled(),
                rolesDTO,
                user.getCreatedAt()
        );
    }

    public User findByEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<RoleDTO> getFormResources() {
        List<Role> roles = this.roleRepository.findAllByOrderByAuthority();
        return roles.stream()
                .map(role -> new RoleDTO(role.getId(), role.getAuthority()))
                .toList();
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
}

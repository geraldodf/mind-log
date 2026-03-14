package com.mindlog.services.status;

import com.mindlog.data.dtos.status.StatusCreateDTO;
import com.mindlog.data.dtos.status.StatusDTO;
import com.mindlog.data.models.Status;
import com.mindlog.data.models.User;
import com.mindlog.repositories.StatusRepository;
import com.mindlog.services.AuthService;
import com.mindlog.services.exceptions.ForbiddenException;
import com.mindlog.services.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Transactional(readOnly = true)
@Service
@RequiredArgsConstructor
public class StatusService {

    private final StatusRepository repository;
    private final AuthService authService;

    public List<StatusDTO> getAllAvailable() {
        Long userId = authService.authenticatedId();
        return repository.findAllAvailableForUser(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    public List<StatusDTO> getMyCustomStatuses() {
        Long userId = authService.authenticatedId();
        return repository.findAllByUserId(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public StatusDTO create(StatusCreateDTO dto) {
        User user = authService.authenticated();
        Status status = new Status();
        status.setName(dto.name().trim());
        status.setIsSystem(false);
        status.setUser(user);
        status.setCreatedAt(Instant.now());
        status = repository.save(status);
        log.info("Status created: {} by user {}", status.getId(), user.getUsername());
        return toDTO(status);
    }

    @Transactional
    public void delete(Long id) {
        User user = authService.authenticated();
        Status status = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Status not found."));

        if (status.getIsSystem()) {
            throw new ForbiddenException("System statuses cannot be deleted.");
        }

        if (!status.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You can only delete your own statuses.");
        }

        repository.delete(status);
        log.info("Status deleted: {} by user {}", id, user.getUsername());
    }

    public StatusDTO toDTO(Status s) {
        return new StatusDTO(
                s.getId(),
                s.getName(),
                s.getIsSystem(),
                s.getUser() != null ? s.getUser().getId() : null,
                s.getCreatedAt()
        );
    }
}

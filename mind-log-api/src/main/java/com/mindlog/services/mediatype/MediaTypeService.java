package com.mindlog.services.mediatype;

import com.mindlog.data.dtos.mediatype.MediaTypeCreateDTO;
import com.mindlog.data.dtos.mediatype.MediaTypeDTO;
import com.mindlog.data.models.MediaType;
import com.mindlog.data.models.User;
import com.mindlog.repositories.MediaTypeRepository;
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
public class MediaTypeService {

    private final MediaTypeRepository repository;
    private final AuthService authService;

    public List<MediaTypeDTO> getAllAvailable() {
        Long userId = authService.authenticatedId();
        return repository.findAllAvailableForUser(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    public List<MediaTypeDTO> getMyCustomTypes() {
        Long userId = authService.authenticatedId();
        return repository.findAllByUserId(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public MediaTypeDTO create(MediaTypeCreateDTO dto) {
        User user = authService.authenticated();
        MediaType mediaType = new MediaType();
        mediaType.setName(dto.name().trim());
        mediaType.setIsSystem(false);
        mediaType.setUser(user);
        mediaType.setCreatedAt(Instant.now());
        mediaType = repository.save(mediaType);
        log.info("MediaType created: {} by user {}", mediaType.getId(), user.getUsername());
        return toDTO(mediaType);
    }

    @Transactional
    public void delete(Long id) {
        User user = authService.authenticated();
        MediaType mediaType = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media type not found."));

        if (mediaType.getIsSystem()) {
            throw new ForbiddenException("System media types cannot be deleted.");
        }

        if (!mediaType.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You can only delete your own media types.");
        }

        repository.delete(mediaType);
        log.info("MediaType deleted: {} by user {}", id, user.getUsername());
    }

    private MediaTypeDTO toDTO(MediaType m) {
        return new MediaTypeDTO(
                m.getId(),
                m.getName(),
                m.getIsSystem(),
                m.getUser() != null ? m.getUser().getId() : null,
                m.getCreatedAt()
        );
    }
}

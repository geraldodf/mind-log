package com.mindlog.services.usermedia;

import com.mindlog.data.dtos.mediatype.MediaTypeDTO;
import com.mindlog.data.dtos.status.StatusDTO;
import com.mindlog.data.dtos.usermedia.UserMediaDTO;
import com.mindlog.data.dtos.usermedia.UserMediaSaveDTO;
import com.mindlog.data.enums.Recommendation;
import com.mindlog.data.enums.Visibility;
import com.mindlog.data.models.MediaType;
import com.mindlog.data.models.Status;
import com.mindlog.data.models.User;
import com.mindlog.data.models.UserMedia;
import com.mindlog.repositories.MediaTypeRepository;
import com.mindlog.repositories.StatusRepository;
import com.mindlog.repositories.UserMediaRepository;
import com.mindlog.services.AuthService;
import com.mindlog.services.audit.AuditService;
import com.mindlog.services.exceptions.ForbiddenException;
import com.mindlog.services.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Transactional(readOnly = true)
@Service
@RequiredArgsConstructor
public class UserMediaService {

    private final UserMediaRepository repository;
    private final MediaTypeRepository mediaTypeRepository;
    private final StatusRepository statusRepository;
    private final AuthService authService;
    private final AuditService auditService;

    public Page<UserMediaDTO> getMyMedia(Long mediaTypeId, Long statusId, String recommendation, Pageable pageable) {
        Long userId = authService.authenticatedId();
        Recommendation rec = parseRecommendation(recommendation);
        return repository.findAllByUserIdFiltered(userId, mediaTypeId, statusId, rec, pageable)
                .map(this::toDTO);
    }

    public UserMediaDTO getById(Long id) {
        Long userId = authService.authenticatedId();
        UserMedia media = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media entry not found."));
        if (!media.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied.");
        }
        return toDTO(media);
    }

    public List<UserMediaDTO> getUpcomingReleases() {
        Long userId = authService.authenticatedId();
        return repository.findUpcomingReleases(userId, LocalDate.now()).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public UserMediaDTO create(UserMediaSaveDTO dto) {
        User user = authService.authenticated();

        MediaType mediaType = mediaTypeRepository.findById(dto.mediaTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Media type not found."));
        Status status = statusRepository.findById(dto.statusId())
                .orElseThrow(() -> new ResourceNotFoundException("Status not found."));

        UserMedia media = new UserMedia();
        media.setUser(user);
        media.setTitle(dto.title().trim());
        media.setMediaType(mediaType);
        media.setStatus(status);
        media.setRating(dto.rating());
        media.setFeeling(dto.feeling());
        media.setRecommendation(dto.recommendation());
        media.setStartDate(dto.startDate());
        media.setEndDate(dto.endDate());
        media.setNextReleaseDate(dto.nextReleaseDate());
        media.setNotes(dto.notes());
        media.setReview(dto.review());
        media.setVisibility(dto.visibility() != null ? dto.visibility() : Visibility.PRIVATE);

        media = repository.save(media);
        auditService.log("MEDIA_CREATED", "UserMedia", media.getId());
        log.info("UserMedia created: {} by user {}", media.getId(), user.getUsername());
        return toDTO(media);
    }

    @Transactional
    public UserMediaDTO update(Long id, UserMediaSaveDTO dto) {
        User user = authService.authenticated();
        UserMedia media = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media entry not found."));

        if (!media.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You can only edit your own entries.");
        }

        MediaType mediaType = mediaTypeRepository.findById(dto.mediaTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Media type not found."));
        Status status = statusRepository.findById(dto.statusId())
                .orElseThrow(() -> new ResourceNotFoundException("Status not found."));

        media.setTitle(dto.title().trim());
        media.setMediaType(mediaType);
        media.setStatus(status);
        media.setRating(dto.rating());
        media.setFeeling(dto.feeling());
        media.setRecommendation(dto.recommendation());
        media.setStartDate(dto.startDate());
        media.setEndDate(dto.endDate());
        media.setNextReleaseDate(dto.nextReleaseDate());
        media.setNotes(dto.notes());
        media.setReview(dto.review());
        media.setVisibility(dto.visibility() != null ? dto.visibility() : media.getVisibility());
        // updatedAt is handled automatically by @UpdateTimestamp on the entity

        media = repository.save(media);
        auditService.log("MEDIA_UPDATED", "UserMedia", id);
        log.info("UserMedia updated: {} by user {}", id, user.getUsername());
        return toDTO(media);
    }

    @Transactional
    public void delete(Long id) {
        User user = authService.authenticated();
        UserMedia media = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media entry not found."));

        if (!media.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You can only delete your own entries.");
        }

        repository.delete(media);
        auditService.log("MEDIA_DELETED", "UserMedia", id);
        log.info("UserMedia deleted: {} by user {}", id, user.getUsername());
    }

    public UserMediaDTO toDTO(UserMedia m) {
        MediaTypeDTO mediaTypeDTO = new MediaTypeDTO(
                m.getMediaType().getId(),
                m.getMediaType().getName(),
                m.getMediaType().getIsSystem(),
                m.getMediaType().getUser() != null ? m.getMediaType().getUser().getId() : null,
                m.getMediaType().getCreatedAt()
        );
        StatusDTO statusDTO = new StatusDTO(
                m.getStatus().getId(),
                m.getStatus().getName(),
                m.getStatus().getIsSystem(),
                m.getStatus().getUser() != null ? m.getStatus().getUser().getId() : null,
                m.getStatus().getCreatedAt()
        );
        return new UserMediaDTO(
                m.getId(),
                m.getUser().getId(),
                m.getTitle(),
                mediaTypeDTO,
                statusDTO,
                m.getRating(),
                m.getFeeling(),
                m.getRecommendation(),
                m.getStartDate(),
                m.getEndDate(),
                m.getNextReleaseDate(),
                m.getNotes(),
                m.getReview(),
                m.getVisibility(),
                m.getCreatedAt(),
                m.getUpdatedAt()
        );
    }

    private Recommendation parseRecommendation(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Recommendation.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}

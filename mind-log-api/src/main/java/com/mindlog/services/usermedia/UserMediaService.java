package com.mindlog.services.usermedia;

import com.mindlog.data.dtos.mediatype.MediaTypeDTO;
import com.mindlog.data.dtos.status.StatusDTO;
import com.mindlog.data.dtos.usermedia.PlannedGroupDTO;
import com.mindlog.data.dtos.usermedia.PlannedOrderDTO;
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
import com.mindlog.services.exceptions.ForbiddenException;
import com.mindlog.services.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Transactional(readOnly = true)
@Service
@RequiredArgsConstructor
public class UserMediaService {

    /** Nome do status de sistema que forma a fila de planejados (semeado no V1). */
    private static final String PLANNED_STATUS = "Planned";

    private final UserMediaRepository repository;
    private final MediaTypeRepository mediaTypeRepository;
    private final StatusRepository statusRepository;
    private final AuthService authService;
    public Page<UserMediaDTO> getMyMedia(Long mediaTypeId, Long statusId, String recommendation, String title, Pageable pageable) {
        Long userId = authService.authenticatedId();
        Recommendation rec = parseRecommendation(recommendation);
        String titleFilter = (title != null && !title.isBlank()) ? title.trim() : null;
        return repository.findAllByUserIdFiltered(userId, mediaTypeId, statusId, rec, titleFilter, pageable)
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
        media.setFeelings(dto.feelings() != null ? dto.feelings() : new java.util.ArrayList<>());
        media.setRecommendation(dto.recommendation());
        media.setStartDate(dto.startDate());
        media.setEndDate(dto.endDate());
        media.setNextReleaseDate(dto.nextReleaseDate());
        media.setNotes(dto.notes());
        media.setReview(dto.review());
        media.setVisibility(dto.visibility() != null ? dto.visibility() : Visibility.PUBLIC);
        media.setIsFavorite(dto.isFavorite() != null && dto.isFavorite());
        media.setTopRank(dto.topRank());

        media = repository.save(media);
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
        media.setFeelings(dto.feelings() != null ? dto.feelings() : new java.util.ArrayList<>());
        media.setRecommendation(dto.recommendation());
        media.setStartDate(dto.startDate());
        media.setEndDate(dto.endDate());
        media.setNextReleaseDate(dto.nextReleaseDate());
        media.setNotes(dto.notes());
        media.setReview(dto.review());
        media.setVisibility(dto.visibility() != null ? dto.visibility() : media.getVisibility());
        media.setIsFavorite(dto.isFavorite() != null ? dto.isFavorite() : media.getIsFavorite());
        // Rank só existe para favorito: desfavoritar limpa a posição no Top 10,
        // senão `null` continua significando "mantenha o rank atual".
        if (!media.getIsFavorite()) media.setTopRank(null);
        else media.setTopRank(dto.topRank() != null ? dto.topRank() : media.getTopRank());
        // updatedAt is handled automatically by @UpdateTimestamp on the entity

        media = repository.save(media);
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
        log.info("UserMedia deleted: {} by user {}", id, user.getUsername());
    }

    public List<UserMediaDTO> getFavorites() {
        Long userId = authService.authenticatedId();
        return repository.findFavoritesByUserId(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    /** Tipos em que o usuário tem entradas — as abas da biblioteca saíam só da página atual. */
    public List<MediaTypeDTO> getUsedMediaTypes() {
        return repository.findUsedMediaTypesByUserId(authService.authenticatedId()).stream()
                .map(t -> new MediaTypeDTO(
                        t.getId(),
                        t.getName(),
                        t.getIsSystem(),
                        t.getUser() != null ? t.getUser().getId() : null,
                        t.getCreatedAt()))
                .toList();
    }

    public List<PlannedGroupDTO> getPlanned() {
        Long userId = authService.authenticatedId();
        Map<Long, MediaTypeDTO> types = new LinkedHashMap<>();
        Map<Long, List<UserMediaDTO>> byType = new LinkedHashMap<>();
        for (UserMedia m : repository.findPlannedByUserId(userId)) {
            UserMediaDTO dto = toDTO(m);
            types.putIfAbsent(dto.mediaType().id(), dto.mediaType());
            byType.computeIfAbsent(dto.mediaType().id(), k -> new ArrayList<>()).add(dto);
        }
        return byType.entrySet().stream()
                .map(e -> new PlannedGroupDTO(types.get(e.getKey()), e.getValue()))
                .toList();
    }

    @Transactional
    public void reorderPlanned(PlannedOrderDTO dto) {
        Long userId = authService.authenticatedId();
        List<Long> ids = dto.ids();
        if (new HashSet<>(ids).size() != ids.size())
            throw new IllegalArgumentException("Duplicate ids in planned order.");

        Map<Long, UserMedia> found = new HashMap<>();
        repository.findAllById(ids).forEach(m -> found.put(m.getId(), m));
        if (found.size() != ids.size())
            throw new ResourceNotFoundException("Media entry not found.");
        if (found.values().stream().anyMatch(m -> !m.getUser().getId().equals(userId)))
            throw new ForbiddenException("You can only reorder your own entries.");

        // A fila é por tipo de mídia e só existe para o status Planned: sem isso,
        // uma aba desatualizada renumeraria tipos diferentes na mesma faixa 1..n.
        if (found.values().stream().anyMatch(m -> !isSystemPlanned(m.getStatus())))
            throw new IllegalArgumentException("Only entries in the Planned status can be reordered.");
        if (found.values().stream().map(m -> m.getMediaType().getId()).distinct().count() > 1)
            throw new IllegalArgumentException("Planned order is kept per media type.");

        for (int i = 0; i < ids.size(); i++)
            found.get(ids.get(i)).setPlannedOrder(i + 1);
        repository.saveAll(found.values());
        log.info("Planned order updated for user {}: {} entries", userId, ids.size());
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
                m.getFeelings(),
                m.getRecommendation(),
                m.getStartDate(),
                m.getEndDate(),
                m.getNextReleaseDate(),
                m.getNotes(),
                m.getReview(),
                m.getVisibility(),
                m.getIsFavorite(),
                m.getTopRank(),
                m.getPlannedOrder(),
                m.getCreatedAt(),
                m.getUpdatedAt()
        );
    }

    private boolean isSystemPlanned(Status status) {
        return Boolean.TRUE.equals(status.getIsSystem()) && PLANNED_STATUS.equals(status.getName());
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

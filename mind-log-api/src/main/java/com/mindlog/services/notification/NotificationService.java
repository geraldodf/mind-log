package com.mindlog.services.notification;

import com.mindlog.data.dtos.notification.NotificationDTO;
import com.mindlog.data.models.Notification;
import com.mindlog.repositories.NotificationRepository;
import com.mindlog.services.AuthService;
import com.mindlog.services.exceptions.ForbiddenException;
import com.mindlog.services.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Transactional(readOnly = true)
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;
    private final AuthService authService;

    public Page<NotificationDTO> getMyNotifications(Pageable pageable) {
        Long userId = authService.authenticatedId();
        return repository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toDTO);
    }

    public long countUnread() {
        Long userId = authService.authenticatedId();
        return repository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long id) {
        Long userId = authService.authenticatedId();
        Notification notification = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied.");
        }

        notification.setIsRead(true);
        repository.save(notification);
    }

    @Transactional
    public void markAllAsRead() {
        Long userId = authService.authenticatedId();
        repository.markAllAsReadByUserId(userId);
        log.info("All notifications marked as read for user {}", userId);
    }

    private NotificationDTO toDTO(Notification n) {
        // userMedia is optional — notifications may not be linked to a media entry
        Long userMediaId = n.getUserMedia() != null ? n.getUserMedia().getId() : null;
        String userMediaTitle = n.getUserMedia() != null ? n.getUserMedia().getTitle() : null;

        return new NotificationDTO(
                n.getId(),
                n.getUser().getId(),
                userMediaId,
                userMediaTitle,
                n.getRelatedUsername(),
                n.getRelatedName(),
                n.getNotificationType(),
                n.getMessage(),
                n.getIsRead(),
                n.getCreatedAt()
        );
    }
}

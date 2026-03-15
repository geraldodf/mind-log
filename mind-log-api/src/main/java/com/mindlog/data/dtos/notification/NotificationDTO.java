package com.mindlog.data.dtos.notification;

import java.time.Instant;

public record NotificationDTO(
        Long id,
        Long userId,
        Long userMediaId,
        String userMediaTitle,
        String relatedUsername,
        String relatedName,
        String notificationType,
        String message,
        Boolean isRead,
        Instant createdAt
) {}

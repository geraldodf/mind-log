package com.mindlog.data.dtos.notification;

import java.time.Instant;

public record NotificationDTO(
        Long id,
        Long userId,
        Long userMediaId,
        String userMediaTitle,
        String message,
        Boolean isRead,
        Instant createdAt
) {}

package com.mindlog.data.dtos.status;

import java.time.Instant;

public record StatusDTO(
        Long id,
        String name,
        Boolean isSystem,
        Long userId,
        Instant createdAt
) {}

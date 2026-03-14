package com.mindlog.data.dtos.mediatype;

import java.time.Instant;

public record MediaTypeDTO(
        Long id,
        String name,
        Boolean isSystem,
        Long userId,
        Instant createdAt
) {}

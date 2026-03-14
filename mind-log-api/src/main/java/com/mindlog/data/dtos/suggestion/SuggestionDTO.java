package com.mindlog.data.dtos.suggestion;

import com.mindlog.data.enums.SuggestionStatus;

import java.time.Instant;

public record SuggestionDTO(
        Long id,
        Long userId,
        String username,
        String content,
        SuggestionStatus status,
        Instant createdAt
) {}

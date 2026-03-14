package com.mindlog.data.dtos.suggestion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SuggestionCreateDTO(
        @NotBlank(message = "Content is required")
        @Size(max = 2000, message = "Suggestion must not exceed 2000 characters")
        String content
) {}

package com.mindlog.data.dtos.usermedia;

import com.mindlog.data.enums.Recommendation;
import com.mindlog.data.enums.Visibility;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Single DTO for both creating and updating a media entry.
 */
public record UserMediaSaveDTO(
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        String title,

        @NotNull(message = "Media type is required")
        Long mediaTypeId,

        @NotNull(message = "Status is required")
        Long statusId,

        @Min(value = 1, message = "Rating must be between 1 and 5")
        @Max(value = 5, message = "Rating must be between 1 and 5")
        Integer rating,

        List<String> feelings,

        Recommendation recommendation,

        LocalDate startDate,

        LocalDate endDate,

        LocalDate nextReleaseDate,

        String notes,

        String review,

        Visibility visibility,

        Boolean isFavorite,

        @Min(value = 1, message = "Top rank must be between 1 and 10")
        @Max(value = 10, message = "Top rank must be between 1 and 10")
        Integer topRank
) {}

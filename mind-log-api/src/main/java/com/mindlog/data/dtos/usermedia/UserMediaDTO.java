package com.mindlog.data.dtos.usermedia;

import com.mindlog.data.dtos.mediatype.MediaTypeDTO;
import com.mindlog.data.dtos.status.StatusDTO;
import com.mindlog.data.enums.Recommendation;
import com.mindlog.data.enums.Visibility;

import java.time.Instant;
import java.time.LocalDate;

public record UserMediaDTO(
        Long id,
        Long userId,
        String title,
        MediaTypeDTO mediaType,
        StatusDTO status,
        Integer rating,
        String feeling,
        Recommendation recommendation,
        LocalDate startDate,
        LocalDate endDate,
        LocalDate nextReleaseDate,
        String notes,
        String review,
        Visibility visibility,
        Instant createdAt,
        Instant updatedAt
) {}

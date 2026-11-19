package com.mindlog.data.dtos.recommendation;

import com.mindlog.data.dtos.mediatype.MediaTypeDTO;

import java.util.List;

public record RecommendationDTO(
        Long id,
        String title,
        MediaTypeDTO mediaType,
        String reason,
        List<String> basedOn
) {}

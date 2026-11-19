package com.mindlog.data.dtos.retrospective;

public record RatedMediaDTO(Long id, String title, String mediaTypeName, Boolean mediaTypeIsSystem, int rating, boolean isFavorite) {}

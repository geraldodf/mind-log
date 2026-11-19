package com.mindlog.data.dtos.imports;

/** Uma linha da prévia. {@code state}: {@code NEW} (será criada) ou {@code DUPLICATE} (será pulada). */
public record ImportItemDTO(
        String title,
        String mediaType,
        String status,
        Integer rating,
        String state
) {}

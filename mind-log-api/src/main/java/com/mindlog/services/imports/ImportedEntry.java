package com.mindlog.services.imports;

import java.time.LocalDate;

/**
 * Uma entrada já traduzida para o vocabulário do MindLog. {@code mediaType} e {@code status}
 * são nomes (Movie, Book, Anime, Manga / Planned, In Progress...), resolvidos pelo serviço.
 */
public record ImportedEntry(
        String title,
        String mediaType,
        String status,
        Integer rating,
        LocalDate startDate,
        LocalDate endDate,
        String notes,
        String review
) {}

package com.mindlog.data.dtos.recommendation;

import java.util.List;

/**
 * Tudo que alimenta o pedido ao modelo.
 *
 * @param liked           entradas bem avaliadas (a base do gosto)
 * @param avoid           entradas mal avaliadas (o que não repetir)
 * @param knownTitles     títulos que já estão na biblioteca (não sugerir de novo)
 * @param dismissedTitles títulos já descartados pelo usuário
 * @param allowedTypes    nomes dos tipos de mídia que o usuário pode usar
 * @param language        idioma do motivo ({@code en} ou {@code pt})
 */
public record RecommendationInput(
        List<LibraryEntryDTO> liked,
        List<LibraryEntryDTO> avoid,
        List<String> knownTitles,
        List<String> dismissedTitles,
        List<String> allowedTypes,
        String language
) {
}

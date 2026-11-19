package com.mindlog.data.dtos.recommendation;

import com.mindlog.data.enums.Recommendation;

/**
 * Projeção mínima de uma entrada da biblioteca: é só isso que pode sair do sistema para o
 * provedor de IA (nunca notas, review nem feelings).
 */
public record LibraryEntryDTO(String title, String typeName, Integer rating, Recommendation recommendation) {
}

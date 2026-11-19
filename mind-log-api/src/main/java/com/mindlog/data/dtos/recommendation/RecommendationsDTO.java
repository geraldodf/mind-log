package com.mindlog.data.dtos.recommendation;

import java.time.Instant;
import java.util.List;

/**
 * @param enabled         há provedor de IA configurado; falso esconde a seção inteira no front
 * @param eligible        o usuário já tem entradas bem avaliadas suficientes para gerar
 * @param remaining       gerações que ainda cabem nas últimas 24 h
 * @param nextAvailableAt quando uma geração volta a caber (só preenchido se {@code remaining} é 0)
 * @param items           sugestões pendentes
 */
public record RecommendationsDTO(
        boolean enabled,
        boolean eligible,
        int remaining,
        Instant nextAvailableAt,
        List<RecommendationDTO> items
) {}

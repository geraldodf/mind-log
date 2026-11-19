package com.mindlog.data.dtos.imports;

import java.util.List;

/**
 * O que a importação faria, sem gravar nada. {@code toImport} + {@code duplicates} = entradas lidas;
 * {@code invalid} conta as linhas ignoradas. {@code items} e {@code issues} vêm limitados;
 * {@code issuesTotal} é o total real de problemas.
 */
public record ImportPreviewDTO(
        int toImport,
        int duplicates,
        int invalid,
        List<ImportCountDTO> byMediaType,
        List<ImportCountDTO> byStatus,
        List<ImportItemDTO> items,
        List<ImportIssueDTO> issues,
        int issuesTotal
) {}

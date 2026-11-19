package com.mindlog.data.dtos.imports;

/**
 * Linha do arquivo que não pôde ser importada (ou foi importada sem um campo).
 * {@code code} é estável: a tela traduz por ele. {@code value} é o texto que causou o problema.
 */
public record ImportIssueDTO(
        String file,
        long row,
        String code,
        String value
) {}

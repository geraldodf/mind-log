package com.mindlog.services.imports;

import com.mindlog.data.enums.ImportSource;

import java.io.IOException;
import java.io.InputStream;

public interface ImportParser {

    ImportSource source();

    /**
     * Lê o arquivo enviado. Linha ruim vira {@code ImportIssueDTO}; arquivo que não é do formato
     * esperado lança {@code FieldValidationException} com código {@code file.invalid}.
     */
    ParsedImport parse(InputStream in) throws IOException;
}

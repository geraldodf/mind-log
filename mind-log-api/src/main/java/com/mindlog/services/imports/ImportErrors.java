package com.mindlog.services.imports;

import com.mindlog.services.exceptions.FieldValidationException;

/** Erros de arquivo com código estável (o web traduz por {@code code}). */
public final class ImportErrors {

    private ImportErrors() {
    }

    public static FieldValidationException tooLarge() {
        return new FieldValidationException("file", "file.tooLarge", "The file is too large.");
    }

    public static FieldValidationException tooManyEntries() {
        return new FieldValidationException("file", "file.tooManyEntries", "The file has too many entries.");
    }

    public static FieldValidationException invalid() {
        return new FieldValidationException("file", "file.invalid", "The file is not in the expected format.");
    }

    public static FieldValidationException empty() {
        return new FieldValidationException("file", "file.empty", "The file is empty.");
    }
}

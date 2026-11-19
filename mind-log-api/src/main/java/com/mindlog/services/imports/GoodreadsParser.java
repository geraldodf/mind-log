package com.mindlog.services.imports;

import com.mindlog.data.dtos.imports.ImportIssueDTO;
import com.mindlog.data.enums.ImportSource;
import com.mindlog.services.exceptions.FieldValidationException;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** {@code goodreads_library_export.csv}: um livro por linha, prateleira em {@code Exclusive Shelf}. */
@Component
public class GoodreadsParser implements ImportParser {

    private static final String FILE = "goodreads_library_export.csv";

    @Override
    public ImportSource source() {
        return ImportSource.GOODREADS;
    }

    @Override
    public ParsedImport parse(InputStream in) throws IOException {
        List<ImportedEntry> entries = new ArrayList<>();
        List<ImportIssueDTO> issues = new ArrayList<>();
        try (CSVParser csv = ImportText.csv(in)) {
            if (!ImportText.hasColumn(csv, "Title") || !ImportText.hasColumn(csv, "Exclusive Shelf"))
                throw ImportErrors.invalid();
            for (CSVRecord record : csv) {
                read(record, entries, issues);
            }
        } catch (FieldValidationException e) {
            throw e;
        } catch (IllegalArgumentException | UncheckedIOException e) {
            throw ImportErrors.invalid();
        }
        return new ParsedImport(entries, issues);
    }

    private void read(CSVRecord record, List<ImportedEntry> entries, List<ImportIssueDTO> issues) {
        long row = record.getRecordNumber();
        String title = ImportText.get(record, "Title");
        String titleIssue = ImportText.titleIssue(title);
        if (titleIssue != null) {
            issues.add(new ImportIssueDTO(FILE, row, titleIssue, ImportText.clip(title)));
            return;
        }
        String shelf = ImportText.get(record, "Exclusive Shelf");
        String status = statusOf(shelf);
        if (status == null) {
            issues.add(new ImportIssueDTO(FILE, row, "shelf.unknown", ImportText.clip(shelf)));
            return;
        }
        Integer rating = null;
        String rawRating = ImportText.get(record, "My Rating");
        try {
            rating = ImportText.toStars(rawRating, 5);
        } catch (IllegalArgumentException e) {
            issues.add(new ImportIssueDTO(FILE, row, "rating.invalid", ImportText.clip(rawRating)));
        }
        entries.add(new ImportedEntry(
                title.trim(),
                "Book",
                status,
                rating,
                null,
                ImportText.slashDate(ImportText.get(record, "Date Read")),
                ImportText.plainText(ImportText.get(record, "Private Notes")),
                ImportText.plainText(ImportText.get(record, "My Review"))));
    }

    private String statusOf(String shelf) {
        if (shelf == null) return null;
        return switch (shelf.trim().toLowerCase(Locale.ROOT)) {
            case "read" -> "Completed";
            case "currently-reading" -> "In Progress";
            case "to-read" -> "Planned";
            case "did-not-finish", "dnf" -> "Dropped";
            default -> null;
        };
    }
}

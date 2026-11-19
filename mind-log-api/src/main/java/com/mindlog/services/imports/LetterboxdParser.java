package com.mindlog.services.imports;

import com.mindlog.data.dtos.imports.ImportIssueDTO;
import com.mindlog.data.enums.ImportSource;
import com.mindlog.services.exceptions.FieldValidationException;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * ZIP do export do Letterboxd. Lê {@code watchlist}, {@code watched}, {@code ratings}, {@code diary} e
 * {@code reviews} (nessa ordem, para o que foi assistido sobrepor a watchlist) e junta tudo por filme.
 * Tags, likes e listas não têm campo no MindLog e são ignorados.
 */
@Component
public class LetterboxdParser implements ImportParser {

    /** Ordem de leitura: cada arquivo refina o filme criado pelo anterior. */
    private static final List<String> FILES =
            List.of("watchlist.csv", "watched.csv", "ratings.csv", "diary.csv", "reviews.csv");
    private static final Set<String> IGNORED_FOLDERS = Set.of("deleted", "likes", "lists");
    private static final int MAX_ZIP_ENTRIES = 500;

    @Override
    public ImportSource source() {
        return ImportSource.LETTERBOXD;
    }

    @Override
    public ParsedImport parse(InputStream in) throws IOException {
        Map<String, byte[]> files = readZip(in);
        if (files.isEmpty()) throw ImportErrors.invalid();

        Map<String, Film> films = new LinkedHashMap<>();
        List<ImportIssueDTO> issues = new ArrayList<>();
        Set<String> reported = new HashSet<>();
        for (String file : FILES) {
            byte[] content = files.get(file);
            if (content == null) continue;
            try (CSVParser csv = ImportText.csv(new ByteArrayInputStream(content))) {
                if (!ImportText.hasColumn(csv, "Name")) throw ImportErrors.invalid();
                for (CSVRecord record : csv) {
                    apply(file, record, films, issues, reported);
                }
            } catch (FieldValidationException e) {
                throw e;
            } catch (IllegalArgumentException | UncheckedIOException e) {
                throw ImportErrors.invalid();
            }
        }
        return new ParsedImport(entries(films), issues);
    }

    private void apply(String file, CSVRecord record, Map<String, Film> films,
                       List<ImportIssueDTO> issues, Set<String> reported) {
        String name = ImportText.get(record, "Name");
        String year = ImportText.get(record, "Year");
        String uri = ImportText.get(record, "Letterboxd URI");
        String key = uri != null ? uri : (name == null ? "" : ImportText.normalize(name)) + "|" + year;

        String titleIssue = ImportText.titleIssue(name);
        if (titleIssue != null) {
            if (reported.add(key + "|" + titleIssue))
                issues.add(new ImportIssueDTO(file, record.getRecordNumber(), titleIssue, ImportText.clip(name)));
            return;
        }

        Film film = films.computeIfAbsent(key, k -> new Film(name.trim(), year));
        switch (file) {
            case "watchlist.csv" -> film.status = film.status == null ? "Planned" : film.status;
            case "watched.csv" -> film.status = "Completed";
            case "ratings.csv" -> {
                film.status = "Completed";
                film.rating = rating(file, record, issues, true, film.rating);
            }
            case "diary.csv" -> {
                film.status = "Completed";
                film.watchedOn(ImportText.isoDate(ImportText.get(record, "Watched Date")));
                film.rating = rating(file, record, issues, false, film.rating);
            }
            case "reviews.csv" -> {
                film.status = "Completed";
                film.watchedOn(ImportText.isoDate(ImportText.get(record, "Watched Date")));
                film.rating = rating(file, record, issues, false, film.rating);
                String review = ImportText.plainText(ImportText.get(record, "Review"));
                if (review != null) film.review = review;
            }
            default -> {
            }
        }
    }

    /** {@code ratings.csv} manda na nota; nos outros arquivos ela só preenche o que está vazio. */
    private Integer rating(String file, CSVRecord record, List<ImportIssueDTO> issues, boolean authoritative,
                           Integer current) {
        String raw = ImportText.get(record, "Rating");
        try {
            Integer stars = ImportText.toStars(raw, 5);
            if (stars == null) return current;
            return authoritative || current == null ? stars : current;
        } catch (IllegalArgumentException e) {
            issues.add(new ImportIssueDTO(file, record.getRecordNumber(), "rating.invalid", ImportText.clip(raw)));
            return current;
        }
    }

    /** Dois filmes com o mesmo nome (refilmagem) ganham o ano no título, para não parecerem duplicados. */
    private List<ImportedEntry> entries(Map<String, Film> films) {
        Map<String, Integer> sameName = new HashMap<>();
        films.values().forEach(f -> sameName.merge(ImportText.normalize(f.name), 1, Integer::sum));
        List<ImportedEntry> entries = new ArrayList<>();
        for (Film film : films.values()) {
            boolean collides = sameName.get(ImportText.normalize(film.name)) > 1 && film.year != null;
            String title = collides ? film.name + " (" + film.year + ")" : film.name;
            entries.add(new ImportedEntry(title, "Movie", film.status, film.rating, null, film.endDate, null,
                    film.review));
        }
        return entries;
    }

    /**
     * Lê os CSV que interessam do ZIP, sem extrair nada em disco. Todo byte descompactado, lido ou
     * descartado, conta no mesmo orçamento: ZIP-bomba estoura o limite em vez de travar o servidor.
     */
    private Map<String, byte[]> readZip(InputStream in) throws IOException {
        Map<String, byte[]> files = new HashMap<>();
        try (ZipInputStream zip = new ZipInputStream(in);
             InputStream budget = new LimitedInputStream(zip, ImportLimits.MAX_UNCOMPRESSED_BYTES)) {
            ZipEntry entry;
            int count = 0;
            while ((entry = zip.getNextEntry()) != null) {
                if (++count > MAX_ZIP_ENTRIES) throw ImportErrors.invalid();
                String wanted = wantedName(entry);
                if (entry.isDirectory() || wanted == null || files.containsKey(wanted))
                    budget.transferTo(OutputStream.nullOutputStream());
                else
                    files.put(wanted, budget.readAllBytes());
            }
        } catch (java.util.zip.ZipException e) {
            throw ImportErrors.invalid();
        }
        return files;
    }

    /** Nome do CSV se for um dos lidos e não estiver numa pasta ignorada ({@code likes/}, {@code lists/}...). */
    private String wantedName(ZipEntry entry) {
        String[] parts = entry.getName().replace('\\', '/').toLowerCase(Locale.ROOT).split("/");
        String base = parts[parts.length - 1];
        if (!FILES.contains(base)) return null;
        for (int i = 0; i < parts.length - 1; i++)
            if (IGNORED_FOLDERS.contains(parts[i])) return null;
        return base;
    }

    private static final class Film {
        private final String name;
        private final String year;
        private String status;
        private Integer rating;
        private LocalDate endDate;
        private String review;

        private Film(String name, String year) {
            this.name = name;
            this.year = year;
        }

        /** Reassistido: vale a data mais recente. */
        private void watchedOn(LocalDate date) {
            if (date != null && (endDate == null || date.isAfter(endDate))) endDate = date;
        }
    }
}

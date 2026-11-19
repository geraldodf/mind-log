package com.mindlog.services.imports;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;
import java.util.regex.Pattern;

/** Conversões compartilhadas pelos parsers: texto, nota, data e CSV. */
final class ImportText {

    private static final Pattern BREAK = Pattern.compile("(?i)<br\\s*/?>");
    private static final Pattern BLOCK_START = Pattern.compile("(?i)<(p|div)\\b[^>]*>");
    private static final Pattern BLOCK_END = Pattern.compile("(?i)</(p|div|li|blockquote)>");
    private static final Pattern TAG = Pattern.compile("<[^>]+>");
    private static final Pattern MANY_BLANK_LINES = Pattern.compile("\\n{3,}");
    private static final Pattern MARKS = Pattern.compile("\\p{M}+");
    private static final Pattern SPACES = Pattern.compile("\\s+");
    private static final DateTimeFormatter SLASH_DATE = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    private ImportText() {
    }

    /** Título comparável: sem acento, minúsculo, espaços repetidos colapsados. */
    static String normalize(String title) {
        String decomposed = Normalizer.normalize(title, Normalizer.Form.NFD);
        String bare = MARKS.matcher(decomposed).replaceAll("");
        return SPACES.matcher(bare.toLowerCase(Locale.ROOT)).replaceAll(" ").trim();
    }

    /** Texto de review/nota vindo com HTML leve: tira as marcas, mantém as quebras de linha. */
    static String plainText(String raw) {
        if (raw == null) return null;
        String text = BREAK.matcher(raw).replaceAll("\n");
        text = BLOCK_START.matcher(text).replaceAll("\n\n");
        text = BLOCK_END.matcher(text).replaceAll("\n\n");
        text = TAG.matcher(text).replaceAll("");
        text = text.replace("&nbsp;", " ").replace("&lt;", "<").replace("&gt;", ">")
                .replace("&quot;", "\"").replace("&#39;", "'").replace("&#x27;", "'").replace("&amp;", "&");
        text = MANY_BLANK_LINES.matcher(text.replace("\r\n", "\n")).replaceAll("\n\n").trim();
        return text.isEmpty() ? null : text;
    }

    static String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /** Código do problema do título, ou {@code null} se serve. */
    static String titleIssue(String title) {
        if (title == null || title.isBlank()) return "title.missing";
        if (title.trim().length() > ImportLimits.MAX_TITLE_LENGTH) return "title.tooLong";
        return null;
    }

    static String clip(String value) {
        if (value == null) return null;
        return value.length() > 80 ? value.substring(0, 80) : value;
    }

    /**
     * Converte uma nota para 1–5 estrelas, arredondando para cima. {@code scaleMax} é o teto da origem
     * (5 ou 10). Vazio ou zero = sem nota ({@code null}). Fora da escala ou ilegível lança
     * {@link IllegalArgumentException}.
     */
    static Integer toStars(String raw, int scaleMax) {
        String text = blankToNull(raw);
        if (text == null) return null;
        BigDecimal value = new BigDecimal(text.replace(',', '.'));
        if (value.signum() == 0) return null;
        if (value.signum() < 0 || value.compareTo(BigDecimal.valueOf(scaleMax)) > 0)
            throw new IllegalArgumentException("Rating out of range: " + text);
        BigDecimal stars = scaleMax == 5 ? value : value.divide(BigDecimal.valueOf(2));
        return stars.setScale(0, RoundingMode.CEILING).intValueExact();
    }

    /** {@code YYYY-MM-DD}; vazio, {@code 0000-00-00} (MAL) ou data inválida viram {@code null}. */
    static LocalDate isoDate(String raw) {
        String text = blankToNull(raw);
        if (text == null) return null;
        try {
            return LocalDate.parse(text);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    /** {@code yyyy/MM/dd} (Goodreads). */
    static LocalDate slashDate(String raw) {
        String text = blankToNull(raw);
        if (text == null) return null;
        try {
            return LocalDate.parse(text, SLASH_DATE);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    static CSVParser csv(InputStream in) throws IOException {
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreEmptyLines(true)
                .setIgnoreSurroundingSpaces(true)
                .setAllowMissingColumnNames(true)
                .setAllowDuplicateHeaderNames(true)
                .get();
        return CSVParser.builder().setFormat(format).setReader(utf8Reader(in)).get();
    }

    /** Valor da coluna (cabeçalho sem diferenciar caixa), ou {@code null} se ausente ou em branco. */
    static String get(CSVRecord record, String column) {
        for (String header : record.getParser().getHeaderNames()) {
            if (header != null && header.trim().equalsIgnoreCase(column))
                return record.isSet(header) ? blankToNull(record.get(header)) : null;
        }
        return null;
    }

    static boolean hasColumn(CSVParser parser, String column) {
        return parser.getHeaderNames().stream().anyMatch(h -> h != null && h.trim().equalsIgnoreCase(column));
    }

    /** Leitor UTF-8 que descarta o BOM, se houver. */
    private static Reader utf8Reader(InputStream in) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8));
        reader.mark(1);
        if (reader.read() != 0xFEFF) reader.reset();
        return reader;
    }
}

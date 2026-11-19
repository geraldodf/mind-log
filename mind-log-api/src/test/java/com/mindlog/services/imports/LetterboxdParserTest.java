package com.mindlog.services.imports;

import com.mindlog.services.exceptions.FieldValidationException;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LetterboxdParserTest {

    private final LetterboxdParser parser = new LetterboxdParser();

    private static byte[] zip(Map<String, String> files) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (ZipOutputStream zip = new ZipOutputStream(out)) {
            for (Map.Entry<String, String> file : files.entrySet()) {
                zip.putNextEntry(new ZipEntry(file.getKey()));
                zip.write(file.getValue().getBytes(StandardCharsets.UTF_8));
                zip.closeEntry();
            }
        }
        return out.toByteArray();
    }

    private ParsedImport parse(byte[] bytes) throws IOException {
        return parser.parse(new ByteArrayInputStream(bytes));
    }

    @Test
    void parse_mergesFilesPerFilm() throws IOException {
        Map<String, String> files = new LinkedHashMap<>();
        files.put("watchlist.csv", """
                Date,Name,Year,Letterboxd URI
                2024-01-01,Wanted Film,2020,https://boxd.it/a
                2024-01-01,Now Watched,2019,https://boxd.it/b
                """);
        files.put("watched.csv", """
                Date,Name,Year,Letterboxd URI
                2024-02-01,Now Watched,2019,https://boxd.it/b
                2024-02-01,Only Watched,2018,https://boxd.it/c
                2024-02-01,Reviewed Film,2017,https://boxd.it/d
                """);
        files.put("ratings.csv", """
                Date,Name,Year,Letterboxd URI,Rating
                2024-02-02,Only Watched,2018,https://boxd.it/c,3.5
                """);
        files.put("diary.csv", """
                Date,Name,Year,Letterboxd URI,Rating,Rewatch,Tags,Watched Date
                2024-03-01,Only Watched,2018,https://boxd.it/entry,4,,,2024-02-20
                2024-03-02,Only Watched,2018,https://boxd.it/entry,4,Yes,,2024-02-25
                2024-03-03,Reviewed Film,2017,https://boxd.it/entry,5,,"a,b",2024-01-10
                """);
        files.put("reviews.csv", """
                Date,Name,Year,Letterboxd URI,Rating,Rewatch,Review,Tags,Watched Date
                2024-03-03,Reviewed Film,2017,https://boxd.it/review,5,,"<p>Brilliant, truly.</p>",,2024-01-10
                """);
        files.put("likes/films.csv", "Date,Name,Year,Letterboxd URI\n2024-01-01,Liked Only,2000,https://boxd.it/z\n");
        files.put("deleted/watched.csv", "Date,Name,Year,Letterboxd URI\n2024-01-01,Deleted One,2000,https://boxd.it/y\n");

        ParsedImport result = parse(zip(files));

        assertThat(result.issues()).isEmpty();
        assertThat(result.entries()).extracting(ImportedEntry::title)
                .containsExactly("Wanted Film", "Now Watched", "Only Watched", "Reviewed Film");

        ImportedEntry wanted = result.entries().get(0);
        assertThat(wanted.status()).isEqualTo("Planned");
        assertThat(wanted.mediaType()).isEqualTo("Movie");

        assertThat(result.entries().get(1).status()).isEqualTo("Completed");

        ImportedEntry only = result.entries().get(2);
        assertThat(only.status()).isEqualTo("Completed");
        assertThat(only.rating()).isEqualTo(4);
        assertThat(only.endDate()).isEqualTo(LocalDate.of(2024, 2, 25));
        assertThat(only.startDate()).isNull();

        ImportedEntry reviewed = result.entries().get(3);
        assertThat(reviewed.rating()).isEqualTo(5);
        assertThat(reviewed.review()).isEqualTo("Brilliant, truly.");
    }

    @Test
    void parse_addsYearWhenTwoFilmsShareTheName() throws IOException {
        ParsedImport result = parse(zip(Map.of("watched.csv", """
                Date,Name,Year,Letterboxd URI
                2024-01-01,Dune,1984,https://boxd.it/a
                2024-01-01,Dune,2021,https://boxd.it/b
                2024-01-01,Alien,1979,https://boxd.it/c
                """)));

        assertThat(result.entries()).extracting(ImportedEntry::title)
                .containsExactlyInAnyOrder("Dune (1984)", "Dune (2021)", "Alien");
    }

    @Test
    void parse_ignoresJunkYearsAndKeepsLongTitlesWithoutTheYearSuffix() throws IOException {
        String longName = "x".repeat(252);
        ParsedImport result = parse(zip(Map.of("watched.csv", "Date,Name,Year,Letterboxd URI\n"
                + "2024-01-01,Alien,<script>,https://boxd.it/a\n"
                + "2024-01-01," + longName + ",1990,https://boxd.it/b\n"
                + "2024-01-01," + longName + ",1991,https://boxd.it/c\n")));

        assertThat(result.entries()).extracting(ImportedEntry::title).containsExactly("Alien", longName, longName);
    }

    @Test
    void parse_reportsBadTitleOnceAndKeepsGoing() throws IOException {
        ParsedImport result = parse(zip(Map.of("watched.csv", """
                Date,Name,Year,Letterboxd URI
                2024-01-01,,2000,https://boxd.it/a
                2024-01-01,Fine,2001,https://boxd.it/b
                """)));

        assertThat(result.entries()).extracting(ImportedEntry::title).containsExactly("Fine");
        assertThat(result.issues()).hasSize(1);
        assertThat(result.issues().get(0).code()).isEqualTo("title.missing");
        assertThat(result.issues().get(0).file()).isEqualTo("watched.csv");
    }

    @Test
    void parse_rejectsZipWithoutKnownFiles() throws IOException {
        byte[] bytes = zip(Map.of("profile.csv", "Date Joined,Username\n2020-01-01,x\n"));

        assertThatThrownBy(() -> parse(bytes))
                .isInstanceOfSatisfying(FieldValidationException.class,
                        e -> assertThat(e.getCode()).isEqualTo("file.invalid"));
    }

    @Test
    void parse_rejectsNonZip() {
        assertThatThrownBy(() -> parse("Date,Name\n".getBytes(StandardCharsets.UTF_8)))
                .isInstanceOfSatisfying(FieldValidationException.class,
                        e -> assertThat(e.getCode()).isEqualTo("file.invalid"));
    }

    @Test
    void parse_stopsAZipThatInflatesPastTheLimit() throws IOException {
        // 25 MB de zeros comprimem para poucos KB: o limite é sobre o descompactado.
        byte[] zeros = new byte[1024 * 1024];
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (ZipOutputStream zip = new ZipOutputStream(out)) {
            zip.putNextEntry(new ZipEntry("junk.bin"));
            for (int i = 0; i < 25; i++) zip.write(zeros);
            zip.closeEntry();
            zip.putNextEntry(new ZipEntry("watched.csv"));
            zip.write("Date,Name,Year,Letterboxd URI\n".getBytes(StandardCharsets.UTF_8));
            zip.closeEntry();
        }

        assertThatThrownBy(() -> parse(out.toByteArray()))
                .isInstanceOfSatisfying(FieldValidationException.class,
                        e -> assertThat(e.getCode()).isEqualTo("file.tooLarge"));
    }
}

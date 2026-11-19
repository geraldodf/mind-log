package com.mindlog.services.imports;

import com.mindlog.services.exceptions.FieldValidationException;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GoodreadsParserTest {

    private static final String HEADER = "Book Id,Title,Author,ISBN,My Rating,Date Read,Date Added,"
            + "Bookshelves,Exclusive Shelf,My Review,Spoiler,Private Notes,Read Count\n";

    private final GoodreadsParser parser = new GoodreadsParser();

    private ParsedImport parse(String csv) throws IOException {
        return parser.parse(new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8)));
    }

    @Test
    void parse_mapsShelvesRatingDatesAndTexts() throws IOException {
        ParsedImport result = parse(HEADER
                + "1,\"Dune (Dune, #1)\",Frank Herbert,=\"0441013597\",5,2023/12/31,2023/01/01,sci-fi,read,"
                + "\"Loved it<br/>Really &amp; truly\",,\"borrowed from Ana\",1\n"
                + "2,Neuromancer,William Gibson,,0,,2024/02/02,,currently-reading,,,,0\n"
                + "3,Snow Crash,Neal Stephenson,,0,,2024/02/03,,to-read,,,,0\n"
                + "4,Quit Book,Someone,,2,2022/05/05,2022/01/01,,did-not-finish,,,,1\n");

        assertThat(result.issues()).isEmpty();
        assertThat(result.entries()).hasSize(4);

        ImportedEntry dune = result.entries().get(0);
        assertThat(dune.title()).isEqualTo("Dune (Dune, #1)");
        assertThat(dune.mediaType()).isEqualTo("Book");
        assertThat(dune.status()).isEqualTo("Completed");
        assertThat(dune.rating()).isEqualTo(5);
        assertThat(dune.endDate()).isEqualTo(LocalDate.of(2023, 12, 31));
        assertThat(dune.startDate()).isNull();
        assertThat(dune.review()).isEqualTo("Loved it\nReally & truly");
        assertThat(dune.notes()).isEqualTo("borrowed from Ana");

        assertThat(result.entries().get(1).status()).isEqualTo("In Progress");
        assertThat(result.entries().get(1).rating()).isNull();
        assertThat(result.entries().get(2).status()).isEqualTo("Planned");
        assertThat(result.entries().get(3).status()).isEqualTo("Dropped");
    }

    @Test
    void parse_keepsMultilineQuotedReview() throws IOException {
        ParsedImport result = parse(HEADER + "1,Emma,Austen,,4,2020/01/01,,,read,\"line one\nline two\",,,1\n");

        assertThat(result.entries()).hasSize(1);
        assertThat(result.entries().get(0).review()).isEqualTo("line one\nline two");
    }

    @Test
    void parse_reportsUnknownShelfAndBadTitlesAndContinues() throws IOException {
        ParsedImport result = parse(HEADER
                + "1,Good Book,A,,3,,,,read,,,,1\n"
                + "2,Custom Shelf Book,A,,3,,,favorites,favorites,,,,1\n"
                + "3,,A,,3,,,,read,,,,1\n"
                + "4," + "x".repeat(300) + ",A,,3,,,,read,,,,1\n");

        assertThat(result.entries()).extracting(ImportedEntry::title).containsExactly("Good Book");
        assertThat(result.issues()).extracting("code", "row")
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple("shelf.unknown", 2L),
                        org.assertj.core.groups.Tuple.tuple("title.missing", 3L),
                        org.assertj.core.groups.Tuple.tuple("title.tooLong", 4L));
    }

    @Test
    void parse_acceptsBomAndLowercaseHeaders() throws IOException {
        ParsedImport result = parse("﻿title,exclusive shelf,my rating\nBook,read,4\n");

        assertThat(result.entries()).hasSize(1);
        assertThat(result.entries().get(0).rating()).isEqualTo(4);
    }

    @Test
    void parse_rejectsFileWithoutExpectedColumns() {
        assertThatThrownBy(() -> parse("foo,bar\n1,2\n"))
                .isInstanceOfSatisfying(FieldValidationException.class,
                        e -> assertThat(e.getCode()).isEqualTo("file.invalid"));
    }
}

package com.mindlog.services.imports;

import com.mindlog.services.exceptions.FieldValidationException;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.zip.GZIPOutputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MyAnimeListParserTest {

    private static final String XML = """
            <?xml version="1.0" encoding="UTF-8" ?>
            <myanimelist>
              <myinfo><user_id>1</user_id><user_export_type>1</user_export_type></myinfo>
              <anime>
                <series_animedb_id>1</series_animedb_id>
                <series_title><![CDATA[Cowboy Bebop]]></series_title>
                <my_start_date>2020-01-02</my_start_date>
                <my_finish_date>2020-02-03</my_finish_date>
                <my_score>10</my_score>
                <my_status>Completed</my_status>
                <my_comments><![CDATA[Classic]]></my_comments>
              </anime>
              <anime>
                <series_title><![CDATA[Planned Show]]></series_title>
                <my_start_date>0000-00-00</my_start_date>
                <my_finish_date>0000-00-00</my_finish_date>
                <my_score>0</my_score>
                <my_status>Plan to Watch</my_status>
                <my_comments><![CDATA[]]></my_comments>
              </anime>
              <anime>
                <series_title><![CDATA[Numeric Status]]></series_title>
                <my_score>7</my_score>
                <my_status>4</my_status>
              </anime>
              <anime>
                <series_title><![CDATA[Weird Status]]></series_title>
                <my_status>Someday</my_status>
              </anime>
              <manga>
                <manga_title><![CDATA[Berserk]]></manga_title>
                <my_score>9</my_score>
                <my_status>Reading</my_status>
              </manga>
            </myanimelist>
            """;

    private final MyAnimeListParser parser = new MyAnimeListParser();

    private ParsedImport parse(byte[] bytes) throws IOException {
        return parser.parse(new ByteArrayInputStream(bytes));
    }

    @Test
    void parse_mapsAnimeAndMangaEntries() throws IOException {
        ParsedImport result = parse(XML.getBytes(StandardCharsets.UTF_8));

        assertThat(result.entries()).hasSize(4);

        ImportedEntry bebop = result.entries().get(0);
        assertThat(bebop.title()).isEqualTo("Cowboy Bebop");
        assertThat(bebop.mediaType()).isEqualTo("Anime");
        assertThat(bebop.status()).isEqualTo("Completed");
        assertThat(bebop.rating()).isEqualTo(5);
        assertThat(bebop.startDate()).isEqualTo(LocalDate.of(2020, 1, 2));
        assertThat(bebop.endDate()).isEqualTo(LocalDate.of(2020, 2, 3));
        assertThat(bebop.notes()).isEqualTo("Classic");

        ImportedEntry planned = result.entries().get(1);
        assertThat(planned.status()).isEqualTo("Planned");
        assertThat(planned.rating()).isNull();
        assertThat(planned.startDate()).isNull();
        assertThat(planned.endDate()).isNull();
        assertThat(planned.notes()).isNull();

        assertThat(result.entries().get(2).status()).isEqualTo("Dropped");
        assertThat(result.entries().get(2).rating()).isEqualTo(4);

        ImportedEntry berserk = result.entries().get(3);
        assertThat(berserk.mediaType()).isEqualTo("Manga");
        assertThat(berserk.status()).isEqualTo("In Progress");
        assertThat(berserk.rating()).isEqualTo(5);
    }

    @Test
    void parse_reportsUnknownStatusAndContinues() throws IOException {
        ParsedImport result = parse(XML.getBytes(StandardCharsets.UTF_8));

        assertThat(result.issues()).hasSize(1);
        assertThat(result.issues().get(0).code()).isEqualTo("status.unknown");
        assertThat(result.issues().get(0).row()).isEqualTo(4);
        assertThat(result.issues().get(0).value()).isEqualTo("Someday");
    }

    @Test
    void parse_readsGzippedFile() throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (GZIPOutputStream gzip = new GZIPOutputStream(out)) {
            gzip.write(XML.getBytes(StandardCharsets.UTF_8));
        }

        assertThat(parse(out.toByteArray()).entries()).hasSize(4);
    }

    @Test
    void parse_stopsAGzipThatInflatesPastTheLimit() throws IOException {
        // 25 MB de espaços comprimem para poucos KB: o limite é sobre o descompactado.
        byte[] spaces = new byte[1024 * 1024];
        java.util.Arrays.fill(spaces, (byte) ' ');
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (GZIPOutputStream gzip = new GZIPOutputStream(out)) {
            gzip.write("<myanimelist>".getBytes(StandardCharsets.UTF_8));
            for (int i = 0; i < 25; i++) gzip.write(spaces);
            gzip.write("</myanimelist>".getBytes(StandardCharsets.UTF_8));
        }

        assertThatThrownBy(() -> parse(out.toByteArray()))
                .isInstanceOfSatisfying(FieldValidationException.class,
                        e -> assertThat(e.getCode()).isEqualTo("file.tooLarge"));
    }

    @Test
    void parse_doesNotResolveExternalEntities() {
        String evil = """
                <?xml version="1.0"?>
                <!DOCTYPE myanimelist [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
                <myanimelist><anime><series_title>&xxe;</series_title><my_status>Completed</my_status></anime></myanimelist>
                """;

        assertThatThrownBy(() -> parse(evil.getBytes(StandardCharsets.UTF_8)))
                .isInstanceOfSatisfying(FieldValidationException.class,
                        e -> assertThat(e.getCode()).isEqualTo("file.invalid"));
    }

    @Test
    void parse_rejectsNonMalXmlAndGarbage() {
        assertThatThrownBy(() -> parse("<html></html>".getBytes(StandardCharsets.UTF_8)))
                .isInstanceOf(FieldValidationException.class);
        assertThatThrownBy(() -> parse("not xml at all".getBytes(StandardCharsets.UTF_8)))
                .isInstanceOf(FieldValidationException.class);
    }
}

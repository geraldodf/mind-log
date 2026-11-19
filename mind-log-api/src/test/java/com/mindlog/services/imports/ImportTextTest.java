package com.mindlog.services.imports;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ImportTextTest {

    @Test
    void normalize_ignoresCaseAccentsAndRepeatedSpaces() {
        assertThat(ImportText.normalize("  A   Viagem de  CHIHIRO "))
                .isEqualTo(ImportText.normalize("a viagem de chihiro"));
        assertThat(ImportText.normalize("Amélie")).isEqualTo("amelie");
    }

    @Test
    void toStars_fiveScaleRoundsUp() {
        assertThat(ImportText.toStars("0.5", 5)).isEqualTo(1);
        assertThat(ImportText.toStars("1.5", 5)).isEqualTo(2);
        assertThat(ImportText.toStars("4.5", 5)).isEqualTo(5);
        assertThat(ImportText.toStars("5", 5)).isEqualTo(5);
    }

    @Test
    void toStars_tenScaleIsCeilOfHalf() {
        assertThat(ImportText.toStars("1", 10)).isEqualTo(1);
        assertThat(ImportText.toStars("2", 10)).isEqualTo(1);
        assertThat(ImportText.toStars("3", 10)).isEqualTo(2);
        assertThat(ImportText.toStars("7", 10)).isEqualTo(4);
        assertThat(ImportText.toStars("9", 10)).isEqualTo(5);
        assertThat(ImportText.toStars("10", 10)).isEqualTo(5);
    }

    @Test
    void toStars_zeroAndBlankMeanUnrated() {
        assertThat(ImportText.toStars("0", 5)).isNull();
        assertThat(ImportText.toStars("0", 10)).isNull();
        assertThat(ImportText.toStars("  ", 5)).isNull();
        assertThat(ImportText.toStars(null, 5)).isNull();
    }

    @Test
    void toStars_rejectsOutOfRangeAndGarbage() {
        assertThatThrownBy(() -> ImportText.toStars("6", 5)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> ImportText.toStars("11", 10)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> ImportText.toStars("abc", 5)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void dates_invalidOrPlaceholderBecomeNull() {
        assertThat(ImportText.isoDate("2024-03-09")).isEqualTo(LocalDate.of(2024, 3, 9));
        assertThat(ImportText.isoDate("0000-00-00")).isNull();
        assertThat(ImportText.isoDate("")).isNull();
        assertThat(ImportText.slashDate("2023/12/31")).isEqualTo(LocalDate.of(2023, 12, 31));
        assertThat(ImportText.slashDate("31/12/2023")).isNull();
    }

    @Test
    void plainText_stripsHtmlKeepingLineBreaks() {
        assertThat(ImportText.plainText("Great &amp; fun<br/>Second line<br>Third<p>Para</p>"))
                .isEqualTo("Great & fun\nSecond line\nThird\n\nPara");
        assertThat(ImportText.plainText("<br/>")).isNull();
    }

    @Test
    void titleIssue_flagsBlankAndTooLong() {
        assertThat(ImportText.titleIssue("Dune")).isNull();
        assertThat(ImportText.titleIssue("  ")).isEqualTo("title.missing");
        assertThat(ImportText.titleIssue("x".repeat(256))).isEqualTo("title.tooLong");
        assertThat(ImportText.titleIssue("x".repeat(255))).isNull();
    }
}

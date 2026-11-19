package com.mindlog.services.retrospective;

import com.mindlog.data.dtos.retrospective.RetrospectiveDTO;
import com.mindlog.data.enums.Recommendation;
import com.mindlog.data.models.MediaType;
import com.mindlog.data.models.UserMedia;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class RetrospectiveCalculatorTest {

    private static final MediaType MOVIE = type(1L, "Movie", true);
    private static final MediaType BOOK = type(2L, "Book", true);

    @Test
    void calculate_shouldReturnEmptyYear_whenNothingWasCompleted() {
        RetrospectiveDTO dto = RetrospectiveCalculator.calculate(2026, List.of(), 0);

        assertThat(dto.totalCompleted()).isZero();
        assertThat(dto.lowData()).isFalse();
        assertThat(dto.busiestMonth()).isNull();
        assertThat(dto.averageRating()).isNull();
        assertThat(dto.byMonth()).hasSize(12).containsOnly(0);
        assertThat(dto.byType()).isEmpty();
        assertThat(dto.titles()).isEmpty();
    }

    @Test
    void calculate_shouldFlagLowDataAndListTitles_whenOneOrTwoEntries() {
        List<UserMedia> two = List.of(
                media(1L, "Dune", MOVIE, 5, "2026-03-10", null),
                media(2L, "Heat", MOVIE, null, "2026-04-02", null));

        RetrospectiveDTO dto = RetrospectiveCalculator.calculate(2026, two, 0);

        assertThat(dto.lowData()).isTrue();
        assertThat(dto.titles()).containsExactly("Dune", "Heat");
    }

    @Test
    void calculate_shouldBeTheFullVersion_whenThreeEntries() {
        List<UserMedia> three = List.of(
                media(1L, "A", MOVIE, 4, "2026-01-10", null),
                media(2L, "B", MOVIE, 3, "2026-02-10", null),
                media(3L, "C", BOOK, 5, "2026-03-10", null));

        RetrospectiveDTO dto = RetrospectiveCalculator.calculate(2026, three, 0);

        assertThat(dto.lowData()).isFalse();
        assertThat(dto.titles()).isEmpty();
    }

    @Test
    void calculate_shouldCountPerTypeMostFirst_withNameAsTieBreak() {
        List<UserMedia> items = List.of(
                media(1L, "A", MOVIE, null, "2026-01-10", null),
                media(2L, "B", BOOK, null, "2026-01-11", null),
                media(3L, "C", BOOK, null, "2026-01-12", null),
                media(4L, "D", MOVIE, null, "2026-01-13", null));

        RetrospectiveDTO dto = RetrospectiveCalculator.calculate(2026, items, 0);

        assertThat(dto.byType()).extracting("name", "count").containsExactly(
                org.assertj.core.groups.Tuple.tuple("Book", 2), org.assertj.core.groups.Tuple.tuple("Movie", 2));
    }

    @Test
    void calculate_shouldPickTheEarliestMonth_whenMonthsTie() {
        List<UserMedia> items = List.of(
                media(1L, "A", MOVIE, null, "2026-05-10", null),
                media(2L, "B", MOVIE, null, "2026-02-10", null),
                media(3L, "C", MOVIE, null, "2026-05-20", null),
                media(4L, "D", MOVIE, null, "2026-02-25", null));

        RetrospectiveDTO dto = RetrospectiveCalculator.calculate(2026, items, 0);

        assertThat(dto.busiestMonth()).isEqualTo(2);
        assertThat(dto.byMonth().get(1)).isEqualTo(2);
        assertThat(dto.byMonth().get(4)).isEqualTo(2);
    }

    @Test
    void calculate_shouldPlaceEntriesByStartDate_whenEndDateIsMissing() {
        List<UserMedia> items = List.of(media(1L, "A", MOVIE, null, null, "2026-07-04"));

        RetrospectiveDTO dto = RetrospectiveCalculator.calculate(2026, items, 0);

        assertThat(dto.busiestMonth()).isEqualTo(7);
    }

    @Test
    void calculate_shouldKeepYearBoundaries_onTheFirstAndLastDay() {
        List<UserMedia> items = List.of(
                media(1L, "A", MOVIE, null, "2026-01-01", null),
                media(2L, "B", MOVIE, null, "2026-12-31", null));

        RetrospectiveDTO dto = RetrospectiveCalculator.calculate(2026, items, 0);

        assertThat(dto.byMonth().get(0)).isEqualTo(1);
        assertThat(dto.byMonth().get(11)).isEqualTo(1);
    }

    @Test
    void calculate_shouldRankTopRatedByRatingThenFavoriteThenRecency_ignoringUnrated() {
        UserMedia fiveOld = media(1L, "Five old", MOVIE, 5, "2026-01-10", null);
        UserMedia fiveNew = media(2L, "Five new", MOVIE, 5, "2026-09-10", null);
        UserMedia fiveFav = media(3L, "Five fav", MOVIE, 5, "2026-02-10", null);
        fiveFav.setIsFavorite(true);
        UserMedia four = media(4L, "Four", MOVIE, 4, "2026-10-10", null);
        UserMedia unrated = media(5L, "Unrated", MOVIE, null, "2026-11-10", null);

        RetrospectiveDTO dto = RetrospectiveCalculator.calculate(2026, List.of(fiveOld, fiveNew, fiveFav, four, unrated), 0);

        assertThat(dto.topRated()).extracting("title").containsExactly("Five fav", "Five new", "Five old");
        assertThat(dto.topRated().get(0).isFavorite()).isTrue();
    }

    @Test
    void calculate_shouldAverageOnlyRatedEntries_withOneDecimal() {
        List<UserMedia> items = List.of(
                media(1L, "A", MOVIE, 5, "2026-01-10", null),
                media(2L, "B", MOVIE, 4, "2026-01-11", null),
                media(3L, "C", MOVIE, 4, "2026-01-12", null),
                media(4L, "D", MOVIE, null, "2026-01-13", null));

        RetrospectiveDTO dto = RetrospectiveCalculator.calculate(2026, items, 0);

        assertThat(dto.averageRating()).isEqualTo(4.3);
        assertThat(dto.ratedCount()).isEqualTo(3);
    }

    @Test
    void calculate_shouldCountRecommendationsAndFeelings() {
        UserMedia a = media(1L, "A", MOVIE, null, "2026-01-10", null);
        a.setRecommendation(Recommendation.RECOMMEND);
        a.setFeelings(List.of("😍", "🔥"));
        UserMedia b = media(2L, "B", MOVIE, null, "2026-01-11", null);
        b.setRecommendation(Recommendation.NOT_RECOMMEND);
        b.setFeelings(List.of("😍"));
        UserMedia c = media(3L, "C", MOVIE, null, "2026-01-12", null);
        c.setRecommendation(Recommendation.RECOMMEND);
        c.setFeelings(null);

        RetrospectiveDTO dto = RetrospectiveCalculator.calculate(2026, List.of(a, b, c), 0);

        assertThat(dto.recommendedCount()).isEqualTo(2);
        assertThat(dto.topFeelings()).extracting("emoji", "count").containsExactly(
                org.assertj.core.groups.Tuple.tuple("😍", 2), org.assertj.core.groups.Tuple.tuple("🔥", 1));
    }

    @Test
    void calculate_shouldCarryTheUndatedCountThrough() {
        RetrospectiveDTO dto = RetrospectiveCalculator.calculate(2026, List.of(), 4);

        assertThat(dto.undatedCompleted()).isEqualTo(4);
    }

    @Test
    void calculate_shouldAcceptUserOwnedMediaTypes() {
        MediaType custom = type(9L, "Board game", false);
        List<UserMedia> items = List.of(media(1L, "Catan", custom, null, "2026-06-01", null));

        RetrospectiveDTO dto = RetrospectiveCalculator.calculate(2026, items, 0);

        assertThat(dto.byType().get(0).isSystem()).isFalse();
        assertThat(dto.byType().get(0).name()).isEqualTo("Board game");
    }

    private static MediaType type(Long id, String name, boolean system) {
        MediaType type = new MediaType();
        type.setId(id);
        type.setName(name);
        type.setIsSystem(system);
        return type;
    }

    private static UserMedia media(Long id, String title, MediaType type, Integer rating, String end, String start) {
        UserMedia media = new UserMedia();
        media.setId(id);
        media.setTitle(title);
        media.setMediaType(type);
        media.setRating(rating);
        media.setEndDate(end == null ? null : LocalDate.parse(end));
        media.setStartDate(start == null ? null : LocalDate.parse(start));
        return media;
    }
}

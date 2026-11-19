package com.mindlog.services.retrospective;

import com.mindlog.data.dtos.retrospective.FeelingCountDTO;
import com.mindlog.data.dtos.retrospective.RatedMediaDTO;
import com.mindlog.data.dtos.retrospective.RetrospectiveDTO;
import com.mindlog.data.dtos.retrospective.TypeCountDTO;
import com.mindlog.data.enums.Recommendation;
import com.mindlog.data.models.MediaType;
import com.mindlog.data.models.UserMedia;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Pure aggregation of one year of completed media; no I/O, so it is tested without mocks. */
public final class RetrospectiveCalculator {

    /** Up to this many entries the retrospective is the short version. */
    static final int LOW_DATA_MAX = 2;
    private static final int TOP_RATED_SIZE = 3;
    private static final int TOP_FEELINGS_SIZE = 5;

    private RetrospectiveCalculator() {
    }

    /** The date that places an entry in a year: the end date, else the start date, else none. */
    public static LocalDate referenceDate(UserMedia media) {
        return media.getEndDate() != null ? media.getEndDate() : media.getStartDate();
    }

    /** {@code completed} must already be dated inside {@code year} (see {@link #referenceDate}). */
    public static RetrospectiveDTO calculate(int year, List<UserMedia> completed, long undatedCompleted) {
        int total = completed.size();
        boolean lowData = total > 0 && total <= LOW_DATA_MAX;

        int[] months = new int[12];
        Map<Long, int[]> typeCounts = new LinkedHashMap<>();
        Map<Long, MediaType> types = new LinkedHashMap<>();
        Map<String, Integer> feelings = new LinkedHashMap<>();
        int ratingSum = 0;
        int ratedCount = 0;
        int recommended = 0;

        for (UserMedia media : completed) {
            months[referenceDate(media).getMonthValue() - 1]++;

            MediaType type = media.getMediaType();
            typeCounts.computeIfAbsent(type.getId(), id -> new int[1])[0]++;
            types.putIfAbsent(type.getId(), type);

            if (media.getRating() != null) {
                ratingSum += media.getRating();
                ratedCount++;
            }
            if (media.getRecommendation() == Recommendation.RECOMMEND) recommended++;
            if (media.getFeelings() != null) media.getFeelings().forEach(f -> feelings.merge(f, 1, Integer::sum));
        }

        return new RetrospectiveDTO(
                year,
                total,
                undatedCompleted,
                lowData,
                byType(typeCounts, types),
                toList(months),
                busiestMonth(months),
                topRated(completed),
                ratedCount == 0 ? null : Math.round(ratingSum * 10.0 / ratedCount) / 10.0,
                ratedCount,
                topFeelings(feelings),
                recommended,
                lowData ? completed.stream().map(UserMedia::getTitle).toList() : List.of()
        );
    }

    private static List<TypeCountDTO> byType(Map<Long, int[]> counts, Map<Long, MediaType> types) {
        return counts.entrySet().stream()
                .map(e -> new TypeCountDTO(e.getKey(), types.get(e.getKey()).getName(), types.get(e.getKey()).getIsSystem(), e.getValue()[0]))
                .sorted(Comparator.comparingInt(TypeCountDTO::count).reversed().thenComparing(TypeCountDTO::name))
                .toList();
    }

    /** Month 1..12 with the most entries; the earliest month wins a tie. Null when nothing was completed. */
    private static Integer busiestMonth(int[] months) {
        int best = -1;
        for (int i = 0; i < months.length; i++) {
            if (months[i] > 0 && (best < 0 || months[i] > months[best])) best = i;
        }
        return best < 0 ? null : best + 1;
    }

    /** Highest rating first; a favorite wins a tie, then the most recent, then the newest entry. */
    private static List<RatedMediaDTO> topRated(List<UserMedia> completed) {
        Comparator<UserMedia> order = Comparator
                .comparing(UserMedia::getRating).reversed()
                .thenComparing(m -> Boolean.TRUE.equals(m.getIsFavorite()) ? 0 : 1)
                .thenComparing(RetrospectiveCalculator::referenceDate, Comparator.reverseOrder())
                .thenComparing(UserMedia::getId, Comparator.nullsLast(Comparator.reverseOrder()));
        return completed.stream()
                .filter(m -> m.getRating() != null)
                .sorted(order)
                .limit(TOP_RATED_SIZE)
                .map(m -> new RatedMediaDTO(m.getId(), m.getTitle(), m.getMediaType().getName(), m.getMediaType().getIsSystem(),
                        m.getRating(), Boolean.TRUE.equals(m.getIsFavorite())))
                .toList();
    }

    /** Most used emoji first; equal counts keep the order they first appeared in. */
    private static List<FeelingCountDTO> topFeelings(Map<String, Integer> feelings) {
        List<FeelingCountDTO> all = new ArrayList<>();
        feelings.forEach((emoji, count) -> all.add(new FeelingCountDTO(emoji, count)));
        return all.stream()
                .sorted(Comparator.comparingInt(FeelingCountDTO::count).reversed())
                .limit(TOP_FEELINGS_SIZE)
                .toList();
    }

    private static List<Integer> toList(int[] values) {
        List<Integer> list = new ArrayList<>(values.length);
        for (int value : values) list.add(value);
        return list;
    }
}

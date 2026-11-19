package com.mindlog.data.dtos.retrospective;

import java.util.List;

/**
 * A year of one user's completed media. {@code lowData} marks the short version (1 or 2 entries):
 * the client then skips month, ranking and feeling slides and shows {@code titles} instead.
 * {@code undatedCompleted} counts Completed entries with neither end nor start date, which cannot
 * be placed in any year.
 */
public record RetrospectiveDTO(
        int year,
        int totalCompleted,
        long undatedCompleted,
        boolean lowData,
        List<TypeCountDTO> byType,
        List<Integer> byMonth,
        Integer busiestMonth,
        List<RatedMediaDTO> topRated,
        Double averageRating,
        int ratedCount,
        List<FeelingCountDTO> topFeelings,
        int recommendedCount,
        List<String> titles
) {}

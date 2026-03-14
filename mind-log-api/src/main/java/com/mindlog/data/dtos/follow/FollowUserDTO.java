package com.mindlog.data.dtos.follow;

import java.time.Instant;

/**
 * Compact user card returned inside followers / following paginated lists.
 * Contains only the data needed to render the user card in the UI.
 *
 * Used in JPQL constructor expressions — field order must match exactly.
 */
public record FollowUserDTO(
        Long   userId,
        String username,
        String name,
        String picture,
        Instant followedAt
) {}

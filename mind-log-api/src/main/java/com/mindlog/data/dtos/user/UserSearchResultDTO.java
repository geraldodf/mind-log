package com.mindlog.data.dtos.user;

/**
 * Compact user card returned in search results.
 * Includes the current user's follow relationship so the UI can
 * render a "Follow / Following" button without an extra request.
 */
public record UserSearchResultDTO(
        Long    id,
        String  username,
        String  name,
        String  picture,
        boolean isFollowing
) {}

package com.mindlog.data.dtos.profile;
import java.time.Instant;
public record PublicProfileDTO(Long id, String username, String name, String picture, long followersCount, long followingCount, long publicMediaCount, Instant createdAt) {}

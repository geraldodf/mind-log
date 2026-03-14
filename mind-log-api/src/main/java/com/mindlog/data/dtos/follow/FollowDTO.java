package com.mindlog.data.dtos.follow;
import java.time.Instant;
public record FollowDTO(Long id, Long followerId, String followerUsername, String followerPicture, Long followingId, String followingUsername, String followingPicture, Instant createdAt) {}

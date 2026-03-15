package com.mindlog.resources;

import com.mindlog.data.dtos.follow.FollowStatsDTO;
import com.mindlog.data.dtos.follow.FollowUserDTO;
import com.mindlog.services.follow.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/follows")
@RequiredArgsConstructor
public class    FollowResource {

    private final FollowService service;

    /** Follow a user. Idempotent — following an already-followed user is a no-op. */
    @PostMapping("/{username}")
    public ResponseEntity<Void> follow(@PathVariable String username) {
        service.follow(username);
        return ResponseEntity.noContent().build();
    }

    /** Unfollow a user. Idempotent — unfollowing a non-followed user is a no-op. */
    @DeleteMapping("/{username}")
    public ResponseEntity<Void> unfollow(@PathVariable String username) {
        service.unfollow(username);
        return ResponseEntity.noContent().build();
    }

    /** Returns follower/following counts and the authenticated user's follow state. */
    @GetMapping("/{username}/stats")
    public ResponseEntity<FollowStatsDTO> getStats(@PathVariable String username) {
        return ResponseEntity.ok(service.getStats(username));
    }

    /**
     * Paginated list of users who follow {@code username}.
     * Default: page=0, size=20, sorted by followedAt DESC.
     */
    @GetMapping("/{username}/followers")
    public ResponseEntity<Page<FollowUserDTO>> getFollowers(
            @PathVariable String username,
            @PageableDefault(size = 20, sort = "followedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(service.getFollowers(username, pageable));
    }

    /**
     * Paginated list of users that {@code username} is following.
     * Default: page=0, size=20, sorted by followedAt DESC.
     */
    @GetMapping("/{username}/following")
    public ResponseEntity<Page<FollowUserDTO>> getFollowing(
            @PathVariable String username,
            @PageableDefault(size = 20, sort = "followedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(service.getFollowing(username, pageable));
    }
}

package com.mindlog.services.follow;

import com.mindlog.data.dtos.follow.FollowStatsDTO;
import com.mindlog.data.dtos.follow.FollowUserDTO;
import com.mindlog.data.models.Follow;
import com.mindlog.data.models.User;
import com.mindlog.repositories.FollowRepository;
import com.mindlog.repositories.UserRepository;
import com.mindlog.services.AuthService;
import com.mindlog.services.audit.AuditService;
import com.mindlog.services.exceptions.ForbiddenException;
import com.mindlog.services.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final AuditService auditService;

    @Transactional
    public void follow(String username) {
        User me = authService.authenticated();
        User target = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (me.getId().equals(target.getId())) {
            throw new ForbiddenException("You cannot follow yourself.");
        }

        if (followRepository.existsByFollowerIdAndFollowingId(me.getId(), target.getId())) {
            return; // already following — idempotent
        }

        Follow follow = new Follow();
        follow.setFollower(me);
        follow.setFollowing(target);
        follow.setCreatedAt(Instant.now());
        followRepository.save(follow);

        auditService.log("FOLLOW", "User", target.getId(), "followed: " + target.getUsername(), null);
        log.info("user {} followed {}", me.getUsername(), target.getUsername());
    }

    @Transactional
    public void unfollow(String username) {
        User me = authService.authenticated();
        User target = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        followRepository.findByFollowerIdAndFollowingId(me.getId(), target.getId())
                .ifPresent(f -> {
                    followRepository.delete(f);
                    auditService.log("UNFOLLOW", "User", target.getId(), "unfollowed: " + target.getUsername(), null);
                    log.info("user {} unfollowed {}", me.getUsername(), target.getUsername());
                });
    }

    public FollowStatsDTO getStats(String username) {
        User target = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        long followers = followRepository.countByFollowingId(target.getId());
        long following = followRepository.countByFollowerId(target.getId());
        boolean isFollowing = false;

        try {
            User me = authService.authenticated();
            isFollowing = followRepository.existsByFollowerIdAndFollowingId(me.getId(), target.getId());
        } catch (Exception ignored) {
            // unauthenticated callers get isFollowing = false
        }

        return new FollowStatsDTO(followers, following, isFollowing);
    }

    @Transactional(readOnly = true)
    public Page<FollowUserDTO> getFollowers(String username, Pageable pageable) {
        User target = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        return followRepository.findFollowersByUserId(target.getId(), pageable);
    }

    @Transactional(readOnly = true)
    public Page<FollowUserDTO> getFollowing(String username, Pageable pageable) {
        User target = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        return followRepository.findFollowingByUserId(target.getId(), pageable);
    }
}

package com.mindlog.repositories;

import com.mindlog.data.dtos.follow.FollowUserDTO;
import com.mindlog.data.models.Follow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    long countByFollowingId(Long followingId);

    long countByFollowerId(Long followerId);

    /**
     * Returns paginated list of users who follow {@code userId}.
     *
     * Uses a JPQL constructor expression (no JOIN FETCH) to avoid Hibernate's
     * in-memory pagination warning (HHH90003004). The explicit countQuery
     * ensures the total count is computed with a lean query, not re-running
     * the full projection.
     */
    @Query(
        value = """
            SELECT new com.mindlog.data.dtos.follow.FollowUserDTO(
                u.id, u.username, u.name, u.picture, f.createdAt)
            FROM Follow f JOIN f.follower u
            WHERE f.following.id = :userId
            """,
        countQuery = "SELECT COUNT(f) FROM Follow f WHERE f.following.id = :userId"
    )
    Page<FollowUserDTO> findFollowersByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * Returns paginated list of users that {@code userId} is following.
     */
    @Query(
        value = """
            SELECT new com.mindlog.data.dtos.follow.FollowUserDTO(
                u.id, u.username, u.name, u.picture, f.createdAt)
            FROM Follow f JOIN f.following u
            WHERE f.follower.id = :userId
            """,
        countQuery = "SELECT COUNT(f) FROM Follow f WHERE f.follower.id = :userId"
    )
    Page<FollowUserDTO> findFollowingByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * Batch check: given a viewer and a collection of candidate user IDs,
     * returns the subset that the viewer is already following.
     *
     * Used to decorate search results with the follow state in O(1) queries
     * instead of one query per result (N+1 problem).
     */
    @Query("""
        SELECT f.following.id
        FROM Follow f
        WHERE f.follower.id = :viewerId
          AND f.following.id IN :targetIds
        """)
    Set<Long> findFollowingIds(@Param("viewerId") Long viewerId,
                               @Param("targetIds") Collection<Long> targetIds);

    @Modifying
    @Query("DELETE FROM Follow f WHERE f.follower.id = :userId OR f.following.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
}

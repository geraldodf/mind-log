package com.mindlog.repositories;

import com.mindlog.data.dtos.admin.UserActivityDTO;
import com.mindlog.data.enums.Recommendation;
import com.mindlog.data.enums.Visibility;
import com.mindlog.data.models.UserMedia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface UserMediaRepository extends JpaRepository<UserMedia, Long> {

    /**
     * Unified filtered library query. All filter parameters are optional:
     * passing {@code null} skips that filter. Replaces the previous four
     * near-identical queries (one per Recommendation value).
     */
    @Query("""
        SELECT m FROM UserMedia m
        WHERE m.user.id = :userId
          AND (:mediaTypeId    IS NULL OR m.mediaType.id  = :mediaTypeId)
          AND (:statusId       IS NULL OR m.status.id     = :statusId)
          AND (:recommendation IS NULL OR m.recommendation = :recommendation)
        ORDER BY m.updatedAt DESC
        """)
    Page<UserMedia> findAllByUserIdFiltered(
            @Param("userId")         Long userId,
            @Param("mediaTypeId")    Long mediaTypeId,
            @Param("statusId")       Long statusId,
            @Param("recommendation") Recommendation recommendation,
            Pageable pageable
    );

    @Query("SELECT m FROM UserMedia m WHERE m.user.id = :userId AND m.nextReleaseDate IS NOT NULL AND m.nextReleaseDate >= :today ORDER BY m.nextReleaseDate ASC")
    List<UserMedia> findUpcomingReleases(@Param("userId") Long userId, @Param("today") LocalDate today);

    @Query("SELECT m FROM UserMedia m WHERE m.nextReleaseDate IS NOT NULL AND m.nextReleaseDate = :date")
    List<UserMedia> findByNextReleaseDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(m) FROM UserMedia m WHERE FUNCTION('DATE', m.createdAt) = CURRENT_DATE")
    long countMediaCreatedToday();

    @Query("SELECT COUNT(DISTINCT m.user.id) FROM UserMedia m WHERE FUNCTION('DATE', m.createdAt) = CURRENT_DATE")
    long countDistinctActiveUsersToday();

    @Query("SELECT COUNT(m) FROM UserMedia m WHERE m.user.id = :userId AND m.visibility = :visibility")
    long countByUserIdAndVisibility(@Param("userId") Long userId, @Param("visibility") Visibility visibility);

    @Query("""
        SELECT m FROM UserMedia m
        WHERE m.user.id = :userId
          AND m.visibility = com.mindlog.data.enums.Visibility.PUBLIC
          AND (:mediaTypeId IS NULL OR m.mediaType.id = :mediaTypeId)
          AND (:statusId    IS NULL OR m.status.id    = :statusId)
        ORDER BY m.updatedAt DESC
        """)
    Page<UserMedia> findPublicByUserIdFiltered(
            @Param("userId")      Long userId,
            @Param("mediaTypeId") Long mediaTypeId,
            @Param("statusId")    Long statusId,
            Pageable pageable
    );

    @Query("""
        SELECT m FROM UserMedia m
        WHERE m.user.id = :userId AND m.isFavorite = true
        ORDER BY m.topRank ASC NULLS LAST, m.rating DESC NULLS LAST
        """)
    List<UserMedia> findFavoritesByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM UserMedia m WHERE m.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);

    @Query("""
        SELECT new com.mindlog.data.dtos.admin.UserActivityDTO(
            m.user.id, m.user.username, m.user.picture, COUNT(m))
        FROM UserMedia m
        GROUP BY m.user.id, m.user.username, m.user.picture
        ORDER BY COUNT(m) DESC
        """)
    Page<UserActivityDTO> findMostActiveUsers(Pageable pageable);
}

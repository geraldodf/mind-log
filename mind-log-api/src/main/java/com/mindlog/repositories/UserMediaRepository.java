package com.mindlog.repositories;

import com.mindlog.data.dtos.admin.UserActivityDTO;
import com.mindlog.data.dtos.imports.ExistingMediaDTO;
import com.mindlog.data.dtos.recommendation.LibraryEntryDTO;
import com.mindlog.data.enums.Recommendation;
import com.mindlog.data.enums.Visibility;
import com.mindlog.data.models.MediaType;
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
          AND (:title IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', CAST(:title AS string), '%')))
        ORDER BY m.updatedAt DESC
        """)
    Page<UserMedia> findAllByUserIdFiltered(
            @Param("userId")         Long userId,
            @Param("mediaTypeId")    Long mediaTypeId,
            @Param("statusId")       Long statusId,
            @Param("recommendation") Recommendation recommendation,
            @Param("title")          String title,
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

    @Query("""
        SELECT m FROM UserMedia m
        WHERE m.user.id = :userId
          AND m.status.isSystem = true
          AND m.status.name = 'Planned'
        ORDER BY m.mediaType.name ASC, m.plannedOrder ASC NULLS LAST, m.createdAt ASC
        """)
    List<UserMedia> findPlannedByUserId(@Param("userId") Long userId);

    /** Tipos de mídia em que o usuário realmente tem entradas, independente de paginação. */
    @Query("""
        SELECT DISTINCT m.mediaType FROM UserMedia m
        WHERE m.user.id = :userId
        ORDER BY m.mediaType.name ASC
        """)
    List<MediaType> findUsedMediaTypesByUserId(@Param("userId") Long userId);

    /**
     * Completed entries placed in a year by their end date, or by their start date when the end
     * date is missing. Entries with neither date are in no year (see {@link #countCompletedWithoutDates}).
     */
    @Query("""
        SELECT m FROM UserMedia m JOIN FETCH m.mediaType
        WHERE m.user.id = :userId
          AND m.status.isSystem = true
          AND m.status.name = 'Completed'
          AND COALESCE(m.endDate, m.startDate) BETWEEN :from AND :to
        ORDER BY COALESCE(m.endDate, m.startDate) ASC, m.id ASC
        """)
    List<UserMedia> findCompletedBetween(
            @Param("userId") Long userId,
            @Param("from")   LocalDate from,
            @Param("to")     LocalDate to
    );

    @Query("""
        SELECT COUNT(m) FROM UserMedia m
        WHERE m.user.id = :userId
          AND m.status.isSystem = true
          AND m.status.name = 'Completed'
          AND m.endDate IS NULL AND m.startDate IS NULL
        """)
    long countCompletedWithoutDates(@Param("userId") Long userId);

    @Query("""
        SELECT DISTINCT EXTRACT(YEAR FROM COALESCE(m.endDate, m.startDate)) FROM UserMedia m
        WHERE m.user.id = :userId
          AND m.status.isSystem = true
          AND m.status.name = 'Completed'
          AND COALESCE(m.endDate, m.startDate) IS NOT NULL
        ORDER BY EXTRACT(YEAR FROM COALESCE(m.endDate, m.startDate)) DESC
        """)
    List<Integer> findCompletedYears(@Param("userId") Long userId);

    /** Título e tipo de tudo que o usuário tem, para a importação reconhecer duplicados. */
    @Query("""
        SELECT new com.mindlog.data.dtos.imports.ExistingMediaDTO(m.title, m.mediaType.name)
        FROM UserMedia m
        WHERE m.user.id = :userId
        """)
    List<ExistingMediaDTO> findTitlesByUserId(@Param("userId") Long userId);

    /** Entradas bem avaliadas (nota mínima): a base do gosto para as recomendações. */
    @Query("""
        SELECT new com.mindlog.data.dtos.recommendation.LibraryEntryDTO(
            m.title, m.mediaType.name, m.rating, m.recommendation)
        FROM UserMedia m
        WHERE m.user.id = :userId AND m.rating >= :minRating
        ORDER BY m.updatedAt DESC
        """)
    List<LibraryEntryDTO> findLikedEntries(@Param("userId") Long userId, @Param("minRating") int minRating,
                                           Pageable pageable);

    @Query("SELECT COUNT(m) FROM UserMedia m WHERE m.user.id = :userId AND m.rating >= :minRating")
    long countLikedEntries(@Param("userId") Long userId, @Param("minRating") int minRating);

    /** Entradas mal avaliadas ou marcadas como não recomendadas: o que não repetir. */
    @Query("""
        SELECT new com.mindlog.data.dtos.recommendation.LibraryEntryDTO(
            m.title, m.mediaType.name, m.rating, m.recommendation)
        FROM UserMedia m
        WHERE m.user.id = :userId
          AND (m.rating <= :maxRating OR m.recommendation = com.mindlog.data.enums.Recommendation.NOT_RECOMMEND)
        ORDER BY m.updatedAt DESC
        """)
    List<LibraryEntryDTO> findAvoidEntries(@Param("userId") Long userId, @Param("maxRating") int maxRating,
                                           Pageable pageable);

    @Query("SELECT m.title FROM UserMedia m WHERE m.user.id = :userId ORDER BY m.updatedAt DESC")
    List<String> findRecentTitles(@Param("userId") Long userId, Pageable pageable);

    boolean existsByUserIdAndTitleIgnoreCase(Long userId, String title);

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

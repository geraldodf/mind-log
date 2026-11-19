package com.mindlog.repositories;

import com.mindlog.data.enums.RecommendationStatus;
import com.mindlog.data.models.MediaRecommendation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MediaRecommendationRepository extends JpaRepository<MediaRecommendation, Long> {

    @Query("""
        SELECT r FROM MediaRecommendation r JOIN FETCH r.mediaType
        WHERE r.user.id = :userId AND r.status = :status
        ORDER BY r.id ASC
        """)
    List<MediaRecommendation> findByUserIdAndStatus(@Param("userId") Long userId,
                                                    @Param("status") RecommendationStatus status);

    @Query("""
        SELECT r FROM MediaRecommendation r JOIN FETCH r.mediaType
        WHERE r.id = :id AND r.user.id = :userId
        """)
    Optional<MediaRecommendation> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    long countByUserIdAndStatus(Long userId, RecommendationStatus status);

    /** Títulos descartados, os mais recentes primeiro: entram no pedido como "não sugerir". */
    @Query("""
        SELECT r.title FROM MediaRecommendation r
        WHERE r.user.id = :userId AND r.status = com.mindlog.data.enums.RecommendationStatus.DISMISSED
        ORDER BY r.id DESC
        """)
    List<String> findDismissedTitles(@Param("userId") Long userId, Pageable pageable);

    @Query("""
        SELECT COUNT(r) > 0 FROM MediaRecommendation r
        WHERE r.user.id = :userId
          AND LOWER(r.title) = LOWER(:title)
          AND r.status <> com.mindlog.data.enums.RecommendationStatus.PENDING
        """)
    boolean existsResolvedTitle(@Param("userId") Long userId, @Param("title") String title);

    /** Uma geração nova substitui as sugestões que o usuário ainda não respondeu. */
    @Modifying
    @Query("""
        DELETE FROM MediaRecommendation r
        WHERE r.user.id = :userId AND r.status = com.mindlog.data.enums.RecommendationStatus.PENDING
        """)
    void deletePendingByUserId(@Param("userId") Long userId);

    /**
     * Troca o status só se a linha ainda estiver no status esperado: dois cliques simultâneos em
     * "Adicionar" passam pela leitura, mas só um muda a linha (devolve 1).
     */
    @Modifying
    @Query("""
        UPDATE MediaRecommendation r SET r.status = :to
        WHERE r.id = :id AND r.user.id = :userId AND r.status = :from
        """)
    int changeStatus(@Param("id") Long id, @Param("userId") Long userId,
                     @Param("from") RecommendationStatus from, @Param("to") RecommendationStatus to);
}

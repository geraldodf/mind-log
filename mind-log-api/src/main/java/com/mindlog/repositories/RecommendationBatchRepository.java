package com.mindlog.repositories;

import com.mindlog.data.models.RecommendationBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecommendationBatchRepository extends JpaRepository<RecommendationBatch, Long> {

    /** Gerações do usuário desde {@code since}, da mais antiga para a mais nova (janela do limite diário). */
    List<RecommendationBatch> findByUserIdAndCreatedAtAfterOrderByCreatedAtAsc(Long userId, Instant since);

    Optional<RecommendationBatch> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
}

package com.mindlog.repositories;

import com.mindlog.data.models.Suggestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SuggestionRepository extends JpaRepository<Suggestion, Long> {
    Page<Suggestion> findAllByOrderByCreatedAtDesc(Pageable pageable);
}

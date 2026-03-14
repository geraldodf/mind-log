package com.mindlog.repositories;

import com.mindlog.data.models.SystemEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemEventRepository extends JpaRepository<SystemEvent, Long> {
    Page<SystemEvent> findAllByOrderByCreatedAtDesc(Pageable pageable);
}

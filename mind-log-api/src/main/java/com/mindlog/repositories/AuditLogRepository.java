package com.mindlog.repositories;
import com.mindlog.data.models.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.action = :action AND CAST(a.createdAt AS date) = CURRENT_DATE")
    long countTodayByAction(String action);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE AuditLog a SET a.user = null WHERE a.user.id = :userId")
    void nullifyUserForUserId(Long userId);
}

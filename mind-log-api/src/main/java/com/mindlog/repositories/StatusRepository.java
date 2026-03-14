package com.mindlog.repositories;

import com.mindlog.data.models.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StatusRepository extends JpaRepository<Status, Long> {

    @Query("SELECT s FROM Status s WHERE s.isSystem = true OR s.user.id = :userId ORDER BY s.isSystem DESC, s.name ASC")
    List<Status> findAllAvailableForUser(Long userId);

    @Query("SELECT s FROM Status s WHERE s.isSystem = true ORDER BY s.name ASC")
    List<Status> findAllSystem();

    @Query("SELECT s FROM Status s WHERE s.isSystem = false AND s.user.id = :userId ORDER BY s.name ASC")
    List<Status> findAllByUserId(Long userId);
}

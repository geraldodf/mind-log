package com.mindlog.repositories;

import com.mindlog.data.models.MediaType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaTypeRepository extends JpaRepository<MediaType, Long> {

    @Query("SELECT m FROM MediaType m WHERE m.isSystem = true OR m.user.id = :userId ORDER BY m.isSystem DESC, m.name ASC")
    List<MediaType> findAllAvailableForUser(Long userId);

    @Query("SELECT m FROM MediaType m WHERE m.isSystem = true ORDER BY m.name ASC")
    List<MediaType> findAllSystem();

    @Query("SELECT m FROM MediaType m WHERE m.isSystem = false AND m.user.id = :userId ORDER BY m.name ASC")
    List<MediaType> findAllByUserId(Long userId);
}

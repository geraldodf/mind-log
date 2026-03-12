package com.mindlog.repositories;

import com.mindlog.data.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    List<Role> findAllByOrderByAuthority();
    Optional<Role> findByAuthority(String authority);
}

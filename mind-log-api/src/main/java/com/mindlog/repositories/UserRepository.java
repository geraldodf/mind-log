package com.mindlog.repositories;

import com.mindlog.data.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findUserByUsername(String username);

    @Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.username = :username")
    Optional<User> findByUsernameAndRoles(String username);

    @Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.email = :email")
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.googleId = :googleId")
    Optional<User> findByGoogleId(String googleId);

    @Query("SELECT COUNT(p.id) < 1 FROM User p WHERE p.username = :username")
    boolean checkUsernameAvailable(String username);

    @Query("SELECT COUNT(p.id) < 1 FROM User p WHERE p.email = :email")
    boolean checkEmailAvailable(String email);

    Page<User> findAllByOrderByNameAsc(Pageable pageable);

    @Query("SELECT COUNT(u) FROM User u WHERE FUNCTION('DATE', u.createdAt) = CURRENT_DATE")
    long countUsersCreatedToday();

    /**
     * Full-text user search by username or display name using PostgreSQL ILIKE.
     * Performance depends on the GIN trigram indexes created in V009.
     *
     * Excludes soft-deleted accounts. Results are ordered by username for stable pagination.
     */
    @Query(
        value = """
            SELECT * FROM users
             WHERE (username ILIKE '%' || :q || '%'
                OR  name     ILIKE '%' || :q || '%')
               AND is_enabled = TRUE
             ORDER BY username ASC
            """,
        countQuery = """
            SELECT COUNT(*) FROM users
             WHERE (username ILIKE '%' || :q || '%'
                OR  name     ILIKE '%' || :q || '%')
               AND is_enabled = TRUE
            """,
        nativeQuery = true
    )
    Page<User> searchByUsernameOrName(@Param("q") String q, Pageable pageable);
}

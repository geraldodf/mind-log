package com.mindlog.repositories;

import com.mindlog.data.models.PasswordRecoverToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface PasswordRecoverTokenRepository extends JpaRepository<PasswordRecoverToken, Long> {

    @Query("SELECT p FROM PasswordRecoverToken p WHERE p.token = :token AND p.expiration > :now")
    List<PasswordRecoverToken> findValidTokens(String token, Instant now);

    void deleteByEmail(String email);

    /**
     * Consome o token: devolve 1 só para o pedido que apagou a linha. Dois pedidos simultâneos
     * com o mesmo link disputam a mesma linha e o segundo recebe 0.
     */
    @Modifying
    @Query("DELETE FROM PasswordRecoverToken p WHERE p.token = :token AND p.expiration > :now")
    int consumeValidToken(String token, Instant now);

}

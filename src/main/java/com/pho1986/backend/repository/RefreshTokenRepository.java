package com.pho1986.backend.repository;

import com.pho1986.backend.model.entity.RefreshToken;
import com.pho1986.backend.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {

    @Query("SELECT r FROM RefreshToken r JOIN FETCH r.user WHERE r.tokenHash = :tokenHash")
    Optional<RefreshToken> findByTokenHash(@Param("tokenHash") String tokenHash);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.user = :user AND r.revoked = false")
    int revokeAllUserTokens(@Param("user") User user);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.familyId = :familyId AND r.revoked = false")
    int revokeFamilyTokens(@Param("familyId") String familyId);

    @Modifying
    @Query(value = "DELETE FROM refresh_tokens WHERE expiry_date <= :cutoffDate LIMIT :batchSize", nativeQuery = true)
    int deleteExpiredTokensBatch(@Param("cutoffDate") LocalDateTime cutoffDate, @Param("batchSize") int batchSize);

    @Query("SELECT COUNT(r) FROM RefreshToken r WHERE r.expiryDate <= :cutoffDate")
    long countExpiredTokens(@Param("cutoffDate") LocalDateTime cutoffDate);
}

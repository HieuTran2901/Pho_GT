package com.pho1986.backend.repository;

import com.pho1986.backend.model.entity.SecurityBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SecurityBlacklistRepository extends JpaRepository<SecurityBlacklist, String> {

    Optional<SecurityBlacklist> findByTargetTypeAndTargetValue(String targetType, String targetValue);

    List<SecurityBlacklist> findByTargetValue(String targetValue);

    boolean existsByTargetTypeAndTargetValue(String targetType, String targetValue);

    void deleteByTargetTypeAndTargetValue(String targetType, String targetValue);

    @Query("SELECT b FROM SecurityBlacklist b WHERE b.expiresAt IS NULL OR b.expiresAt > :now")
    List<SecurityBlacklist> findAllActiveBlacklists(LocalDateTime now);
}

package com.pho1986.backend.repository;

import com.pho1986.backend.model.entity.LoyaltyAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoyaltyAccountRepository extends JpaRepository<LoyaltyAccount, String> {
    Optional<LoyaltyAccount> findByUserId(String userId);
}

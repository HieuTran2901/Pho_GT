package com.pho1986.backend.repository;

import com.pho1986.backend.model.entity.LoyaltyTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoyaltyTransactionRepository extends JpaRepository<LoyaltyTransaction, String> {
    List<LoyaltyTransaction> findByLoyaltyAccountIdOrderByCreatedAtDesc(String loyaltyAccountId);
}

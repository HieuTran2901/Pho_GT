package com.pho1986.backend.repository;

import com.pho1986.backend.model.entity.LoyaltyReward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoyaltyRewardRepository extends JpaRepository<LoyaltyReward, String> {
    List<LoyaltyReward> findByIsActiveTrueOrderByPointsRequiredAsc();
}

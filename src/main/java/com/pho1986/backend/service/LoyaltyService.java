package com.pho1986.backend.service;

import com.pho1986.backend.model.dto.LoyaltyDtos.*;
import com.pho1986.backend.model.entity.*;
import com.pho1986.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class LoyaltyService {

    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final LoyaltyRewardRepository loyaltyRewardRepository;
    private final UserRepository userRepository;

    public LoyaltyService(
            LoyaltyAccountRepository loyaltyAccountRepository,
            LoyaltyTransactionRepository loyaltyTransactionRepository,
            LoyaltyRewardRepository loyaltyRewardRepository,
            UserRepository userRepository) {
        this.loyaltyAccountRepository = loyaltyAccountRepository;
        this.loyaltyTransactionRepository = loyaltyTransactionRepository;
        this.loyaltyRewardRepository = loyaltyRewardRepository;
        this.userRepository = userRepository;
    }

    public SummaryResponse getLoyaltySummary(String userId) {
        LoyaltyAccount account = loyaltyAccountRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));
            LoyaltyAccount newAccount = new LoyaltyAccount();
            newAccount.setUser(user);
            return loyaltyAccountRepository.save(newAccount);
        });

        Map<String, Integer> targets = Map.of(
                "DONG", 500,
                "BAC", 1000,
                "VANG", 2000,
                "KIM_CUONG", 2000
        );
        Map<String, String> nextTiers = Map.of(
                "DONG", "BAC",
                "BAC", "VANG",
                "VANG", "KIM_CUONG",
                "KIM_CUONG", "KIM_CUONG"
        );

        String currentTier = account.getMembershipTier();
        int target = targets.getOrDefault(currentTier, 500);
        String nextTier = nextTiers.getOrDefault(currentTier, "BAC");
        int pointsToNext = Math.max(0, target - account.getTotalPoints());
        int progressPercent = Math.min(100, (int) Math.round(((double) account.getTotalPoints() / target) * 100));

        TierDetails tierDetails = new TierDetails(currentTier, nextTier, target, pointsToNext, progressPercent);
        return new SummaryResponse(account, tierDetails);
    }

    public List<LoyaltyTransaction> getLoyaltyLedger(String userId) {
        LoyaltyAccount account = loyaltyAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản"));
        return loyaltyTransactionRepository.findByLoyaltyAccountIdOrderByCreatedAtDesc(account.getId());
    }

    public List<LoyaltyReward> getAvailableRewards() {
        return loyaltyRewardRepository.findByIsActiveTrueOrderByPointsRequiredAsc();
    }

    @Transactional
    public LoyaltyAccount redeemReward(String userId, RedeemRequest request) {
        LoyaltyReward reward = loyaltyRewardRepository.findById(request.getRewardId())
                .orElseThrow(() -> new IllegalArgumentException("Phần thưởng không tồn tại"));

        if (!reward.getIsActive()) {
            throw new IllegalArgumentException("Phần thưởng này hiện không khả dụng");
        }

        LoyaltyAccount account = loyaltyAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản"));

        if (account.getAvailablePoints() < reward.getPointsRequired()) {
            throw new IllegalArgumentException("Bạn không đủ điểm Tri Kỷ để đổi phần thưởng này");
        }

        int newAvail = account.getAvailablePoints() - reward.getPointsRequired();
        account.setAvailablePoints(newAvail);
        account = loyaltyAccountRepository.save(account);

        LoyaltyTransaction transaction = new LoyaltyTransaction(
                account,
                null,
                -reward.getPointsRequired(),
                "REDEEM_REWARD",
                newAvail,
                "Đổi quà: " + reward.getTitle()
        );
        loyaltyTransactionRepository.save(transaction);

        return account;
    }
}

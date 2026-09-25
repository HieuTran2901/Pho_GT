package com.pho1986.backend.service;

import com.pho1986.backend.dto.CustomerGiftDto;
import com.pho1986.backend.dto.RedeemRewardResponseDto;
import com.pho1986.backend.model.dto.LoyaltyDtos.*;
import com.pho1986.backend.model.entity.*;
import com.pho1986.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class LoyaltyService {

    private static final Logger log = LoggerFactory.getLogger(LoyaltyService.class);

    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final LoyaltyRewardRepository loyaltyRewardRepository;
    private final UserRepository userRepository;
    private final CustomerGiftService customerGiftService;

    public LoyaltyService(
            LoyaltyAccountRepository loyaltyAccountRepository,
            LoyaltyTransactionRepository loyaltyTransactionRepository,
            LoyaltyRewardRepository loyaltyRewardRepository,
            UserRepository userRepository,
            CustomerGiftService customerGiftService) {
        this.loyaltyAccountRepository = loyaltyAccountRepository;
        this.loyaltyTransactionRepository = loyaltyTransactionRepository;
        this.loyaltyRewardRepository = loyaltyRewardRepository;
        this.userRepository = userRepository;
        this.customerGiftService = customerGiftService;
    }

    @Transactional
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

    @Transactional(readOnly = true)
    public List<LoyaltyTransaction> getLoyaltyLedger(String userId) {
        LoyaltyAccount account = loyaltyAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản"));
        return loyaltyTransactionRepository.findByLoyaltyAccountIdOrderByCreatedAtDesc(account.getId());
    }

    @Transactional(readOnly = true)
    public List<LoyaltyReward> getAvailableRewards() {
        return loyaltyRewardRepository.findByIsActiveTrueOrderByPointsRequiredAsc();
    }

    @Transactional
    public RedeemRewardResponseDto redeemReward(String userId, RedeemRequest request) {
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

        CustomerGiftDto issuedGift = customerGiftService.createRedeemedGift(account.getUser(), reward);
        return new RedeemRewardResponseDto(
                account,
                issuedGift,
                "Đổi thành công: \"" + reward.getTitle() + "\"! Đã thêm vào Kho quà của bạn."
        );
    }

    @Transactional
    public boolean awardLoyaltyPointsForOrder(Order order) {
        if (order == null || order.getUser() == null || order.getId() == null) {
            return false;
        }

        // 1. Fast-path check: Tránh truy vấn khóa nếu đã tích điểm cho đơn hàng này
        if (loyaltyTransactionRepository.existsByOrderIdAndType(order.getId(), "EARN_PAYMENT")) {
            log.info("ℹ️ [LOYALTY] Đơn hàng [{}] đã được tích điểm trước đó. Bỏ qua để bảo toàn số dư.", order.getOrderCode());
            return false;
        }

        User user = order.getUser();

        // 2. Khóa ghi PESSIMISTIC_WRITE trên tài khoản hội viên để loại trừ hoàn toàn race condition
        LoyaltyAccount loyalty = loyaltyAccountRepository.findByUserIdForUpdate(user.getId())
                .orElseGet(() -> {
                    LoyaltyAccount newAccount = new LoyaltyAccount();
                    newAccount.setUser(user);
                    return loyaltyAccountRepository.save(newAccount);
                });

        // 3. Double-check bên trong transaction đã được khóa độc quyền
        if (loyaltyTransactionRepository.existsByOrderIdAndType(order.getId(), "EARN_PAYMENT")) {
            return false;
        }

        int earnedPoints = Math.max(10, (int) Math.floor(order.getFinalAmount() / 1000.0));
        int newTotal = loyalty.getTotalPoints() + earnedPoints;
        int newAvail = loyalty.getAvailablePoints() + earnedPoints;
        loyalty.setTotalPoints(newTotal);
        loyalty.setAvailablePoints(newAvail);
        loyalty.setTotalSpent(loyalty.getTotalSpent() + order.getFinalAmount());
        loyalty.setTotalOrdersCount(loyalty.getTotalOrdersCount() + 1);

        String tier = (newTotal >= 2000) ? "KIM_CUONG" : (newTotal >= 1000) ? "VANG" : (newTotal >= 500) ? "BAC" : "DONG";
        loyalty.setMembershipTier(tier);
        loyaltyAccountRepository.save(loyalty);

        try {
            loyaltyTransactionRepository.save(new LoyaltyTransaction(
                    loyalty, order.getId(), earnedPoints, "EARN_PAYMENT", newAvail, "Tích điểm thanh toán đơn hàng #" + order.getOrderCode()
            ));
            log.info("✨ [LOYALTY] Tích lũy thành công {} điểm cho hội viên [{}] từ đơn hàng [{}]", earnedPoints, user.getPhone(), order.getOrderCode());
            return true;
        } catch (DataIntegrityViolationException ex) {
            log.warn("⚠️ [LOYALTY] Unique constraint uk_loyalty_tx_order_type đã chặn bản ghi tích điểm trùng lặp cho đơn [{}]", order.getOrderCode());
            return false;
        }
    }

    @Transactional
    public boolean revertLoyaltyPointsForOrder(Order order) {
        if (order == null || order.getUser() == null || order.getId() == null) {
            return false;
        }
        if (!loyaltyTransactionRepository.existsByOrderIdAndType(order.getId(), "EARN_PAYMENT")) {
            return false;
        }
        if (loyaltyTransactionRepository.existsByOrderIdAndType(order.getId(), "REVERT_CANCEL")) {
            return false;
        }

        User user = order.getUser();
        LoyaltyAccount loyalty = loyaltyAccountRepository.findByUserIdForUpdate(user.getId()).orElse(null);
        if (loyalty == null) return false;

        int pointsDeducted = Math.max(10, (int) Math.floor(order.getFinalAmount() / 1000.0));
        int newTotal = Math.max(0, loyalty.getTotalPoints() - pointsDeducted);
        int newAvail = Math.max(0, loyalty.getAvailablePoints() - pointsDeducted);
        loyalty.setTotalPoints(newTotal);
        loyalty.setAvailablePoints(newAvail);
        loyalty.setTotalSpent(Math.max(0.0, loyalty.getTotalSpent() - order.getFinalAmount()));
        loyalty.setTotalOrdersCount(Math.max(0, loyalty.getTotalOrdersCount() - 1));

        String tier = (newTotal >= 2000) ? "KIM_CUONG" : (newTotal >= 1000) ? "VANG" : (newTotal >= 500) ? "BAC" : "DONG";
        loyalty.setMembershipTier(tier);
        loyaltyAccountRepository.save(loyalty);

        try {
            loyaltyTransactionRepository.save(new LoyaltyTransaction(
                    loyalty, order.getId(), -pointsDeducted, "REVERT_CANCEL", newAvail, "Thu hồi điểm do hủy đơn hàng #" + order.getOrderCode()
            ));
            return true;
        } catch (DataIntegrityViolationException ex) {
            return false;
        }
    }
}

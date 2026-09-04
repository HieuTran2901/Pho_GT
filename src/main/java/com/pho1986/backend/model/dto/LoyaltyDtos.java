package com.pho1986.backend.model.dto;

import com.pho1986.backend.model.entity.LoyaltyAccount;
import jakarta.validation.constraints.NotBlank;

public class LoyaltyDtos {

    public static class RedeemRequest {
        @NotBlank(message = "Vui lòng chọn quà tặng cần đổi")
        private String rewardId;

        public String getRewardId() { return rewardId; }
        public void setRewardId(String rewardId) { this.rewardId = rewardId; }
    }

    public static class TierDetails {
        private String currentTier;
        private String nextTier;
        private Integer targetPoints;
        private Integer pointsToNext;
        private Integer progressPercent;

        public TierDetails(String currentTier, String nextTier, Integer targetPoints, Integer pointsToNext, Integer progressPercent) {
            this.currentTier = currentTier;
            this.nextTier = nextTier;
            this.targetPoints = targetPoints;
            this.pointsToNext = pointsToNext;
            this.progressPercent = progressPercent;
        }

        public String getCurrentTier() { return currentTier; }
        public String getNextTier() { return nextTier; }
        public Integer getTargetPoints() { return targetPoints; }
        public Integer getPointsToNext() { return pointsToNext; }
        public Integer getProgressPercent() { return progressPercent; }
    }

    public static class SummaryResponse {
        private LoyaltyAccount account;
        private TierDetails tierDetails;

        public SummaryResponse(LoyaltyAccount account, TierDetails tierDetails) {
            this.account = account;
            this.tierDetails = tierDetails;
        }

        public LoyaltyAccount getAccount() { return account; }
        public TierDetails getTierDetails() { return tierDetails; }
    }
}

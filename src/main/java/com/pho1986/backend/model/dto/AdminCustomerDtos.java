package com.pho1986.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public class AdminCustomerDtos {

    public static class AdminCustomerSummaryResponse {
        private String id;
        private String phone;
        private String email;
        private String fullName;
        private String role;
        private String status;
        private int failedLoginAttempts;
        private int lockoutRounds;
        private LocalDateTime lockedUntil;
        private LocalDateTime lockedAt;
        private String lockReason;
        private String lockType;
        private LocalDateTime createdAt;
        private Integer availablePoints;
        private String membershipTier;
        private Double totalSpent;
        private Integer totalOrdersCount;
        private String favoriteDishName;
        private String brothType;
        private String onionStyle;
        private String lastLoginIp;
        private String lastDeviceId;

        public AdminCustomerSummaryResponse() {}

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public int getFailedLoginAttempts() { return failedLoginAttempts; }
        public void setFailedLoginAttempts(int failedLoginAttempts) { this.failedLoginAttempts = failedLoginAttempts; }
        public int getLockoutRounds() { return lockoutRounds; }
        public void setLockoutRounds(int lockoutRounds) { this.lockoutRounds = lockoutRounds; }
        public LocalDateTime getLockedUntil() { return lockedUntil; }
        public void setLockedUntil(LocalDateTime lockedUntil) { this.lockedUntil = lockedUntil; }
        public LocalDateTime getLockedAt() { return lockedAt; }
        public void setLockedAt(LocalDateTime lockedAt) { this.lockedAt = lockedAt; }
        public String getLockReason() { return lockReason; }
        public void setLockReason(String lockReason) { this.lockReason = lockReason; }
        public String getLockType() { return lockType; }
        public void setLockType(String lockType) { this.lockType = lockType; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public Integer getAvailablePoints() { return availablePoints; }
        public void setAvailablePoints(Integer availablePoints) { this.availablePoints = availablePoints; }
        public String getMembershipTier() { return membershipTier; }
        public void setMembershipTier(String membershipTier) { this.membershipTier = membershipTier; }
        public Double getTotalSpent() { return totalSpent; }
        public void setTotalSpent(Double totalSpent) { this.totalSpent = totalSpent; }
        public Integer getTotalOrdersCount() { return totalOrdersCount; }
        public void setTotalOrdersCount(Integer totalOrdersCount) { this.totalOrdersCount = totalOrdersCount; }
        public String getFavoriteDishName() { return favoriteDishName; }
        public void setFavoriteDishName(String favoriteDishName) { this.favoriteDishName = favoriteDishName; }
        public String getBrothType() { return brothType; }
        public void setBrothType(String brothType) { this.brothType = brothType; }
        public String getOnionStyle() { return onionStyle; }
        public void setOnionStyle(String onionStyle) { this.onionStyle = onionStyle; }
        public String getLastLoginIp() { return lastLoginIp; }
        public void setLastLoginIp(String lastLoginIp) { this.lastLoginIp = lastLoginIp; }
        public String getLastDeviceId() { return lastDeviceId; }
        public void setLastDeviceId(String lastDeviceId) { this.lastDeviceId = lastDeviceId; }
    }

    public static class TasteProfileDetail {
        private String favoriteDishId;
        private String favoriteDishName;
        private String brothType;
        private String onionStyle;
        private String herbStyle;
        private Integer spicyLevel;
        private String crullerPref;
        private String customNote;

        public TasteProfileDetail() {}

        public String getFavoriteDishId() { return favoriteDishId; }
        public void setFavoriteDishId(String favoriteDishId) { this.favoriteDishId = favoriteDishId; }
        public String getFavoriteDishName() { return favoriteDishName; }
        public void setFavoriteDishName(String favoriteDishName) { this.favoriteDishName = favoriteDishName; }
        public String getBrothType() { return brothType; }
        public void setBrothType(String brothType) { this.brothType = brothType; }
        public String getOnionStyle() { return onionStyle; }
        public void setOnionStyle(String onionStyle) { this.onionStyle = onionStyle; }
        public String getHerbStyle() { return herbStyle; }
        public void setHerbStyle(String herbStyle) { this.herbStyle = herbStyle; }
        public Integer getSpicyLevel() { return spicyLevel; }
        public void setSpicyLevel(Integer spicyLevel) { this.spicyLevel = spicyLevel; }
        public String getCrullerPref() { return crullerPref; }
        public void setCrullerPref(String crullerPref) { this.crullerPref = crullerPref; }
        public String getCustomNote() { return customNote; }
        public void setCustomNote(String customNote) { this.customNote = customNote; }
    }

    public static class LoyaltyTxItem {
        private String id;
        private Integer pointsChange;
        private String type;
        private Integer balanceAfter;
        private String description;
        private LocalDateTime createdAt;

        public LoyaltyTxItem() {}

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public Integer getPointsChange() { return pointsChange; }
        public void setPointsChange(Integer pointsChange) { this.pointsChange = pointsChange; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Integer getBalanceAfter() { return balanceAfter; }
        public void setBalanceAfter(Integer balanceAfter) { this.balanceAfter = balanceAfter; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class CustomerOrderBrief {
        private String id;
        private String orderCode;
        private String status;
        private Double finalAmount;
        private String paymentMethod;
        private String paymentStatus;
        private LocalDateTime createdAt;
        private int itemCount;

        public CustomerOrderBrief() {}

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getOrderCode() { return orderCode; }
        public void setOrderCode(String orderCode) { this.orderCode = orderCode; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Double getFinalAmount() { return finalAmount; }
        public void setFinalAmount(Double finalAmount) { this.finalAmount = finalAmount; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getPaymentStatus() { return paymentStatus; }
        public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public int getItemCount() { return itemCount; }
        public void setItemCount(int itemCount) { this.itemCount = itemCount; }
    }

    public static class AdminCustomerDetailResponse {
        private AdminCustomerSummaryResponse summary;
        private TasteProfileDetail tasteProfile;
        private List<LoyaltyTxItem> loyaltyTransactions;
        private List<CustomerOrderBrief> recentOrders;

        public AdminCustomerDetailResponse() {}

        public AdminCustomerSummaryResponse getSummary() { return summary; }
        public void setSummary(AdminCustomerSummaryResponse summary) { this.summary = summary; }
        public TasteProfileDetail getTasteProfile() { return tasteProfile; }
        public void setTasteProfile(TasteProfileDetail tasteProfile) { this.tasteProfile = tasteProfile; }
        public List<LoyaltyTxItem> getLoyaltyTransactions() { return loyaltyTransactions; }
        public void setLoyaltyTransactions(List<LoyaltyTxItem> loyaltyTransactions) { this.loyaltyTransactions = loyaltyTransactions; }
        public List<CustomerOrderBrief> getRecentOrders() { return recentOrders; }
        public void setRecentOrders(List<CustomerOrderBrief> recentOrders) { this.recentOrders = recentOrders; }
    }

    public static class UpdateCustomerStatusRequest {
        @NotBlank(message = "Trạng thái không được để trống")
        private String status; // ACTIVE | LOCKED

        private String reason;

        public UpdateCustomerStatusRequest() {}

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class AdjustCustomerPointsRequest {
        @NotNull(message = "Số điểm điều chỉnh không được để trống")
        private Integer points; // +/- điểm

        @NotBlank(message = "Lý do điều chỉnh không được để trống")
        private String reason;

        public AdjustCustomerPointsRequest() {}

        public Integer getPoints() { return points; }
        public void setPoints(Integer points) { this.points = points; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class BlacklistCustomerRequest {
        private boolean banPhone = true;
        private boolean banDevice = true;
        private boolean banIp = true;
        private Integer ipDurationDays = 7; // Mặc định 7 ngày

        @NotBlank(message = "Lý do đưa vào danh sách cấm không được để trống")
        private String reason;

        public BlacklistCustomerRequest() {}

        public boolean isBanPhone() { return banPhone; }
        public void setBanPhone(boolean banPhone) { this.banPhone = banPhone; }
        public boolean isBanDevice() { return banDevice; }
        public void setBanDevice(boolean banDevice) { this.banDevice = banDevice; }
        public boolean isBanIp() { return banIp; }
        public void setBanIp(boolean banIp) { this.banIp = banIp; }
        public Integer getIpDurationDays() { return ipDurationDays; }
        public void setIpDurationDays(Integer ipDurationDays) { this.ipDurationDays = ipDurationDays; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}

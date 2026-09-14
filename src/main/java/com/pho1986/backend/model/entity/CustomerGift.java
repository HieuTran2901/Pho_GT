package com.pho1986.backend.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer_gifts", indexes = {
    @Index(name = "idx_customer_gifts_user_status", columnList = "user_id, status, expiry_date"),
    @Index(name = "idx_customer_gifts_status_expiry", columnList = "status, expiry_date"),
    @Index(name = "idx_customer_gifts_code", columnList = "code")
})
public class CustomerGift {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "reward_id", length = 36)
    private String rewardId;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String category = "Món Tặng Kèm 0đ"; // 'Món Tặng Kèm 0đ' | 'Phiếu Giảm Giá'

    @Column(name = "reward_type", nullable = false, length = 30)
    private String rewardType = "FREE_ITEM"; // 'FREE_ITEM' | 'DISCOUNT_CASH' | 'DISCOUNT_PERCENT'

    @Column(name = "dish_id", length = 50)
    private String dishId;

    @Column(name = "dish_name", length = 100)
    private String dishName;

    @Column(name = "discount_value", nullable = false)
    private Double discountValue = 0.0;

    @Column(name = "min_order_amount", nullable = false)
    private Double minOrderAmount = 0.0;

    @Column(length = 500)
    private String image;

    @Column(nullable = false, length = 20)
    private String status = "AVAILABLE"; // 'AVAILABLE' | 'USED' | 'EXPIRED'

    @Column(nullable = false, length = 30)
    private String source = "REDEEM"; // 'WELCOME' | 'REDEEM' | 'ADMIN_GIFT'

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "order_id", length = 50)
    private String orderId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public CustomerGift() {}

    public CustomerGift(User user, String code, String title, String description, String category,
                        String rewardType, String dishId, String dishName, Double discountValue,
                        Double minOrderAmount, String image, String source, LocalDateTime expiryDate) {
        this.user = user;
        this.code = code;
        this.title = title;
        this.description = description;
        this.category = category;
        this.rewardType = rewardType;
        this.dishId = dishId;
        this.dishName = dishName;
        this.discountValue = discountValue != null ? discountValue : 0.0;
        this.minOrderAmount = minOrderAmount != null ? minOrderAmount : 0.0;
        this.image = image;
        this.source = source;
        this.status = "AVAILABLE";
        this.expiryDate = expiryDate;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getRewardId() { return rewardId; }
    public void setRewardId(String rewardId) { this.rewardId = rewardId; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getRewardType() { return rewardType; }
    public void setRewardType(String rewardType) { this.rewardType = rewardType; }
    public String getDishId() { return dishId; }
    public void setDishId(String dishId) { this.dishId = dishId; }
    public String getDishName() { return dishName; }
    public void setDishName(String dishName) { this.dishName = dishName; }
    public Double getDiscountValue() { return discountValue; }
    public void setDiscountValue(Double discountValue) { this.discountValue = discountValue; }
    public Double getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(Double minOrderAmount) { this.minOrderAmount = minOrderAmount; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
    public LocalDateTime getUsedAt() { return usedAt; }
    public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isExpired() {
        return expiryDate != null && LocalDateTime.now().isAfter(expiryDate);
    }

    public boolean isExpiringSoon(int daysThreshold) {
        if (expiryDate == null || isExpired()) return false;
        return LocalDateTime.now().plusDays(daysThreshold).isAfter(expiryDate);
    }
}

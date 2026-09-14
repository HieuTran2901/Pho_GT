package com.pho1986.backend.dto;

import com.pho1986.backend.model.entity.CustomerGift;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class CustomerGiftDto {

    private String id;
    private String code;
    private String title;
    private String description;
    private String category;
    private String rewardType;
    private String dishId;
    private String dishName;
    private Double discountValue;
    private Double minOrderAmount;
    private String image;
    private String status;
    private String source;
    private String expiryText;
    private LocalDateTime expiryDate;
    private Boolean isExpiringSoon;
    private Long daysRemaining;
    private LocalDateTime usedAt;
    private String orderId;
    private LocalDateTime createdAt;

    public CustomerGiftDto() {}

    public static CustomerGiftDto fromEntity(CustomerGift gift) {
        if (gift == null) return null;
        CustomerGiftDto dto = new CustomerGiftDto();
        dto.setId(gift.getId());
        dto.setCode(gift.getCode());
        dto.setTitle(gift.getTitle());
        dto.setDescription(gift.getDescription());
        dto.setCategory(gift.getCategory());
        dto.setRewardType(gift.getRewardType());
        dto.setDishId(gift.getDishId());
        dto.setDishName(gift.getDishName());
        dto.setDiscountValue(gift.getDiscountValue());
        dto.setMinOrderAmount(gift.getMinOrderAmount());
        dto.setImage(gift.getImage());
        dto.setStatus(gift.getStatus());
        dto.setSource(gift.getSource());
        dto.setExpiryDate(gift.getExpiryDate());
        dto.setUsedAt(gift.getUsedAt());
        dto.setOrderId(gift.getOrderId());
        dto.setCreatedAt(gift.getCreatedAt());

        if (gift.getExpiryDate() != null) {
            dto.setExpiryText("Hạn dùng: " + gift.getExpiryDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
            long days = java.time.temporal.ChronoUnit.DAYS.between(LocalDateTime.now(), gift.getExpiryDate());
            dto.setDaysRemaining(Math.max(0, days));
            dto.setIsExpiringSoon(days >= 0 && days <= 3 && !"USED".equals(gift.getStatus()) && !"EXPIRED".equals(gift.getStatus()));
        } else {
            dto.setExpiryText("Hạn dùng: Vô thời hạn");
            dto.setDaysRemaining(null);
            dto.setIsExpiringSoon(false);
        }

        return dto;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
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
    public String getExpiryText() { return expiryText; }
    public void setExpiryText(String expiryText) { this.expiryText = expiryText; }
    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
    public Boolean getIsExpiringSoon() { return isExpiringSoon; }
    public void setIsExpiringSoon(Boolean isExpiringSoon) { this.isExpiringSoon = isExpiringSoon; }
    public Long getDaysRemaining() { return daysRemaining; }
    public void setDaysRemaining(Long daysRemaining) { this.daysRemaining = daysRemaining; }
    public LocalDateTime getUsedAt() { return usedAt; }
    public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

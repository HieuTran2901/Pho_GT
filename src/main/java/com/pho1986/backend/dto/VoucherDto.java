package com.pho1986.backend.dto;

import com.pho1986.backend.model.entity.Voucher;
import java.time.LocalDateTime;

public class VoucherDto {
    private String id;
    private String code;
    private String title;
    private String description;
    private String discountType;
    private Double discountValue;
    private Double maxDiscountAmount;
    private Double minOrderAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer usageLimit;
    private Integer usedCount;
    private Boolean isActive;
    private Boolean isPublic;
    private Boolean isExpired;
    private Boolean isExpiringSoon;
    private Long daysRemaining;
    private String formattedDiscount;

    public VoucherDto() {}

    public static VoucherDto fromEntity(Voucher v) {
        if (v == null) return null;
        VoucherDto dto = new VoucherDto();
        dto.setId(v.getId());
        dto.setCode(v.getCode());
        dto.setTitle(v.getTitle());
        dto.setDescription(v.getDescription());
        dto.setDiscountType(v.getDiscountType());
        dto.setDiscountValue(v.getDiscountValue());
        dto.setMaxDiscountAmount(v.getMaxDiscountAmount());
        dto.setMinOrderAmount(v.getMinOrderAmount());
        dto.setStartDate(v.getStartDate());
        dto.setEndDate(v.getEndDate());
        dto.setUsageLimit(v.getUsageLimit());
        dto.setUsedCount(v.getUsedCount());
        dto.setIsActive(v.getIsActive());
        dto.setIsPublic(v.getIsPublic());
        dto.setIsExpired(v.isExpired());

        if (v.getEndDate() != null) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(LocalDateTime.now(), v.getEndDate());
            dto.setDaysRemaining(Math.max(0, days));
            dto.setIsExpiringSoon(days >= 0 && days <= 3 && !v.isExpired());
        } else {
            dto.setDaysRemaining(null);
            dto.setIsExpiringSoon(false);
        }

        if ("PERCENT".equalsIgnoreCase(v.getDiscountType())) {
            dto.setFormattedDiscount(String.format("GIẢM %.0f%%", v.getDiscountValue()));
        } else {
            dto.setFormattedDiscount(String.format("GIẢM %,.0fđ", v.getDiscountValue()));
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

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public Double getDiscountValue() { return discountValue; }
    public void setDiscountValue(Double discountValue) { this.discountValue = discountValue; }

    public Double getMaxDiscountAmount() { return maxDiscountAmount; }
    public void setMaxDiscountAmount(Double maxDiscountAmount) { this.maxDiscountAmount = maxDiscountAmount; }

    public Double getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(Double minOrderAmount) { this.minOrderAmount = minOrderAmount; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public Integer getUsageLimit() { return usageLimit; }
    public void setUsageLimit(Integer usageLimit) { this.usageLimit = usageLimit; }

    public Integer getUsedCount() { return usedCount; }
    public void setUsedCount(Integer usedCount) { this.usedCount = usedCount; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }

    public Boolean getIsExpired() { return isExpired; }
    public void setIsExpired(Boolean isExpired) { this.isExpired = isExpired; }

    public Boolean getIsExpiringSoon() { return isExpiringSoon; }
    public void setIsExpiringSoon(Boolean isExpiringSoon) { this.isExpiringSoon = isExpiringSoon; }

    public Long getDaysRemaining() { return daysRemaining; }
    public void setDaysRemaining(Long daysRemaining) { this.daysRemaining = daysRemaining; }

    public String getFormattedDiscount() { return formattedDiscount; }
    public void setFormattedDiscount(String formattedDiscount) { this.formattedDiscount = formattedDiscount; }
}

package com.pho1986.backend.dto;

public class VoucherValidateResponseDto {
    private boolean valid;
    private String message;
    private String code;
    private String title;
    private String discountType;
    private Double discountValue;
    private Double discountAmount;
    private Double finalAmount;

    public VoucherValidateResponseDto() {}

    public static VoucherValidateResponseDto success(String code, String title, String discountType,
                                                     Double discountValue, Double discountAmount, Double finalAmount) {
        VoucherValidateResponseDto dto = new VoucherValidateResponseDto();
        dto.setValid(true);
        dto.setMessage("Áp dụng tem phiếu thành công!");
        dto.setCode(code);
        dto.setTitle(title);
        dto.setDiscountType(discountType);
        dto.setDiscountValue(discountValue);
        dto.setDiscountAmount(discountAmount);
        dto.setFinalAmount(finalAmount);
        return dto;
    }

    public static VoucherValidateResponseDto invalid(String message) {
        VoucherValidateResponseDto dto = new VoucherValidateResponseDto();
        dto.setValid(false);
        dto.setMessage(message);
        dto.setDiscountAmount(0.0);
        return dto;
    }

    // Getters and Setters
    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public Double getDiscountValue() { return discountValue; }
    public void setDiscountValue(Double discountValue) { this.discountValue = discountValue; }

    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }

    public Double getFinalAmount() { return finalAmount; }
    public void setFinalAmount(Double finalAmount) { this.finalAmount = finalAmount; }
}

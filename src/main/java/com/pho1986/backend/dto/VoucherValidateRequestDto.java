package com.pho1986.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class VoucherValidateRequestDto {

    @NotBlank(message = "Mã tem phiếu không được để trống")
    private String code;

    @NotNull(message = "Giá trị đơn hàng không được để trống")
    @PositiveOrZero(message = "Giá trị đơn hàng không được âm")
    private Double orderAmount;

    public VoucherValidateRequestDto() {}

    public VoucherValidateRequestDto(String code, Double orderAmount) {
        this.code = code;
        this.orderAmount = orderAmount;
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Double getOrderAmount() { return orderAmount; }
    public void setOrderAmount(Double orderAmount) { this.orderAmount = orderAmount; }
}

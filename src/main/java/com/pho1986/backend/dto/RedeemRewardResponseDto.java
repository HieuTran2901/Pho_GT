package com.pho1986.backend.dto;

import com.pho1986.backend.model.entity.LoyaltyAccount;

public class RedeemRewardResponseDto {

    private LoyaltyAccount loyaltyAccount;
    private CustomerGiftDto issuedGift;
    private String message;

    public RedeemRewardResponseDto() {}

    public RedeemRewardResponseDto(LoyaltyAccount loyaltyAccount, CustomerGiftDto issuedGift, String message) {
        this.loyaltyAccount = loyaltyAccount;
        this.issuedGift = issuedGift;
        this.message = message;
    }

    public LoyaltyAccount getLoyaltyAccount() { return loyaltyAccount; }
    public void setLoyaltyAccount(LoyaltyAccount loyaltyAccount) { this.loyaltyAccount = loyaltyAccount; }
    public CustomerGiftDto getIssuedGift() { return issuedGift; }
    public void setIssuedGift(CustomerGiftDto issuedGift) { this.issuedGift = issuedGift; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

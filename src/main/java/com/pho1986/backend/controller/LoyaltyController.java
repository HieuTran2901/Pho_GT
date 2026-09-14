package com.pho1986.backend.controller;

import com.pho1986.backend.common.ApiResponse;
import com.pho1986.backend.dto.CustomerGiftDto;
import com.pho1986.backend.dto.RedeemRewardResponseDto;
import com.pho1986.backend.model.dto.LoyaltyDtos.*;
import com.pho1986.backend.model.entity.LoyaltyReward;
import com.pho1986.backend.model.entity.LoyaltyTransaction;
import com.pho1986.backend.service.CustomerGiftService;
import com.pho1986.backend.service.LoyaltyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/loyalty")
public class LoyaltyController {

    private final LoyaltyService loyaltyService;
    private final CustomerGiftService customerGiftService;

    public LoyaltyController(LoyaltyService loyaltyService, CustomerGiftService customerGiftService) {
        this.loyaltyService = loyaltyService;
        this.customerGiftService = customerGiftService;
    }

    @GetMapping("/rewards")
    public ResponseEntity<ApiResponse<List<LoyaltyReward>>> getAvailableRewards() {
        List<LoyaltyReward> rewards = loyaltyService.getAvailableRewards();
        return ResponseEntity.ok(ApiResponse.ok(rewards));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<SummaryResponse>> getLoyaltySummary(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        SummaryResponse summary = loyaltyService.getLoyaltySummary(userId);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @GetMapping("/ledger")
    public ResponseEntity<ApiResponse<List<LoyaltyTransaction>>> getLoyaltyLedger(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        List<LoyaltyTransaction> ledger = loyaltyService.getLoyaltyLedger(userId);
        return ResponseEntity.ok(ApiResponse.ok(ledger));
    }

    @GetMapping("/my-gifts")
    public ResponseEntity<ApiResponse<List<CustomerGiftDto>>> getMyGifts(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        List<CustomerGiftDto> gifts = customerGiftService.getMyGifts(userId);
        return ResponseEntity.ok(ApiResponse.ok(gifts));
    }

    @PostMapping("/redeem")
    public ResponseEntity<ApiResponse<RedeemRewardResponseDto>> redeemReward(
            Authentication authentication,
            @Valid @RequestBody RedeemRequest request) {
        String userId = (String) authentication.getPrincipal();
        RedeemRewardResponseDto response = loyaltyService.redeemReward(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(response, response.getMessage()));
    }

    @PostMapping("/my-gifts/{id}/apply")
    public ResponseEntity<ApiResponse<Boolean>> applyGift(
            Authentication authentication,
            @PathVariable("id") String id,
            @RequestParam(value = "orderId", required = false) String orderId) {
        String userId = (String) authentication.getPrincipal();
        boolean applied = customerGiftService.applyGiftToOrder(userId, id, orderId);
        return ResponseEntity.ok(ApiResponse.ok(applied, applied ? "Đã áp dụng quà vào đơn hàng" : "Quà không khả dụng hoặc đã sử dụng"));
    }
}

package com.pho1986.backend.controller;

import com.pho1986.backend.common.ApiResponse;
import com.pho1986.backend.model.dto.LoyaltyDtos.*;
import com.pho1986.backend.model.entity.LoyaltyAccount;
import com.pho1986.backend.model.entity.LoyaltyReward;
import com.pho1986.backend.model.entity.LoyaltyTransaction;
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

    public LoyaltyController(LoyaltyService loyaltyService) {
        this.loyaltyService = loyaltyService;
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

    @PostMapping("/redeem")
    public ResponseEntity<ApiResponse<LoyaltyAccount>> redeemReward(
            Authentication authentication,
            @Valid @RequestBody RedeemRequest request) {
        String userId = (String) authentication.getPrincipal();
        LoyaltyAccount account = loyaltyService.redeemReward(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(account, "Đổi quà thành công! Phần thưởng sẽ được áp dụng vào bát phở tiếp theo."));
    }
}

package com.pho1986.backend.controller;

import com.pho1986.backend.common.ApiResponse;
import com.pho1986.backend.model.dto.TasteProfileDto.*;
import com.pho1986.backend.model.entity.TasteProfile;
import com.pho1986.backend.service.TasteProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/user/taste-profile")
public class TasteProfileController {

    private final TasteProfileService tasteProfileService;

    public TasteProfileController(TasteProfileService tasteProfileService) {
        this.tasteProfileService = tasteProfileService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<DetailResponse>> getTasteProfile(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        DetailResponse response = tasteProfileService.getTasteProfile(userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<TasteProfile>> updateTasteProfile(
            Authentication authentication,
            @RequestBody UpdateRequest request) {
        String userId = (String) authentication.getPrincipal();
        TasteProfile updated = tasteProfileService.updateTasteProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Đã lưu Gu Ăn Phở thành công! Món phở của bạn sẽ luôn chuẩn vị."));
    }
}

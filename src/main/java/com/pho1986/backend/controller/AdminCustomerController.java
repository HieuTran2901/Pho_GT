package com.pho1986.backend.controller;

import com.pho1986.backend.common.ApiResponse;
import com.pho1986.backend.model.dto.AdminCustomerDtos.*;
import com.pho1986.backend.service.AdminCustomerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/customers")
public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;

    public AdminCustomerController(AdminCustomerService adminCustomerService) {
        this.adminCustomerService = adminCustomerService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminCustomerSummaryResponse>>> getCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String tier) {
        List<AdminCustomerSummaryResponse> customers = adminCustomerService.getCustomers(search, status, tier);
        return ResponseEntity.ok(ApiResponse.ok(customers));
    }

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMetrics() {
        Map<String, Object> metrics = adminCustomerService.getCustomerMetrics();
        return ResponseEntity.ok(ApiResponse.ok(metrics));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminCustomerDetailResponse>> getCustomerDetail(@PathVariable String id) {
        AdminCustomerDetailResponse detail = adminCustomerService.getCustomerDetail(id);
        return ResponseEntity.ok(ApiResponse.ok(detail));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminCustomerSummaryResponse>> updateCustomerStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateCustomerStatusRequest request,
            Authentication authentication) {
        String adminPhone = (authentication != null) ? authentication.getName() : "ADMIN";
        AdminCustomerSummaryResponse updated = adminCustomerService.updateCustomerStatus(id, request, adminPhone);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Cập nhật trạng thái khách hàng thành công!"));
    }

    @PostMapping("/{id}/adjust-points")
    public ResponseEntity<ApiResponse<AdminCustomerDetailResponse>> adjustCustomerPoints(
            @PathVariable String id,
            @Valid @RequestBody AdjustCustomerPointsRequest request,
            Authentication authentication) {
        String adminPhone = (authentication != null) ? authentication.getName() : "ADMIN";
        AdminCustomerDetailResponse updated = adminCustomerService.adjustCustomerPoints(id, request, adminPhone);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Điều chỉnh điểm thưởng khách hàng thành công!"));
    }

    @PostMapping("/{id}/unlock")
    public ResponseEntity<ApiResponse<AdminCustomerSummaryResponse>> unlockCustomer(@PathVariable String id) {
        AdminCustomerSummaryResponse updated = adminCustomerService.unlockCustomer(id);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Mở khóa tài khoản khách hàng thành công!"));
    }

    @PostMapping("/{id}/blacklist")
    public ResponseEntity<ApiResponse<AdminCustomerSummaryResponse>> blacklistCustomer(
            @PathVariable String id,
            @Valid @RequestBody BlacklistCustomerRequest request,
            Authentication authentication) {
        String adminPhone = (authentication != null) ? authentication.getName() : "ADMIN";
        AdminCustomerSummaryResponse updated = adminCustomerService.blacklistCustomer(id, request, adminPhone);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Đã đưa khách hàng vào Danh Sách Cấm (Blacklist) thành công!"));
    }
}

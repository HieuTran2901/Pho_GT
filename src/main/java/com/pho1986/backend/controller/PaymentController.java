package com.pho1986.backend.controller;

import com.pho1986.backend.common.ApiResponse;
import com.pho1986.backend.model.dto.PaymentDtos.*;
import com.pho1986.backend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(
            Authentication authentication,
            @Valid @RequestBody CreatePaymentRequest request) {
        String userId = (authentication != null && !"anonymousUser".equals(authentication.getPrincipal()))
                ? (String) authentication.getPrincipal()
                : null;

        PaymentResponse response = paymentService.createPayment(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Khởi tạo thanh toán thành công."));
    }

    @GetMapping("/{paymentCode}/status")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> getPaymentStatus(
            @PathVariable String paymentCode) {
        PaymentStatusResponse response = paymentService.getPaymentStatus(paymentCode);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/{paymentCode}/confirm")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> confirmPayment(
            @PathVariable String paymentCode,
            @RequestBody(required = false) ConfirmPaymentRequest request) {
        PaymentStatusResponse response = paymentService.confirmPayment(paymentCode, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Xác nhận thanh toán thành công! Bếp đã bắt đầu nấu phở."));
    }

    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<String>> handleWebhook(
            @RequestBody String payload) {
        // Dự phòng cho webhook cổng thanh toán ngân hàng (PayOS, SePay, MoMo)
        return ResponseEntity.ok(ApiResponse.ok("WEBHOOK_RECEIVED", "Đã ghi nhận dữ liệu webhook thành công."));
    }
}

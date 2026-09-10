package com.pho1986.backend.controller;

import com.pho1986.backend.common.ApiResponse;
import com.pho1986.backend.model.dto.PaymentDtos.*;
import com.pho1986.backend.model.dto.PaymentGatewayDtos.PaymentGatewayResponse;
import com.pho1986.backend.service.PaymentGatewayService;
import com.pho1986.backend.service.PaymentService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentGatewayService paymentGatewayService;

    public PaymentController(PaymentService paymentService, PaymentGatewayService paymentGatewayService) {
        this.paymentService = paymentService;
        this.paymentGatewayService = paymentGatewayService;
    }

    /**
     * Endpoint công khai lấy trạng thái các cổng thanh toán (M5.4 Payment Maintenance Hub)
     */
    @GetMapping("/gateways")
    public ResponseEntity<ApiResponse<List<PaymentGatewayResponse>>> getPaymentGateways() {
        List<PaymentGatewayResponse> gateways = paymentGatewayService.getAllGateways();
        return ResponseEntity.ok(ApiResponse.ok(gateways));
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

    /**
     * Webhook IPN xử lý biến động số dư / thanh toán từ cổng SePay
     */
    @PostMapping("/sepay/ipn")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> handleSepayIpn(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Secret-Key", required = false) String secretHeader,
            @RequestBody SepayIpnPayload payload) {
        PaymentStatusResponse response = paymentService.processSepayIpn(authHeader, secretHeader, payload);
        return ResponseEntity.ok(ApiResponse.ok(response, "Đã xử lý SePay IPN thành công!"));
    }

    /**
     * Endpoint đón chuyển hướng người dùng trở về từ SePay hosted checkout
     */
    @GetMapping("/sepay/return/{status}")
    public void handleSepayReturn(
            @PathVariable String status,
            @RequestParam(value = "order_id", required = false) String orderId,
            HttpServletResponse httpServletResponse) throws IOException {
        String redirectUrl = paymentService.resolveSepayReturnUrl(status, orderId);
        httpServletResponse.sendRedirect(redirectUrl);
    }

    /**
     * Webhook IPN xử lý kết quả thanh toán từ ví điện tử MoMo API v2
     */
    @PostMapping("/momo/ipn")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> handleMomoIpn(
            @RequestBody MomoIpnRequest request) {
        PaymentStatusResponse response = paymentService.processMomoIpn(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Đã xử lý MoMo IPN thành công!"));
    }

    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<String>> handleWebhook(
            @RequestBody String payload) {
        // Dự phòng cho webhook cổng thanh toán ngân hàng (PayOS, SePay, MoMo)
        return ResponseEntity.ok(ApiResponse.ok("WEBHOOK_RECEIVED", "Đã ghi nhận dữ liệu webhook thành công."));
    }
}

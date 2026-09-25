package com.pho1986.backend.controller;

import com.pho1986.backend.common.ApiResponse;
import com.pho1986.backend.model.dto.OrderDtos.*;
import com.pho1986.backend.model.entity.Order;
import com.pho1986.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CreateOrderResponse>> createOrder(
            Authentication authentication,
            @Valid @RequestBody CreateOrderRequest request) {
        String userId = (authentication != null && !"anonymousUser".equals(authentication.getPrincipal()))
                ? (String) authentication.getPrincipal()
                : null;

        Order order = orderService.createOrder(userId, request);
        CreateOrderResponse response = CreateOrderResponse.fromOrder(order, order.getRawAccessToken());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Đặt món thành công! Bếp Phở Gia Truyền 1986 đang chuẩn bị cho bạn."));
    }

    @GetMapping("/quick-reorder")
    public ResponseEntity<ApiResponse<QuickReorderResponse>> getQuickReorder(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        QuickReorderResponse response = orderService.getQuickReorder(userId);
        return ResponseEntity.ok(ApiResponse.ok(response, "Dữ liệu bát phở quen thuộc sẵn sàng cho bạn đặt lại."));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<Order>>> getOrderHistory(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        List<Order> orders = orderService.getOrderHistory(userId);
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<ApiResponse<PublicOrderResponse>> getOrderByCode(
            @PathVariable String orderCode,
            @RequestHeader(value = "X-Order-Access-Token", required = false) String orderAccessToken,
            Authentication authentication) {
        Order order = orderService.getOrderByCode(orderCode);
        boolean isOwner = false;
        if (authentication != null && !"anonymousUser".equals(authentication.getPrincipal())) {
            String currentUserId = (String) authentication.getPrincipal();
            if (order.getUser() != null && currentUserId.equals(order.getUser().getId())) {
                isOwner = true;
            }
            if (authentication.getAuthorities() != null &&
                    authentication.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()))) {
                isOwner = true;
            }
        }
        if (!isOwner && order.getUser() == null && org.springframework.util.StringUtils.hasText(orderAccessToken)) {
            String hash = com.pho1986.backend.common.PiiMaskUtils.sha256Hex(orderAccessToken.trim());
            if (order.getOrderAccessTokenHash() != null && java.security.MessageDigest.isEqual(
                    order.getOrderAccessTokenHash().getBytes(java.nio.charset.StandardCharsets.UTF_8),
                    hash.getBytes(java.nio.charset.StandardCharsets.UTF_8))) {
                isOwner = true;
            }
        }
        PublicOrderResponse response = PublicOrderResponse.fromOrder(order, isOwner);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * Pre-flight check tính hợp lệ của tài khoản / SĐT trước khi đặt bàn
     */
    @GetMapping("/eligibility")
    public ResponseEntity<ApiResponse<Boolean>> checkEligibility(
            Authentication authentication,
            @RequestParam(required = false) String phone) {
        String userId = (authentication != null && !"anonymousUser".equals(authentication.getPrincipal()))
                ? (String) authentication.getPrincipal()
                : null;
        orderService.checkEligibility(userId, phone);
        return ResponseEntity.ok(ApiResponse.ok(true, "Tài khoản đủ điều kiện đặt bàn."));
    }
}

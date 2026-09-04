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
    public ResponseEntity<ApiResponse<Order>> createOrder(
            Authentication authentication,
            @Valid @RequestBody CreateOrderRequest request) {
        String userId = (authentication != null && !"anonymousUser".equals(authentication.getPrincipal()))
                ? (String) authentication.getPrincipal()
                : null;

        Order order = orderService.createOrder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(order, "Đặt món thành công! Bếp Phở Gia Truyền 1986 đang chuẩn bị cho bạn."));
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
    public ResponseEntity<ApiResponse<Order>> getOrderByCode(@PathVariable String orderCode) {
        Order order = orderService.getOrderByCode(orderCode);
        return ResponseEntity.ok(ApiResponse.ok(order));
    }
}

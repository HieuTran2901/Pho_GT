package com.pho1986.backend.controller;

import com.pho1986.backend.common.ApiResponse;
import com.pho1986.backend.model.dto.AdminDashboardDtos.*;
import com.pho1986.backend.model.dto.PaymentGatewayDtos.*;
import com.pho1986.backend.model.entity.Category;
import com.pho1986.backend.model.entity.Dish;
import com.pho1986.backend.model.entity.Order;
import com.pho1986.backend.service.AdminService;
import com.pho1986.backend.service.AuthService;
import com.pho1986.backend.service.PaymentGatewayService;
import com.pho1986.backend.service.S3StorageService;
import com.pho1986.backend.model.entity.User;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final S3StorageService s3StorageService;
    private final PaymentGatewayService paymentGatewayService;
    private final AuthService authService;

    public AdminController(
            AdminService adminService,
            S3StorageService s3StorageService,
            PaymentGatewayService paymentGatewayService,
            AuthService authService) {
        this.adminService = adminService;
        this.s3StorageService = s3StorageService;
        this.paymentGatewayService = paymentGatewayService;
        this.authService = authService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        AdminStatsResponse stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<Order>>> getOrders(@RequestParam(required = false) String status) {
        List<Order> orders = adminService.getAllOrders(status);
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<Order>> updateOrderStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        Order updated = adminService.updateOrderStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Cập nhật trạng thái đơn hàng thành công!"));
    }

    @GetMapping("/dishes")
    public ResponseEntity<ApiResponse<List<Dish>>> getDishes() {
        List<Dish> dishes = adminService.getAllDishes();
        return ResponseEntity.ok(ApiResponse.ok(dishes));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<Category>>> getCategories() {
        List<Category> categories = adminService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    @PostMapping("/dishes")
    public ResponseEntity<ApiResponse<Dish>> createDish(@Valid @RequestBody DishUpsertRequest request) {
        Dish dish = adminService.createDish(request);
        return ResponseEntity.ok(ApiResponse.ok(dish, "Tạo món ăn mới thành công!"));
    }

    @PutMapping("/dishes/{id}")
    public ResponseEntity<ApiResponse<Dish>> updateDish(
            @PathVariable String id,
            @Valid @RequestBody DishUpsertRequest request) {
        Dish dish = adminService.updateDish(id, request);
        return ResponseEntity.ok(ApiResponse.ok(dish, "Cập nhật món ăn thành công!"));
    }

    @DeleteMapping("/dishes/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDish(@PathVariable String id) {
        adminService.deleteDish(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa món ăn thành công!"));
    }

    @PostMapping(value = "/dishes/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadDishImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = s3StorageService.uploadDishImage(file);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("imageUrl", imageUrl), "Tải ảnh lên S3 thành công!"));
    }

    /**
     * Quản lý Cổng Thanh Toán & Bảo Trì (M5.4 Payment Maintenance Hub)
     */
    @GetMapping("/payments/gateways")
    public ResponseEntity<ApiResponse<List<PaymentGatewayResponse>>> getPaymentGateways() {
        List<PaymentGatewayResponse> gateways = paymentGatewayService.getAllGateways();
        return ResponseEntity.ok(ApiResponse.ok(gateways));
    }

    @PutMapping("/payments/gateways/{id}")
    public ResponseEntity<ApiResponse<PaymentGatewayResponse>> updatePaymentGateway(
            @PathVariable String id,
            @Valid @RequestBody UpdateGatewayStatusRequest request,
            Authentication authentication) {
        String adminPhone = (authentication != null) ? authentication.getName() : "ADMIN";
        PaymentGatewayResponse response = paymentGatewayService.updateGatewayStatus(id, request, adminPhone);
        return ResponseEntity.ok(ApiResponse.ok(response, "Cập nhật trạng thái cổng thanh toán thành công!"));
    }

    /**
     * [SECURITY_AGENT] Mở khóa tài khoản bị khóa do vượt quá số vòng thử đăng nhập
     */
    @PostMapping("/users/{userId}/unlock")
    public ResponseEntity<ApiResponse<Map<String, Object>>> unlockUser(@PathVariable String userId) {
        User user = authService.unlockUserAccount(userId);
        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("phone", user.getPhone());
        data.put("fullName", user.getFullName());
        data.put("status", user.getStatus());
        data.put("unlocked", true);
        return ResponseEntity.ok(ApiResponse.ok(data, "Mở khóa tài khoản thành công! Khách hàng có thể đăng nhập lại bình thường."));
    }
}

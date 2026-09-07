package com.pho1986.backend.controller;

import com.pho1986.backend.common.ApiResponse;
import com.pho1986.backend.model.dto.AdminDashboardDtos.*;
import com.pho1986.backend.model.entity.Category;
import com.pho1986.backend.model.entity.Dish;
import com.pho1986.backend.model.entity.Order;
import com.pho1986.backend.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
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
}

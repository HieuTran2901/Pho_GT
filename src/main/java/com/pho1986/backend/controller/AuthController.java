package com.pho1986.backend.controller;

import com.pho1986.backend.common.ApiResponse;
import com.pho1986.backend.model.dto.AuthDtos.*;
import com.pho1986.backend.model.entity.User;
import com.pho1986.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "Đăng ký thành viên thành công! Bạn nhận được 50 điểm Tri Kỷ."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Đăng nhập thành công! Chào mừng quý khách trở lại."));
    }

    @PostMapping("/post-order-claim")
    public ResponseEntity<ApiResponse<AuthResponse>> postOrderClaim(@Valid @RequestBody PostOrderClaimRequest request) {
        AuthResponse response = authService.postOrderClaim(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Chuyển đổi thành công đơn hàng vào tài khoản hội viên!"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getMe(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Chưa xác thực"));
        }
        User user = authService.getMe((String) authentication.getPrincipal());
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.ok(null, "Đăng xuất thành công. Hẹn sớm gặp lại quý khách!"));
    }
}

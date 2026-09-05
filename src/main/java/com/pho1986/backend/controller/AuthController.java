package com.pho1986.backend.controller;

import com.pho1986.backend.common.ApiResponse;
import com.pho1986.backend.model.dto.AuthDtos.*;
import com.pho1986.backend.model.entity.User;
import com.pho1986.backend.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {
        AuthResponse response = authService.register(request);
        boolean isSecure = httpRequest.isSecure();

        ResponseCookie accessCookie = createAccessCookie(response.getAccessToken(), isSecure);
        ResponseCookie refreshCookie = createRefreshCookie(response.getRefreshToken(), isSecure);

        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.ok(response, "Đăng ký thành viên thành công! Bạn nhận được 50 điểm Tri Kỷ."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        AuthResponse response = authService.login(request);
        boolean isSecure = httpRequest.isSecure();

        ResponseCookie accessCookie = createAccessCookie(response.getAccessToken(), isSecure);
        ResponseCookie refreshCookie = createRefreshCookie(response.getRefreshToken(), isSecure);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.ok(response, "Đăng nhập thành công! Chào mừng quý khách trở lại."));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @RequestBody(required = false) RefreshTokenRequest requestBody,
            HttpServletRequest httpRequest) {
        String token = getCookieValue(httpRequest, "refreshToken");
        if (!StringUtils.hasText(token) && requestBody != null) {
            token = requestBody.getRefreshToken();
        }

        AuthResponse response = authService.refreshToken(token);
        boolean isSecure = httpRequest.isSecure();

        ResponseCookie accessCookie = createAccessCookie(response.getAccessToken(), isSecure);
        ResponseCookie refreshCookie = createRefreshCookie(response.getRefreshToken(), isSecure);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.ok(response, "Làm mới phiên đăng nhập thành công!"));
    }

    @PostMapping("/post-order-claim")
    public ResponseEntity<ApiResponse<AuthResponse>> postOrderClaim(
            @Valid @RequestBody PostOrderClaimRequest request,
            HttpServletRequest httpRequest) {
        AuthResponse response = authService.postOrderClaim(request);
        boolean isSecure = httpRequest.isSecure();

        ResponseCookie accessCookie = createAccessCookie(response.getAccessToken(), isSecure);
        ResponseCookie refreshCookie = createRefreshCookie(response.getRefreshToken(), isSecure);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.ok(response, "Chuyển đổi thành công đơn hàng vào tài khoản hội viên!"));
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
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest httpRequest) {
        String accessToken = getAccessTokenFromRequest(httpRequest);
        String refreshToken = getCookieValue(httpRequest, "refreshToken");

        authService.logout(accessToken, refreshToken);

        boolean isSecure = httpRequest.isSecure();
        ResponseCookie deleteAccessCookie = deleteCookie("accessToken", "/", isSecure);
        ResponseCookie deleteRefreshCookie = deleteCookie("refreshToken", "/api/v1/auth", isSecure);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteAccessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, deleteRefreshCookie.toString())
                .body(ApiResponse.ok(null, "Đăng xuất thành công. Hẹn sớm gặp lại quý khách!"));
    }

    private ResponseCookie createAccessCookie(String token, boolean isSecure) {
        return ResponseCookie.from("accessToken", token != null ? token : "")
                .httpOnly(true)
                .secure(isSecure)
                .path("/")
                .maxAge(15 * 60)
                .sameSite("Lax")
                .build();
    }

    private ResponseCookie createRefreshCookie(String token, boolean isSecure) {
        return ResponseCookie.from("refreshToken", token != null ? token : "")
                .httpOnly(true)
                .secure(isSecure)
                .path("/api/v1/auth")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Lax")
                .build();
    }

    private ResponseCookie deleteCookie(String name, String path, boolean isSecure) {
        return ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(isSecure)
                .path(path)
                .maxAge(0)
                .sameSite("Lax")
                .build();
    }

    private String getCookieValue(HttpServletRequest request, String name) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (name.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private String getAccessTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return getCookieValue(request, "accessToken");
    }
}

package com.pho1986.backend.model.dto;

import com.pho1986.backend.model.entity.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public static class RegisterRequest {
        @NotBlank(message = "Số điện thoại không được để trống")
        @Pattern(regexp = "^(0[35789])[0-9]{8}$", message = "Số điện thoại không hợp lệ (cần 10 số đầu 03, 05, 07, 08, 09)")
        private String phone;

        @NotBlank(message = "Họ và tên không được để trống")
        @Size(min = 2, max = 100, message = "Họ và tên phải từ 2 ký tự")
        private String fullName;

        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 6, message = "Mật khẩu phải từ 6 ký tự")
        private String password;

        private String email;

        private Boolean saveTasteProfile = true;

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public Boolean getSaveTasteProfile() { return saveTasteProfile; }
        public void setSaveTasteProfile(Boolean saveTasteProfile) { this.saveTasteProfile = saveTasteProfile; }
    }

    public static class LoginRequest {
        @NotBlank(message = "Vui lòng nhập số điện thoại")
        private String phone;

        @NotBlank(message = "Vui lòng nhập mật khẩu")
        private String password;

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class PostOrderClaimRequest {
        @NotBlank(message = "Mã đơn hàng không được để trống")
        private String orderCode;

        @NotBlank(message = "Số điện thoại không được để trống")
        private String phone;

        @NotBlank(message = "Họ tên không được để trống")
        private String fullName;

        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 6, message = "Mật khẩu phải từ 6 ký tự")
        private String password;

        public String getOrderCode() { return orderCode; }
        public void setOrderCode(String orderCode) { this.orderCode = orderCode; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class FirebasePhoneLoginRequest {
        @NotBlank(message = "Firebase ID Token không được để trống")
        private String idToken;

        private String fullName;

        public String getIdToken() { return idToken; }
        public void setIdToken(String idToken) { this.idToken = idToken; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
    }

    public static class RefreshTokenRequest {
        private String refreshToken;
        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    }

    public static class AuthResponse {
        private User user;
        private String accessToken;
        private String refreshToken;
        private Integer pointsEarned;

        public AuthResponse(User user, String accessToken) {
            this.user = user;
            this.accessToken = accessToken;
        }

        public AuthResponse(User user, String accessToken, String refreshToken) {
            this.user = user;
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
        }

        public AuthResponse(User user, String accessToken, Integer pointsEarned) {
            this.user = user;
            this.accessToken = accessToken;
            this.pointsEarned = pointsEarned;
        }

        public AuthResponse(User user, String accessToken, String refreshToken, Integer pointsEarned) {
            this.user = user;
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.pointsEarned = pointsEarned;
        }

        public User getUser() { return user; }
        public void setUser(User user) { this.user = user; }
        public String getAccessToken() { return accessToken; }
        public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
        public Integer getPointsEarned() { return pointsEarned; }
        public void setPointsEarned(Integer pointsEarned) { this.pointsEarned = pointsEarned; }
    }

    public static class UserProfileResponse {
        private String id;
        private String phone;
        private String email;
        private String fullName;
        private String role;
        private String status;
        private String avatarUrl;
        private Object loyaltyAccount;
        private Object tasteProfile;
        private java.time.LocalDateTime createdAt;

        public UserProfileResponse() {}

        public static UserProfileResponse from(User user) {
            if (user == null) return null;
            UserProfileResponse resp = new UserProfileResponse();
            resp.id = user.getId();
            resp.phone = user.getPhone();
            resp.email = user.getEmail();
            resp.fullName = user.getFullName();
            resp.role = user.getRole();
            resp.status = user.getStatus();
            resp.avatarUrl = user.getAvatarUrl();
            resp.loyaltyAccount = user.getLoyaltyAccount();
            resp.tasteProfile = user.getTasteProfile();
            resp.createdAt = user.getCreatedAt();
            return resp;
        }

        public String getId() { return id; }
        public String getPhone() { return phone; }
        public String getEmail() { return email; }
        public String getFullName() { return fullName; }
        public String getRole() { return role; }
        public String getStatus() { return status; }
        public String getAvatarUrl() { return avatarUrl; }
        public Object getLoyaltyAccount() { return loyaltyAccount; }
        public Object getTasteProfile() { return tasteProfile; }
        public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    }
}

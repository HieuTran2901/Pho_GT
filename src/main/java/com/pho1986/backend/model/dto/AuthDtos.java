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

    public static class AuthResponse {
        private User user;
        private String accessToken;
        private Integer pointsEarned;

        public AuthResponse(User user, String accessToken) {
            this.user = user;
            this.accessToken = accessToken;
        }

        public AuthResponse(User user, String accessToken, Integer pointsEarned) {
            this.user = user;
            this.accessToken = accessToken;
            this.pointsEarned = pointsEarned;
        }

        public User getUser() { return user; }
        public void setUser(User user) { this.user = user; }
        public String getAccessToken() { return accessToken; }
        public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
        public Integer getPointsEarned() { return pointsEarned; }
        public void setPointsEarned(Integer pointsEarned) { this.pointsEarned = pointsEarned; }
    }
}

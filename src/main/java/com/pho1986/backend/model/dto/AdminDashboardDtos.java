package com.pho1986.backend.model.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AdminDashboardDtos {

    public static class AdminStatsResponse {
        private long totalOrders;
        private long pendingOrders;
        private long confirmedOrders;
        private long completedOrders;
        private Double totalRevenue;
        private Double todayRevenue;
        private long totalDishes;
        private long totalUsers;

        public AdminStatsResponse() {}

        public AdminStatsResponse(long totalOrders, long pendingOrders, long confirmedOrders, long completedOrders,
                                  Double totalRevenue, Double todayRevenue, long totalDishes, long totalUsers) {
            this.totalOrders = totalOrders;
            this.pendingOrders = pendingOrders;
            this.confirmedOrders = confirmedOrders;
            this.completedOrders = completedOrders;
            this.totalRevenue = totalRevenue != null ? totalRevenue : 0.0;
            this.todayRevenue = todayRevenue != null ? todayRevenue : 0.0;
            this.totalDishes = totalDishes;
            this.totalUsers = totalUsers;
        }

        public long getTotalOrders() { return totalOrders; }
        public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
        public long getPendingOrders() { return pendingOrders; }
        public void setPendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; }
        public long getConfirmedOrders() { return confirmedOrders; }
        public void setConfirmedOrders(long confirmedOrders) { this.confirmedOrders = confirmedOrders; }
        public long getCompletedOrders() { return completedOrders; }
        public void setCompletedOrders(long completedOrders) { this.completedOrders = completedOrders; }
        public Double getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }
        public Double getTodayRevenue() { return todayRevenue; }
        public void setTodayRevenue(Double todayRevenue) { this.todayRevenue = todayRevenue; }
        public long getTotalDishes() { return totalDishes; }
        public void setTotalDishes(long totalDishes) { this.totalDishes = totalDishes; }
        public long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    }

    public static class UpdateOrderStatusRequest {
        @NotBlank(message = "Trạng thái đơn hàng không được để trống")
        private String status;

        private String paymentStatus;

        public UpdateOrderStatusRequest() {}

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getPaymentStatus() { return paymentStatus; }
        public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    }

    public static class DishUpsertRequest {
        @NotBlank(message = "Mã danh mục không được để trống")
        private String categoryId;

        @NotBlank(message = "Tên món ăn không được để trống")
        @Size(max = 150, message = "Tên món ăn không được vượt quá 150 ký tự")
        private String name;

        @NotNull(message = "Giá bán không được để trống")
        @Min(value = 1000L, message = "Số tiền tối thiểu phải từ 1.000đ trở lên")
        @Max(value = 1000000000L, message = "Giá bán không được vượt quá 1.000.000.000 VNĐ")
        private Double price;

        @Size(max = 2000, message = "Mô tả không được vượt quá 2000 ký tự")
        private String description;

        @Size(max = 1000, message = "Đường dẫn hình ảnh không được vượt quá 1000 ký tự")
        @Pattern(regexp = "^(https?://|/|data:image/).*", message = "Đường dẫn hình ảnh phải bắt đầu bằng http://, https:// hoặc /")
        private String imageUrl;

        private Boolean isAvailable = true;
        private Boolean isSignature = false;

        @Size(max = 50, message = "Khẩu phần không được vượt quá 50 ký tự")
        private String portion;

        @Size(max = 50, message = "Huy hiệu nổi bật không được vượt quá 50 ký tự")
        private String tag;

        @Size(max = 50, message = "Biểu tượng huy hiệu không được vượt quá 50 ký tự")
        private String tagIcon;

        @Size(max = 2000, message = "Danh sách nguyên liệu không được vượt quá 2000 ký tự")
        private String ingredients;

        public DishUpsertRequest() {}

        public String getCategoryId() { return categoryId; }
        public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public Boolean getIsAvailable() { return isAvailable; }
        public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
        public Boolean getIsSignature() { return isSignature; }
        public void setIsSignature(Boolean isSignature) { this.isSignature = isSignature; }
        public String getPortion() { return portion; }
        public void setPortion(String portion) { this.portion = portion; }
        public String getTag() { return tag; }
        public void setTag(String tag) { this.tag = tag; }
        public String getTagIcon() { return tagIcon; }
        public void setTagIcon(String tagIcon) { this.tagIcon = tagIcon; }
        public String getIngredients() { return ingredients; }
        public void setIngredients(String ingredients) { this.ingredients = ingredients; }
    }
}

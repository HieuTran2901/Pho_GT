package com.pho1986.backend.model.dto;

import com.pho1986.backend.model.entity.Order;
import com.pho1986.backend.model.entity.OrderItem;
import com.pho1986.backend.model.entity.TasteProfile;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDtos {

    public static class CreateOrderItemRequest {
        private String dishId;

        @NotNull(message = "Tên món không được để trống")
        private String dishName;

        @NotNull(message = "Đơn giá không được để trống")
        private Double unitPrice;

        private Integer quantity = 1;

        private String customizedOptions; // JSON string

        public String getDishId() { return dishId; }
        public void setDishId(String dishId) { this.dishId = dishId; }
        public String getDishName() { return dishName; }
        public void setDishName(String dishName) { this.dishName = dishName; }
        public Double getUnitPrice() { return unitPrice; }
        public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public String getCustomizedOptions() { return customizedOptions; }
        public void setCustomizedOptions(String customizedOptions) { this.customizedOptions = customizedOptions; }
    }

    public static class CreateOrderRequest {
        private String guestName;
        private String guestPhone;

        @NotNull(message = "Địa chỉ nhận hàng không được để trống")
        private String deliveryAddressText;

        private String paymentMethod = "COD";
        private String notes;
        private String tableNumber;

        @NotEmpty(message = "Đơn hàng phải có ít nhất 1 món")
        private List<CreateOrderItemRequest> items;

        public String getGuestName() { return guestName; }
        public void setGuestName(String guestName) { this.guestName = guestName; }
        public String getGuestPhone() { return guestPhone; }
        public void setGuestPhone(String guestPhone) { this.guestPhone = guestPhone; }
        public String getDeliveryAddressText() { return deliveryAddressText; }
        public void setDeliveryAddressText(String deliveryAddressText) { this.deliveryAddressText = deliveryAddressText; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public String getTableNumber() { return tableNumber; }
        public void setTableNumber(String tableNumber) { this.tableNumber = tableNumber; }
        public List<CreateOrderItemRequest> getItems() { return items; }
        public void setItems(List<CreateOrderItemRequest> items) { this.items = items; }
    }

    public static class QuickReorderResponse {
        private String sourceOrderCode;
        private String deliveryAddressText;
        private List<OrderItem> items;
        private TasteProfile tasteProfile;

        public QuickReorderResponse(String sourceOrderCode, String deliveryAddressText, List<OrderItem> items, TasteProfile tasteProfile) {
            this.sourceOrderCode = sourceOrderCode;
            this.deliveryAddressText = deliveryAddressText;
            this.items = items;
            this.tasteProfile = tasteProfile;
        }

        public String getSourceOrderCode() { return sourceOrderCode; }
        public String getDeliveryAddressText() { return deliveryAddressText; }
        public List<OrderItem> getItems() { return items; }
        public TasteProfile getTasteProfile() { return tasteProfile; }
    }

    /**
     * [SECURITY_AGENT & BLADE] DTO che giấu thông tin cá nhân (PII Masking) cho đơn hàng công khai
     */
    public static class PublicOrderResponse {
        private String id;
        private String orderCode;
        private String status;
        private Double totalAmount;
        private Double discountAmount;
        private Double finalAmount;
        private String paymentMethod;
        private String paymentStatus;
        private String guestName;
        private String guestPhone;
        private String deliveryAddressText;
        private String notes;
        private String tableNumber;
        private LocalDateTime createdAt;
        private List<OrderItem> items;
        private boolean isOwner;

        public static PublicOrderResponse fromOrder(Order order, boolean isOwner) {
            PublicOrderResponse res = new PublicOrderResponse();
            res.id = order.getId();
            res.orderCode = order.getOrderCode();
            res.status = order.getStatus();
            res.totalAmount = order.getTotalAmount();
            res.discountAmount = order.getDiscountAmount();
            res.finalAmount = order.getFinalAmount();
            res.paymentMethod = order.getPaymentMethod();
            res.paymentStatus = order.getPaymentStatus();
            res.tableNumber = order.getTableNumber();
            res.createdAt = order.getCreatedAt();
            res.items = order.getItems();
            res.isOwner = isOwner;

            String rawName = order.getGuestName() != null ? order.getGuestName() : (order.getUser() != null ? order.getUser().getFullName() : null);
            String rawPhone = order.getGuestPhone() != null ? order.getGuestPhone() : (order.getUser() != null ? order.getUser().getPhone() : null);

            if (isOwner) {
                res.guestName = rawName;
                res.guestPhone = rawPhone;
                res.deliveryAddressText = order.getDeliveryAddressText();
                res.notes = order.getNotes();
            } else {
                res.guestName = maskName(rawName);
                res.guestPhone = maskPhone(rawPhone);
                res.deliveryAddressText = maskAddress(order.getDeliveryAddressText());
                res.notes = null;
            }
            return res;
        }

        private static String maskPhone(String phone) {
            if (phone == null || phone.isBlank()) return "***";
            String clean = phone.replaceAll("[\\s.-]+", "");
            if (clean.length() <= 6) return "***";
            return clean.substring(0, 3) + "****" + clean.substring(clean.length() - 3);
        }

        private static String maskName(String name) {
            if (name == null || name.isBlank()) return "Khách hàng";
            String[] parts = name.trim().split("\\s+");
            if (parts.length <= 1) return parts[0].substring(0, Math.min(1, parts[0].length())) + "***";
            return parts[0] + " *** " + parts[parts.length - 1];
        }

        private static String maskAddress(String address) {
            if (address == null || address.isBlank()) return "***";
            String[] parts = address.split(",");
            if (parts.length > 1) {
                return "***, " + parts[parts.length - 1].trim();
            }
            return address.length() > 10 ? address.substring(0, 5) + " ***" : "***";
        }

        public String getId() { return id; }
        public String getOrderCode() { return orderCode; }
        public String getStatus() { return status; }
        public Double getTotalAmount() { return totalAmount; }
        public Double getDiscountAmount() { return discountAmount; }
        public Double getFinalAmount() { return finalAmount; }
        public String getPaymentMethod() { return paymentMethod; }
        public String getPaymentStatus() { return paymentStatus; }
        public String getGuestName() { return guestName; }
        public String getGuestPhone() { return guestPhone; }
        public String getDeliveryAddressText() { return deliveryAddressText; }
        public String getNotes() { return notes; }
        public String getTableNumber() { return tableNumber; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public List<OrderItem> getItems() { return items; }
        public boolean isOwner() { return isOwner; }
    }
}

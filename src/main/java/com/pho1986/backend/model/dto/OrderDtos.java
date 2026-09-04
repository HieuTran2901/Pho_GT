package com.pho1986.backend.model.dto;

import com.pho1986.backend.model.entity.OrderItem;
import com.pho1986.backend.model.entity.TasteProfile;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
}

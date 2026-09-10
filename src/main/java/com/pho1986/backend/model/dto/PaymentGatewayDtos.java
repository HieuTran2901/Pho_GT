package com.pho1986.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;

public class PaymentGatewayDtos {

    public static class PaymentGatewayResponse {
        private String id;
        private String name;
        private String status; // ACTIVE, MAINTENANCE, DISABLED
        private String maintenanceMessage;
        private LocalDateTime updatedAt;
        private String updatedBy;

        public PaymentGatewayResponse() {
        }

        public PaymentGatewayResponse(String id, String name, String status, String maintenanceMessage, LocalDateTime updatedAt, String updatedBy) {
            this.id = id;
            this.name = name;
            this.status = status;
            this.maintenanceMessage = maintenanceMessage;
            this.updatedAt = updatedAt;
            this.updatedBy = updatedBy;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getMaintenanceMessage() {
            return maintenanceMessage;
        }

        public void setMaintenanceMessage(String maintenanceMessage) {
            this.maintenanceMessage = maintenanceMessage;
        }

        public LocalDateTime getUpdatedAt() {
            return updatedAt;
        }

        public void setUpdatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
        }

        public String getUpdatedBy() {
            return updatedBy;
        }

        public void setUpdatedBy(String updatedBy) {
            this.updatedBy = updatedBy;
        }
    }

    public static class UpdateGatewayStatusRequest {
        @NotBlank(message = "Trạng thái cổng thanh toán không được để trống")
        @Pattern(regexp = "^(ACTIVE|MAINTENANCE|DISABLED)$", message = "Trạng thái chỉ chấp nhận: ACTIVE, MAINTENANCE, DISABLED")
        private String status;

        private String maintenanceMessage;

        public UpdateGatewayStatusRequest() {
        }

        public UpdateGatewayStatusRequest(String status, String maintenanceMessage) {
            this.status = status;
            this.maintenanceMessage = maintenanceMessage;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getMaintenanceMessage() {
            return maintenanceMessage;
        }

        public void setMaintenanceMessage(String maintenanceMessage) {
            this.maintenanceMessage = maintenanceMessage;
        }
    }
}

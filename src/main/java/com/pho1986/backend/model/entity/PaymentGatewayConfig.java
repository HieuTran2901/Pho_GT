package com.pho1986.backend.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_gateway_configs")
public class PaymentGatewayConfig {

    @Id
    @Column(name = "id", length = 32, nullable = false)
    private String id; // e.g. SEPAY, MOMO, VNPAY, ZALOPAY, CREDIT_CARD, CASH

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "status", length = 20, nullable = false)
    private String status = "ACTIVE"; // ACTIVE, MAINTENANCE, DISABLED

    @Column(name = "maintenance_message", length = 255)
    private String maintenanceMessage;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    public PaymentGatewayConfig() {
    }

    public PaymentGatewayConfig(String id, String name, String status, String maintenanceMessage, String updatedBy) {
        this.id = id;
        this.name = name;
        this.status = status;
        this.maintenanceMessage = maintenanceMessage;
        this.updatedAt = LocalDateTime.now();
        this.updatedBy = updatedBy;
    }

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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

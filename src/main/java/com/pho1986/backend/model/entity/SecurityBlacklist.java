package com.pho1986.backend.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity lưu trữ thông tin cấm truy cập đa tầng (SĐT + IP + Device ID)
 * Phục vụ hệ thống phòng thủ mối đe dọa (Threat Defense) Phở Gia Truyền 1986.
 */
@Entity
@Table(name = "security_blacklists", indexes = {
        @Index(name = "idx_target_type_value", columnList = "targetType, targetValue"),
        @Index(name = "idx_target_value", columnList = "targetValue")
})
public class SecurityBlacklist {

    @Id
    @Column(length = 36)
    private String id = UUID.randomUUID().toString();

    @Column(nullable = false, length = 20)
    private String targetType; // PHONE | IP | DEVICE_ID

    @Column(nullable = false, length = 100)
    private String targetValue; // SĐT, Địa chỉ IP hoặc Device UUID

    @Column(length = 255)
    private String reason; // Lý do cấm (Bom hàng, gian lận, phá hoại...)

    @Column(length = 50)
    private String bannedBy; // SĐT Quản trị viên thực hiện cấm

    private LocalDateTime expiresAt; // null = cấm vĩnh viễn; hoặc thời hạn kết thúc lệnh phạt

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public SecurityBlacklist() {}

    public SecurityBlacklist(String targetType, String targetValue, String reason, String bannedBy, LocalDateTime expiresAt) {
        this.targetType = targetType;
        this.targetValue = targetValue;
        this.reason = reason;
        this.bannedBy = bannedBy;
        this.expiresAt = expiresAt;
    }

    public boolean isExpired() {
        return this.expiresAt != null && this.expiresAt.isBefore(LocalDateTime.now());
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public String getTargetValue() { return targetValue; }
    public void setTargetValue(String targetValue) { this.targetValue = targetValue; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getBannedBy() { return bannedBy; }
    public void setBannedBy(String bannedBy) { this.bannedBy = bannedBy; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

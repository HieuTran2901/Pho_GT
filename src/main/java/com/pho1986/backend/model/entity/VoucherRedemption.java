package com.pho1986.backend.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "voucher_redemptions", uniqueConstraints = {
    @UniqueConstraint(name = "uk_voucher_order", columnNames = {"voucher_id", "order_id"})
}, indexes = {
    @Index(name = "idx_voucher_redemptions_order", columnList = "order_id"),
    @Index(name = "idx_voucher_redemptions_user", columnList = "user_id")
})
public class VoucherRedemption {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "voucher_id", nullable = false, length = 36)
    private String voucherId;

    @Column(name = "order_id", nullable = false, length = 50)
    private String orderId;

    @Column(name = "user_id", length = 36)
    private String userId;

    @Column(name = "discount_amount", nullable = false)
    private Double discountAmount = 0.0;

    @Column(nullable = false, length = 30)
    private String status = "USED"; // 'RESERVED' | 'USED' | 'CANCELLED'

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public VoucherRedemption() {}

    public VoucherRedemption(String voucherId, String orderId, String userId, Double discountAmount, String status) {
        this.voucherId = voucherId;
        this.orderId = orderId;
        this.userId = userId;
        this.discountAmount = discountAmount != null ? discountAmount : 0.0;
        this.status = status != null ? status : "USED";
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getVoucherId() { return voucherId; }
    public void setVoucherId(String voucherId) { this.voucherId = voucherId; }
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

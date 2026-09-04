package com.pho1986.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_transactions")
public class LoyaltyTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loyalty_account_id", nullable = false)
    private LoyaltyAccount loyaltyAccount;

    private String orderId;

    @Column(nullable = false)
    private Integer pointsChange; // +/-

    @Column(nullable = false, length = 30)
    private String type; // WELCOME_BONUS | EARN_ORDER | REDEEM_REWARD

    @Column(nullable = false)
    private Integer balanceAfter;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public LoyaltyTransaction() {}

    public LoyaltyTransaction(LoyaltyAccount loyaltyAccount, String orderId, Integer pointsChange, String type, Integer balanceAfter, String description) {
        this.loyaltyAccount = loyaltyAccount;
        this.orderId = orderId;
        this.pointsChange = pointsChange;
        this.type = type;
        this.balanceAfter = balanceAfter;
        this.description = description;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public LoyaltyAccount getLoyaltyAccount() { return loyaltyAccount; }
    public void setLoyaltyAccount(LoyaltyAccount loyaltyAccount) { this.loyaltyAccount = loyaltyAccount; }
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public Integer getPointsChange() { return pointsChange; }
    public void setPointsChange(Integer pointsChange) { this.pointsChange = pointsChange; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Integer getBalanceAfter() { return balanceAfter; }
    public void setBalanceAfter(Integer balanceAfter) { this.balanceAfter = balanceAfter; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

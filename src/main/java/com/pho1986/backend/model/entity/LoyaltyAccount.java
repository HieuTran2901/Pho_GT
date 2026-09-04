package com.pho1986.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "loyalty_accounts")
public class LoyaltyAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer totalPoints = 50; // Khởi tạo tặng 50 điểm chào mừng

    @Column(nullable = false)
    private Integer availablePoints = 50;

    @Column(nullable = false, length = 20)
    private String membershipTier = "DONG"; // DONG | BAC | VANG | KIM_CUONG

    @Column(nullable = false)
    private Double totalSpent = 0.0;

    @Column(nullable = false)
    private Integer totalOrdersCount = 0;

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @JsonIgnore
    @OneToMany(mappedBy = "loyaltyAccount", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LoyaltyTransaction> transactions = new ArrayList<>();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public LoyaltyAccount() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Integer getTotalPoints() { return totalPoints; }
    public void setTotalPoints(Integer totalPoints) { this.totalPoints = totalPoints; }
    public Integer getAvailablePoints() { return availablePoints; }
    public void setAvailablePoints(Integer availablePoints) { this.availablePoints = availablePoints; }
    public String getMembershipTier() { return membershipTier; }
    public void setMembershipTier(String membershipTier) { this.membershipTier = membershipTier; }
    public Double getTotalSpent() { return totalSpent; }
    public void setTotalSpent(Double totalSpent) { this.totalSpent = totalSpent; }
    public Integer getTotalOrdersCount() { return totalOrdersCount; }
    public void setTotalOrdersCount(Integer totalOrdersCount) { this.totalOrdersCount = totalOrdersCount; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public List<LoyaltyTransaction> getTransactions() { return transactions; }
    public void setTransactions(List<LoyaltyTransaction> transactions) { this.transactions = transactions; }
}

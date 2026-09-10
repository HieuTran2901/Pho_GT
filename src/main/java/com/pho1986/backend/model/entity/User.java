package com.pho1986.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_status", columnList = "status")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @Column(unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 100)
    private String fullName;

    @JsonIgnore
    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 20)
    private String role = "CUSTOMER"; // CUSTOMER | ADMIN | STAFF

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE"; // ACTIVE | LOCKED

    @Column(nullable = false)
    private int failedLoginAttempts = 0; // Đếm số lần sai trong vòng hiện tại (0 - 5)

    @Column(nullable = false)
    private int lockoutRounds = 0; // Đếm số vòng thử đã bị tạm dừng (0 - 5)

    private LocalDateTime lockedUntil; // Thời hạn hết tạm khóa vòng hiện tại

    private LocalDateTime lockedAt; // Thời điểm bị khóa cứng tài khoản

    @Column(length = 100)
    private String lockReason; // Lý do khóa (ví dụ: BRUTE_FORCE_EXCEEDED)

    @Column(length = 30)
    private String lockType; // PASSWORD_FAILED | ADMIN_MANUAL | null

    @Column(length = 45)
    private String lastLoginIp; // Địa chỉ IP thực tế ghi nhận gần nhất

    @Column(length = 100)
    private String lastDeviceId; // Dấu vân tay thiết bị (Device UUID)

    private String avatarUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private TasteProfile tasteProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private LoyaltyAccount loyaltyAccount;

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Address> addresses = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user")
    private List<Order> orders = new ArrayList<>();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public User() {}

    public User(String phone, String fullName, String passwordHash, String email) {
        this.phone = phone;
        this.fullName = fullName;
        this.passwordHash = passwordHash;
        this.email = email;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public TasteProfile getTasteProfile() { return tasteProfile; }
    public void setTasteProfile(TasteProfile tasteProfile) {
        this.tasteProfile = tasteProfile;
        if (tasteProfile != null) tasteProfile.setUser(this);
    }
    public LoyaltyAccount getLoyaltyAccount() { return loyaltyAccount; }
    public void setLoyaltyAccount(LoyaltyAccount loyaltyAccount) {
        this.loyaltyAccount = loyaltyAccount;
        if (loyaltyAccount != null) loyaltyAccount.setUser(this);
    }
    public List<Address> getAddresses() { return addresses; }
    public void setAddresses(List<Address> addresses) { this.addresses = addresses; }
    public List<Order> getOrders() { return orders; }
    public void setOrders(List<Order> orders) { this.orders = orders; }

    // Lockout Getters & Setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getFailedLoginAttempts() { return failedLoginAttempts; }
    public void setFailedLoginAttempts(int failedLoginAttempts) { this.failedLoginAttempts = failedLoginAttempts; }
    public int getLockoutRounds() { return lockoutRounds; }
    public void setLockoutRounds(int lockoutRounds) { this.lockoutRounds = lockoutRounds; }
    public LocalDateTime getLockedUntil() { return lockedUntil; }
    public void setLockedUntil(LocalDateTime lockedUntil) { this.lockedUntil = lockedUntil; }
    public LocalDateTime getLockedAt() { return lockedAt; }
    public void setLockedAt(LocalDateTime lockedAt) { this.lockedAt = lockedAt; }
    public String getLockReason() { return lockReason; }
    public void setLockReason(String lockReason) { this.lockReason = lockReason; }
    public String getLockType() { return lockType; }
    public void setLockType(String lockType) { this.lockType = lockType; }

    // Business Security Helpers
    public boolean isAccountLocked() {
        return "LOCKED".equalsIgnoreCase(this.status);
    }

    public boolean isTemporarilyBlocked() {
        return this.lockedUntil != null && this.lockedUntil.isAfter(LocalDateTime.now());
    }

    public boolean isPasswordLocked() {
        if ("ADMIN_MANUAL".equalsIgnoreCase(this.lockType)) {
            return false;
        }
        return "PASSWORD_FAILED".equalsIgnoreCase(this.lockType)
                || "BRUTE_FORCE_EXCEEDED".equalsIgnoreCase(this.lockReason)
                || (this.lockedUntil != null && this.lockedUntil.isAfter(LocalDateTime.now()))
                || this.lockoutRounds > 0;
    }

    public long getRemainingTemporaryLockSeconds() {
        if (!isTemporarilyBlocked()) return 0;
        return java.time.Duration.between(LocalDateTime.now(), this.lockedUntil).getSeconds();
    }

    public void resetLoginFailures() {
        this.failedLoginAttempts = 0;
        this.lockoutRounds = 0;
        this.lockedUntil = null;
        this.lockedAt = null;
        this.lockReason = null;
        this.lockType = null;
    }

    public String getLastLoginIp() { return lastLoginIp; }
    public void setLastLoginIp(String lastLoginIp) { this.lastLoginIp = lastLoginIp; }

    public String getLastDeviceId() { return lastDeviceId; }
    public void setLastDeviceId(String lastDeviceId) { this.lastDeviceId = lastDeviceId; }

    public void unlockAccount() {
        this.status = "ACTIVE";
        resetLoginFailures();
    }
}

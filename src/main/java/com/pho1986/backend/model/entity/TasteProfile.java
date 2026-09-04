package com.pho1986.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "taste_profiles")
public class TasteProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    private String favoriteDishId;

    @Column(nullable = false, length = 30)
    private String brothType = "DAM_DA"; // THANH | DAM_DA | BEO_NGAY

    @Column(nullable = false, length = 30)
    private String onionStyle = "NHIEU_HANH"; // IT_HANH | NHIEU_HANH | HANH_TRAN | DAU_HANH

    @Column(nullable = false, length = 30)
    private String herbStyle = "DU_RAU"; // DU_RAU | KHONG_RAU_MUI | KHONG_HANH_TAY

    @Column(nullable = false)
    private Integer spicyLevel = 1; // 0..3

    @Column(nullable = false, length = 30)
    private String crullerPref = "QUAY_GION"; // QUAY_GION | QUAY_MEM | KHONG_QUAY

    @Column(length = 255)
    private String customNote;

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public TasteProfile() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getFavoriteDishId() { return favoriteDishId; }
    public void setFavoriteDishId(String favoriteDishId) { this.favoriteDishId = favoriteDishId; }
    public String getBrothType() { return brothType; }
    public void setBrothType(String brothType) { this.brothType = brothType; }
    public String getOnionStyle() { return onionStyle; }
    public void setOnionStyle(String onionStyle) { this.onionStyle = onionStyle; }
    public String getHerbStyle() { return herbStyle; }
    public void setHerbStyle(String herbStyle) { this.herbStyle = herbStyle; }
    public Integer getSpicyLevel() { return spicyLevel; }
    public void setSpicyLevel(Integer spicyLevel) { this.spicyLevel = spicyLevel; }
    public String getCrullerPref() { return crullerPref; }
    public void setCrullerPref(String crullerPref) { this.crullerPref = crullerPref; }
    public String getCustomNote() { return customNote; }
    public void setCustomNote(String customNote) { this.customNote = customNote; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}

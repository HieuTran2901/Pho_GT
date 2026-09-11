package com.pho1986.backend.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dining_tables")
public class DiningTable {

    @Id
    @Column(length = 50)
    private String id; // e.g. "t1-01", "t2-05"

    @Column(nullable = false, length = 100)
    private String name; // e.g. "Bàn 01", "VIP Trúc Lâm"

    @Column(nullable = false)
    private Integer floor = 1; // 1 | 2

    @Column(nullable = false)
    private Integer capacity = 4;

    @Column(length = 50)
    private String zone; // "bep", "phoco", "vip", "bancong", "giantranh", "thuhoa", "thuongtra"

    @Column(length = 150)
    private String zoneName;

    @Column(nullable = false, length = 30)
    private String status = "AVAILABLE"; // AVAILABLE | OCCUPIED | RESERVED | MAINTENANCE

    @Column(nullable = false)
    private Boolean isVip = false;

    @Column(length = 255)
    private String description;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public DiningTable() {}

    public DiningTable(String id, String name, Integer floor, String zone, String zoneName, Integer capacity, String description, Boolean isVip) {
        this.id = id;
        this.name = name;
        this.floor = floor;
        this.zone = zone;
        this.zoneName = zoneName;
        this.capacity = capacity;
        this.description = description;
        this.isVip = isVip != null ? isVip : false;
        this.status = "AVAILABLE";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }

    public String getZoneName() { return zoneName; }
    public void setZoneName(String zoneName) { this.zoneName = zoneName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsVip() { return isVip; }
    public void setIsVip(Boolean isVip) { this.isVip = isVip; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

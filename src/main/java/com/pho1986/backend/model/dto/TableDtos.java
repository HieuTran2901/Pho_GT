package com.pho1986.backend.model.dto;

import java.time.LocalDateTime;

public class TableDtos {

    public static class TableResponse {
        private String id;
        private String name;
        private Integer floor;
        private Integer capacity;
        private String zone;
        private String zoneName;
        private String status; // "available" | "occupied" | "reserved" | "maintenance"
        private Boolean isVip;
        private String desc;

        // Active Order details when occupied
        private String activeOrderCode;
        private String activeGuestName;
        private String activeGuestPhone;
        private Double activeAmount;
        private String activeStatus;
        private LocalDateTime activeCreatedAt;

        public TableResponse() {}

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

        public String getDesc() { return desc; }
        public void setDesc(String desc) { this.desc = desc; }

        public String getActiveOrderCode() { return activeOrderCode; }
        public void setActiveOrderCode(String activeOrderCode) { this.activeOrderCode = activeOrderCode; }

        public String getActiveGuestName() { return activeGuestName; }
        public void setActiveGuestName(String activeGuestName) { this.activeGuestName = activeGuestName; }

        public String getActiveGuestPhone() { return activeGuestPhone; }
        public void setActiveGuestPhone(String activeGuestPhone) { this.activeGuestPhone = activeGuestPhone; }

        public Double getActiveAmount() { return activeAmount; }
        public void setActiveAmount(Double activeAmount) { this.activeAmount = activeAmount; }

        public String getActiveStatus() { return activeStatus; }
        public void setActiveStatus(String activeStatus) { this.activeStatus = activeStatus; }

        public LocalDateTime getActiveCreatedAt() { return activeCreatedAt; }
        public void setActiveCreatedAt(LocalDateTime activeCreatedAt) { this.activeCreatedAt = activeCreatedAt; }
    }

    public static class UpdateTableStatusRequest {
        private String status; // "AVAILABLE" | "RESERVED" | "MAINTENANCE"
        private String notes;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}

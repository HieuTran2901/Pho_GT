package com.pho1986.backend.model.dto;

import com.pho1986.backend.model.entity.Dish;
import com.pho1986.backend.model.entity.TasteProfile;

public class TasteProfileDto {

    public static class UpdateRequest {
        private String favoriteDishId;
        private String brothType;
        private String onionStyle;
        private String herbStyle;
        private Integer spicyLevel;
        private String crullerPref;
        private String customNote;

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
    }

    public static class DetailResponse {
        private TasteProfile profile;
        private Dish favoriteDish;

        public DetailResponse(TasteProfile profile, Dish favoriteDish) {
            this.profile = profile;
            this.favoriteDish = favoriteDish;
        }

        public TasteProfile getProfile() { return profile; }
        public void setProfile(TasteProfile profile) { this.profile = profile; }
        public Dish getFavoriteDish() { return favoriteDish; }
        public void setFavoriteDish(Dish favoriteDish) { this.favoriteDish = favoriteDish; }
    }
}

package com.pho1986.backend.service;

import com.pho1986.backend.model.dto.TasteProfileDto.*;
import com.pho1986.backend.model.entity.Dish;
import com.pho1986.backend.model.entity.TasteProfile;
import com.pho1986.backend.model.entity.User;
import com.pho1986.backend.repository.DishRepository;
import com.pho1986.backend.repository.TasteProfileRepository;
import com.pho1986.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TasteProfileService {

    private final TasteProfileRepository tasteProfileRepository;
    private final UserRepository userRepository;
    private final DishRepository dishRepository;

    public TasteProfileService(
            TasteProfileRepository tasteProfileRepository,
            UserRepository userRepository,
            DishRepository dishRepository) {
        this.tasteProfileRepository = tasteProfileRepository;
        this.userRepository = userRepository;
        this.dishRepository = dishRepository;
    }

    public DetailResponse getTasteProfile(String userId) {
        TasteProfile profile = tasteProfileRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));
            TasteProfile newProfile = new TasteProfile();
            newProfile.setUser(user);
            return tasteProfileRepository.save(newProfile);
        });

        Dish favoriteDish = null;
        if (profile.getFavoriteDishId() != null) {
            favoriteDish = dishRepository.findById(profile.getFavoriteDishId()).orElse(null);
        }

        return new DetailResponse(profile, favoriteDish);
    }

    @Transactional
    public TasteProfile updateTasteProfile(String userId, UpdateRequest request) {
        TasteProfile profile = tasteProfileRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));
            TasteProfile newProfile = new TasteProfile();
            newProfile.setUser(user);
            return newProfile;
        });

        if (request.getFavoriteDishId() != null) profile.setFavoriteDishId(request.getFavoriteDishId());
        if (request.getBrothType() != null) profile.setBrothType(request.getBrothType());
        if (request.getOnionStyle() != null) profile.setOnionStyle(request.getOnionStyle());
        if (request.getHerbStyle() != null) profile.setHerbStyle(request.getHerbStyle());
        if (request.getSpicyLevel() != null) profile.setSpicyLevel(request.getSpicyLevel());
        if (request.getCrullerPref() != null) profile.setCrullerPref(request.getCrullerPref());
        if (request.getCustomNote() != null) profile.setCustomNote(request.getCustomNote());

        return tasteProfileRepository.save(profile);
    }
}

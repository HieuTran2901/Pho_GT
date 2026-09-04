package com.pho1986.backend.repository;

import com.pho1986.backend.model.entity.TasteProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TasteProfileRepository extends JpaRepository<TasteProfile, String> {
    Optional<TasteProfile> findByUserId(String userId);
}

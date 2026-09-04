package com.pho1986.backend.repository;

import com.pho1986.backend.model.entity.Dish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DishRepository extends JpaRepository<Dish, String> {
    Optional<Dish> findBySlug(String slug);
    List<Dish> findByIsAvailableTrueOrderByIsSignatureDescPriceAsc();
    List<Dish> findByCategorySlugAndIsAvailableTrueOrderByIsSignatureDescPriceAsc(String categorySlug);
}

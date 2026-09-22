package com.pho1986.backend.repository;

import com.pho1986.backend.model.entity.Dish;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DishRepository extends JpaRepository<Dish, String> {

    @Override
    @EntityGraph(attributePaths = {"category"})
    List<Dish> findAll();

    @Override
    @EntityGraph(attributePaths = {"category"})
    Optional<Dish> findById(String id);

    @Override
    @EntityGraph(attributePaths = {"category"})
    List<Dish> findAllById(Iterable<String> ids);

    @EntityGraph(attributePaths = {"category"})
    Optional<Dish> findBySlug(String slug);

    @EntityGraph(attributePaths = {"category"})
    List<Dish> findByIsAvailableTrueOrderByIsSignatureDescPriceAsc();

    @EntityGraph(attributePaths = {"category"})
    List<Dish> findByCategorySlugAndIsAvailableTrueOrderByIsSignatureDescPriceAsc(String categorySlug);

    @EntityGraph(attributePaths = {"category"})
    List<Dish> findByOrderByIsAvailableDescIsSignatureDescPriceAsc();

    @EntityGraph(attributePaths = {"category"})
    List<Dish> findByCategorySlugOrderByIsAvailableDescIsSignatureDescPriceAsc(String categorySlug);
}

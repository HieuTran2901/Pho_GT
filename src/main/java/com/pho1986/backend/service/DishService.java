package com.pho1986.backend.service;

import com.pho1986.backend.model.entity.Category;
import com.pho1986.backend.model.entity.Dish;
import com.pho1986.backend.repository.CategoryRepository;
import com.pho1986.backend.repository.DishRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DishService {

    private final DishRepository dishRepository;
    private final CategoryRepository categoryRepository;

    public DishService(DishRepository dishRepository, CategoryRepository categoryRepository) {
        this.dishRepository = dishRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Dish> getDishes(String categorySlug) {
        if (categorySlug != null && !categorySlug.isBlank()) {
            return dishRepository.findByCategorySlugAndIsAvailableTrueOrderByIsSignatureDescPriceAsc(categorySlug);
        }
        return dishRepository.findByIsAvailableTrueOrderByIsSignatureDescPriceAsc();
    }

    public Dish getDishBySlug(String slug) {
        return dishRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy món ăn: " + slug));
    }

    public List<Category> getCategories() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc();
    }
}

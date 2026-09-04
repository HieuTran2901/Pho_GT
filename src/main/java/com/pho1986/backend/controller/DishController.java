package com.pho1986.backend.controller;

import com.pho1986.backend.common.ApiResponse;
import com.pho1986.backend.model.entity.Category;
import com.pho1986.backend.model.entity.Dish;
import com.pho1986.backend.service.DishService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dishes")
public class DishController {

    private final DishService dishService;

    public DishController(DishService dishService) {
        this.dishService = dishService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Dish>>> getDishes(@RequestParam(required = false) String category) {
        List<Dish> dishes = dishService.getDishes(category);
        return ResponseEntity.ok(ApiResponse.ok(dishes));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<Category>>> getCategories() {
        List<Category> categories = dishService.getCategories();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<Dish>> getDishBySlug(@PathVariable String slug) {
        Dish dish = dishService.getDishBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(dish));
    }
}

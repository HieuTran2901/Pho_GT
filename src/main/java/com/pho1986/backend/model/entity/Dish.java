package com.pho1986.backend.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dishes", indexes = {
    @Index(name = "idx_dishes_menu", columnList = "is_available, is_signature DESC, price ASC"),
    @Index(name = "idx_dishes_category", columnList = "category_id, is_available"),
    @Index(name = "idx_dishes_slug", columnList = "slug")
})
public class Dish {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String slug;

    @Column(nullable = false)
    private Double price;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 1000)
    private String imageUrl;

    @Column(nullable = false)
    private Boolean isAvailable = true;

    @Column(nullable = false)
    private Boolean isSignature = false;

    @Column(length = 50)
    private String portion;

    @Column(length = 50)
    private String tag;

    @Column(length = 50)
    private String tagIcon;

    @Column(columnDefinition = "TEXT")
    private String ingredients;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Dish() {}

    public Dish(Category category, String name, String slug, Double price, String description, String imageUrl, Boolean isAvailable, Boolean isSignature) {
        this.category = category;
        this.name = name;
        this.slug = slug;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.isAvailable = isAvailable;
        this.isSignature = isSignature;
    }

    public Dish(Category category, String name, String slug, Double price, String description, String imageUrl, Boolean isAvailable, Boolean isSignature, String portion, String tag, String tagIcon, String ingredients) {
        this.category = category;
        this.name = name;
        this.slug = slug;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.isAvailable = isAvailable;
        this.isSignature = isSignature;
        this.portion = portion;
        this.tag = tag;
        this.tagIcon = tagIcon;
        this.ingredients = ingredients;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
    public Boolean getIsSignature() { return isSignature; }
    public void setIsSignature(Boolean isSignature) { this.isSignature = isSignature; }
    public String getPortion() { return portion; }
    public void setPortion(String portion) { this.portion = portion; }
    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }
    public String getTagIcon() { return tagIcon; }
    public void setTagIcon(String tagIcon) { this.tagIcon = tagIcon; }
    public String getIngredients() { return ingredients; }
    public void setIngredients(String ingredients) { this.ingredients = ingredients; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

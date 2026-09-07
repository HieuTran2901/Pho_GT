package com.pho1986.backend.service;

import com.pho1986.backend.model.dto.AdminDashboardDtos.*;
import com.pho1986.backend.model.entity.*;
import com.pho1986.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class AdminService {

    private final OrderRepository orderRepository;
    private final DishRepository dishRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;

    public AdminService(
            OrderRepository orderRepository,
            DishRepository dishRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            LoyaltyAccountRepository loyaltyAccountRepository,
            LoyaltyTransactionRepository loyaltyTransactionRepository) {
        this.orderRepository = orderRepository;
        this.dishRepository = dishRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.loyaltyAccountRepository = loyaltyAccountRepository;
        this.loyaltyTransactionRepository = loyaltyTransactionRepository;
    }

    public AdminStatsResponse getDashboardStats() {
        List<Order> allOrders = orderRepository.findAll();

        long totalOrders = allOrders.size();
        long pendingOrders = allOrders.stream().filter(o -> "PENDING".equalsIgnoreCase(o.getStatus())).count();
        long confirmedOrders = allOrders.stream().filter(o -> "CONFIRMED".equalsIgnoreCase(o.getStatus()) || "COOKING".equalsIgnoreCase(o.getStatus())).count();
        long completedOrders = allOrders.stream().filter(o -> "COMPLETED".equalsIgnoreCase(o.getStatus())).count();

        double totalRevenue = allOrders.stream()
                .filter(o -> "PAID".equalsIgnoreCase(o.getPaymentStatus()) || "COMPLETED".equalsIgnoreCase(o.getStatus()))
                .mapToDouble(Order::getFinalAmount)
                .sum();

        LocalDateTime startOfToday = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        double todayRevenue = allOrders.stream()
                .filter(o -> o.getCreatedAt().isAfter(startOfToday))
                .filter(o -> "PAID".equalsIgnoreCase(o.getPaymentStatus()) || "COMPLETED".equalsIgnoreCase(o.getStatus()))
                .mapToDouble(Order::getFinalAmount)
                .sum();

        long totalDishes = dishRepository.count();
        long totalUsers = userRepository.count();

        return new AdminStatsResponse(
                totalOrders, pendingOrders, confirmedOrders, completedOrders,
                totalRevenue, todayRevenue, totalDishes, totalUsers
        );
    }

    public List<Order> getAllOrders(String status) {
        if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            return orderRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase().trim());
        }
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Order updateOrderStatus(String orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng với mã: " + orderId));

        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            String newStatus = request.getStatus().toUpperCase().trim();
            order.setStatus(newStatus);

            // Tự động chuyển paymentStatus sang PAID nếu đơn hoàn tất
            if ("COMPLETED".equals(newStatus)) {
                order.setPaymentStatus("PAID");

                // Tích điểm loyalty nếu đơn thuộc về User và chưa được cộng
                if (order.getUser() != null) {
                    User user = order.getUser();
                    LoyaltyAccount account = user.getLoyaltyAccount();
                    if (account != null) {
                        int pointsEarned = (int) (order.getFinalAmount() / 1000);
                        if (pointsEarned > 0) {
                            account.setTotalPoints(account.getTotalPoints() + pointsEarned);
                            account.setAvailablePoints(account.getAvailablePoints() + pointsEarned);
                            account.setTotalSpent(account.getTotalSpent() + order.getFinalAmount());
                            account.setTotalOrdersCount(account.getTotalOrdersCount() + 1);
                            loyaltyAccountRepository.save(account);

                            loyaltyTransactionRepository.save(new LoyaltyTransaction(
                                    account, order.getId(), pointsEarned, "EARN_ORDER",
                                    account.getAvailablePoints(), "Tích điểm từ đơn " + order.getOrderCode()
                            ));
                        }
                    }
                }
            }
        }

        if (request.getPaymentStatus() != null && !request.getPaymentStatus().trim().isEmpty()) {
            order.setPaymentStatus(request.getPaymentStatus().toUpperCase().trim());
        }

        return orderRepository.save(order);
    }

    public List<Dish> getAllDishes() {
        return dishRepository.findAll();
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional
    public Dish createDish(DishUpsertRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh mục"));

        String baseSlug = toSlug(request.getName());
        if (baseSlug.isEmpty()) {
            baseSlug = "mon-an";
        }
        if (baseSlug.length() > 90) {
            baseSlug = baseSlug.substring(0, 90);
        }
        String slug = baseSlug + "-" + UUID.randomUUID().toString().substring(0, 8);

        String trimmedName = request.getName() != null ? request.getName().trim() : "";
        String trimmedPortion = request.getPortion() != null && !request.getPortion().trim().isEmpty() 
                ? request.getPortion().trim() : "Tô thường";
        String trimmedTag = request.getTag() != null && !request.getTag().trim().isEmpty() 
                ? request.getTag().trim() : null;
        String trimmedTagIcon = request.getTagIcon() != null && !request.getTagIcon().trim().isEmpty() 
                ? request.getTagIcon().trim() : "star";
        String trimmedIngredients = request.getIngredients() != null ? request.getIngredients().trim() : null;
        String trimmedDesc = request.getDescription() != null ? request.getDescription().trim() : null;
        String trimmedImg = request.getImageUrl() != null && !request.getImageUrl().trim().isEmpty() 
                ? request.getImageUrl().trim() : "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80";

        Dish dish = new Dish(
                category,
                trimmedName,
                slug,
                request.getPrice(),
                trimmedDesc,
                trimmedImg,
                request.getIsAvailable() != null ? request.getIsAvailable() : true,
                request.getIsSignature() != null ? request.getIsSignature() : false,
                trimmedPortion,
                trimmedTag,
                trimmedTagIcon,
                trimmedIngredients
        );

        return dishRepository.save(dish);
    }

    @Transactional
    public Dish updateDish(String dishId, DishUpsertRequest request) {
        Dish dish = dishRepository.findById(dishId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy món ăn với ID: " + dishId));

        if (request.getCategoryId() != null && !request.getCategoryId().trim().isEmpty()) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh mục"));
            dish.setCategory(category);
        }

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            dish.setName(request.getName().trim());
        }
        if (request.getPrice() != null) {
            dish.setPrice(request.getPrice());
        }
        if (request.getDescription() != null) {
            dish.setDescription(request.getDescription().trim());
        }
        if (request.getImageUrl() != null) {
            dish.setImageUrl(request.getImageUrl().trim());
        }
        if (request.getIsAvailable() != null) {
            dish.setIsAvailable(request.getIsAvailable());
        }
        if (request.getIsSignature() != null) {
            dish.setIsSignature(request.getIsSignature());
        }
        if (request.getPortion() != null) {
            dish.setPortion(request.getPortion().trim());
        }
        if (request.getTag() != null) {
            dish.setTag(request.getTag().trim().isEmpty() ? null : request.getTag().trim());
        }
        if (request.getTagIcon() != null) {
            dish.setTagIcon(request.getTagIcon().trim().isEmpty() ? "star" : request.getTagIcon().trim());
        }
        if (request.getIngredients() != null) {
            dish.setIngredients(request.getIngredients().trim());
        }

        return dishRepository.save(dish);
    }

    @Transactional
    public void deleteDish(String dishId) {
        Dish dish = dishRepository.findById(dishId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy món ăn với ID: " + dishId));
        // Soft delete bằng cách đặt isAvailable = false
        dish.setIsAvailable(false);
        dishRepository.save(dish);
    }

    private String toSlug(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String noDiacritics = pattern.matcher(normalized).replaceAll("").toLowerCase(Locale.ROOT);
        return noDiacritics.replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }
}

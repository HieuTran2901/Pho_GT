package com.pho1986.backend.service;

import com.pho1986.backend.common.AccountLockedException;
import com.pho1986.backend.model.dto.OrderDtos.*;
import com.pho1986.backend.model.entity.*;
import com.pho1986.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private static final String CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final TasteProfileRepository tasteProfileRepository;
    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final DishRepository dishRepository;

    public OrderService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            TasteProfileRepository tasteProfileRepository,
            LoyaltyAccountRepository loyaltyAccountRepository,
            LoyaltyTransactionRepository loyaltyTransactionRepository,
            DishRepository dishRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.tasteProfileRepository = tasteProfileRepository;
        this.loyaltyAccountRepository = loyaltyAccountRepository;
        this.loyaltyTransactionRepository = loyaltyTransactionRepository;
        this.dishRepository = dishRepository;
    }

    /**
     * [SECURITY_AGENT & BLADE] Sinh mã đơn an toàn mật mã học chống đoán mò / quét vét (enumeration)
     */
    private String generateOrderCode() {
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder("PHO-");
            for (int i = 0; i < 6; i++) {
                sb.append(CODE_CHARS.charAt(SECURE_RANDOM.nextInt(CODE_CHARS.length())));
            }
            String candidate = sb.toString();
            if (!orderRepository.existsByOrderCode(candidate)) {
                return candidate;
            }
        }
        return "PHO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    @Transactional
    public Order createOrder(String userId, CreateOrderRequest request) {
        User user = (userId != null) ? userRepository.findById(userId).orElse(null) : null;
        String phoneToCheck = (user != null) ? user.getPhone() : request.getGuestPhone();
        checkEligibility(userId, phoneToCheck);

        if (user == null && (request.getGuestName() == null || request.getGuestPhone() == null)) {
            throw new IllegalArgumentException("Quý khách vui lòng cung cấp tên và số điện thoại nhận hàng");
        }

        double totalAmount = request.getItems().stream()
                .mapToDouble(i -> i.getUnitPrice() * i.getQuantity())
                .sum();
        double discountAmount = 0.0;
        double finalAmount = totalAmount - discountAmount;

        Order order = new Order();
        order.setOrderCode(generateOrderCode());
        order.setUser(user);
        order.setGuestName(user != null ? null : request.getGuestName());
        order.setGuestPhone(user != null ? null : request.getGuestPhone());
        order.setDeliveryAddressText(request.getDeliveryAddressText());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus("COD".equalsIgnoreCase(request.getPaymentMethod()) ? "UNPAID" : "PAID");
        order.setTotalAmount(totalAmount);
        order.setDiscountAmount(discountAmount);
        order.setFinalAmount(finalAmount);
        order.setNotes(request.getNotes());
        order.setTableNumber(request.getTableNumber());

        for (CreateOrderItemRequest itemReq : request.getItems()) {
            if (StringUtils.hasText(itemReq.getDishId())) {
                dishRepository.findById(itemReq.getDishId()).ifPresent(dish -> {
                    if (Boolean.FALSE.equals(dish.getIsAvailable())) {
                        throw new IllegalStateException("Món \"" + dish.getName() + "\" hiện đang tạm hết hàng tại quán. Quý khách vui lòng chọn món khác.");
                    }
                });
            }
            OrderItem item = new OrderItem(
                    itemReq.getDishId(),
                    itemReq.getDishName(),
                    itemReq.getUnitPrice(),
                    itemReq.getQuantity(),
                    itemReq.getUnitPrice() * itemReq.getQuantity(),
                    itemReq.getCustomizedOptions()
            );
            order.addItem(item);
        }

        order = orderRepository.save(order);

        // Tích điểm cho thành viên
        if (user != null) {
            int earnedPoints = Math.max(10, (int) Math.floor(finalAmount / 1000.0));
            LoyaltyAccount loyalty = loyaltyAccountRepository.findByUserId(user.getId()).orElse(null);

            if (loyalty != null) {
                int newTotal = loyalty.getTotalPoints() + earnedPoints;
                int newAvail = loyalty.getAvailablePoints() + earnedPoints;
                loyalty.setTotalPoints(newTotal);
                loyalty.setAvailablePoints(newAvail);
                loyalty.setTotalSpent(loyalty.getTotalSpent() + finalAmount);
                loyalty.setTotalOrdersCount(loyalty.getTotalOrdersCount() + 1);

                String tier = (newTotal >= 2000) ? "KIM_CUONG" : (newTotal >= 1000) ? "VANG" : (newTotal >= 500) ? "BAC" : "DONG";
                loyalty.setMembershipTier(tier);
                loyaltyAccountRepository.save(loyalty);

                loyaltyTransactionRepository.save(new LoyaltyTransaction(
                        loyalty, order.getId(), earnedPoints, "EARN_ORDER", newAvail, "Tích điểm đơn hàng #" + order.getOrderCode()
                ));
            }
        }

        return order;
    }

    public QuickReorderResponse getQuickReorder(String userId) {
        Order lastOrder = orderRepository.findFirstByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new IllegalArgumentException("Bạn chưa có đơn hàng nào trước đây để gọi lại"));

        TasteProfile taste = tasteProfileRepository.findByUserId(userId).orElse(null);

        return new QuickReorderResponse(
                lastOrder.getOrderCode(),
                lastOrder.getDeliveryAddressText(),
                lastOrder.getItems(),
                taste
        );
    }

    public List<Order> getOrderHistory(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Order getOrderByCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng #" + orderCode));
    }

    /**
     * [SENTINEL & BLADE] Pre-flight check kiểm tra tính hợp lệ của tài khoản / SĐT trước khi đặt bàn
     */
     public void checkEligibility(String userId, String phone) {
         if (userId != null) {
             User user = userRepository.findById(userId).orElse(null);
             if (user != null && (user.isAccountLocked() || "LOCKED".equalsIgnoreCase(user.getStatus()))) {
                 throw new AccountLockedException(
                         user.getPhone(),
                         "Tài khoản của quý khách hiện đang bị tạm khóa. Không thể thực hiện đặt bàn."
                 );
             }
         }
         if (StringUtils.hasText(phone)) {
             String cleanPhone = phone.replaceAll("[\\s.-]+", "");
             userRepository.findByPhone(cleanPhone).ifPresent(u -> {
                 if (u.isAccountLocked() || "LOCKED".equalsIgnoreCase(u.getStatus())) {
                     throw new AccountLockedException(
                             cleanPhone,
                             "Số điện thoại này hiện đang bị tạm khóa dịch vụ. Vui lòng liên hệ Hotline quán để được hỗ trợ."
                     );
                 }
             });
         }
     }
}

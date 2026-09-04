package com.pho1986.backend.service;

import com.pho1986.backend.model.dto.OrderDtos.*;
import com.pho1986.backend.model.entity.*;
import com.pho1986.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final TasteProfileRepository tasteProfileRepository;
    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;

    public OrderService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            TasteProfileRepository tasteProfileRepository,
            LoyaltyAccountRepository loyaltyAccountRepository,
            LoyaltyTransactionRepository loyaltyTransactionRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.tasteProfileRepository = tasteProfileRepository;
        this.loyaltyAccountRepository = loyaltyAccountRepository;
        this.loyaltyTransactionRepository = loyaltyTransactionRepository;
    }

    private String generateOrderCode() {
        long timeSuffix = System.currentTimeMillis() % 10000;
        int rand = 100 + new Random().nextInt(900);
        return "PHO-" + timeSuffix + rand;
    }

    @Transactional
    public Order createOrder(String userId, CreateOrderRequest request) {
        User user = (userId != null) ? userRepository.findById(userId).orElse(null) : null;

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

        for (CreateOrderItemRequest itemReq : request.getItems()) {
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
}

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
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final String CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final TasteProfileRepository tasteProfileRepository;
    private final DishRepository dishRepository;
    private final TableService tableService;
    private final CustomerGiftRepository customerGiftRepository;
    private final CustomerGiftService customerGiftService;
    private final LoyaltyService loyaltyService;
    private final VoucherService voucherService;

    public OrderService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            TasteProfileRepository tasteProfileRepository,
            DishRepository dishRepository,
            TableService tableService,
            CustomerGiftRepository customerGiftRepository,
            CustomerGiftService customerGiftService,
            LoyaltyService loyaltyService,
            VoucherService voucherService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.tasteProfileRepository = tasteProfileRepository;
        this.dishRepository = dishRepository;
        this.tableService = tableService;
        this.customerGiftRepository = customerGiftRepository;
        this.customerGiftService = customerGiftService;
        this.loyaltyService = loyaltyService;
        this.voucherService = voucherService;
    }

    /**
     * Sinh mã đơn an toàn mật mã học chống đoán mò / quét vét (enumeration)
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

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Đơn hàng phải có ít nhất 01 món ăn.");
        }

        // 1. Kiểm tra bắt buộc dishId trên từng món ăn
        for (CreateOrderItemRequest itemReq : request.getItems()) {
            if (!StringUtils.hasText(itemReq.getDishId())) {
                throw new IllegalArgumentException("Mã món ăn (dishId) không hợp lệ hoặc để trống trong yêu cầu đặt hàng.");
            }
        }

        // 2. Thu thập danh sách dishId duy nhất để truy vấn batch DB (chống N+1 query theo TEST-R015)
        List<String> distinctDishIds = request.getItems().stream()
                .map(CreateOrderItemRequest::getDishId)
                .map(String::trim)
                .distinct()
                .toList();

        Map<String, Dish> dishMap = dishRepository.findAllById(distinctDishIds).stream()
                .collect(Collectors.toMap(Dish::getId, Function.identity(), (a, b) -> a));

        // 3. Khởi tạo danh sách OrderItem và tính đơn giá/thành tiền 100% từ Server DB (hỗ trợ món trùng khác tùy biến)
        List<OrderItem> orderItems = new java.util.ArrayList<>();
        for (CreateOrderItemRequest itemReq : request.getItems()) {
            String dishId = itemReq.getDishId().trim();
            Dish dish = dishMap.get(dishId);
            if (dish == null) {
                throw new IllegalArgumentException("Món ăn không tồn tại trong thực đơn: " + dishId);
            }
            if (Boolean.FALSE.equals(dish.getIsAvailable())) {
                throw new IllegalStateException("Món \"" + dish.getName() + "\" hiện đang tạm hết hàng tại quán. Quý khách vui lòng chọn món khác.");
            }
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new IllegalArgumentException("Số lượng món ăn phải lớn hơn 0: " + dishId);
            }

            Double serverPrice = dish.getPrice();
            if (serverPrice == null || serverPrice <= 0) {
                throw new IllegalArgumentException("Đơn giá món ăn không hợp lệ trong hệ thống: " + dishId);
            }

            int qty = itemReq.getQuantity();
            double subtotal = serverPrice * qty;
            String name = StringUtils.hasText(dish.getName()) ? dish.getName() : itemReq.getDishName();

            orderItems.add(new OrderItem(
                    dish.getId(),
                    name,
                    serverPrice,
                    qty,
                    subtotal,
                    itemReq.getCustomizedOptions()
            ));
        }

        double totalAmount = orderItems.stream().mapToDouble(OrderItem::getSubtotal).sum();
        double discountAmount = 0.0;

        Order order = new Order();
        order.setOrderCode(generateOrderCode());
        order.setUser(user);
        order.setGuestName(user != null ? null : request.getGuestName());
        order.setGuestPhone(user != null ? null : request.getGuestPhone());
        order.setDeliveryAddressText(request.getDeliveryAddressText());
        order.setPaymentMethod(request.getPaymentMethod());
        // BẤT BIẾN: 100% đơn hàng mới luôn khởi tạo ở trạng thái UNPAID
        order.setPaymentStatus("UNPAID");
        order.setStatus("PENDING");
        order.setNotes(request.getNotes());
        order.setTableNumber(request.getTableNumber());

        // Guest Capability Token: sinh 256-bit token ngẫu nhiên, chỉ lưu hash và trả token raw 1 lần duy nhất
        if (user == null) {
            byte[] tokenBytes = new byte[32];
            SECURE_RANDOM.nextBytes(tokenBytes);
            String rawAccessToken = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
            order.setOrderAccessTokenHash(com.pho1986.backend.common.PiiMaskUtils.sha256Hex(rawAccessToken));
            order.setRawAccessToken(rawAccessToken);
        }

        // Kiểm tra bắt buộc có món ăn chính nếu đặt bàn hoặc áp dụng ưu đãi
        boolean hasMainDish = orderItems.stream().anyMatch(item -> {
            Dish d = dishMap.get(item.getDishId());
            if (d == null) return false;
            if (d.getCategory() == null || d.getCategory().getSlug() == null) {
                String name = d.getName() != null ? d.getName().toLowerCase() : "";
                return name.contains("phở") || name.contains("pho");
            }
            String slug = d.getCategory().getSlug().toLowerCase();
            return !slug.contains("mon-an-kem") && !slug.contains("do-uong");
        });

        if ((StringUtils.hasText(request.getTableNumber()) || StringUtils.hasText(request.getAppliedGiftId())) && !hasMainDish) {
            throw new IllegalArgumentException("Quý khách cần chọn ít nhất 01 món ăn chính (không áp dụng cho đơn chỉ gồm đồ uống hoặc món ăn kèm).");
        }

        // Kiểm tra và giữ chỗ phiếu quà tặng nguyên tử (15 phút TTL)
        if (StringUtils.hasText(request.getAppliedGiftId())) {
            String cleanGiftId = request.getAppliedGiftId().trim();
            String targetUserId = (user != null) ? user.getId() : null;
            if (targetUserId == null && StringUtils.hasText(request.getGuestPhone())) {
                String cleanPhone = request.getGuestPhone().replaceAll("[\\s.-]+", "");
                targetUserId = userRepository.findByPhone(cleanPhone).map(User::getId).orElse(null);
            }
            if (targetUserId != null) {
                Optional<CustomerGift> optGift = customerGiftService.reserveGiftForOrder(targetUserId, cleanGiftId, order.getOrderCode(), 15);
                if (optGift.isPresent()) {
                    CustomerGift gift = optGift.get();
                    order.setVoucherCode(gift.getCode());
                    if ("DISCOUNT_CASH".equalsIgnoreCase(gift.getRewardType())
                            && gift.getDiscountValue() != null && gift.getDiscountValue() > 0) {
                        if (gift.getMinOrderAmount() == null || totalAmount >= gift.getMinOrderAmount()) {
                            discountAmount = Math.min(totalAmount, gift.getDiscountValue());
                        }
                    }
                }
            } else {
                order.setVoucherCode(cleanGiftId);
            }
        }

        double finalAmount = Math.max(0.0, totalAmount - discountAmount);
        order.setTotalAmount(totalAmount);
        order.setDiscountAmount(discountAmount);
        order.setFinalAmount(finalAmount);

        if (StringUtils.hasText(request.getTableNumber())) {
            tableService.validateTableAvailable(request.getTableNumber());
        }

        orderItems.forEach(order::addItem);
        order = orderRepository.save(order);

        if (StringUtils.hasText(request.getTableNumber())) {
            tableService.markTableStatus(request.getTableNumber(), "RESERVED");
        }

        return order;
    }

    @Transactional
    public Order cancelOrder(String orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng: " + orderId));
        if ("CANCELLED".equals(order.getStatus())) {
            return order;
        }
        order.setStatus("CANCELLED");
        if (StringUtils.hasText(order.getTableNumber())) {
            tableService.markTableStatus(order.getTableNumber(), "AVAILABLE");
            order.setTableNumber(null);
        }
        if ("PAID".equals(order.getPaymentStatus())) {
            order.setPaymentStatus("REFUND_PENDING");
            order.setRefundReason(reason);
        } else {
            customerGiftService.releaseGiftFromOrder(order.getId(), order.getOrderCode());
        }
        return orderRepository.save(order);
    }

    @Transactional
    public Order confirmRefund(String orderId, String adminUserId, Double refundAmount, String refundRef, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng: " + orderId));
        if (!"REFUND_PENDING".equals(order.getPaymentStatus()) && !"PAID".equals(order.getPaymentStatus())) {
            throw new IllegalStateException("Đơn hàng không ở trạng thái chờ hoàn tiền (REFUND_PENDING): " + order.getPaymentStatus());
        }
        order.setStatus("CANCELLED");
        order.setPaymentStatus("REFUNDED");
        order.setRefundAmount(refundAmount != null ? refundAmount : order.getFinalAmount());
        order.setRefundedBy(adminUserId);
        order.setRefundRef(refundRef);
        order.setRefundReason(reason);
        order.setRefundedAt(java.time.LocalDateTime.now());

        // Thu hồi điểm thưởng thành viên đã tích lũy
        loyaltyService.revertLoyaltyPointsForOrder(order);
        // Giải phóng vé quà & sổ cái voucher
        customerGiftService.releaseGiftFromOrder(order.getId(), order.getOrderCode());
        voucherService.revertVoucherRedemption(order.getId());

        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
    public List<Order> getOrderHistory(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public Order getOrderByCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng #" + orderCode));
    }

    /**
     * Pre-flight check kiểm tra tính hợp lệ của tài khoản / SĐT trước khi đặt bàn
     */
    @Transactional(readOnly = true)
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

package com.pho1986.backend.service;

import com.pho1986.backend.model.dto.OrderDtos.CreateOrderItemRequest;
import com.pho1986.backend.model.dto.OrderDtos.CreateOrderRequest;
import com.pho1986.backend.model.entity.*;
import com.pho1986.backend.repository.*;
import com.pho1986.backend.service.payment.PaymentSettlementHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class OrderSecurityConcurrencyTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private PaymentSettlementHelper paymentSettlementHelper;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private DishRepository dishRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoyaltyAccountRepository loyaltyAccountRepository;

    @Autowired
    private LoyaltyTransactionRepository loyaltyTransactionRepository;

    @Autowired
    private CustomerGiftRepository customerGiftRepository;

    @Autowired
    private CustomerGiftService customerGiftService;

    @Autowired
    private CategoryRepository categoryRepository;

    private Dish activeDish1;
    private Dish activeDish2;
    private Dish inactiveDish;
    private User testUser;

    @BeforeEach
    void setUp() {
        Category cat = categoryRepository.findAll().stream().findFirst().orElseGet(() -> {
            Category c = new Category();
            c.setName("Món Chính");
            c.setSlug("mon-chinh-test-" + UUID.randomUUID());
            c.setDisplayOrder(1);
            return categoryRepository.save(c);
        });

        // Setup isolated test entities
        activeDish1 = new Dish();
        activeDish1.setName("Phở Tái Lăn Test");
        activeDish1.setSlug("pho-tai-lan-test-" + UUID.randomUUID());
        activeDish1.setPrice(75000.0);
        activeDish1.setIsAvailable(true);
        activeDish1.setCategory(cat);
        activeDish1 = dishRepository.save(activeDish1);

        activeDish2 = new Dish();
        activeDish2.setName("Quẩy Giòn Test");
        activeDish2.setSlug("quay-gion-test-" + UUID.randomUUID());
        activeDish2.setPrice(15000.0);
        activeDish2.setIsAvailable(true);
        activeDish2.setCategory(cat);
        activeDish2 = dishRepository.save(activeDish2);

        inactiveDish = new Dish();
        inactiveDish.setName("Phở Đặc Biệt Hết Hàng");
        inactiveDish.setSlug("pho-dac-biet-het-hang-" + UUID.randomUUID());
        inactiveDish.setPrice(95000.0);
        inactiveDish.setIsAvailable(false);
        inactiveDish.setCategory(cat);
        inactiveDish = dishRepository.save(inactiveDish);

        String randomPhone = "098" + (int)(1000000 + Math.random() * 9000000);
        testUser = new User();
        testUser.setPhone(randomPhone);
        testUser.setFullName("Nguyễn Văn Test Concurrency");
        testUser.setPasswordHash("hashed_pass");
        testUser = userRepository.save(testUser);
    }

    @Test
    @DisplayName("P0-1: Thử tấn công sửa giá unitPrice = 1đ -> Server bắt buộc tra DB và gán giá chuẩn 75.000đ")
    void testClientPriceTampering_IgnoredAndEnforcesServerPrice() {
        CreateOrderRequest request = new CreateOrderRequest();
        request.setGuestName("Khách Thử Nghiệm");
        request.setGuestPhone("0912345678");
        request.setDeliveryAddressText("123 Phố Cổ Hà Nội");
        request.setPaymentMethod("COD");

        CreateOrderItemRequest item = new CreateOrderItemRequest();
        item.setDishId(activeDish1.getId());
        item.setDishName("Tên Fake");
        item.setUnitPrice(1.0); // Client cố ý gửi 1đ
        item.setQuantity(2);

        request.setItems(List.of(item));

        Order order = orderService.createOrder(null, request);

        assertNotNull(order);
        assertNotNull(order.getId());
        // Server phải lấy giá từ activeDish1 (75.000đ) x 2 = 150.000đ
        assertEquals(150000.0, order.getTotalAmount(), "TotalAmount phải được tính 100% từ DB");
        assertEquals(150000.0, order.getFinalAmount(), "FinalAmount phải được tính 100% từ DB");

        OrderItem savedItem = order.getItems().get(0);
        assertEquals(75000.0, savedItem.getUnitPrice(), "OrderItem.unitPrice phải bị ghi đè bởi giá DB");
        assertEquals(150000.0, savedItem.getSubtotal(), "OrderItem.subtotal phải chuẩn theo giá DB");

        // Bất biến: Đơn mới luôn là UNPAID
        assertEquals("UNPAID", order.getPaymentStatus());
    }

    @Test
    @DisplayName("P0-2: Đặt món với dishId không tồn tại hoặc bị để trống -> Server từ chối ngay lập tức")
    void testInvalidDishId_RejectedImmediately() {
        CreateOrderRequest req1 = new CreateOrderRequest();
        req1.setGuestName("Khách 1");
        req1.setGuestPhone("0912345678");
        req1.setDeliveryAddressText("123 Phố Cổ");

        CreateOrderItemRequest itemWithoutId = new CreateOrderItemRequest();
        itemWithoutId.setDishName("Món Không Có ID");
        itemWithoutId.setUnitPrice(50000.0);
        itemWithoutId.setQuantity(1);
        req1.setItems(List.of(itemWithoutId));

        assertThrows(IllegalArgumentException.class, () -> orderService.createOrder(null, req1),
                "Phải ném ngoại lệ khi dishId để trống");

        CreateOrderRequest req2 = new CreateOrderRequest();
        req2.setGuestName("Khách 2");
        req2.setGuestPhone("0912345678");
        req2.setDeliveryAddressText("123 Phố Cổ");

        CreateOrderItemRequest itemNonExistent = new CreateOrderItemRequest();
        itemNonExistent.setDishId("dish_does_not_exist_" + UUID.randomUUID());
        itemNonExistent.setDishName("Món Ảo");
        itemNonExistent.setUnitPrice(50000.0);
        itemNonExistent.setQuantity(1);
        req2.setItems(List.of(itemNonExistent));

        assertThrows(IllegalArgumentException.class, () -> orderService.createOrder(null, req2),
                "Phải ném ngoại lệ khi dishId không có trong DB");
    }

    @Test
    @DisplayName("P0-3: Đặt món tạm hết hàng (isAvailable = false) -> Server từ chối")
    void testInactiveDish_Rejected() {
        CreateOrderRequest req = new CreateOrderRequest();
        req.setGuestName("Khách");
        req.setGuestPhone("0912345678");
        req.setDeliveryAddressText("123 Phố Cổ");

        CreateOrderItemRequest item = new CreateOrderItemRequest();
        item.setDishId(inactiveDish.getId());
        item.setDishName(inactiveDish.getName());
        item.setQuantity(1);
        req.setItems(List.of(item));

        assertThrows(IllegalStateException.class, () -> orderService.createOrder(null, req),
                "Phải ném IllegalStateException khi món hết hàng");
    }

    @Test
    @DisplayName("P0-4: Đặt 2 món trùng dishId nhưng khác customizedOptions -> Cả 2 được lưu độc lập, tính đúng giá")
    void testDuplicateDishIdWithDifferentOptions_HandledAccurately() {
        CreateOrderRequest req = new CreateOrderRequest();
        req.setGuestName("Khách Sành Ăn");
        req.setGuestPhone("0912345678");
        req.setDeliveryAddressText("123 Phố Cổ");

        CreateOrderItemRequest bowl1 = new CreateOrderItemRequest();
        bowl1.setDishId(activeDish1.getId());
        bowl1.setQuantity(1);
        bowl1.setCustomizedOptions("Nhiều hành, nước béo");

        CreateOrderItemRequest bowl2 = new CreateOrderItemRequest();
        bowl2.setDishId(activeDish1.getId());
        bowl2.setQuantity(1);
        bowl2.setCustomizedOptions("Không hành, nước trong");

        req.setItems(List.of(bowl1, bowl2));

        Order order = orderService.createOrder(null, req);

        assertNotNull(order);
        assertEquals(2, order.getItems().size(), "Phải lưu đủ 2 bát phở");
        assertEquals(150000.0, order.getTotalAmount(), "Tổng tiền phải bằng 75.000 x 2 = 150.000");

        OrderItem item1 = order.getItems().get(0);
        OrderItem item2 = order.getItems().get(1);
        assertEquals("Nhiều hành, nước béo", item1.getCustomizedOptions());
        assertEquals("Không hành, nước trong", item2.getCustomizedOptions());
    }

    @Test
    @DisplayName("P0-5: Concurrency - 2 luồng đồng thời quyết toán 1 đơn hàng -> Chỉ 1 luồng được ghi nhận, điểm và quà chỉ cộng/dùng 1 lần")
    void testConcurrentPaymentSettlement_RaceConditionProtected() throws Exception {
        // 1. Tạo ví quà cho khách hàng
        CustomerGift gift = new CustomerGift(
                testUser,
                "TRIKY-TEST-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase(),
                "Voucher Giảm 20K Concurrency",
                "Mô tả",
                "Phiếu Giảm Giá",
                "DISCOUNT_CASH",
                null,
                null,
                20000.0,
                50000.0,
                null,
                "TEST",
                LocalDateTime.now().plusDays(10)
        );
        gift = customerGiftRepository.save(gift);

        // 2. Tạo đơn hàng với mã quà
        CreateOrderRequest req = new CreateOrderRequest();
        req.setDeliveryAddressText("123 Phố Cổ");
        req.setPaymentMethod("VIETQR");
        req.setAppliedGiftId(gift.getCode());

        CreateOrderItemRequest item = new CreateOrderItemRequest();
        item.setDishId(activeDish1.getId());
        item.setQuantity(1);
        req.setItems(List.of(item));

        Order order = orderService.createOrder(testUser.getId(), req);
        assertEquals("UNPAID", order.getPaymentStatus());
        assertEquals(gift.getCode(), order.getVoucherCode());
        assertEquals(20000.0, order.getDiscountAmount());
        assertEquals(55000.0, order.getFinalAmount()); // 75.000 - 20.000

        // Kiểm tra quà chuyển sang trạng thái RESERVED (giữ chỗ cho đơn hàng)
        CustomerGift giftBeforeSettle = customerGiftRepository.findById(gift.getId()).orElseThrow();
        assertEquals("RESERVED", giftBeforeSettle.getStatus(), "Quà phải được RESERVED (giữ chỗ) khi đơn tạo thành công");

        // 3. Giả lập 2 luồng webhook/settle đồng thời
        int threadCount = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CyclicBarrier barrier = new CyclicBarrier(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger skippedCount = new AtomicInteger(0);

        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < threadCount; i++) {
            final int threadIdx = i;
            futures.add(executor.submit(() -> {
                try {
                    barrier.await(5, TimeUnit.SECONDS); // Đồng bộ thời điểm bắt đầu
                    boolean settled = paymentSettlementHelper.settleOrderDirectly(order, "[Thread-" + threadIdx + "]");
                    if (settled) {
                        successCount.incrementAndGet();
                    } else {
                        skippedCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }));
        }

        for (Future<?> f : futures) {
            f.get(10, TimeUnit.SECONDS);
        }
        executor.shutdown();

        // 4. Kiểm tra nghiệm thu nghiêm ngặt
        assertEquals(1, successCount.get(), "Chính xác 1 luồng được ghi nhận quyết toán thành công");
        assertEquals(1, skippedCount.get(), "Luồng còn lại phải bị idempotent skip");

        // Kiểm tra trạng thái đơn hàng
        Order settledOrder = orderRepository.findById(order.getId()).orElseThrow();
        assertEquals("PAID", settledOrder.getPaymentStatus());
        assertEquals("CONFIRMED", settledOrder.getStatus());

        // Kiểm tra lịch sử giao dịch điểm tích lũy: Phải đúng duy nhất 1 bản ghi EARN_PAYMENT
        LoyaltyAccount loyalty = loyaltyAccountRepository.findByUserId(testUser.getId()).orElseThrow();
        List<LoyaltyTransaction> txs = loyaltyTransactionRepository.findByLoyaltyAccountIdOrderByCreatedAtDesc(loyalty.getId());
        long earnPaymentCount = txs.stream()
                .filter(t -> "EARN_PAYMENT".equals(t.getType()) && order.getId().equals(t.getOrderId()))
                .count();
        assertEquals(1, earnPaymentCount, "Điểm chỉ được tích duy nhất 1 lần cho đơn hàng");

        // Kiểm tra vé quà: Chỉ bị đánh dấu USED duy nhất 1 lần
        CustomerGift giftAfterSettle = customerGiftRepository.findById(gift.getId()).orElseThrow();
        assertEquals("USED", giftAfterSettle.getStatus(), "Quà phải chuyển sang USED sau khi quyết toán");
        assertNotNull(giftAfterSettle.getUsedAt());
    }

    @Test
    @DisplayName("P0-6: Hủy đơn hàng đã thanh toán -> Hoàn trả điểm và giải phóng vé quà")
    void testCancelOrder_RevertsPointsAndReleasesGift() {
        CustomerGift gift = new CustomerGift(
                testUser,
                "TRIKY-CANCEL-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase(),
                "Voucher Hủy",
                "Mô tả",
                "Phiếu Giảm Giá",
                "DISCOUNT_CASH",
                null,
                null,
                20000.0,
                50000.0,
                null,
                "TEST",
                LocalDateTime.now().plusDays(10)
        );
        gift = customerGiftRepository.save(gift);

        CreateOrderRequest req = new CreateOrderRequest();
        req.setDeliveryAddressText("123 Phố Cổ");
        req.setPaymentMethod("VIETQR");
        req.setAppliedGiftId(gift.getCode());

        CreateOrderItemRequest item = new CreateOrderItemRequest();
        item.setDishId(activeDish1.getId());
        item.setQuantity(1);
        req.setItems(List.of(item));

        Order order = orderService.createOrder(testUser.getId(), req);
        paymentSettlementHelper.settleOrderDirectly(order, "[Settle Before Cancel]");

        // Sau khi thanh toán, quà đã USED
        CustomerGift giftUsed = customerGiftRepository.findById(gift.getId()).orElseThrow();
        assertEquals("USED", giftUsed.getStatus());

        // Hủy đơn đã PAID -> Chuyển CANCELLED và REFUND_PENDING (Chưa hoàn điểm ngay để đối soát kế toán)
        Order cancelledOrder = orderService.cancelOrder(order.getId(), "Khách đổi ý");
        assertEquals("CANCELLED", cancelledOrder.getStatus());
        assertEquals("REFUND_PENDING", cancelledOrder.getPaymentStatus());

        CustomerGift giftPending = customerGiftRepository.findById(gift.getId()).orElseThrow();
        assertEquals("USED", giftPending.getStatus(), "Quà vẫn giữ trạng thái USED khi đang chờ hoàn tiền");

        // Admin xác nhận hoàn tiền -> Chuyển REFUNDED, hoàn trả điểm và giải phóng vé quà
        Order refundedOrder = orderService.confirmRefund(order.getId(), "admin-01", order.getFinalAmount(), "TX-REF-999", "Đã chuyển khoản hoàn tiền");
        assertEquals("REFUNDED", refundedOrder.getPaymentStatus());
        assertNotNull(refundedOrder.getRefundedAt());

        // Quà phải được giải phóng trở lại AVAILABLE
        CustomerGift giftReleased = customerGiftRepository.findById(gift.getId()).orElseThrow();
        assertEquals("AVAILABLE", giftReleased.getStatus());
        assertNull(giftReleased.getOrderId());
        assertNull(giftReleased.getUsedAt());

        // Điểm phải có bản ghi REVERT_CANCEL
        LoyaltyAccount loyalty = loyaltyAccountRepository.findByUserId(testUser.getId()).orElseThrow();
        List<LoyaltyTransaction> txs = loyaltyTransactionRepository.findByLoyaltyAccountIdOrderByCreatedAtDesc(loyalty.getId());
        boolean hasRevert = txs.stream().anyMatch(t -> "REVERT_CANCEL".equals(t.getType()) && order.getId().equals(t.getOrderId()));
        assertTrue(hasRevert, "Phải có giao dịch hoàn trả điểm REVERT_CANCEL");
    }

    @Test
    @DisplayName("P0-7: 2 đơn hàng đồng thời tranh chấp giữ chỗ 1 vé quà -> Đúng 1 đơn giữ thành công, đơn kia trả giá gốc")
    void testConcurrentGiftReservation_OnlyOneSucceeds() throws Exception {
        CustomerGift gift = new CustomerGift(
                testUser,
                "TRIKY-RACE-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase(),
                "Voucher Tranh Chấp",
                "Mô tả",
                "Phiếu Giảm Giá",
                "DISCOUNT_CASH",
                null,
                null,
                20000.0,
                50000.0,
                null,
                "TEST",
                LocalDateTime.now().plusDays(5)
        );
        CustomerGift savedGift = customerGiftRepository.save(gift);
        final String giftCode = savedGift.getCode();

        int threadCount = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CyclicBarrier barrier = new CyclicBarrier(threadCount);
        List<Future<Order>> futures = new ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            futures.add(executor.submit(() -> {
                barrier.await(5, TimeUnit.SECONDS);
                CreateOrderRequest req = new CreateOrderRequest();
                req.setDeliveryAddressText("123 Phố Cổ");
                req.setPaymentMethod("COD");
                req.setAppliedGiftId(giftCode);

                CreateOrderItemRequest item = new CreateOrderItemRequest();
                item.setDishId(activeDish1.getId());
                item.setQuantity(1);
                req.setItems(List.of(item));

                return orderService.createOrder(testUser.getId(), req);
            }));
        }

        List<Order> createdOrders = new ArrayList<>();
        for (Future<Order> f : futures) {
            createdOrders.add(f.get(10, TimeUnit.SECONDS));
        }
        executor.shutdown();

        long discountedOrdersCount = createdOrders.stream()
                .filter(o -> o.getDiscountAmount() != null && o.getDiscountAmount() > 0)
                .count();
        assertEquals(1, discountedOrdersCount, "Chính xác 1 đơn hàng được áp dụng giảm giá vé quà");

        long fullPriceOrdersCount = createdOrders.stream()
                .filter(o -> o.getDiscountAmount() == null || o.getDiscountAmount() == 0.0)
                .count();
        assertEquals(1, fullPriceOrdersCount, "Đơn hàng còn lại phải thanh toán đủ giá gốc do vé quà đã bị giữ chỗ");
    }

    @Test
    @DisplayName("P0-8: Quyết toán trên đơn hàng đã bị hủy -> Bị CAS từ chối, không thể hồi sinh thành PAID/CONFIRMED")
    void testSettlementOnCancelledOrder_RejectedByCAS() {
        CreateOrderRequest req = new CreateOrderRequest();
        req.setGuestName("Khách Hủy");
        req.setGuestPhone("0988776655");
        req.setDeliveryAddressText("123 Phố Cổ");
        req.setPaymentMethod("VIETQR");

        CreateOrderItemRequest item = new CreateOrderItemRequest();
        item.setDishId(activeDish1.getId());
        item.setQuantity(1);
        req.setItems(List.of(item));

        Order order = orderService.createOrder(null, req);
        orderService.cancelOrder(order.getId(), "Khách đổi ý trước khi trả tiền");

        // Webhook đến trễ sau khi đơn đã bị hủy
        boolean settled = paymentSettlementHelper.settleOrderDirectly(order, "[Delayed Webhook Replay]");
        assertFalse(settled, "CAS bắt buộc phải từ chối quyết toán trên đơn hàng CANCELLED");

        Order orderAfter = orderRepository.findById(order.getId()).orElseThrow();
        assertEquals("CANCELLED", orderAfter.getStatus(), "Trạng thái đơn vẫn phải là CANCELLED");
        assertNotEquals("PAID", orderAfter.getPaymentStatus(), "PaymentStatus không được phép đổi sang PAID");
    }
}

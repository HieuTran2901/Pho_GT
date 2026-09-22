package com.pho1986.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pho1986.backend.model.dto.OrderDtos.CreateOrderItemRequest;
import com.pho1986.backend.model.dto.PaymentDtos.ConfirmPaymentRequest;
import com.pho1986.backend.model.dto.PaymentDtos.CreatePaymentRequest;
import com.pho1986.backend.model.entity.Dish;
import com.pho1986.backend.model.entity.Order;
import com.pho1986.backend.model.entity.OrderItem;
import com.pho1986.backend.repository.DishRepository;
import com.pho1986.backend.repository.OrderRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import org.springframework.beans.factory.annotation.Value;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class PaymentSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DishRepository dishRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Value("${app.payment.webhook-secret:pho1986_webhook_secret_key_prod_auth_2026}")
    private String webhookSecret;

    private String createPendingPayment(String orderCode) throws Exception {
        CreatePaymentRequest createReq = new CreatePaymentRequest();
        createReq.setOrderCode(orderCode);
        createReq.setPaymentMethod("VIETQR");

        CreateOrderItemRequest item = new CreateOrderItemRequest();
        item.setDishId("dish-01-pho-bo-tai-lan-hn");
        item.setQuantity(2);
        createReq.setItems(List.of(item));

        MvcResult result = mockMvc.perform(post("/api/v1/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).get("data").get("paymentCode").asText();
    }

    @Test
    @DisplayName("Security: Từ chối xác nhận thanh toán khi Secret Key để chuỗi rỗng '' -> 403 Forbidden")
    void testConfirmPaymentEmptySecretKeyRejected() throws Exception {
        String paymentCode = createPendingPayment("PHO-TEST-SEC-01");

        ConfirmPaymentRequest request = new ConfirmPaymentRequest();
        request.setSecretKey("");
        request.setAmount(130000.0);

        mockMvc.perform(post("/api/v1/payments/" + paymentCode + "/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Secret Key không được để trống")));
    }

    @Test
    @DisplayName("Security: Từ chối xác nhận thanh toán khi Secret Key chỉ chứa khoảng trắng '   ' -> 403 Forbidden")
    void testConfirmPaymentWhitespaceSecretKeyRejected() throws Exception {
        String paymentCode = createPendingPayment("PHO-TEST-SEC-02");

        ConfirmPaymentRequest request = new ConfirmPaymentRequest();
        request.setSecretKey("   ");
        request.setAmount(130000.0);

        mockMvc.perform(post("/api/v1/payments/" + paymentCode + "/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Secret Key không được để trống")));
    }

    @Test
    @DisplayName("Security: Từ chối xác nhận thanh toán khi Secret Key bị null/thiếu -> 403 Forbidden")
    void testConfirmPaymentNullSecretKeyRejected() throws Exception {
        String paymentCode = createPendingPayment("PHO-TEST-SEC-03");

        ConfirmPaymentRequest request = new ConfirmPaymentRequest();
        request.setSecretKey(null);
        request.setAmount(130000.0);

        mockMvc.perform(post("/api/v1/payments/" + paymentCode + "/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Secret Key không được để trống")));
    }

    @Test
    @DisplayName("Security: Từ chối xác nhận thanh toán khi Secret Key quá ngắn (< 32 ký tự) -> 403 Forbidden")
    void testConfirmPaymentShortSecretKeyRejected() throws Exception {
        String paymentCode = createPendingPayment("PHO-TEST-SEC-04");

        ConfirmPaymentRequest request = new ConfirmPaymentRequest();
        request.setSecretKey("short_secret_under_32_chars");
        request.setAmount(130000.0);

        mockMvc.perform(post("/api/v1/payments/" + paymentCode + "/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Secret Key không hợp lệ")));
    }

    @Test
    @WithMockUser(username = "0999999999", roles = {"ADMIN"})
    @DisplayName("Security: Quản trị viên ROLE_ADMIN được quyền xác nhận thanh toán mà không cần Secret Key")
    void testConfirmPaymentByAdminSuccess() throws Exception {
        String paymentCode = createPendingPayment("PHO-TEST-SEC-05");

        ConfirmPaymentRequest request = new ConfirmPaymentRequest();
        request.setAmount(130000.0);
        request.setTransactionRef("ADMIN-MANUAL-CONFIRM-01");

        mockMvc.perform(post("/api/v1/payments/" + paymentCode + "/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("SUCCESS")));
    }

    @Test
    @DisplayName("Anti-Tampering: Giá client gửi lên (unitPrice=1000đ) bị triệt tiêu, tính 100% theo DB (65000đ x 3 = 195000đ)")
    void testCreatePaymentTamperedClientPriceIsIgnored() throws Exception {
        CreatePaymentRequest createReq = new CreatePaymentRequest();
        createReq.setOrderCode("PHO-TAMPER-PRICE-01");
        createReq.setPaymentMethod("VIETQR");

        CreateOrderItemRequest item = new CreateOrderItemRequest();
        item.setDishId("dish-01-pho-bo-tai-lan-hn"); // Giá trong DB là 65.000đ
        item.setUnitPrice(1000.0); // Client cố tình can thiệp giá 1.000đ
        item.setQuantity(3);
        createReq.setItems(List.of(item));

        MvcResult result = mockMvc.perform(post("/api/v1/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.amount", is(195000.0)))
                .andReturn();

        double returnedAmount = objectMapper.readTree(result.getResponse().getContentAsString()).get("data").get("amount").asDouble();
        assertEquals(195000.0, returnedAmount, "Số tiền bắt buộc phải là 195.000đ từ server database!");
    }

    @Test
    @DisplayName("Anti-Tampering: Gửi dishId không tồn tại trong DB -> Chặn ngay 400 Bad Request")
    void testCreatePaymentNonExistentDishIdRejected() throws Exception {
        CreatePaymentRequest createReq = new CreatePaymentRequest();
        createReq.setOrderCode("PHO-TAMPER-DISH-01");
        createReq.setPaymentMethod("VIETQR");

        CreateOrderItemRequest item = new CreateOrderItemRequest();
        item.setDishId("fake-dish-id-999999");
        item.setQuantity(1);
        createReq.setItems(List.of(item));

        mockMvc.perform(post("/api/v1/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Món ăn không tồn tại")));
    }

    @Test
    @DisplayName("Anti-Tampering: Gửi món ăn tạm hết hàng (isAvailable=false) -> Chặn ngay 400 Bad Request")
    void testCreatePaymentUnavailableDishRejected() throws Exception {
        Dish dish = dishRepository.findById("dish-01-pho-bo-tai-lan-hn").orElseThrow();
        dish.setIsAvailable(false);
        dishRepository.save(dish);

        try {
            CreatePaymentRequest createReq = new CreatePaymentRequest();
            createReq.setOrderCode("PHO-TAMPER-UNAVAIL-01");
            createReq.setPaymentMethod("VIETQR");

            CreateOrderItemRequest item = new CreateOrderItemRequest();
            item.setDishId("dish-01-pho-bo-tai-lan-hn");
            item.setQuantity(1);
            createReq.setItems(List.of(item));

            mockMvc.perform(post("/api/v1/payments")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createReq)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success", is(false)))
                    .andExpect(jsonPath("$.message", containsString("tạm hết hàng")));
        } finally {
            dish.setIsAvailable(true);
            dishRepository.save(dish);
        }
    }

    private String computeHmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    @Test
    @DisplayName("Security: Xác thực chữ ký HMAC-SHA256 hợp lệ qua Header X-Signature -> Thành công HTTP 200")
    void testConfirmPaymentValidHmacSha256HeaderSuccess() throws Exception {
        String paymentCode = createPendingPayment("PHO-TEST-HMAC-01");
        double amount = 130000.0;
        String payload = paymentCode + "|" + String.format(java.util.Locale.ROOT, "%.0f", amount);
        String validSignature = computeHmacSha256(payload, webhookSecret);

        ConfirmPaymentRequest request = new ConfirmPaymentRequest();
        request.setAmount(amount);

        mockMvc.perform(post("/api/v1/payments/" + paymentCode + "/confirm")
                        .header("X-Signature", validSignature)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("SUCCESS")));
    }

    @Test
    @DisplayName("Security: Từ chối chữ ký HMAC-SHA256 giả mạo / sai lệch qua Header X-Signature -> 403 Forbidden")
    void testConfirmPaymentTamperedHmacSha256HeaderRejected() throws Exception {
        String paymentCode = createPendingPayment("PHO-TEST-HMAC-02");
        String fakeSignature = "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789";

        ConfirmPaymentRequest request = new ConfirmPaymentRequest();
        request.setAmount(130000.0);

        mockMvc.perform(post("/api/v1/payments/" + paymentCode + "/confirm")
                        .header("X-Signature", fakeSignature)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Secret Key không hợp lệ")));
    }

    @Test
    @DisplayName("Security: Giao dịch đã thanh toán (SUCCESS) vẫn chặn người gọi không xác thực gửi secret sai -> 403 Forbidden")
    void testConfirmPaymentAlreadyPaidRejectsUnauthorizedCaller() throws Exception {
        String paymentCode = createPendingPayment("PHO-TEST-ALREADY-PAID-01");

        // Xác nhận hợp lệ lần 1 bằng Secret Key chuẩn
        ConfirmPaymentRequest validReq = new ConfirmPaymentRequest();
        validReq.setSecretKey(webhookSecret);
        validReq.setAmount(130000.0);

        mockMvc.perform(post("/api/v1/payments/" + paymentCode + "/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("SUCCESS")));

        // Lần 2: Kẻ tấn công không có secret hợp lệ cố tình truy vấn xác nhận -> BẮT BUỘC BỊ CHẶN 403
        ConfirmPaymentRequest invalidReq = new ConfirmPaymentRequest();
        invalidReq.setSecretKey("wrong_attacker_secret_key_12345678901234");
        invalidReq.setAmount(130000.0);

        mockMvc.perform(post("/api/v1/payments/" + paymentCode + "/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("Anti-Tampering: Gửi số lượng món ăn <= 0 (quantity=0 hoặc âm) -> Chặn ngay 400 Bad Request")
    void testCreatePaymentZeroOrNegativeQuantityRejected() throws Exception {
        CreatePaymentRequest createReq = new CreatePaymentRequest();
        createReq.setOrderCode("PHO-TAMPER-QTY-01");
        createReq.setPaymentMethod("VIETQR");

        CreateOrderItemRequest item = new CreateOrderItemRequest();
        item.setDishId("dish-01-pho-bo-tai-lan-hn");
        item.setQuantity(0);
        createReq.setItems(List.of(item));

        mockMvc.perform(post("/api/v1/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Số lượng món ăn phải lớn hơn 0")));
    }

    @Test
    @DisplayName("Anti-Tampering: Đơn chỉ có đồ uống cố tình đặt bàn (tableNumber) -> Chặn 400 vì thiếu món chính")
    void testCreatePaymentDrinksOnlyCannotReserveTable() throws Exception {
        CreatePaymentRequest createReq = new CreatePaymentRequest();
        createReq.setOrderCode("PHO-TAMPER-DRINKS-TABLE-01");
        createReq.setPaymentMethod("VIETQR");
        createReq.setTableNumber("B01");

        CreateOrderItemRequest drinkItem = new CreateOrderItemRequest();
        drinkItem.setDishId("dish-22-tra-sen-tay-ho"); // Thức uống, không phải món chính
        drinkItem.setQuantity(2);
        createReq.setItems(List.of(drinkItem));

        mockMvc.perform(post("/api/v1/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("món ăn chính")));
    }

    @Test
    @DisplayName("Anti-Tampering: Đơn hàng chỉ gồm đồ uống không áp dụng ưu đãi/giữ bàn -> Được phép thanh toán (20000đ x 2 = 40000đ)")
    void testCreatePaymentDrinksOnlyWithoutTableOrVoucherAllowed() throws Exception {
        CreatePaymentRequest createReq = new CreatePaymentRequest();
        createReq.setOrderCode("PHO-DRINKS-ONLY-01");
        createReq.setPaymentMethod("VIETQR");

        CreateOrderItemRequest drinkItem = new CreateOrderItemRequest();
        drinkItem.setDishId("dish-22-tra-sen-tay-ho");
        drinkItem.setQuantity(2);
        createReq.setItems(List.of(drinkItem));

        MvcResult result = mockMvc.perform(post("/api/v1/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.amount", is(40000.0)))
                .andReturn();

        double returnedAmount = objectMapper.readTree(result.getResponse().getContentAsString()).get("data").get("amount").asDouble();
        assertEquals(40000.0, returnedAmount, "Đơn hàng chỉ có đồ uống phải được tính đúng 40.000đ từ database!");
    }

    @Test
    @DisplayName("Anti-Tampering: Đơn chỉ có đồ uống cố tình áp dụng ưu đãi (appliedGiftId) -> Chặn 400 vì thiếu món chính")
    void testCreatePaymentDrinksOnlyWithVoucherRejected() throws Exception {
        CreatePaymentRequest createReq = new CreatePaymentRequest();
        createReq.setOrderCode("PHO-TAMPER-DRINKS-GIFT-01");
        createReq.setPaymentMethod("VIETQR");
        createReq.setAppliedGiftId("VOUCHER-TEST");

        CreateOrderItemRequest drinkItem = new CreateOrderItemRequest();
        drinkItem.setDishId("dish-22-tra-sen-tay-ho");
        drinkItem.setQuantity(2);
        createReq.setItems(List.of(drinkItem));

        mockMvc.perform(post("/api/v1/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("món ăn chính")));
    }

    @Test
    @DisplayName("Anti-Tampering: Đơn hàng đã tồn tại bị can thiệp giá (1000đ) khi thanh toán không gửi kèm items -> Phải tính lại 100% từ DB (65000đ)")
    void testCreatePaymentExistingOrderTamperedPricesRecalculatedFromDb() throws Exception {
        String orderCode = "PHO-EXISTING-TAMPER-01";
        Order order = new Order();
        order.setOrderCode(orderCode);
        order.setPaymentMethod("VIETQR");
        order.setGuestName("Khách Thử Nghiệm");
        order.setGuestPhone("0987654321");
        order.setDeliveryAddressText("10 Lý Quốc Sư, Hoàn Kiếm, Hà Nội");
        // Giả lập đơn hàng trong DB bị can thiệp giá 1.000đ
        order.setTotalAmount(1000.0);
        order.setFinalAmount(1000.0);

        OrderItem item = new OrderItem("dish-01-pho-bo-tai-lan-hn", "Phở Bò Tái Lăn", 1000.0, 1, 1000.0, null);
        order.addItem(item);
        orderRepository.save(order);

        CreatePaymentRequest createReq = new CreatePaymentRequest();
        createReq.setOrderCode(orderCode);
        createReq.setPaymentMethod("VIETQR");

        MvcResult result = mockMvc.perform(post("/api/v1/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.amount", is(65000.0)))
                .andReturn();

        double returnedAmount = objectMapper.readTree(result.getResponse().getContentAsString()).get("data").get("amount").asDouble();
        assertEquals(65000.0, returnedAmount, "Đơn hàng đã tồn tại bắt buộc phải được tính lại 100% từ DB là 65.000đ!");
    }

    @Test
    @DisplayName("Security: Xác thực chữ ký HMAC-SHA256 gửi trong trường signature của JSON body -> Thành công HTTP 200")
    void testConfirmPaymentValidSignatureInBodySuccess() throws Exception {
        String paymentCode = createPendingPayment("PHO-TEST-HMAC-BODY-01");
        double amount = 130000.0;
        String payload = paymentCode + "|" + String.format(java.util.Locale.ROOT, "%.0f", amount);
        String validSignature = computeHmacSha256(payload, webhookSecret);

        ConfirmPaymentRequest request = new ConfirmPaymentRequest();
        request.setAmount(amount);
        request.setSignature(validSignature);

        mockMvc.perform(post("/api/v1/payments/" + paymentCode + "/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("SUCCESS")));
    }

    @Test
    @DisplayName("Security: Không có thông tin xác thực (không header, không body) -> Bị chặn 403 Forbidden")
    void testConfirmPaymentUnauthenticatedNoCredentialsRejected() throws Exception {
        String paymentCode = createPendingPayment("PHO-TEST-NOCRED-01");

        mockMvc.perform(post("/api/v1/payments/" + paymentCode + "/confirm"))
                .andExpect(status().isForbidden());
    }
}

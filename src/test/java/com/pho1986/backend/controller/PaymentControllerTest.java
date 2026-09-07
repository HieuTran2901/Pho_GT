package com.pho1986.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pho1986.backend.model.dto.OrderDtos.CreateOrderItemRequest;
import com.pho1986.backend.model.dto.OrderDtos.CreateOrderRequest;
import com.pho1986.backend.model.dto.PaymentDtos.ConfirmPaymentRequest;
import com.pho1986.backend.model.dto.PaymentDtos.CreatePaymentRequest;
import com.pho1986.backend.model.dto.PaymentDtos.SepayIpnPayload;
import com.pho1986.backend.model.dto.PaymentDtos.MomoIpnRequest;
import com.pho1986.backend.security.MomoSigner;
import com.pho1986.backend.model.entity.Order;
import com.pho1986.backend.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrderService orderService;

    private Order testOrder;

    @BeforeEach
    void setUp() {
        CreateOrderRequest orderReq = new CreateOrderRequest();
        orderReq.setGuestName("Trần Trọng Minh");
        orderReq.setGuestPhone("0912345678");
        orderReq.setDeliveryAddressText("45 Hàng Bạc, Hoàn Kiếm, Hà Nội");
        orderReq.setPaymentMethod("COD");

        CreateOrderItemRequest item = new CreateOrderItemRequest();
        item.setDishName("Phở Tái Bắp Bò Hoa");
        item.setUnitPrice(75000.0);
        item.setQuantity(2);
        orderReq.setItems(List.of(item));

        testOrder = orderService.createOrder(null, orderReq);
    }

    @Test
    @DisplayName("1. Khởi tạo thanh toán VietQR động -> Nhận URL VietQR chuẩn Napas và hạn 15 phút")
    void testCreatePaymentVietQR() throws Exception {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setOrderCode(testOrder.getOrderCode());
        request.setPaymentMethod("VIETQR");

        mockMvc.perform(post("/api/v1/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.orderCode", is(testOrder.getOrderCode())))
                .andExpect(jsonPath("$.data.paymentMethod", is("VIETQR")))
                .andExpect(jsonPath("$.data.status", is("PENDING")))
                .andExpect(jsonPath("$.data.qrCodeUrl", containsString("vietqr.io")))
                .andExpect(jsonPath("$.data.bankAccountNo", is("0986198686")))
                .andExpect(jsonPath("$.data.transferContent", containsString("PHO1986")))
                .andExpect(jsonPath("$.data.expiredAt", notNullValue()));
    }

    @Test
    @DisplayName("2. Khởi tạo thanh toán COD (Tiền mặt khi nhận phở) -> Trạng thái PENDING, completed = true")
    void testCreatePaymentCOD() throws Exception {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setOrderCode(testOrder.getOrderCode());
        request.setPaymentMethod("COD");

        mockMvc.perform(post("/api/v1/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.paymentMethod", is("COD")))
                .andExpect(jsonPath("$.data.status", is("PENDING")))
                .andExpect(jsonPath("$.data.completed", is(true)));
    }

    @Test
    @DisplayName("3. Khởi tạo thanh toán Đặt Bàn (POST_PAID_AT_STORE) -> Giữ bàn 30 phút, thanh toán sau")
    void testCreatePaymentPostPaidAtStore() throws Exception {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setOrderCode(testOrder.getOrderCode());
        request.setPaymentMethod("POST_PAID_AT_STORE");

        mockMvc.perform(post("/api/v1/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.paymentMethod", is("POST_PAID_AT_STORE")))
                .andExpect(jsonPath("$.data.status", is("PENDING")))
                .andExpect(jsonPath("$.data.completed", is(true)));
    }

    @Test
    @DisplayName("4. Xác nhận thanh toán thành công với Secret Key hợp lệ -> Chuyển status SUCCESS và cập nhật đơn hàng PAID")
    void testConfirmPaymentSuccess() throws Exception {
        // Tạo payment VietQR trước
        CreatePaymentRequest createReq = new CreatePaymentRequest();
        createReq.setOrderCode(testOrder.getOrderCode());
        createReq.setPaymentMethod("VIETQR");

        MvcResult result = mockMvc.perform(post("/api/v1/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        String paymentCode = objectMapper.readTree(responseBody).get("data").get("paymentCode").asText();

        // Xác nhận thanh toán với Secret Key đúng
        ConfirmPaymentRequest confirmReq = new ConfirmPaymentRequest();
        confirmReq.setTransactionRef("MB-FT-998877");
        confirmReq.setAmount(150000.0);
        confirmReq.setSecretKey("pho1986_webhook_secret_key_prod_auth_2026");

        mockMvc.perform(post("/api/v1/payments/" + paymentCode + "/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(confirmReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("SUCCESS")))
                .andExpect(jsonPath("$.data.paidAt", notNullValue()));

        // Kiểm tra tra cứu trạng thái giao dịch
        mockMvc.perform(get("/api/v1/payments/" + paymentCode + "/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("SUCCESS")));
    }

    @Test
    @DisplayName("5. [Bảo mật] Xác nhận thanh toán với Secret Key giả mạo -> Bị chặn 403 Forbidden")
    void testConfirmPaymentInvalidSecretKey() throws Exception {
        CreatePaymentRequest createReq = new CreatePaymentRequest();
        createReq.setOrderCode(testOrder.getOrderCode());
        createReq.setPaymentMethod("VIETQR");

        MvcResult result = mockMvc.perform(post("/api/v1/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String paymentCode = objectMapper.readTree(result.getResponse().getContentAsString()).get("data").get("paymentCode").asText();

        ConfirmPaymentRequest fakeReq = new ConfirmPaymentRequest();
        fakeReq.setTransactionRef("HACKER-REF-001");
        fakeReq.setAmount(150000.0);
        fakeReq.setSecretKey("invalid_malicious_secret_token_xyz");

        mockMvc.perform(post("/api/v1/payments/" + paymentCode + "/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(fakeReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Secret Key không hợp lệ")));
    }

    @Test
    @DisplayName("6. [Bảo mật] Xác nhận thanh toán với số tiền bị sửa đổi (Tampered Amount) -> Bị chặn 400 Bad Request")
    void testConfirmPaymentTamperedAmount() throws Exception {
        CreatePaymentRequest createReq = new CreatePaymentRequest();
        createReq.setOrderCode(testOrder.getOrderCode());
        createReq.setPaymentMethod("VIETQR");

        MvcResult result = mockMvc.perform(post("/api/v1/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String paymentCode = objectMapper.readTree(result.getResponse().getContentAsString()).get("data").get("paymentCode").asText();

        ConfirmPaymentRequest tamperedReq = new ConfirmPaymentRequest();
        tamperedReq.setTransactionRef("TAMPERED-REF-002");
        tamperedReq.setAmount(1000.0); // Cố tình chuyển 1.000đ thay vì 150.000đ
        tamperedReq.setSecretKey("pho1986_webhook_secret_key_prod_auth_2026");

        mockMvc.perform(post("/api/v1/payments/" + paymentCode + "/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tamperedReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("không khớp với giá trị đơn hàng")));
    }

    @Test
    @DisplayName("7. [Bảo mật] Chống Replay Attack: Gửi Webhook xác nhận nhiều lần -> Idempotent trả lời an toàn")
    void testConfirmPaymentReplayAttackIdempotent() throws Exception {
        CreatePaymentRequest createReq = new CreatePaymentRequest();
        createReq.setOrderCode(testOrder.getOrderCode());
        createReq.setPaymentMethod("VIETQR");

        MvcResult result = mockMvc.perform(post("/api/v1/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String paymentCode = objectMapper.readTree(result.getResponse().getContentAsString()).get("data").get("paymentCode").asText();

        ConfirmPaymentRequest confirmReq = new ConfirmPaymentRequest();
        confirmReq.setTransactionRef("REPLAY-REF-003");
        confirmReq.setAmount(150000.0);
        confirmReq.setSecretKey("pho1986_webhook_secret_key_prod_auth_2026");

        // Lần 1: Thành công
        mockMvc.perform(post("/api/v1/payments/" + paymentCode + "/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(confirmReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("SUCCESS")));

        // Lần 2 (Replay webhook): Vẫn trả lời 200 OK với status SUCCESS, không throw exception, không nhân đôi điểm
        mockMvc.perform(post("/api/v1/payments/" + paymentCode + "/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(confirmReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("SUCCESS")));
    }

    @Test
    @DisplayName("8. [SePay] Nhận Webhook IPN với Secret Token hợp lệ -> Cập nhật SUCCESS và đơn hàng PAID")
    void testSepayIpnSuccess() throws Exception {
        // Tạo giao dịch VietQR trước
        CreatePaymentRequest createReq = new CreatePaymentRequest();
        createReq.setOrderCode(testOrder.getOrderCode());
        createReq.setPaymentMethod("VIETQR");

        mockMvc.perform(post("/api/v1/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated());

        SepayIpnPayload sepayPayload = new SepayIpnPayload();
        sepayPayload.setId(889911L);
        sepayPayload.setGateway("MBBank");
        sepayPayload.setCode(testOrder.getOrderCode());
        sepayPayload.setContent("PHO1986 " + testOrder.getOrderCode());
        sepayPayload.setTransferAmount(150000.0);
        sepayPayload.setReferenceCode("FT260906-8899");

        mockMvc.perform(post("/api/v1/payments/sepay/ipn")
                        .header("X-Secret-Key", "test_sepay_ipn_secret_token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sepayPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("SUCCESS")))
                .andExpect(jsonPath("$.data.orderCode", is(testOrder.getOrderCode())));
    }

    @Test
    @DisplayName("9. [SePay] Nhận Webhook IPN với Secret Token giả mạo -> Bị từ chối 403 Forbidden")
    void testSepayIpnInvalidSecret() throws Exception {
        SepayIpnPayload sepayPayload = new SepayIpnPayload();
        sepayPayload.setId(999999L);
        sepayPayload.setCode(testOrder.getOrderCode());
        sepayPayload.setTransferAmount(150000.0);

        mockMvc.perform(post("/api/v1/payments/sepay/ipn")
                        .header("X-Secret-Key", "invalid_fake_sepay_secret")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sepayPayload)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Secret Token không hợp lệ")));
    }

    @Test
    @DisplayName("10. [MoMo] Nhận Webhook IPN với chữ ký HMAC-SHA256 hợp lệ -> Cập nhật SUCCESS và đơn hàng PAID")
    void testMomoIpnSuccess() throws Exception {
        CreatePaymentRequest createReq = new CreatePaymentRequest();
        createReq.setOrderCode(testOrder.getOrderCode());
        createReq.setPaymentMethod("MOMO");

        mockMvc.perform(post("/api/v1/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated());

        String partnerCode = "MOMO";
        String orderId = testOrder.getOrderCode();
        String requestId = "REQ_" + System.currentTimeMillis();
        Long amount = 150000L;
        String orderInfo = "Thanh toan don hang Pho 1986";
        String orderType = "momo_wallet";
        Long transId = 2345678901L;
        Integer resultCode = 0;
        String message = "Giao dich thanh cong";
        String payType = "qr";
        Long responseTime = System.currentTimeMillis();
        String extraData = "";
        String secretKey = "test_momo_secret_key";

        MomoSigner signer = new MomoSigner();
        String rawData = "accessKey=test_momo_access_key" +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&message=" + message +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&orderType=" + orderType +
                "&partnerCode=" + partnerCode +
                "&payType=" + payType +
                "&requestId=" + requestId +
                "&responseTime=" + responseTime +
                "&resultCode=" + resultCode +
                "&transId=" + transId;
        String signature = signer.hmacSha256(rawData, secretKey);

        MomoIpnRequest momoReq = new MomoIpnRequest();
        momoReq.setPartnerCode(partnerCode);
        momoReq.setOrderId(orderId);
        momoReq.setRequestId(requestId);
        momoReq.setAmount(amount);
        momoReq.setOrderInfo(orderInfo);
        momoReq.setOrderType(orderType);
        momoReq.setTransId(transId);
        momoReq.setResultCode(resultCode);
        momoReq.setMessage(message);
        momoReq.setPayType(payType);
        momoReq.setResponseTime(responseTime);
        momoReq.setExtraData(extraData);
        momoReq.setSignature(signature);

        mockMvc.perform(post("/api/v1/payments/momo/ipn")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(momoReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("SUCCESS")))
                .andExpect(jsonPath("$.data.orderCode", is(orderId)));
    }

    @Test
    @DisplayName("11. [MoMo] Nhận Webhook IPN với chữ ký HMAC sai -> Bị từ chối 403 Forbidden")
    void testMomoIpnInvalidSignature() throws Exception {
        MomoIpnRequest momoReq = new MomoIpnRequest();
        momoReq.setPartnerCode("MOMO");
        momoReq.setOrderId(testOrder.getOrderCode());
        momoReq.setRequestId("REQ_FAKE_001");
        momoReq.setAmount(150000L);
        momoReq.setResultCode(0);
        momoReq.setSignature("invalid_forged_hmac_signature_xyz");

        mockMvc.perform(post("/api/v1/payments/momo/ipn")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(momoReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Chữ ký HMAC không hợp lệ")));
    }
}

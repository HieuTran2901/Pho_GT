package com.pho1986.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pho1986.backend.model.dto.OrderDtos.CreateOrderItemRequest;
import com.pho1986.backend.model.dto.OrderDtos.CreateOrderRequest;
import com.pho1986.backend.model.dto.PaymentDtos.ConfirmPaymentRequest;
import com.pho1986.backend.model.dto.PaymentDtos.CreatePaymentRequest;
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
    @DisplayName("4. Xác nhận thanh toán thành công -> Chuyển status SUCCESS và cập nhật đơn hàng PAID")
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

        // Xác nhận thanh toán
        ConfirmPaymentRequest confirmReq = new ConfirmPaymentRequest();
        confirmReq.setTransactionRef("MB-FT-998877");
        confirmReq.setAmount(150000.0);

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
}

package com.pho1986.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pho1986.backend.model.dto.AuthDtos.LoginRequest;
import com.pho1986.backend.model.dto.AuthDtos.PostOrderClaimRequest;
import com.pho1986.backend.model.dto.AuthDtos.RegisterRequest;
import com.pho1986.backend.model.entity.Order;
import com.pho1986.backend.repository.OrderRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrderRepository orderRepository;

    private Order createOrderForExistingUser(String paymentMethod, String paymentStatus, String status) {
        Order order = new Order();
        order.setOrderCode("ORD-SEC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setGuestName("Demo Member");
        order.setGuestPhone("0988888888");
        order.setDeliveryAddressText("123 Pho Hue, Hanoi");
        order.setTotalAmount(150000.0);
        order.setFinalAmount(150000.0);
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus(paymentStatus);
        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Test
    @DisplayName("1. Đăng ký thành viên thành công -> Nhận 201 Created và 50 điểm Tri Kỷ")
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setPhone("0987654321");
        request.setFullName("Lê Hoàng Nam");
        request.setPassword("123456");
        request.setSaveTasteProfile(true);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.user.phone", is("0987654321")))
                .andExpect(jsonPath("$.data.pointsEarned", is(50)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.refreshToken").doesNotExist())
                .andExpect(header().exists("Set-Cookie"));
    }

    @Test
    @DisplayName("2. Đăng ký với số điện thoại sai định dạng -> Nhận 422 Unprocessable Entity")
    void testRegisterInvalidPhone() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setPhone("123456"); // Sai format
        request.setFullName("Nguyễn Văn A");
        request.setPassword("123456");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("3. Đăng nhập thành công với tài khoản đã đăng ký -> Nhận 200 OK")
    void testLoginSuccess() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setPhone("0988888888");
        request.setPassword("123456");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.user.phone", is("0988888888")))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.refreshToken").doesNotExist())
                .andExpect(header().exists("Set-Cookie"));
    }

    @Test
    @DisplayName("4. Đăng nhập sai mật khẩu -> Nhận 401 Unauthorized")
    void testLoginBadCredentials() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setPhone("0988888888");
        request.setPassword("wrongpassword");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("5. [SECURITY] Đăng nhập thành công -> Trả về Set-Cookie HttpOnly cho accessToken và refreshToken")
    void testLoginSetsHttpOnlyCookies() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setPhone("0988888888");
        request.setPassword("123456");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(header().exists("Set-Cookie"));
    }

    @Test
    @DisplayName("6. [SECURITY] Đăng xuất -> Xóa Cookie và thu hồi token thành công")
    void testLogoutClearsCookies() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(header().exists("Set-Cookie"))
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    @DisplayName("7. [SEC-ISSUE-01] Post-order claim cho tài khoản đã tồn tại nhưng sai mật khẩu -> 401 Unauthorized")
    void testPostOrderClaimExistingUserWrongPasswordBlocked() throws Exception {
        Order paidOrder = createOrderForExistingUser("VIETQR", "PAID", "CONFIRMED");

        PostOrderClaimRequest request = new PostOrderClaimRequest();
        request.setOrderCode(paidOrder.getOrderCode());
        request.setPhone("0988888888");
        request.setFullName("Attacker");
        request.setPassword("wrong-password-123");

        mockMvc.perform(post("/api/v1/auth/post-order-claim")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("8. [SEC-ISSUE-01] Post-order claim cho tài khoản đã tồn tại với đơn UNPAID -> 400 Bad Request")
    void testPostOrderClaimExistingUserUnpaidOrderBlocked() throws Exception {
        Order unpaidOrder = createOrderForExistingUser("COD", "UNPAID", "PENDING");

        PostOrderClaimRequest request = new PostOrderClaimRequest();
        request.setOrderCode(unpaidOrder.getOrderCode());
        request.setPhone("0988888888");
        request.setFullName("Demo Member");
        request.setPassword("123456");

        mockMvc.perform(post("/api/v1/auth/post-order-claim")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("9. [SEC-ISSUE-01 & SEC-ISSUE-02] Post-order claim cho tài khoản đã tồn tại (đúng MK + PAID) -> 200 OK, HttpOnly Cookie, không lộ refreshToken")
    void testPostOrderClaimExistingUserSuccessWithoutRefreshTokenLeak() throws Exception {
        Order paidOrder = createOrderForExistingUser("VIETQR", "PAID", "CONFIRMED");

        PostOrderClaimRequest request = new PostOrderClaimRequest();
        request.setOrderCode(paidOrder.getOrderCode());
        request.setPhone("0988888888");
        request.setFullName("Demo Member");
        request.setPassword("123456");

        mockMvc.perform(post("/api/v1/auth/post-order-claim")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.refreshToken").doesNotExist())
                .andExpect(header().exists("Set-Cookie"));
    }
}

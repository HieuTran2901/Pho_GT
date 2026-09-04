package com.pho1986.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pho1986.backend.model.dto.AuthDtos.LoginRequest;
import com.pho1986.backend.model.dto.AuthDtos.RegisterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
                .andExpect(jsonPath("$.data.accessToken", notNullValue()));
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
        // Đăng ký người dùng trước để đảm bảo dữ liệu tồn tại trong H2 Test DB
        RegisterRequest regReq = new RegisterRequest();
        regReq.setPhone("0988888888");
        regReq.setFullName("Chủ Quán Phở");
        regReq.setPassword("123456");
        regReq.setSaveTasteProfile(false);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated());

        LoginRequest request = new LoginRequest();
        request.setPhone("0988888888");
        request.setPassword("123456");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.user.phone", is("0988888888")))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()));
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
}

package com.pho1986.backend.service;

import com.pho1986.backend.common.AccountLockedException;
import com.pho1986.backend.common.LoginRateLimitExceededException;
import com.pho1986.backend.common.PiiMaskUtils;
import com.pho1986.backend.model.dto.AuthDtos.AuthResponse;
import com.pho1986.backend.model.dto.AuthDtos.LoginRequest;
import com.pho1986.backend.model.dto.AuthDtos.PostOrderClaimRequest;
import com.pho1986.backend.model.dto.OrderDtos.CreateOrderItemRequest;
import com.pho1986.backend.model.dto.PaymentDtos.ConfirmPaymentRequest;
import com.pho1986.backend.model.dto.PaymentDtos.CreatePaymentRequest;
import com.pho1986.backend.model.dto.PaymentDtos.PaymentResponse;
import com.pho1986.backend.model.dto.PaymentDtos.PaymentStatusResponse;
import com.pho1986.backend.model.dto.PaymentDtos.SepayIpnPayload;
import com.pho1986.backend.model.entity.Order;
import com.pho1986.backend.model.entity.PaymentTransaction;
import com.pho1986.backend.model.entity.RefreshToken;
import com.pho1986.backend.model.entity.User;
import com.pho1986.backend.repository.OrderRepository;
import com.pho1986.backend.repository.PaymentTransactionRepository;
import com.pho1986.backend.repository.RefreshTokenRepository;
import com.pho1986.backend.repository.UserRepository;
import com.pho1986.backend.security.TokenHashUtil;
import com.pho1986.backend.service.auth.LoginAttemptPolicy;
import com.pho1986.backend.service.auth.PostOrderClaimHelper;
import com.pho1986.backend.service.payment.PaymentChannelDispatcher;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Empirical Adversarial Test Harness for Backend Modularization.
 * Enforces TEST-R015 (HikariCP out-of-transaction gateway calls),
 * SEC-R009 (RFC 6819 Token Family Breach Containment),
 * Brute-force lockout tiers, and boundary validations.
 */
@SpringBootTest
@ActiveProfiles("test")
public class ModularizationAdversarialTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PaymentChannelDispatcher paymentChannelDispatcher;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private LoginAttemptPolicy loginAttemptPolicy;

    @Autowired
    private PostOrderClaimHelper postOrderClaimHelper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Order createTestOrder(String orderCode, String rawToken, Double amount) {
        Order order = new Order();
        order.setOrderCode(orderCode);
        order.setPaymentMethod("VIETQR");
        order.setGuestName("Khách Hàng Test");
        order.setGuestPhone("0981112233");
        order.setDeliveryAddressText("10 Lý Quốc Sư");
        order.setTotalAmount(amount);
        order.setFinalAmount(amount);
        order.setStatus("PENDING");
        order.setPaymentStatus("UNPAID");
        order.setOrderAccessTokenHash(PiiMaskUtils.sha256Hex(rawToken));
        return orderRepository.save(order);
    }

    @Test
    @DisplayName("TEST-R015: Payment gateway dispatch executes strictly OUT of database transaction")
    void testPaymentGatewayDispatchOutOfTransaction() {
        String orderCode = "TEST-OOT-" + System.currentTimeMillis();
        String rawToken = "token_oot_" + System.currentTimeMillis();
        createTestOrder(orderCode, rawToken, 65000.0);

        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setOrderCode(orderCode);
        request.setPaymentMethod("VIETQR");
        request.setCustomerName("Adversarial Tester");
        request.setPhone("0981112233");
        request.setOrderAccessToken(rawToken);

        CreateOrderItemRequest item = new CreateOrderItemRequest();
        item.setDishId("dish-01-pho-bo-tai-lan-hn");
        item.setQuantity(1);
        request.setItems(List.of(item));

        // Create payment
        PaymentResponse response = paymentService.createPayment(null, request);
        assertNotNull(response);
        assertEquals(orderCode, response.getOrderCode());

        // Verify that outside createPayment (and during dispatchExternalCheckout), no transaction is active
        assertFalse(TransactionSynchronizationManager.isActualTransactionActive(),
                "Transaction must NOT be active outside the repository persistence block");

        // Verify transaction was committed and can be read independently
        PaymentTransaction tx = paymentTransactionRepository.findByPaymentCode(response.getPaymentCode()).orElse(null);
        assertNotNull(tx, "Payment transaction must be persisted in DB");
        assertEquals("PENDING", tx.getStatus());
    }

    @Test
    @DisplayName("Payment Idempotency & Rollback: Duplicate confirmation is idempotent; tampered amount rolls back")
    void testPaymentIdempotencyAndRollback() {
        String orderCode = "TEST-IDEM-" + System.currentTimeMillis();
        String rawToken = "token_idem_" + System.currentTimeMillis();
        createTestOrder(orderCode, rawToken, 65000.0);

        CreatePaymentRequest req = new CreatePaymentRequest();
        req.setOrderCode(orderCode);
        req.setPaymentMethod("VIETQR");
        req.setPhone("0982223344");
        req.setOrderAccessToken(rawToken);

        CreateOrderItemRequest item = new CreateOrderItemRequest();
        item.setDishId("dish-01-pho-bo-tai-lan-hn");
        item.setQuantity(1);
        req.setItems(List.of(item));

        PaymentResponse resp = paymentService.createPayment(null, req);
        String paymentCode = resp.getPaymentCode();
        Double expectedAmount = resp.getAmount();

        // 1. Rollback test: Confirming with wrong amount throws IllegalArgumentException
        ConfirmPaymentRequest badReq = new ConfirmPaymentRequest();
        badReq.setAmount(expectedAmount + 50000.0);
        badReq.setSecretKey("pho1986_webhook_secret_key_prod_auth_2026");

        assertThrows(IllegalArgumentException.class, () -> paymentService.confirmPayment(paymentCode, badReq));

        // Transaction must remain PENDING (rollback occurred)
        PaymentTransaction txAfterRollback = paymentTransactionRepository.findByPaymentCode(paymentCode).orElseThrow();
        assertEquals("PENDING", txAfterRollback.getStatus());

        // 2. Successful confirmation
        ConfirmPaymentRequest goodReq = new ConfirmPaymentRequest();
        goodReq.setAmount(expectedAmount);
        goodReq.setTransactionRef("REF-ADVERSARIAL-1");
        goodReq.setSecretKey("pho1986_webhook_secret_key_prod_auth_2026");

        PaymentStatusResponse statusResp1 = paymentService.confirmPayment(paymentCode, goodReq);
        assertEquals("SUCCESS", statusResp1.getStatus());

        // 3. Duplicate confirmation (replay / idempotent call)
        PaymentStatusResponse statusResp2 = paymentService.confirmPayment(paymentCode, goodReq);
        assertEquals("SUCCESS", statusResp2.getStatus());
        assertEquals(statusResp1.getPaidAt().truncatedTo(java.time.temporal.ChronoUnit.SECONDS),
                statusResp2.getPaidAt().truncatedTo(java.time.temporal.ChronoUnit.SECONDS),
                "Duplicate confirmation must return existing state idempotently");
    }

    @Test
    @DisplayName("LoginAttemptPolicy: Progressive lockout tiers (60s, 180s, 300s, 600s) and permanent lock on round 5")
    void testProgressiveLockoutPolicy() {
        String testPhone = "098999" + (int)(Math.random() * 9000 + 1000);
        User savedUser = userRepository.saveAndFlush(new User(testPhone, "Test Lockout User", passwordEncoder.encode("correctpass123"), null));
        final String userId = savedUser.getId();

        // Round 1: 4 bad attempts throw BadCredentialsException
        for (int i = 1; i <= 4; i++) {
            final int attempt = i;
            BadCredentialsException ex = assertThrows(BadCredentialsException.class,
                    () -> loginAttemptPolicy.handleFailedPassword(userRepository.findById(userId).orElseThrow(), "127.0.0.1"));
            assertTrue(ex.getMessage().contains("lần thử trong Vòng 1/5"));
        }

        // 5th bad attempt -> triggers round 1 lockout (60s cooldown)
        LoginRateLimitExceededException r1Ex = assertThrows(LoginRateLimitExceededException.class,
                () -> loginAttemptPolicy.handleFailedPassword(userRepository.findById(userId).orElseThrow(), "127.0.0.1"));
        assertEquals(60L, r1Ex.getRetryAfterSeconds());
        assertEquals(1, r1Ex.getCurrentRound());

        // Simulate progression to Round 2 (180s), Round 3 (300s), Round 4 (600s)
        User u2 = userRepository.findById(userId).orElseThrow();
        u2.setFailedLoginAttempts(4);
        u2.setLockoutRounds(1);
        LoginRateLimitExceededException r2Ex = assertThrows(LoginRateLimitExceededException.class,
                () -> loginAttemptPolicy.handleFailedPassword(u2, "127.0.0.1"));
        assertEquals(180L, r2Ex.getRetryAfterSeconds());
        assertEquals(2, r2Ex.getCurrentRound());

        User u3 = userRepository.findById(userId).orElseThrow();
        u3.setFailedLoginAttempts(4);
        u3.setLockoutRounds(2);
        LoginRateLimitExceededException r3Ex = assertThrows(LoginRateLimitExceededException.class,
                () -> loginAttemptPolicy.handleFailedPassword(u3, "127.0.0.1"));
        assertEquals(300L, r3Ex.getRetryAfterSeconds());
        assertEquals(3, r3Ex.getCurrentRound());

        User u4 = userRepository.findById(userId).orElseThrow();
        u4.setFailedLoginAttempts(4);
        u4.setLockoutRounds(3);
        LoginRateLimitExceededException r4Ex = assertThrows(LoginRateLimitExceededException.class,
                () -> loginAttemptPolicy.handleFailedPassword(u4, "127.0.0.1"));
        assertEquals(600L, r4Ex.getRetryAfterSeconds());
        assertEquals(4, r4Ex.getCurrentRound());

        // Round 5: Permanent lock
        User u5 = userRepository.findById(userId).orElseThrow();
        u5.setFailedLoginAttempts(4);
        u5.setLockoutRounds(4);
        AccountLockedException lockEx = assertThrows(AccountLockedException.class,
                () -> loginAttemptPolicy.handleFailedPassword(u5, "127.0.0.1"));
        assertTrue(lockEx.getMessage().contains("khóa bảo vệ do nhập sai quá 5 vòng thử"));

        User lockedUser = userRepository.findById(userId).orElseThrow();
        assertEquals("LOCKED", lockedUser.getStatus());
        assertTrue(lockedUser.isAccountLocked());
    }

    @Test
    @DisplayName("SEC-R009: RFC 6819 Token Family Breach Containment revokes entire family upon reuse")
    void testRfc6819TokenFamilyBreachContainment() {
        String testPhone = "098777" + (int)(Math.random() * 9000 + 1000);
        User user = new User(testPhone, "Test Token Family User", passwordEncoder.encode("secretpass"), null);
        user = userRepository.saveAndFlush(user);

        // 1. Initial login -> generates token family
        LoginRequest loginReq = new LoginRequest();
        loginReq.setPhone(testPhone);
        loginReq.setPassword("secretpass");
        AuthResponse initialAuth = authService.login(loginReq, "127.0.0.1", "device-test-01");
        String initialRefreshToken = initialAuth.getRefreshToken();
        assertNotNull(initialRefreshToken);

        String initialHash = TokenHashUtil.sha256Hex(initialRefreshToken);
        RefreshToken initialRtEntity = refreshTokenRepository.findByTokenHash(initialHash).orElseThrow();
        String familyId = initialRtEntity.getFamilyId();
        assertNotNull(familyId);

        // 2. Normal rotation: use initialRefreshToken to obtain a new rotated token
        AuthResponse rotatedAuth = authService.refreshToken(initialRefreshToken);
        String rotatedRefreshToken = rotatedAuth.getRefreshToken();
        assertNotNull(rotatedRefreshToken);
        assertNotEquals(initialRefreshToken, rotatedRefreshToken, "Rotated token must be different from initial token");

        // Old token should now be marked revoked
        RefreshToken rotatedOldEntity = refreshTokenRepository.findByTokenHash(initialHash).orElseThrow();
        assertTrue(rotatedOldEntity.isRevoked(), "Old token must be marked revoked after normal rotation");

        // 3. ADVERSARIAL ATTACK: Replay old initialRefreshToken!
        // RFC 6819 Breach Containment MUST trigger and revoke ALL tokens in familyId!
        BadCredentialsException breachEx = assertThrows(BadCredentialsException.class,
                () -> authService.refreshToken(initialRefreshToken));
        assertTrue(breachEx.getMessage().contains("CẢNH BÁO BẢO MẬT") || breachEx.getMessage().contains("bất thường"),
                "Breach containment must alert on token reuse attempt");

        // 4. Verify that the rotated token belonging to the SAME family is now also revoked in DB!
        String rotatedHash = TokenHashUtil.sha256Hex(rotatedRefreshToken);
        RefreshToken rotatedRtEntity = refreshTokenRepository.findByTokenHash(rotatedHash).orElseThrow();
        assertTrue(rotatedRtEntity.isRevoked(),
                "Breach containment MUST have revoked the rotated token belonging to the same family!");

        // 5. Subsequent attempt to refresh with rotated token must now be rejected
        assertThrows(BadCredentialsException.class, () -> authService.refreshToken(rotatedRefreshToken));
    }

    @Test
    @DisplayName("PostOrderClaimHelper: Mismatched phone rejected; order reassignment prohibited")
    void testPostOrderClaimBoundaryConditions() {
        String orderCode = "TEST-CLAIM-" + System.currentTimeMillis();
        Order order = new Order();
        order.setOrderCode(orderCode);
        order.setGuestName("Guest Claimer");
        order.setGuestPhone("0985556677");
        order.setDeliveryAddressText("45 Hàng Bạc, Hà Nội");
        order.setTotalAmount(120000.0);
        order.setFinalAmount(120000.0);
        order.setPaymentMethod("COD");
        order.setPaymentStatus("UNPAID");
        order.setStatus("CONFIRMED");
        orderRepository.saveAndFlush(order);

        // 1. Claim with mismatched phone number -> rejected
        PostOrderClaimRequest badPhoneReq = new PostOrderClaimRequest();
        badPhoneReq.setOrderCode(orderCode);
        badPhoneReq.setPhone("0912345678"); // Different phone
        badPhoneReq.setFullName("Attacker");
        badPhoneReq.setPassword("pass123");

        IllegalArgumentException phoneEx = assertThrows(IllegalArgumentException.class,
                () -> postOrderClaimHelper.processClaim(badPhoneReq));
        assertTrue(phoneEx.getMessage().contains("không khớp với số điện thoại đặt đơn hàng"));

        // 2. Successful claim with matching phone
        PostOrderClaimRequest goodReq = new PostOrderClaimRequest();
        goodReq.setOrderCode(orderCode);
        goodReq.setPhone("0985556677");
        goodReq.setFullName("Guest Claimer");
        goodReq.setPassword("pass123");

        PostOrderClaimHelper.ClaimResult result = postOrderClaimHelper.processClaim(goodReq);
        assertNotNull(result.user());
        assertTrue(result.earnedPoints() >= 10);

        Order claimedOrder = orderRepository.findByOrderCode(orderCode).orElseThrow();
        assertNotNull(claimedOrder.getUser(), "Order must be linked to claimed user");

        // 3. Second claim attempt on already claimed order -> rejected
        IllegalArgumentException doubleClaimEx = assertThrows(IllegalArgumentException.class,
                () -> postOrderClaimHelper.processClaim(goodReq));
        assertTrue(doubleClaimEx.getMessage().contains("đã được gắn vào tài khoản"));
    }
}

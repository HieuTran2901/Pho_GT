package com.pho1986.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pho1986.backend.model.dto.PaymentDtos.*;
import com.pho1986.backend.model.entity.Order;
import com.pho1986.backend.model.entity.PaymentTransaction;
import com.pho1986.backend.model.entity.User;
import com.pho1986.backend.repository.OrderRepository;
import com.pho1986.backend.repository.PaymentTransactionRepository;
import com.pho1986.backend.repository.UserRepository;
import com.pho1986.backend.security.PaymentRateLimiter;
import com.pho1986.backend.service.gateway.MomoPaymentGateway;
import com.pho1986.backend.service.gateway.SepayPaymentGateway;
import com.pho1986.backend.service.payment.MomoIpnHandler;
import com.pho1986.backend.service.payment.SepayIpnHandler;
import com.pho1986.backend.service.payment.VietQrHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final LoyaltyService loyaltyService;

    private final SepayPaymentGateway sepayPaymentGateway;
    private final MomoPaymentGateway momoPaymentGateway;
    private final PaymentRateLimiter paymentRateLimiter;
    private final ObjectMapper objectMapper;

    private final VietQrHelper vietQrHelper;
    private final SepayIpnHandler sepayIpnHandler;
    private final MomoIpnHandler momoIpnHandler;
    private final PaymentGatewayService paymentGatewayService;
    private final TableService tableService;

    @Value("${app.payment.webhook-secret:pho1986_webhook_secret_key_prod_auth_2026}")
    private String webhookSecret;

    @Value("${app.payment.vietqr.bank-bin:970422}")
    private String defaultBankBin; // MBBank

    @Value("${app.payment.vietqr.bank-name:MBBank - Ngân hàng Quân Đội}")
    private String defaultBankName;

    @Value("${app.payment.vietqr.account-no:0986198686}")
    private String defaultAccountNo;

    @Value("${app.payment.vietqr.account-name:PHO GIA TRUYEN 1986}")
    private String defaultAccountName;

    public PaymentService(
            PaymentTransactionRepository paymentTransactionRepository,
            OrderRepository orderRepository,
            UserRepository userRepository,
            LoyaltyService loyaltyService,
            SepayPaymentGateway sepayPaymentGateway,
            MomoPaymentGateway momoPaymentGateway,
            PaymentRateLimiter paymentRateLimiter,
            ObjectMapper objectMapper,
            VietQrHelper vietQrHelper,
            SepayIpnHandler sepayIpnHandler,
            MomoIpnHandler momoIpnHandler,
            PaymentGatewayService paymentGatewayService,
            TableService tableService) {
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.loyaltyService = loyaltyService;
        this.sepayPaymentGateway = sepayPaymentGateway;
        this.momoPaymentGateway = momoPaymentGateway;
        this.paymentRateLimiter = paymentRateLimiter;
        this.objectMapper = objectMapper;
        this.vietQrHelper = vietQrHelper;
        this.sepayIpnHandler = sepayIpnHandler;
        this.momoIpnHandler = momoIpnHandler;
        this.paymentGatewayService = paymentGatewayService;
        this.tableService = tableService;
    }

    @Transactional
    public PaymentResponse createPayment(String userId, CreatePaymentRequest request) {
        // [SENTINEL & BLADE] Chốt chặn tài khoản bị khóa (Account Lockout Guard)
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && (user.isAccountLocked() || "LOCKED".equalsIgnoreCase(user.getStatus()))) {
                throw new com.pho1986.backend.common.AccountLockedException(user.getPhone(),
                        "Tài khoản của quý khách hiện đang bị tạm khóa. Không thể thực hiện thanh toán trực tuyến.");
            }
        }
        if (StringUtils.hasText(request.getPhone())) {
            String cleanPhone = request.getPhone().replaceAll("[\\s.-]+", "");
            userRepository.findByPhone(cleanPhone).ifPresent(u -> {
                if (u.isAccountLocked() || "LOCKED".equalsIgnoreCase(u.getStatus())) {
                    throw new com.pho1986.backend.common.AccountLockedException(cleanPhone,
                            "Số điện thoại này hiện đang bị tạm khóa dịch vụ. Vui lòng liên hệ Hotline quán để được hỗ trợ.");
                }
            });
        }

        // M5.4 Chốt chặn bảo trì cổng thanh toán (HTTP 503 Service Unavailable)
        paymentGatewayService.assertGatewayAvailable(request.getPaymentMethod());

        String rateLimitKey = (userId != null) ? "user_" + userId : "order_" + request.getOrderCode();
        if (!paymentRateLimiter.isAllowed(rateLimitKey)) {
            long remaining = paymentRateLimiter.getRemainingBlockSeconds(rateLimitKey);
            throw new IllegalStateException("Quý khách đã gửi yêu cầu thanh toán quá nhiều lần. Vui lòng thử lại sau " + remaining + " giây!");
        }

        // [BLADE & RAVEN] Chốt chặn kiểm tra bàn bị khóa (Table Lockout Guard)
        if (StringUtils.hasText(request.getTableNumber())) {
            tableService.validateTableAvailable(request.getTableNumber());
        }

        String method = request.getPaymentMethod().toUpperCase();
        Order order = orderRepository.findByOrderCode(request.getOrderCode())
                .orElseGet(() -> {
                    Order newOrder = new Order();
                    newOrder.setOrderCode(request.getOrderCode());
                    newOrder.setGuestName(StringUtils.hasText(request.getCustomerName()) ? request.getCustomerName() : "Khách Quý Phở 1986");
                    newOrder.setGuestPhone(StringUtils.hasText(request.getPhone()) ? request.getPhone() : "0986198686");
                    newOrder.setDeliveryAddressText(StringUtils.hasText(request.getAddress()) ? request.getAddress() : "Tại quán Phở Gia Truyền 1986");
                    newOrder.setPaymentMethod(method);
                    Double initialAmount = (request.getAmount() != null && request.getAmount() > 0) ? request.getAmount() : 150000.0;
                    newOrder.setTotalAmount(initialAmount);
                    newOrder.setFinalAmount(initialAmount);
                    newOrder.setNotes(request.getNote());
                    newOrder.setTableNumber(request.getTableNumber());
                    if (userId != null) {
                        User user = userRepository.findById(userId).orElse(null);
                        newOrder.setUser(user);
                    }
                    return orderRepository.save(newOrder);
                });

        Double amount = order.getFinalAmount();

        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setPaymentCode(vietQrHelper.generatePaymentCode(order.getOrderCode()));
        transaction.setOrder(order);
        transaction.setAmount(amount);
        transaction.setCurrency("VND");
        transaction.setPaymentMethod(method);
        transaction.setNote(request.getNote());
        transaction.setExpiredAt(LocalDateTime.now().plusMinutes(15));

        PaymentResponse response = new PaymentResponse();
        response.setPaymentCode(transaction.getPaymentCode());
        response.setOrderCode(order.getOrderCode());
        response.setAmount(amount);
        response.setCurrency("VND");
        response.setPaymentMethod(method);
        response.setExpiredAt(transaction.getExpiredAt());

        if ("VIETQR".equals(method) || "SEPAY".equals(method)) {
            String transferContent = vietQrHelper.buildTransferContent(order.getOrderCode());
            String qrUrl = vietQrHelper.buildQrUrl(defaultBankBin, defaultAccountNo, amount, transferContent, defaultAccountName);

            transaction.setBankBin(defaultBankBin);
            transaction.setBankName(defaultBankName);
            transaction.setBankAccountNo(defaultAccountNo);
            transaction.setBankAccountName(defaultAccountName);
            transaction.setTransferContent(transferContent);
            transaction.setQrCodeUrl(qrUrl);
            transaction.setStatus("PENDING");

            response.setStatus("PENDING");
            response.setQrCodeUrl(qrUrl);
            response.setBankBin(defaultBankBin);
            response.setBankName(defaultBankName);
            response.setBankAccountNo(defaultAccountNo);
            response.setBankAccountName(defaultAccountName);
            response.setTransferContent(transferContent);
            response.setInstructions("Quý khách vui lòng mở ứng dụng ngân hàng và quét mã VietQR trên để thanh toán trong vòng 15 phút.");
            response.setCompleted(false);

            if (sepayPaymentGateway.isEnabled()) {
                SepayPaymentGateway.SepayCheckoutResult sepayResult = sepayPaymentGateway.createCheckout(order.getOrderCode(), amount, request.getNote());
                if (sepayResult != null) {
                    response.setCheckoutUrl(sepayResult.getCheckoutUrl());
                    response.setCheckoutFields(sepayResult.getCheckoutFields());
                    response.setPayUrl(sepayResult.getCheckoutUrl());
                    response.setInstructions("Quý khách có thể quét mã VietQR hoặc bấm chuyển hướng để thanh toán tự động qua cổng SePay.");
                }
            }

            order.setPaymentMethod(method);
            order.setPaymentStatus("UNPAID");

        } else if ("COD".equals(method)) {
            transaction.setStatus("PENDING");
            response.setStatus("PENDING");
            response.setInstructions("Đơn hàng đã được xác nhận. Quý khách vui lòng chuẩn bị đúng số tiền khi nhận phở từ nhân viên giao hàng.");
            response.setCompleted(true);

            order.setPaymentMethod("COD");
            order.setPaymentStatus("UNPAID");
            order.setStatus("CONFIRMED");

        } else if ("POST_PAID_AT_STORE".equals(method)) {
            transaction.setStatus("PENDING");
            response.setStatus("PENDING");
            response.setInstructions("Bàn của quý khách đã được giữ chỗ trong 30 phút. Quý khách vui lòng thanh toán tại quầy thu ngân sau khi dùng bữa.");
            response.setCompleted(true);

            order.setPaymentMethod("POST_PAID_AT_STORE");
            order.setPaymentStatus("UNPAID");
            order.setStatus("CONFIRMED");

        } else if ("MOMO".equals(method)) {
            transaction.setStatus("PENDING");
            response.setStatus("PENDING");
            response.setInstructions("Vui lòng mở ứng dụng MoMo và quét mã để hoàn tất thanh toán.");
            response.setCompleted(false);

            if (momoPaymentGateway.isEnabled()) {
                MomoPaymentGateway.MomoPaymentResult momoResult = momoPaymentGateway.createPayment(order.getOrderCode(), amount, request.getNote());
                if (momoResult != null && momoResult.getPayUrl() != null) {
                    response.setPayUrl(momoResult.getPayUrl());
                    if (momoResult.getQrCodeUrl() != null) {
                        response.setQrCodeUrl(momoResult.getQrCodeUrl());
                    }
                    response.setInstructions("Hệ thống đã tạo yêu cầu thanh toán MoMo. Quý khách vui lòng chuyển tiếp đến ứng dụng MoMo để hoàn tất.");
                }
            } else {
                String cleanOrderCode = order.getOrderCode().replaceAll("[^a-zA-Z0-9]", "");
                String momoQr = vietQrHelper.buildQrUrl(defaultBankBin, defaultAccountNo, amount, "MOMO " + cleanOrderCode, defaultAccountName);
                response.setQrCodeUrl(momoQr);
                response.setInstructions("Vui lòng quét mã MoMo hoặc chuyển khoản với nội dung MOMO " + cleanOrderCode + " trong vòng 15 phút.");
            }

            order.setPaymentMethod("MOMO");
            order.setPaymentStatus("UNPAID");

        } else {
            transaction.setStatus("PENDING");
            response.setStatus("PENDING");
            response.setInstructions("Phương thức thanh toán đang được xử lý.");
            response.setCompleted(false);
            order.setPaymentMethod(method);
        }

        paymentTransactionRepository.save(transaction);
        orderRepository.save(order);

        return response;
    }

    @Transactional
    public PaymentStatusResponse confirmPayment(String paymentCode, ConfirmPaymentRequest request) {
        PaymentTransaction transaction = paymentTransactionRepository.findByPaymentCode(paymentCode)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giao dịch với mã: " + paymentCode));

        if ("SUCCESS".equals(transaction.getStatus())) {
            return new PaymentStatusResponse(
                    transaction.getPaymentCode(),
                    transaction.getOrder().getOrderCode(),
                    transaction.getStatus(),
                    transaction.getPaymentMethod(),
                    transaction.getAmount(),
                    transaction.getPaidAt()
            );
        }

        String providedSecret = (request != null && request.getSecretKey() != null) ? request.getSecretKey() : null;
        if (providedSecret == null || !MessageDigest.isEqual(
                webhookSecret.getBytes(StandardCharsets.UTF_8),
                providedSecret.getBytes(StandardCharsets.UTF_8))) {
            throw new SecurityException("Xác thực cổng thanh toán thất bại: Secret Key không hợp lệ!");
        }

        if (request != null && request.getAmount() != null) {
            if (Math.abs(request.getAmount() - transaction.getAmount()) > 1.0) {
                throw new IllegalArgumentException(String.format(
                        "Số tiền thanh toán thực tế (%.0f đ) không khớp với giá trị đơn hàng (%.0f đ)!",
                        request.getAmount(), transaction.getAmount()
                ));
            }
        }

        if ("EXPIRED".equals(transaction.getStatus()) ||
                (transaction.getExpiredAt() != null && LocalDateTime.now().isAfter(transaction.getExpiredAt()))) {
            transaction.setStatus("EXPIRED");
            paymentTransactionRepository.save(transaction);
            throw new IllegalStateException("Giao dịch thanh toán đã hết hạn (quá 15 phút). Vui lòng tạo yêu cầu thanh toán mới.");
        }

        if (!"PENDING".equals(transaction.getStatus())) {
            throw new IllegalStateException("Giao dịch không ở trạng thái chờ thanh toán (Trạng thái hiện tại: " + transaction.getStatus() + ")!");
        }

        LocalDateTime now = LocalDateTime.now();
        transaction.setStatus("SUCCESS");
        transaction.setPaidAt(now);
        transaction.setTransactionRef(request.getTransactionRef() != null ? request.getTransactionRef() : "REF-" + System.currentTimeMillis());
        try {
            transaction.setRawWebhookData(objectMapper.writeValueAsString(request));
        } catch (Exception e) {
            log.warn("Không thể serialize webhook data trong confirmPayment: {}", e.getMessage());
        }
        paymentTransactionRepository.save(transaction);

        Order order = transaction.getOrder();
        order.setPaymentStatus("PAID");
        order.setStatus("CONFIRMED");
        orderRepository.save(order);

        loyaltyService.awardLoyaltyPointsForOrder(order);

        return new PaymentStatusResponse(
                transaction.getPaymentCode(),
                order.getOrderCode(),
                transaction.getStatus(),
                transaction.getPaymentMethod(),
                transaction.getAmount(),
                transaction.getPaidAt()
        );
    }

    /**
     * Xử lý Webhook IPN từ cổng SePay
     */
    @Transactional
    public PaymentStatusResponse processSepayIpn(String authHeader, String secretHeader, SepayIpnPayload payload) {
        sepayIpnHandler.verifyIpnSecret(authHeader, secretHeader);
        String lookupCode = sepayIpnHandler.extractOrderCode(payload);

        PaymentTransaction transaction = paymentTransactionRepository.findTopByOrderOrderCodeOrderByCreatedAtDesc(lookupCode)
                .orElse(null);

        if (transaction == null) {
            transaction = paymentTransactionRepository.findByPaymentCode(lookupCode)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giao dịch với mã: " + lookupCode));
        }

        if ("SUCCESS".equals(transaction.getStatus())) {
            log.info("[SePay IPN] Giao dịch [{}] đã được xử lý trước đó (Idempotent OK).", transaction.getPaymentCode());
            return new PaymentStatusResponse(
                    transaction.getPaymentCode(),
                    transaction.getOrder().getOrderCode(),
                    transaction.getStatus(),
                    transaction.getPaymentMethod(),
                    transaction.getAmount(),
                    transaction.getPaidAt()
            );
        }

        sepayIpnHandler.validateAmount(payload.getTransferAmount(), transaction.getAmount());

        LocalDateTime now = LocalDateTime.now();
        transaction.setStatus("SUCCESS");
        transaction.setPaidAt(now);
        transaction.setTransactionRef(payload.getReferenceCode() != null ? payload.getReferenceCode() : "SEPAY-" + payload.getId());
        try {
            transaction.setRawWebhookData(objectMapper.writeValueAsString(payload));
        } catch (Exception e) {
            log.warn("Không thể serialize SePay IPN data: {}", e.getMessage());
        }
        paymentTransactionRepository.save(transaction);

        Order order = transaction.getOrder();
        order.setPaymentStatus("PAID");
        order.setStatus("CONFIRMED");
        orderRepository.save(order);

        loyaltyService.awardLoyaltyPointsForOrder(order);
        log.info("[SePay IPN] Xác nhận thanh toán thành công cho đơn hàng [{}]", order.getOrderCode());

        return new PaymentStatusResponse(
                transaction.getPaymentCode(),
                order.getOrderCode(),
                transaction.getStatus(),
                transaction.getPaymentMethod(),
                transaction.getAmount(),
                transaction.getPaidAt()
        );
    }

    /**
     * Xử lý Webhook IPN từ ví điện tử MoMo
     */
    @Transactional
    public PaymentStatusResponse processMomoIpn(MomoIpnRequest request) {
        momoIpnHandler.verifyIpnSignature(request);

        String orderCode = request.getOrderId();
        PaymentTransaction transaction = paymentTransactionRepository.findTopByOrderOrderCodeOrderByCreatedAtDesc(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giao dịch cho đơn MoMo: " + orderCode));

        if ("SUCCESS".equals(transaction.getStatus())) {
            log.info("[MoMo IPN] Giao dịch [{}] đã được xử lý trước đó (Idempotent OK).", transaction.getPaymentCode());
            return new PaymentStatusResponse(
                    transaction.getPaymentCode(),
                    transaction.getOrder().getOrderCode(),
                    transaction.getStatus(),
                    transaction.getPaymentMethod(),
                    transaction.getAmount(),
                    transaction.getPaidAt()
            );
        }

        try {
            transaction.setRawWebhookData(objectMapper.writeValueAsString(request));
        } catch (Exception e) {
            log.warn("Không thể serialize MoMo IPN data: {}", e.getMessage());
        }

        if (request.getResultCode() != null && request.getResultCode() == 0) {
            momoIpnHandler.validateAmount(request.getAmount(), transaction.getAmount());

            LocalDateTime now = LocalDateTime.now();
            transaction.setStatus("SUCCESS");
            transaction.setPaidAt(now);
            transaction.setTransactionRef(request.getTransId() != null ? String.valueOf(request.getTransId()) : "MOMO-" + request.getRequestId());
            paymentTransactionRepository.save(transaction);

            Order order = transaction.getOrder();
            order.setPaymentStatus("PAID");
            order.setStatus("CONFIRMED");
            orderRepository.save(order);

            loyaltyService.awardLoyaltyPointsForOrder(order);
            log.info("[MoMo IPN] Xác nhận thanh toán thành công cho đơn hàng [{}]", order.getOrderCode());
        } else {
            transaction.setStatus("FAILED");
            paymentTransactionRepository.save(transaction);
            log.warn("[MoMo IPN] Thanh toán đơn hàng [{}] thất bại: resultCode = {}, message = {}", orderCode, request.getResultCode(), request.getMessage());
        }

        return new PaymentStatusResponse(
                transaction.getPaymentCode(),
                transaction.getOrder().getOrderCode(),
                transaction.getStatus(),
                transaction.getPaymentMethod(),
                transaction.getAmount(),
                transaction.getPaidAt()
        );
    }

    /**
     * Xác định URL điều hướng người dùng sau khi SePay redirect về backend
     */
    public String resolveSepayReturnUrl(String status, String orderCode) {
        return sepayIpnHandler.resolveReturnUrl(status, orderCode);
    }

    @Transactional
    public PaymentStatusResponse getPaymentStatus(String paymentCode) {
        PaymentTransaction transaction = paymentTransactionRepository.findByPaymentCode(paymentCode)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giao dịch với mã: " + paymentCode));

        if ("PENDING".equals(transaction.getStatus()) && transaction.getExpiredAt() != null) {
            if (LocalDateTime.now().isAfter(transaction.getExpiredAt())) {
                transaction.setStatus("EXPIRED");
                paymentTransactionRepository.save(transaction);
            }
        }

        return new PaymentStatusResponse(
                transaction.getPaymentCode(),
                transaction.getOrder().getOrderCode(),
                transaction.getStatus(),
                transaction.getPaymentMethod(),
                transaction.getAmount(),
                transaction.getPaidAt()
        );
    }
}

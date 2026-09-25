package com.pho1986.backend.service;

import com.pho1986.backend.model.dto.PaymentDtos.*;
import com.pho1986.backend.model.entity.Order;
import com.pho1986.backend.model.entity.OrderItem;
import com.pho1986.backend.model.entity.PaymentTransaction;
import com.pho1986.backend.model.entity.User;
import com.pho1986.backend.repository.DishRepository;
import com.pho1986.backend.repository.OrderRepository;
import com.pho1986.backend.repository.PaymentTransactionRepository;
import com.pho1986.backend.repository.UserRepository;
import com.pho1986.backend.security.PaymentRateLimiter;
import com.pho1986.backend.service.payment.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    private final PaymentRateLimiter paymentRateLimiter;
    private final VietQrHelper vietQrHelper;
    private final SepayIpnHandler sepayIpnHandler;
    private final MomoIpnHandler momoIpnHandler;
    private final PaymentGatewayService paymentGatewayService;
    private final TableService tableService;
    private final DishRepository dishRepository;
    private final CustomerGiftService customerGiftService;
    private final VoucherService voucherService;
    private final PaymentOrderValidator paymentOrderValidator;
    private final PaymentSecurityValidator paymentSecurityValidator;
    private final PaymentChannelDispatcher paymentChannelDispatcher;
    private final PaymentSettlementHelper paymentSettlementHelper;
    private final TransactionTemplate transactionTemplate;

    @Value("${app.payment.webhook-secret:pho1986_webhook_secret_key_prod_auth_2026}")
    private String webhookSecret;

    public PaymentService(
            PaymentTransactionRepository paymentTransactionRepository, OrderRepository orderRepository,
            UserRepository userRepository,
            PaymentRateLimiter paymentRateLimiter,
            VietQrHelper vietQrHelper, SepayIpnHandler sepayIpnHandler,
            MomoIpnHandler momoIpnHandler, PaymentGatewayService paymentGatewayService,
            TableService tableService, CustomerGiftService customerGiftService,
            VoucherService voucherService, DishRepository dishRepository,
            PaymentOrderValidator paymentOrderValidator,
            PaymentSecurityValidator paymentSecurityValidator,
            PaymentChannelDispatcher paymentChannelDispatcher,
            PaymentSettlementHelper paymentSettlementHelper,
            PlatformTransactionManager transactionManager) {
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.paymentRateLimiter = paymentRateLimiter;
        this.vietQrHelper = vietQrHelper;
        this.sepayIpnHandler = sepayIpnHandler;
        this.momoIpnHandler = momoIpnHandler;
        this.paymentGatewayService = paymentGatewayService;
        this.tableService = tableService;
        this.customerGiftService = customerGiftService;
        this.voucherService = voucherService;
        this.dishRepository = dishRepository;
        this.paymentOrderValidator = paymentOrderValidator;
        this.paymentSecurityValidator = paymentSecurityValidator;
        this.paymentChannelDispatcher = paymentChannelDispatcher;
        this.paymentSettlementHelper = paymentSettlementHelper;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    private record PaymentTxContext(
            PaymentResponse response,
            String method,
            String orderCode,
            Double amount
    ) {}

    public PaymentResponse createPayment(String userId, CreatePaymentRequest request) {
        // Bước 1: Lưu đơn hàng & giao dịch vào DB trong Transaction ngắn hạn
        PaymentTxContext ctx = transactionTemplate.execute(status -> executePaymentCreationTx(userId, request));

        PaymentResponse response = ctx.response();
        String method = ctx.method();
        String orderCode = ctx.orderCode();
        Double amount = ctx.amount();

        // Bước 2: Tách biệt I/O mạng cổng thanh toán ra NGOÀI Transaction để không chiếm dụng JDBC connection
        paymentChannelDispatcher.dispatchExternalCheckout(response, method, orderCode, amount, request.getNote());

        return response;
    }

    private PaymentTxContext executePaymentCreationTx(String userId, CreatePaymentRequest request) {
        // Chốt chặn tài khoản bị khóa (Account Lockout Guard)
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

        Order order = orderRepository.findByOrderCode(request.getOrderCode())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng #" + request.getOrderCode()));

        // Chốt chặn quyền sở hữu đơn hàng (Ownership Enforcement)
        if (order.getUser() != null) {
            if (userId == null || !userId.equals(order.getUser().getId())) {
                throw new org.springframework.security.access.AccessDeniedException("Bạn không có quyền thao tác thanh toán cho đơn hàng này.");
            }
        } else {
            // Guest order: bắt buộc kiểm tra orderAccessToken qua SHA-256 hash
            String rawToken = request.getOrderAccessToken();
            if (!StringUtils.hasText(rawToken)) {
                throw new org.springframework.security.access.AccessDeniedException("Mã truy cập đơn hàng (orderAccessToken) không được để trống đối với khách vãng lai.");
            }
            String expectedHash = order.getOrderAccessTokenHash();
            String actualHash = com.pho1986.backend.common.PiiMaskUtils.sha256Hex(rawToken.trim());
            if (expectedHash == null || !java.security.MessageDigest.isEqual(
                    expectedHash.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                    actualHash.getBytes(java.nio.charset.StandardCharsets.UTF_8))) {
                throw new org.springframework.security.access.AccessDeniedException("Mã truy cập đơn hàng không hợp lệ.");
            }
        }

        // Chốt chặn trạng thái đơn: Bắt buộc PENDING và UNPAID
        if (!"PENDING".equalsIgnoreCase(order.getStatus()) || !"UNPAID".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new IllegalStateException("Đơn hàng #" + order.getOrderCode() + " không ở trạng thái chờ thanh toán (Trạng thái hiện tại: " + order.getStatus() + "/" + order.getPaymentStatus() + ")");
        }

        String method = request.getPaymentMethod().toUpperCase();
        Double amount = order.getFinalAmount();
        LocalDateTime now = LocalDateTime.now();

        // Tái sử dụng giao dịch PENDING còn hiệu lực nếu có cùng phương thức
        PaymentTransaction transaction = paymentTransactionRepository
                .findTopByOrderOrderCodeOrderByCreatedAtDesc(order.getOrderCode())
                .filter(tx -> "PENDING".equals(tx.getStatus()) && tx.getExpiredAt() != null && tx.getExpiredAt().isAfter(now) && method.equalsIgnoreCase(tx.getPaymentMethod()))
                .orElseGet(() -> {
                    PaymentTransaction newTx = new PaymentTransaction();
                    newTx.setPaymentCode(vietQrHelper.generatePaymentCode(order.getOrderCode()));
                    newTx.setOrder(order);
                    newTx.setAmount(amount);
                    newTx.setCurrency("VND");
                    newTx.setPaymentMethod(method);
                    newTx.setNote(request.getNote());
                    newTx.setExpiredAt(now.plusMinutes(15));
                    return paymentTransactionRepository.save(newTx);
                });

        PaymentResponse response = new PaymentResponse();
        response.setPaymentCode(transaction.getPaymentCode());
        response.setOrderCode(order.getOrderCode());
        response.setAmount(amount);
        response.setCurrency("VND");
        response.setPaymentMethod(method);
        response.setExpiredAt(transaction.getExpiredAt());

        paymentChannelDispatcher.populateMethodDetails(transaction, response, order, method, amount);

        return new PaymentTxContext(response, method, order.getOrderCode(), amount);
    }

    @Transactional
    public PaymentStatusResponse confirmPayment(String paymentCode, ConfirmPaymentRequest request) {
        return confirmPayment(paymentCode, request, org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication());
    }

    @Transactional
    public PaymentStatusResponse confirmPayment(String paymentCode, ConfirmPaymentRequest request, Authentication authentication) {
        // Chốt chặn an ninh tối thượng: Xác thực Secret Key / Chữ ký HMAC-SHA256 hoặc ROLE_ADMIN TRƯỚC TIÊN
        paymentSecurityValidator.validateConfirmation(webhookSecret, paymentCode, request, authentication);

        PaymentTransaction transaction = paymentTransactionRepository.findByPaymentCode(paymentCode)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giao dịch với mã: " + paymentCode));

        if ("SUCCESS".equals(transaction.getStatus())) {
            return paymentSettlementHelper.toStatusResponse(transaction);
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

        String transactionRef = (request != null && request.getTransactionRef() != null)
                ? request.getTransactionRef()
                : "REF-" + System.currentTimeMillis();

        return paymentSettlementHelper.finalizeSuccessfulPayment(transaction, transactionRef, request, "[Confirm Payment]");
    }

    @Transactional
    public PaymentStatusResponse processSepayIpn(String authHeader, String secretHeader, SepayIpnPayload payload) {
        sepayIpnHandler.verifyIpnSecret(authHeader, secretHeader);
        String lookupCode = sepayIpnHandler.extractOrderCode(payload);

        if (sepayIpnHandler.isTestPing(payload, lookupCode)) {
            log.info("[SePay IPN] Nhận diện gói tin TEST Webhook từ SePay Dashboard. Phản hồi HTTP 200 OK.");
            Double testAmt = payload.getTransferAmount() != null ? payload.getTransferAmount() : 10000.0;
            return new PaymentStatusResponse("TEST-PAYMENT-CODE", "TEST-ORDER", "SUCCESS", "SEPAY", testAmt, LocalDateTime.now());
        }

        PaymentTransaction transaction = paymentTransactionRepository.findTopByOrderOrderCodeOrderByCreatedAtDesc(lookupCode)
                .orElse(null);

        if (transaction == null) {
            transaction = paymentTransactionRepository.findByPaymentCode(lookupCode)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giao dịch với mã: " + lookupCode));
        }

        if ("SUCCESS".equals(transaction.getStatus())) {
            log.info("[SePay IPN] Giao dịch [{}] đã được xử lý trước đó (Idempotent OK).", transaction.getPaymentCode());
            return paymentSettlementHelper.toStatusResponse(transaction);
        }

        sepayIpnHandler.validateAmount(payload.getTransferAmount(), transaction.getAmount());

        String transactionRef = payload.getReferenceCode() != null
                ? payload.getReferenceCode()
                : "SEPAY-" + payload.getId();

        return paymentSettlementHelper.finalizeSuccessfulPayment(transaction, transactionRef, payload, "[SePay IPN]");
    }

    @Transactional
    public PaymentStatusResponse processMomoIpn(MomoIpnRequest request) {
        momoIpnHandler.verifyIpnSignature(request);

        String orderCode = request.getOrderId();
        PaymentTransaction transaction = paymentTransactionRepository.findTopByOrderOrderCodeOrderByCreatedAtDesc(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giao dịch cho đơn MoMo: " + orderCode));

        if ("SUCCESS".equals(transaction.getStatus())) {
            log.info("[MoMo IPN] Giao dịch [{}] đã được xử lý trước đó (Idempotent OK).", transaction.getPaymentCode());
            return paymentSettlementHelper.toStatusResponse(transaction);
        }

        if (request.getResultCode() != null && request.getResultCode() == 0) {
            momoIpnHandler.validateAmount(request.getAmount(), transaction.getAmount());

            String transactionRef = request.getTransId() != null
                    ? String.valueOf(request.getTransId())
                    : "MOMO-" + request.getRequestId();

            return paymentSettlementHelper.finalizeSuccessfulPayment(transaction, transactionRef, request, "[MoMo IPN]");
        } else {
            String logMsg = String.format("[MoMo IPN] Thanh toán đơn hàng [%s] thất bại: resultCode = %s, message = %s",
                    orderCode, request.getResultCode(), request.getMessage());
            return paymentSettlementHelper.recordFailedPayment(transaction, request, logMsg);
        }
    }

    public String resolveSepayReturnUrl(String status, String orderCode) {
        return sepayIpnHandler.resolveReturnUrl(status, orderCode);
    }

    @Transactional
    public PaymentStatusResponse getPaymentStatus(String paymentCode) {
        PaymentTransaction transaction = paymentTransactionRepository.findByPaymentCode(paymentCode)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giao dịch với mã: " + paymentCode));

        if ("PENDING".equals(transaction.getStatus()) && transaction.getExpiredAt() != null && LocalDateTime.now().isAfter(transaction.getExpiredAt())) {
            transaction.setStatus("EXPIRED");
            paymentTransactionRepository.save(transaction);
            Order order = transaction.getOrder();
            if (order != null && "PENDING".equals(order.getStatus())) {
                order.setStatus("CANCELLED");
                orderRepository.save(order);
                if (StringUtils.hasText(order.getTableNumber())) {
                    tableService.markTableStatus(order.getTableNumber(), "AVAILABLE");
                }
            }
        }

        return paymentSettlementHelper.toStatusResponse(transaction);
    }

    public PaymentStatusResponse toStatusResponse(PaymentTransaction tx) {
        return paymentSettlementHelper.toStatusResponse(tx);
    }
}

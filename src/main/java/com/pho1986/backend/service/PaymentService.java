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

        // Kiểm tra bàn ăn trước khi xử lý
        if (StringUtils.hasText(request.getTableNumber())) {
            tableService.validateTableAvailable(request.getTableNumber());
        }

        String targetUserId = userId;
        if (targetUserId == null && StringUtils.hasText(request.getPhone())) {
            targetUserId = userRepository.findByPhone(request.getPhone().trim()).map(User::getId).orElse(null);
        }
        final String resolvedUserId = targetUserId;

        // Xác thực món ăn & tính giá 100% từ Server Database
        boolean hasItems = request.getItems() != null && !request.getItems().isEmpty();
        List<OrderItem> verifiedItems = hasItems
                ? paymentOrderValidator.buildAndVerifyOrderItems(request.getItems(), dishRepository)
                : java.util.Collections.emptyList();
        double verifiedTotal = verifiedItems.stream().mapToDouble(OrderItem::getSubtotal).sum();

        String method = request.getPaymentMethod().toUpperCase();
        Order order = orderRepository.findByOrderCode(request.getOrderCode())
                .orElseGet(() -> {
                    if (!hasItems) {
                        throw new IllegalArgumentException("Không tìm thấy đơn hàng #" + request.getOrderCode() + " và không có món ăn hợp lệ trong yêu cầu.");
                    }
                    Order newOrder = new Order();
                    newOrder.setOrderCode(request.getOrderCode());
                    newOrder.setGuestName(StringUtils.hasText(request.getCustomerName()) ? request.getCustomerName() : "Khách Quý Phở 1986");
                    newOrder.setGuestPhone(StringUtils.hasText(request.getPhone()) ? request.getPhone() : "0986198686");
                    newOrder.setDeliveryAddressText(StringUtils.hasText(request.getAddress()) ? request.getAddress() : "Tại quán Phở Gia Truyền 1986");
                    newOrder.setPaymentMethod(method);
                    newOrder.setTotalAmount(verifiedTotal);
                    newOrder.setFinalAmount(verifiedTotal);
                    newOrder.setNotes(request.getNote());
                    newOrder.setTableNumber(request.getTableNumber());
                    if (StringUtils.hasText(request.getAppliedGiftId())) {
                        newOrder.setVoucherCode(request.getAppliedGiftId().trim());
                    }
                    if (resolvedUserId != null) {
                        userRepository.findById(resolvedUserId).ifPresent(newOrder::setUser);
                    }
                    verifiedItems.forEach(newOrder::addItem);
                    return orderRepository.save(newOrder);
                });

        if (hasItems) {
            paymentOrderValidator.replaceOrderItems(order, verifiedItems);
            orderRepository.save(order);
        } else {
            // Đơn hàng đã tồn tại: Bắt buộc xác thực lại 100% đơn giá và tính lại thành tiền từ DB
            paymentOrderValidator.recalculateAndVerifyExistingOrder(order, dishRepository);
            orderRepository.save(order);
        }

        // Chốt chặn ưu đãi & giữ bàn: Bắt buộc chứa ít nhất 01 món chính đã xác thực từ database
        boolean orderHasMainDish = paymentOrderValidator.hasVerifiedMainDish(order.getItems(), dishRepository);
        boolean hasVoucherOrDiscount = StringUtils.hasText(request.getAppliedGiftId())
                || StringUtils.hasText(order.getVoucherCode())
                || (order.getDiscountAmount() != null && order.getDiscountAmount() > 0);

        if (hasVoucherOrDiscount) {
            if (!orderHasMainDish) {
                throw new IllegalArgumentException("Ưu đãi và giảm giá chỉ áp dụng kèm theo món ăn chính. Quý khách vui lòng chọn ít nhất 01 món chính trong thực đơn.");
            }
            if (StringUtils.hasText(request.getAppliedGiftId())) {
                order.setVoucherCode(request.getAppliedGiftId().trim());
                if (resolvedUserId != null) {
                    customerGiftService.applyGiftToOrder(resolvedUserId, request.getAppliedGiftId(), order.getOrderCode());
                }
                voucherService.applyVoucherUsage(request.getAppliedGiftId());
            }
        }

        if (StringUtils.hasText(order.getTableNumber())) {
            if (!orderHasMainDish) {
                throw new IllegalArgumentException("Dịch vụ giữ bàn chỉ áp dụng khi quý khách đặt trước ít nhất 01 món ăn chính trong thực đơn.");
            }
            tableService.markTableStatus(order.getTableNumber(), "RESERVED");
        }

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

        paymentChannelDispatcher.populateMethodDetails(transaction, response, order, method, amount);

        paymentTransactionRepository.save(transaction);
        orderRepository.save(order);

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

package com.pho1986.backend.service;

import com.pho1986.backend.model.dto.PaymentDtos.*;
import com.pho1986.backend.model.entity.*;
import com.pho1986.backend.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderRepository orderRepository;
    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;

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
            LoyaltyAccountRepository loyaltyAccountRepository,
            LoyaltyTransactionRepository loyaltyTransactionRepository) {
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.orderRepository = orderRepository;
        this.loyaltyAccountRepository = loyaltyAccountRepository;
        this.loyaltyTransactionRepository = loyaltyTransactionRepository;
    }

    private String generatePaymentCode(String orderCode) {
        String clean = orderCode.replaceAll("[^a-zA-Z0-9]", "");
        String salt = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "PAY-" + clean + "-" + salt;
    }

    @Transactional
    public PaymentResponse createPayment(String userId, CreatePaymentRequest request) {
        Order order = orderRepository.findByOrderCode(request.getOrderCode())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng với mã: " + request.getOrderCode()));

        Double amount = order.getFinalAmount();
        String method = request.getPaymentMethod().toUpperCase();

        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setPaymentCode(generatePaymentCode(order.getOrderCode()));
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

        if ("VIETQR".equals(method)) {
            String cleanOrderCode = order.getOrderCode().replaceAll("[^a-zA-Z0-9]", "");
            String transferContent = "PHO1986 " + cleanOrderCode;

            String encodedContent = URLEncoder.encode(transferContent, StandardCharsets.UTF_8);
            String encodedAccountName = URLEncoder.encode(defaultAccountName, StandardCharsets.UTF_8);

            String qrUrl = String.format(
                    "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%.0f&addInfo=%s&accountName=%s",
                    defaultBankBin, defaultAccountNo, amount, encodedContent, encodedAccountName
            );

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

            order.setPaymentMethod("VIETQR");
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

        // 1. Chống replay attack / Double confirmation
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

        // 2. Xác thực Secret Key của Webhook / Gateway
        String providedSecret = (request != null && request.getSecretKey() != null) ? request.getSecretKey() : null;
        if (providedSecret == null || !webhookSecret.equals(providedSecret)) {
            throw new SecurityException("Xác thực cổng thanh toán thất bại: Secret Key không hợp lệ!");
        }

        // 3. Kiểm tra tính toàn vẹn số tiền thanh toán (chống giả mạo số tiền)
        if (request != null && request.getAmount() != null) {
            if (Math.abs(request.getAmount() - transaction.getAmount()) > 1.0) {
                throw new IllegalArgumentException(String.format(
                        "Số tiền thanh toán thực tế (%.0f đ) không khớp với giá trị đơn hàng (%.0f đ)!",
                        request.getAmount(), transaction.getAmount()
                ));
            }
        }

        // 4. Kiểm tra giao dịch hết hạn (quá 15 phút)
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
        paymentTransactionRepository.save(transaction);

        // Cập nhật trạng thái đơn hàng
        Order order = transaction.getOrder();
        order.setPaymentStatus("PAID");
        order.setStatus("CONFIRMED");
        orderRepository.save(order);

        // Tích điểm thưởng nếu có tài khoản người dùng
        User user = order.getUser();
        if (user != null) {
            int earnedPoints = Math.max(10, (int) Math.floor(order.getFinalAmount() / 1000.0));
            LoyaltyAccount loyalty = loyaltyAccountRepository.findByUserId(user.getId()).orElse(null);

            if (loyalty != null) {
                int newTotal = loyalty.getTotalPoints() + earnedPoints;
                int newAvail = loyalty.getAvailablePoints() + earnedPoints;
                loyalty.setTotalPoints(newTotal);
                loyalty.setAvailablePoints(newAvail);
                loyalty.setTotalSpent(loyalty.getTotalSpent() + order.getFinalAmount());
                loyalty.setTotalOrdersCount(loyalty.getTotalOrdersCount() + 1);

                String tier = (newTotal >= 2000) ? "KIM_CUONG" : (newTotal >= 1000) ? "VANG" : (newTotal >= 500) ? "BAC" : "DONG";
                loyalty.setMembershipTier(tier);
                loyaltyAccountRepository.save(loyalty);

                loyaltyTransactionRepository.save(new LoyaltyTransaction(
                        loyalty, order.getId(), earnedPoints, "EARN_PAYMENT", newAvail, "Tích điểm thanh toán đơn hàng #" + order.getOrderCode()
                ));
            }
        }

        return new PaymentStatusResponse(
                transaction.getPaymentCode(),
                order.getOrderCode(),
                transaction.getStatus(),
                transaction.getPaymentMethod(),
                transaction.getAmount(),
                transaction.getPaidAt()
        );
    }

    @Transactional
    public PaymentStatusResponse getPaymentStatus(String paymentCode) {
        PaymentTransaction transaction = paymentTransactionRepository.findByPaymentCode(paymentCode)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giao dịch với mã: " + paymentCode));

        // Kiểm tra hết hạn nếu đang PENDING
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

package com.pho1986.backend.service.payment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pho1986.backend.model.dto.PaymentDtos.PaymentStatusResponse;
import com.pho1986.backend.model.entity.Order;
import com.pho1986.backend.model.entity.PaymentTransaction;
import com.pho1986.backend.repository.OrderRepository;
import com.pho1986.backend.repository.PaymentTransactionRepository;
import com.pho1986.backend.repository.UserRepository;
import com.pho1986.backend.service.CustomerGiftService;
import com.pho1986.backend.service.LoyaltyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/**
 * Handles unified payment transaction finalization, webhook payload recording,
 * order status settlement, and loyalty points awarding.
 */
@Component
public class PaymentSettlementHelper {

    private static final Logger log = LoggerFactory.getLogger(PaymentSettlementHelper.class);

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderRepository orderRepository;
    private final LoyaltyService loyaltyService;
    private final CustomerGiftService customerGiftService;
    private final com.pho1986.backend.service.VoucherService voucherService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public PaymentSettlementHelper(
            PaymentTransactionRepository paymentTransactionRepository,
            OrderRepository orderRepository,
            LoyaltyService loyaltyService,
            CustomerGiftService customerGiftService,
            com.pho1986.backend.service.VoucherService voucherService,
            UserRepository userRepository,
            ObjectMapper objectMapper) {
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.orderRepository = orderRepository;
        this.loyaltyService = loyaltyService;
        this.customerGiftService = customerGiftService;
        this.voucherService = voucherService;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public PaymentStatusResponse finalizeSuccessfulPayment(
            PaymentTransaction transaction,
            String transactionRef,
            Object rawPayload,
            String logPrefix) {
        LocalDateTime now = LocalDateTime.now();
        transaction.setStatus("SUCCESS");
        transaction.setPaidAt(now);
        if (transactionRef != null) {
            transaction.setTransactionRef(transactionRef);
        }
        if (rawPayload != null) {
            try {
                transaction.setRawWebhookData(objectMapper.writeValueAsString(rawPayload));
            } catch (Exception e) {
                log.warn("{} Không thể serialize webhook data: {}", logPrefix != null ? logPrefix : "", e.getMessage());
            }
        }
        paymentTransactionRepository.save(transaction);

        Order order = transaction.getOrder();
        if (order != null) {
            settleOrderInternal(order, logPrefix);
        }

        return toStatusResponse(transaction);
    }

    @Transactional
    public boolean settleOrderDirectly(Order order, String logPrefix) {
        if (order == null) return false;
        return settleOrderInternal(order, logPrefix);
    }

    private boolean settleOrderInternal(Order order, String logPrefix) {
        // Atomic status transition UNPAID -> PAID to eliminate concurrency race condition
        int updatedRows = orderRepository.markOrderAsPaidIfUnpaid(order.getId());
        if (updatedRows > 0) {
            order.setPaymentStatus("PAID");
            order.setStatus("CONFIRMED");

            // Tích điểm thành viên (idempotent, pessimistic write locked)
            loyaltyService.awardLoyaltyPointsForOrder(order);

            // Đánh dấu sử dụng phiếu quà tặng & sổ cái voucher khi đơn hàng đã thanh toán thành công
            if (StringUtils.hasText(order.getVoucherCode())) {
                String targetUserId = (order.getUser() != null) ? order.getUser().getId() : null;
                if (targetUserId == null && StringUtils.hasText(order.getGuestPhone())) {
                    String cleanPhone = order.getGuestPhone().replaceAll("[\\s.-]+", "");
                    targetUserId = userRepository.findByPhone(cleanPhone).map(com.pho1986.backend.model.entity.User::getId).orElse(null);
                }
                if (targetUserId != null) {
                    customerGiftService.applyGiftToOrder(targetUserId, order.getVoucherCode(), order.getOrderCode());
                }
                voucherService.recordVoucherRedemption(order.getVoucherCode(), order.getId(), targetUserId, order.getDiscountAmount());
            }

            if (logPrefix != null) {
                log.info("{} Quyết toán thanh toán thành công cho đơn hàng [{}]", logPrefix, order.getOrderCode());
            }
            return true;
        } else {
            if (logPrefix != null) {
                log.info("{} Đơn hàng [{}] đã được quyết toán trước đó (idempotent skip)", logPrefix, order.getOrderCode());
            }
            return false;
        }
    }

    public PaymentStatusResponse recordFailedPayment(
            PaymentTransaction transaction,
            Object rawPayload,
            String logMessage) {
        if (rawPayload != null) {
            try {
                transaction.setRawWebhookData(objectMapper.writeValueAsString(rawPayload));
            } catch (Exception e) {
                log.warn("Không thể serialize webhook data khi ghi nhận thất bại: {}", e.getMessage());
            }
        }
        transaction.setStatus("FAILED");
        paymentTransactionRepository.save(transaction);
        if (logMessage != null) {
            log.warn("{}", logMessage);
        }
        return toStatusResponse(transaction);
    }

    public PaymentStatusResponse toStatusResponse(PaymentTransaction tx) {
        String code = tx.getOrder() != null ? tx.getOrder().getOrderCode() : null;
        return new PaymentStatusResponse(
                tx.getPaymentCode(),
                code,
                tx.getStatus(),
                tx.getPaymentMethod(),
                tx.getAmount(),
                tx.getPaidAt()
        );
    }
}

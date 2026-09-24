package com.pho1986.backend.service.payment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pho1986.backend.model.dto.PaymentDtos.PaymentStatusResponse;
import com.pho1986.backend.model.entity.Order;
import com.pho1986.backend.model.entity.PaymentTransaction;
import com.pho1986.backend.repository.OrderRepository;
import com.pho1986.backend.repository.PaymentTransactionRepository;
import com.pho1986.backend.service.LoyaltyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

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
    private final ObjectMapper objectMapper;

    public PaymentSettlementHelper(
            PaymentTransactionRepository paymentTransactionRepository,
            OrderRepository orderRepository,
            LoyaltyService loyaltyService,
            ObjectMapper objectMapper) {
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.orderRepository = orderRepository;
        this.loyaltyService = loyaltyService;
        this.objectMapper = objectMapper;
    }

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
            order.setPaymentStatus("PAID");
            order.setStatus("CONFIRMED");
            orderRepository.save(order);

            loyaltyService.awardLoyaltyPointsForOrder(order);
            if (logPrefix != null) {
                log.info("{} Xác nhận thanh toán thành công cho đơn hàng [{}]", logPrefix, order.getOrderCode());
            }
        }

        return toStatusResponse(transaction);
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

package com.pho1986.backend.service;

import com.pho1986.backend.common.PaymentGatewayMaintenanceException;
import com.pho1986.backend.model.dto.PaymentGatewayDtos.*;
import com.pho1986.backend.model.entity.PaymentGatewayConfig;
import com.pho1986.backend.repository.PaymentGatewayConfigRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PaymentGatewayService {

    private static final Logger log = LoggerFactory.getLogger(PaymentGatewayService.class);

    private final PaymentGatewayConfigRepository gatewayRepository;

    public PaymentGatewayService(PaymentGatewayConfigRepository gatewayRepository) {
        this.gatewayRepository = gatewayRepository;
    }

    public List<PaymentGatewayResponse> getAllGateways() {
        return gatewayRepository.findAllByOrderByStatusAscNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public Optional<PaymentGatewayConfig> findGatewayById(String id) {
        return gatewayRepository.findById(id.toUpperCase());
    }

    @Transactional
    public PaymentGatewayResponse updateGatewayStatus(String id, UpdateGatewayStatusRequest request, String adminPhone) {
        String gatewayId = id.toUpperCase();
        PaymentGatewayConfig config = gatewayRepository.findById(gatewayId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy cổng thanh toán với mã: " + gatewayId));

        config.setStatus(request.getStatus().toUpperCase());
        config.setMaintenanceMessage(request.getMaintenanceMessage() != null ? request.getMaintenanceMessage().trim() : "");
        config.setUpdatedBy(adminPhone != null ? adminPhone : "ADMIN");

        PaymentGatewayConfig saved = gatewayRepository.save(config);
        log.info("🛡️ [M5.4 PAYMENT CONTROL] Cổng [{}] đã chuyển sang trạng thái [{}] bởi admin [{}]",
                gatewayId, saved.getStatus(), config.getUpdatedBy());

        return toResponse(saved);
    }

    /**
     * Chốt chặn kiểm tra xem cổng thanh toán có đang hoạt động hay không.
     * Ném PaymentGatewayMaintenanceException (HTTP 503) nếu đang bảo trì hoặc tắt.
     */
    public void assertGatewayAvailable(String method) {
        if (method == null || method.isBlank()) {
            return;
        }
        String gatewayId = method.toUpperCase();
        // Ánh xạ các biến thể method
        if ("VIETQR".equals(gatewayId)) {
            gatewayId = "SEPAY";
        } else if ("POST_PAID_AT_STORE".equals(gatewayId) || "COD".equals(gatewayId)) {
            gatewayId = "CASH";
        }

        Optional<PaymentGatewayConfig> configOpt = gatewayRepository.findById(gatewayId);
        if (configOpt.isPresent()) {
            PaymentGatewayConfig config = configOpt.get();
            if ("MAINTENANCE".equalsIgnoreCase(config.getStatus()) || "DISABLED".equalsIgnoreCase(config.getStatus())) {
                log.warn("🚨 [PAYMENT BLOCKED] Khách hàng cố gắng thanh toán qua cổng đang bảo trì/tắt: [{}]", gatewayId);
                throw new PaymentGatewayMaintenanceException(gatewayId, config.getMaintenanceMessage());
            }
        }
    }

    private PaymentGatewayResponse toResponse(PaymentGatewayConfig config) {
        return new PaymentGatewayResponse(
                config.getId(),
                config.getName(),
                config.getStatus(),
                config.getMaintenanceMessage(),
                config.getUpdatedAt(),
                config.getUpdatedBy()
        );
    }
}

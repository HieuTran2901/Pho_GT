package com.pho1986.backend.service.payment;

import com.pho1986.backend.config.MomoProperties;
import com.pho1986.backend.model.dto.PaymentDtos.MomoIpnRequest;
import com.pho1986.backend.security.MomoSigner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class MomoIpnHandler {

    private static final Logger log = LoggerFactory.getLogger(MomoIpnHandler.class);

    private final MomoProperties momoProperties;
    private final MomoSigner momoSigner;

    public MomoIpnHandler(MomoProperties momoProperties, MomoSigner momoSigner) {
        this.momoProperties = momoProperties;
        this.momoSigner = momoSigner;
    }

    /**
     * Xác minh chữ ký số HMAC-SHA256 của MoMo IPN request
     */
    public void verifyIpnSignature(MomoIpnRequest request) {
        String secretKey = momoProperties.getSecretKey();
        if (!StringUtils.hasText(secretKey)) {
            log.error("[MoMo IPN] MOMO_SECRETKEY chưa được cấu hình!");
            throw new IllegalStateException("MOMO_SECRETKEY_NOT_CONFIGURED");
        }

        boolean validSignature = momoSigner.verifyIpnSignature(
                momoProperties.getAccessKey(),
                request.getAmount(),
                request.getExtraData(),
                request.getMessage(),
                request.getOrderId(),
                request.getOrderInfo(),
                request.getOrderType(),
                request.getPartnerCode(),
                request.getPayType(),
                request.getRequestId(),
                request.getResponseTime(),
                request.getResultCode(),
                request.getTransId(),
                secretKey,
                request.getSignature()
        );

        if (!validSignature) {
            log.warn("[MoMo IPN] Từ chối webhook do chữ ký số MoMo không hợp lệ!");
            throw new SecurityException("Xác thực MoMo IPN thất bại: Chữ ký HMAC không hợp lệ!");
        }
    }

    /**
     * Xác thực số tiền thanh toán từ MoMo so với giá trị đơn hàng
     */
    public void validateAmount(Long momoAmount, Double expectedAmount) {
        if (momoAmount != null && Math.abs(momoAmount.doubleValue() - expectedAmount) > 1.0) {
            throw new IllegalArgumentException(String.format(
                    "Số tiền MoMo (%.0f đ) không khớp với giá trị đơn hàng (%.0f đ)!",
                    momoAmount.doubleValue(), expectedAmount
            ));
        }
    }
}

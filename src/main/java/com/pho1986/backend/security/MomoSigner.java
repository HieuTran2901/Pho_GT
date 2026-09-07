package com.pho1986.backend.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

@Component
public class MomoSigner {

    private static final Logger log = LoggerFactory.getLogger(MomoSigner.class);
    private static final String HMAC_SHA256 = "HmacSHA256";

    /**
     * Ký payload tạo yêu cầu thanh toán MoMo
     */
    public String signCreatePayment(
            String accessKey,
            Double amount,
            String extraData,
            String ipnUrl,
            String orderId,
            String orderInfo,
            String partnerCode,
            String redirectUrl,
            String requestId,
            String requestType,
            String secretKey) {

        long amountLong = amount != null ? amount.longValue() : 0L;
        String rawData = "accessKey=" + accessKey +
                "&amount=" + amountLong +
                "&extraData=" + (extraData != null ? extraData : "") +
                "&ipnUrl=" + ipnUrl +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + partnerCode +
                "&redirectUrl=" + redirectUrl +
                "&requestId=" + requestId +
                "&requestType=" + requestType;

        return hmacSha256(rawData, secretKey);
    }

    /**
     * Xác minh chữ ký IPN callback từ MoMo gửi về
     */
    public boolean verifyIpnSignature(
            String accessKey,
            Long amount,
            String extraData,
            String message,
            String orderId,
            String orderInfo,
            String orderType,
            String partnerCode,
            String payType,
            String requestId,
            Long responseTime,
            Integer resultCode,
            Long transId,
            String secretKey,
            String expectedSignature) {

        if (expectedSignature == null || secretKey == null) {
            return false;
        }

        String rawData = "accessKey=" + accessKey +
                "&amount=" + (amount != null ? amount : 0L) +
                "&extraData=" + (extraData != null ? extraData : "") +
                "&message=" + (message != null ? message : "") +
                "&orderId=" + (orderId != null ? orderId : "") +
                "&orderInfo=" + (orderInfo != null ? orderInfo : "") +
                "&orderType=" + (orderType != null ? orderType : "") +
                "&partnerCode=" + (partnerCode != null ? partnerCode : "") +
                "&payType=" + (payType != null ? payType : "") +
                "&requestId=" + (requestId != null ? requestId : "") +
                "&responseTime=" + (responseTime != null ? responseTime : 0L) +
                "&resultCode=" + (resultCode != null ? resultCode : 0) +
                "&transId=" + (transId != null ? transId : 0L);

        String generated = hmacSha256(rawData, secretKey);
        // Constant-time comparison to prevent timing attacks
        return MessageDigest.isEqual(
                generated.getBytes(StandardCharsets.UTF_8),
                expectedSignature.getBytes(StandardCharsets.UTF_8)
        );
    }

    /**
     * Tạo chữ ký HMAC-SHA256
     */
    public String hmacSha256(String data, String key) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            log.error("[MoMo Signer] Lỗi tính toán HMAC-SHA256: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi tính toán chữ ký số MoMo", e);
        }
    }
}

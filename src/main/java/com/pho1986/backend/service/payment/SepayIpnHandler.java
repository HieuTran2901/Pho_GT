package com.pho1986.backend.service.payment;

import com.pho1986.backend.config.SepayProperties;
import com.pho1986.backend.model.dto.PaymentDtos.SepayIpnPayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class SepayIpnHandler {

    private static final Logger log = LoggerFactory.getLogger(SepayIpnHandler.class);
    private static final Pattern ORDER_CODE_PATTERN = Pattern.compile("(PHO(?:1986)?-[A-Z0-9-]+)", Pattern.CASE_INSENSITIVE);

    private final SepayProperties sepayProperties;

    public SepayIpnHandler(SepayProperties sepayProperties) {
        this.sepayProperties = sepayProperties;
    }

    /**
     * Xác thực Secret Key từ SePay IPN webhook (Constant-time comparison)
     */
    public void verifyIpnSecret(String authHeader, String secretHeader) {
        String configuredSecret = sepayProperties.getIpnSecret();
        if (!StringUtils.hasText(configuredSecret)) {
            log.error("[SePay IPN] SEPAY_IPN_SECRET chưa được cấu hình trong hệ thống!");
            throw new IllegalStateException("SEPAY_IPN_SECRET_NOT_CONFIGURED");
        }

        String receivedSecret = null;
        if (StringUtils.hasText(secretHeader)) {
            receivedSecret = secretHeader.trim();
        } else if (StringUtils.hasText(authHeader)) {
            String trimmed = authHeader.trim();
            if (trimmed.startsWith("ApiKey ")) {
                receivedSecret = trimmed.substring(7).trim();
            } else if (trimmed.startsWith("Bearer ")) {
                receivedSecret = trimmed.substring(7).trim();
            } else {
                receivedSecret = trimmed;
            }
        }

        if (receivedSecret == null || !MessageDigest.isEqual(
                configuredSecret.getBytes(StandardCharsets.UTF_8),
                receivedSecret.getBytes(StandardCharsets.UTF_8))) {
            log.warn("[SePay IPN] Từ chối webhook do sai IPN Secret!");
            throw new SecurityException("Xác thực SePay IPN thất bại: Secret Token không hợp lệ!");
        }
    }

    /**
     * Trích xuất mã đơn hàng từ trường code / content / description của SePay IPN payload
     */
    public String extractOrderCode(SepayIpnPayload payload) {
        if (payload == null) return null;

        String orderCode = null;
        if (StringUtils.hasText(payload.getCode())) {
            orderCode = payload.getCode().trim();
        } else if (StringUtils.hasText(payload.getContent())) {
            orderCode = parseOrderCodeFromText(payload.getContent());
        } else if (StringUtils.hasText(payload.getDescription())) {
            orderCode = parseOrderCodeFromText(payload.getDescription());
        }

        if (!StringUtils.hasText(orderCode)) {
            throw new IllegalArgumentException("Không thể xác định mã đơn hàng từ dữ liệu SePay IPN!");
        }
        return orderCode;
    }

    /**
     * Kiểm tra số tiền chuyển khoản có khớp với giá trị đơn hàng hay không
     */
    public void validateAmount(Double receivedAmount, Double expectedAmount) {
        if (receivedAmount != null && Math.abs(receivedAmount - expectedAmount) > 1.0) {
            throw new IllegalArgumentException(String.format(
                    "Số tiền nhận từ SePay (%.0f đ) không khớp với giá trị đơn hàng (%.0f đ)!",
                    receivedAmount, expectedAmount
            ));
        }
    }

    /**
     * Xác định URL điều hướng người dùng sau khi SePay redirect về backend
     */
    public String resolveReturnUrl(String status, String orderCode) {
        String baseUrl = StringUtils.hasText(sepayProperties.getBookingFrontendRedirectUrl())
                ? sepayProperties.getBookingFrontendRedirectUrl()
                : "http://localhost:5173#order";

        String separator = baseUrl.contains("?") ? "&" : "?";
        return String.format("%s%spaymentStatus=%s&orderCode=%s", baseUrl, separator, status, orderCode != null ? orderCode : "");
    }

    private String parseOrderCodeFromText(String text) {
        if (!StringUtils.hasText(text)) return null;
        Matcher matcher = ORDER_CODE_PATTERN.matcher(text);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return text.trim();
    }
}

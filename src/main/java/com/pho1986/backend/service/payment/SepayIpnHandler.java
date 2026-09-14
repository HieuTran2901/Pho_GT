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
        String configuredIpnSecret = sepayProperties.getIpnSecret();
        String configuredSecretKey = sepayProperties.getSecretKey();

        String receivedSecret = null;
        if (StringUtils.hasText(secretHeader)) {
            receivedSecret = secretHeader.trim();
        } else if (StringUtils.hasText(authHeader)) {
            String trimmed = authHeader.trim();
            if (trimmed.regionMatches(true, 0, "ApiKey ", 0, 7)) {
                receivedSecret = trimmed.substring(7).trim();
            } else if (trimmed.regionMatches(true, 0, "Bearer ", 0, 7)) {
                receivedSecret = trimmed.substring(7).trim();
            } else {
                receivedSecret = trimmed;
            }
        }

        log.info("[SePay IPN Auth] Header Auth: [{}], Header Secret: [{}], Received: [{}]",
                authHeader != null ? (authHeader.length() > 12 ? authHeader.substring(0, 12) + "..." : authHeader) : "null",
                secretHeader != null ? "***" : "null",
                receivedSecret != null ? (receivedSecret.length() > 4 ? receivedSecret.substring(0, 4) + "***" : "***") : "null");

        boolean matchesIpnSecret = StringUtils.hasText(configuredIpnSecret) && receivedSecret != null &&
                MessageDigest.isEqual(configuredIpnSecret.getBytes(StandardCharsets.UTF_8), receivedSecret.getBytes(StandardCharsets.UTF_8));

        boolean matchesSecretKey = StringUtils.hasText(configuredSecretKey) && receivedSecret != null &&
                MessageDigest.isEqual(configuredSecretKey.getBytes(StandardCharsets.UTF_8), receivedSecret.getBytes(StandardCharsets.UTF_8));

        if (!matchesIpnSecret && !matchesSecretKey) {
            log.warn("[SePay IPN] Từ chối webhook do sai IPN Secret! Nhận: [{}]",
                    receivedSecret != null ? (receivedSecret.length() > 4 ? receivedSecret.substring(0, 4) + "***" : "***") : "NULL");
            throw new SecurityException("Xác thực SePay IPN thất bại: Secret Token không hợp lệ!");
        }
    }

    /**
     * Kiểm tra xem gói tin có phải là test ping từ SePay Dashboard hay không
     */
    public boolean isTestPing(SepayIpnPayload payload, String lookupCode) {
        if (payload == null) return false;
        String content = payload.getContent();
        String desc = payload.getDescription();
        String code = payload.getCode();
        return (content != null && content.toUpperCase().contains("TEST"))
                || (desc != null && desc.toUpperCase().contains("TEST"))
                || (code != null && code.toUpperCase().contains("TEST"))
                || (lookupCode != null && lookupCode.toUpperCase().contains("TEST"));
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
            if (isTestPing(payload, null)) {
                return "TEST-ORDER";
            }
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

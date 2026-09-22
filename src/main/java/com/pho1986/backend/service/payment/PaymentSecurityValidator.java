package com.pho1986.backend.service.payment;

import com.pho1986.backend.model.dto.PaymentDtos.ConfirmPaymentRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Component
public class PaymentSecurityValidator {

    private static final Logger log = LoggerFactory.getLogger(PaymentSecurityValidator.class);
    public static final int MIN_SECRET_LENGTH = 32;

    public void validateConfirmation(
            String webhookSecret,
            String paymentCode,
            ConfirmPaymentRequest request,
            Authentication authentication) {

        // 1. Nếu là tài khoản quản trị viên ROLE_ADMIN đã xác thực -> Cho phép xác nhận trực tiếp
        boolean isAdmin = authentication != null && authentication.isAuthenticated()
                && !(authentication instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)
                && authentication.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        if (isAdmin) {
            log.info("[PaymentSecurity] Xác nhận thanh toán qua quyền quản trị viên ROLE_ADMIN cho giao dịch [{}]", paymentCode);
            return;
        }

        // 2. Kiểm tra webhook secret cấu hình trên hệ thống (bắt buộc non-empty và >= 32 ký tự)
        if (!StringUtils.hasText(webhookSecret) || webhookSecret.trim().length() < MIN_SECRET_LENGTH) {
            log.error("[PaymentSecurity] Cổng thanh toán chưa cấu hình Webhook Secret an toàn (tối thiểu 32 ký tự)!");
            throw new SecurityException("Xác thực cổng thanh toán thất bại: Secret Key của hệ thống không hợp lệ hoặc không an toàn!");
        }

        // 3. Trích xuất và kiểm tra secret key / signature do caller gửi lên
        String providedSecret = (request != null && request.getSecretKey() != null) ? request.getSecretKey().trim() : null;
        String providedSignature = (request != null && request.getSignature() != null) ? request.getSignature().trim() : null;

        boolean hasSecret = StringUtils.hasText(providedSecret);
        boolean hasSignature = StringUtils.hasText(providedSignature);

        if (!hasSecret && !hasSignature) {
            throw new SecurityException("Xác thực cổng thanh toán thất bại: Secret Key không được để trống!");
        }

        // 4. So sánh chuỗi byte hằng số thời gian chống timing attack
        boolean secretMatches = false;
        if (hasSecret) {
            if (providedSecret.length() >= MIN_SECRET_LENGTH) {
                secretMatches = MessageDigest.isEqual(
                        webhookSecret.trim().getBytes(StandardCharsets.UTF_8),
                        providedSecret.getBytes(StandardCharsets.UTF_8)
                );
            }
        }

        // 5. Hỗ trợ xác thực chữ ký số HMAC-SHA256 (từ signature hoặc fallback secretKey)
        boolean hmacMatches = false;
        if (!secretMatches) {
            if (hasSignature) {
                hmacMatches = verifyHmacSha256(paymentCode, (request != null ? request.getAmount() : null), webhookSecret.trim(), providedSignature);
            }
            if (!hmacMatches && hasSecret && providedSecret.length() >= MIN_SECRET_LENGTH) {
                hmacMatches = verifyHmacSha256(paymentCode, (request != null ? request.getAmount() : null), webhookSecret.trim(), providedSecret);
            }
        }

        if (!secretMatches && !hmacMatches) {
            throw new SecurityException("Xác thực cổng thanh toán thất bại: Secret Key không hợp lệ!");
        }
    }

    public boolean verifyHmacSha256(String paymentCode, Double amount, String secret, String candidateHex) {
        if (!StringUtils.hasText(candidateHex) || !StringUtils.hasText(secret) || !StringUtils.hasText(paymentCode)) {
            return false;
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String trimmedCandidate = candidateHex.trim().toLowerCase(java.util.Locale.ROOT);

            // 1. Kiểm tra chữ ký tính theo định dạng paymentCode|amount (chuẩn hóa Locale.ROOT)
            if (amount != null) {
                String payloadWithAmount = paymentCode + "|" + String.format(java.util.Locale.ROOT, "%.0f", amount);
                byte[] hashWithAmount = mac.doFinal(payloadWithAmount.getBytes(StandardCharsets.UTF_8));
                String hexAmount = java.util.HexFormat.of().formatHex(hashWithAmount);
                if (MessageDigest.isEqual(hexAmount.getBytes(StandardCharsets.UTF_8), trimmedCandidate.getBytes(StandardCharsets.UTF_8))) {
                    return true;
                }
            }

            // 2. Kiểm tra chữ ký tính theo paymentCode độc lập
            byte[] hashOnlyCode = mac.doFinal(paymentCode.getBytes(StandardCharsets.UTF_8));
            String hexCode = java.util.HexFormat.of().formatHex(hashOnlyCode);
            return MessageDigest.isEqual(
                    hexCode.getBytes(StandardCharsets.UTF_8),
                    trimmedCandidate.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            return false;
        }
    }
}

package com.pho1986.backend.common;

import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Tiện ích che mờ dữ liệu cá nhân (PII) và băm an toàn theo quy chuẩn SEC-R009.
 */
public final class PiiMaskUtils {

    private PiiMaskUtils() {}

    /**
     * Che mờ số điện thoại theo định dạng chuẩn: 098****888.
     */
    public static String maskPhone(String phone) {
        if (!StringUtils.hasText(phone)) {
            return "***";
        }
        String clean = phone.trim();
        if (clean.length() <= 4) {
            return "****";
        }
        if (clean.length() <= 7) {
            return clean.substring(0, 2) + "****" + clean.substring(clean.length() - 2);
        }
        return clean.substring(0, 3) + "****" + clean.substring(clean.length() - 3);
    }

    /**
     * Băm chuỗi SHA-256 trả về chuỗi Hex viết thường (dùng cho RefreshToken, Guest OrderAccessToken).
     */
    public static String sha256Hex(String input) {
        if (input == null) return null;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Thuật toán SHA-256 không khả dụng trên hệ thống", e);
        }
    }
}

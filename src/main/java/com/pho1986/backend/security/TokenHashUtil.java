package com.pho1986.backend.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * [SENTINEL & BLADE] Utility for cryptographic one-way hashing of Refresh Tokens.
 * Converts raw JWT refresh tokens into standard 64-character SHA-256 hex hashes.
 */
public final class TokenHashUtil {

    private TokenHashUtil() {
        // Private constructor for utility class
    }

    /**
     * Compute a standard SHA-256 hex hash of the given raw token string.
     *
     * @param rawToken The plain text refresh token
     * @return 64-character lowercase hexadecimal hash, or null if input is null
     */
    public static String sha256Hex(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(64);
            for (byte b : encodedHash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not supported in this JVM environment", e);
        }
    }
}

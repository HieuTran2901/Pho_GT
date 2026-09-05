package com.pho1986.backend.security;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

/**
 * [SECURITY_AGENT] Token Revocation Service
 * Manages an in-memory, thread-safe token blacklist for immediate token revocation upon logout.
 * Expired entries are automatically pruned to maintain constant memory overhead.
 */
@Service
public class TokenRevocationService {

    // Map of token -> expiry epoch milliseconds
    private final ConcurrentHashMap<String, Long> revokedTokens = new ConcurrentHashMap<>();

    /**
     * Revoke a token until its natural expiration time
     * @param token JWT string or JTI
     * @param expiresAtMs Absolute timestamp in ms when the token would have expired
     */
    public void revoke(String token, long expiresAtMs) {
        if (token == null || token.isBlank()) return;
        revokedTokens.put(token, expiresAtMs);
        pruneExpired();
    }

    /**
     * Convenience method to revoke a token with default 15-minute buffer
     */
    public void revoke(String token) {
        if (token == null || token.isBlank()) return;
        long defaultExpiry = System.currentTimeMillis() + (15 * 60 * 1000);
        revoke(token, defaultExpiry);
    }

    /**
     * Check if a token is in the blacklist
     */
    public boolean isRevoked(String token) {
        if (token == null || token.isBlank()) return false;
        Long expiry = revokedTokens.get(token);
        if (expiry == null) return false;

        if (System.currentTimeMillis() > expiry) {
            revokedTokens.remove(token);
            return false;
        }
        return true;
    }

    /**
     * Periodic cleanup of tokens that have naturally expired past their JWT exp
     */
    public void pruneExpired() {
        long now = System.currentTimeMillis();
        revokedTokens.entrySet().removeIf(entry -> now > entry.getValue());
    }

    public int size() {
        pruneExpired();
        return revokedTokens.size();
    }
}

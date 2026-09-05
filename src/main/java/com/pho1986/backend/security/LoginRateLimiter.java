package com.pho1986.backend.security;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;

/**
 * [SECURITY_AGENT] Login Rate Limiter
 * Enforces brute-force protection: Max 5 failed attempts per phone number / IP within a 60-second window.
 */
@Component
public class LoginRateLimiter {

    private static final int MAX_ATTEMPTS = 5;
    private static final long BLOCK_DURATION_MS = 60 * 1000; // 1 minute

    private static class AttemptTracker {
        int failedAttempts = 0;
        long lastFailedTime = 0;
        long blockedUntil = 0;
    }

    private final ConcurrentHashMap<String, AttemptTracker> attempts = new ConcurrentHashMap<>();

    /**
     * Check if a key (e.g. phone number or IP) is currently blocked
     */
    public boolean isBlocked(String key) {
        if (key == null) return false;
        AttemptTracker tracker = attempts.get(key);
        if (tracker == null) return false;

        long now = System.currentTimeMillis();
        if (tracker.blockedUntil > now) {
            return true;
        }

        // If block period has elapsed, reset
        if (tracker.blockedUntil > 0 && tracker.blockedUntil <= now) {
            attempts.remove(key);
            return false;
        }

        // If last attempt was more than 1 minute ago, reset counter
        if (now - tracker.lastFailedTime > BLOCK_DURATION_MS) {
            attempts.remove(key);
            return false;
        }

        return false;
    }

    /**
     * Record a failed login attempt
     */
    public void recordFailure(String key) {
        if (key == null) return;
        long now = System.currentTimeMillis();
        attempts.compute(key, (k, tracker) -> {
            if (tracker == null || (now - tracker.lastFailedTime > BLOCK_DURATION_MS && tracker.blockedUntil <= now)) {
                tracker = new AttemptTracker();
            }
            tracker.failedAttempts++;
            tracker.lastFailedTime = now;

            if (tracker.failedAttempts >= MAX_ATTEMPTS) {
                tracker.blockedUntil = now + BLOCK_DURATION_MS;
            }
            return tracker;
        });
    }

    /**
     * Reset failure counter on successful login
     */
    public void reset(String key) {
        if (key != null) {
            attempts.remove(key);
        }
    }

    /**
     * Get remaining block seconds
     */
    public long getRemainingBlockSeconds(String key) {
        AttemptTracker tracker = attempts.get(key);
        if (tracker == null || tracker.blockedUntil <= System.currentTimeMillis()) {
            return 0;
        }
        return Math.max(1, (tracker.blockedUntil - System.currentTimeMillis()) / 1000);
    }
}

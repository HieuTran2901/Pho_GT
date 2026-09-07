package com.pho1986.backend.security;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;

/**
 * [SECURITY_AGENT] Payment Creation Rate Limiter
 * Ngăn chặn tấn công DDoS / brute-force tạo giao dịch rác:
 * Giới hạn tối đa 15 yêu cầu tạo thanh toán trong vòng 60 giây cho mỗi Client IP / User ID.
 */
@Component
public class PaymentRateLimiter {

    private static final int MAX_REQUESTS = 15;
    private static final long WINDOW_DURATION_MS = 60 * 1000; // 1 phút
    private static final long BLOCK_DURATION_MS = 120 * 1000; // Khóa 2 phút nếu vượt ngưỡng

    private static class RequestTracker {
        int count = 0;
        long windowStartTime = System.currentTimeMillis();
        long blockedUntil = 0;
    }

    private final ConcurrentHashMap<String, RequestTracker> trackers = new ConcurrentHashMap<>();

    public boolean isAllowed(String clientKey) {
        if (clientKey == null || clientKey.isBlank()) {
            return true;
        }

        long now = System.currentTimeMillis();
        RequestTracker tracker = trackers.compute(clientKey, (k, existing) -> {
            if (existing == null) {
                RequestTracker fresh = new RequestTracker();
                fresh.count = 1;
                fresh.windowStartTime = now;
                return fresh;
            }

            // Nếu đang bị khóa
            if (existing.blockedUntil > now) {
                return existing;
            }

            // Nếu cửa sổ 60s đã trôi qua, reset lại bộ đếm
            if (now - existing.windowStartTime > WINDOW_DURATION_MS) {
                existing.count = 1;
                existing.windowStartTime = now;
                existing.blockedUntil = 0;
                return existing;
            }

            // Tăng số lần request trong cửa sổ hiện tại
            existing.count++;
            if (existing.count > MAX_REQUESTS) {
                existing.blockedUntil = now + BLOCK_DURATION_MS;
            }

            return existing;
        });

        return tracker.blockedUntil <= now;
    }

    public long getRemainingBlockSeconds(String clientKey) {
        if (clientKey == null) return 0;
        RequestTracker tracker = trackers.get(clientKey);
        if (tracker == null || tracker.blockedUntil <= System.currentTimeMillis()) {
            return 0;
        }
        return (tracker.blockedUntil - System.currentTimeMillis()) / 1000;
    }
}

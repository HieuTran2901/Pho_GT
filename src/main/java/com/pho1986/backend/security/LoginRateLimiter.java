package com.pho1986.backend.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;

/**
 * [SECURITY_AGENT] Enhanced Login & Registration Rate Limiter
 * - Login: Tối đa 5 lần thử sai cho mỗi Số điện thoại / Địa chỉ IP trong 60 giây (Chống Brute-force & Password Spraying).
 * - Registration: Tối đa 5 lần tạo tài khoản từ cùng 1 IP trong 10 phút (Chống DoS / Spam tài khoản rác).
 */
@Component
public class LoginRateLimiter {

    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int MAX_IP_LOGIN_ATTEMPTS = 30; // Chống DDoS/Password Spray diện rộng mà không cản trở 5 vòng thử (25 lần) của người dùng hợp lệ
    private static final long LOGIN_BLOCK_DURATION_MS = 60 * 1000L; // 1 phút

    private static final int MAX_REGISTRATIONS_PER_WINDOW = 5;
    private static final long REGISTRATION_WINDOW_MS = 10 * 60 * 1000L; // 10 phút

    private static class AttemptTracker {
        int failedAttempts = 0;
        long lastFailedTime = 0;
        long blockedUntil = 0;
    }

    private static class RegistrationTracker {
        int count = 0;
        long windowStartTime = System.currentTimeMillis();
    }

    private final ConcurrentHashMap<String, AttemptTracker> attempts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, RegistrationTracker> registrationAttempts = new ConcurrentHashMap<>();

    /**
     * Trích xuất Client IP an toàn từ Request (hỗ trợ reverse proxy headers)
     */
    public String extractClientIp(HttpServletRequest request) {
        if (request == null) return "unknown";
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        String remoteAddr = request.getRemoteAddr();
        return (remoteAddr != null && !remoteAddr.isBlank()) ? remoteAddr : "unknown";
    }

    /**
     * Kiểm tra chặn đăng nhập theo cả Số điện thoại và IP
     */
    public boolean isLoginBlocked(String phone, String clientIp) {
        boolean phoneBlocked = phone != null && isBlocked("phone:" + phone);
        boolean ipBlocked = clientIp != null && !"unknown".equals(clientIp) && isBlocked("ip:" + clientIp);
        return phoneBlocked || ipBlocked;
    }

    /**
     * Ghi nhận 1 lần đăng nhập thất bại cho cả Phone và IP
     */
    public void recordLoginFailure(String phone, String clientIp) {
        if (phone != null) recordFailure("phone:" + phone);
        if (clientIp != null && !"unknown".equals(clientIp)) recordFailure("ip:" + clientIp);
    }

    /**
     * Đặt lại bộ đếm khi đăng nhập thành công
     */
    public void resetLogin(String phone, String clientIp) {
        if (phone != null) reset("phone:" + phone);
        if (clientIp != null && !"unknown".equals(clientIp)) reset("ip:" + clientIp);
    }

    /**
     * Lấy thời gian còn lại cần chờ khi đăng nhập bị khóa (giây)
     */
    public long getRemainingLoginBlockSeconds(String phone, String clientIp) {
        long phoneWait = phone != null ? getRemainingBlockSeconds("phone:" + phone) : 0;
        long ipWait = (clientIp != null && !"unknown".equals(clientIp)) ? getRemainingBlockSeconds("ip:" + clientIp) : 0;
        return Math.max(phoneWait, ipWait);
    }

    /**
     * Kiểm tra giới hạn tần suất đăng ký tài khoản từ IP
     */
    public boolean isRegistrationBlocked(String clientIp) {
        if (clientIp == null || "unknown".equals(clientIp)) return false;
        RegistrationTracker tracker = registrationAttempts.get(clientIp);
        if (tracker == null) return false;

        long now = System.currentTimeMillis();
        if (now - tracker.windowStartTime > REGISTRATION_WINDOW_MS) {
            registrationAttempts.remove(clientIp);
            return false;
        }
        return tracker.count >= MAX_REGISTRATIONS_PER_WINDOW;
    }

    /**
     * Ghi nhận 1 lần đăng ký thành công từ IP
     */
    public void recordRegistration(String clientIp) {
        if (clientIp == null || "unknown".equals(clientIp)) return;
        long now = System.currentTimeMillis();
        registrationAttempts.compute(clientIp, (ip, tracker) -> {
            if (tracker == null || now - tracker.windowStartTime > REGISTRATION_WINDOW_MS) {
                RegistrationTracker newTracker = new RegistrationTracker();
                newTracker.count = 1;
                newTracker.windowStartTime = now;
                return newTracker;
            }
            tracker.count++;
            return tracker;
        });
    }

    /**
     * Thời gian chờ còn lại của lượt chặn đăng ký (giây)
     */
    public long getRemainingRegistrationBlockSeconds(String clientIp) {
        RegistrationTracker tracker = registrationAttempts.get(clientIp);
        if (tracker == null) return 0;
        long elapsed = System.currentTimeMillis() - tracker.windowStartTime;
        if (elapsed > REGISTRATION_WINDOW_MS) return 0;
        return Math.max(1, (REGISTRATION_WINDOW_MS - elapsed) / 1000);
    }

    /**
     * Check if a key (e.g. phone number or IP) is currently blocked (Tương thích ngược)
     */
    public boolean isBlocked(String key) {
        if (key == null) return false;
        AttemptTracker tracker = attempts.get(key);
        if (tracker == null && !key.startsWith("phone:") && !key.startsWith("ip:")) {
            tracker = attempts.get("phone:" + key);
        }
        if (tracker == null) return false;

        long now = System.currentTimeMillis();
        if (tracker.blockedUntil > now) {
            return true;
        }

        if (tracker.blockedUntil > 0 && tracker.blockedUntil <= now) {
            attempts.remove(key);
            return false;
        }

        if (now - tracker.lastFailedTime > LOGIN_BLOCK_DURATION_MS) {
            attempts.remove(key);
            return false;
        }

        return false;
    }

    public void recordFailure(String key) {
        if (key == null) return;
        long now = System.currentTimeMillis();
        attempts.compute(key, (k, tracker) -> {
            if (tracker == null || (now - tracker.lastFailedTime > LOGIN_BLOCK_DURATION_MS && tracker.blockedUntil <= now)) {
                tracker = new AttemptTracker();
            }
            tracker.failedAttempts++;
            tracker.lastFailedTime = now;

            int maxAttempts = key.startsWith("ip:") ? MAX_IP_LOGIN_ATTEMPTS : MAX_LOGIN_ATTEMPTS;
            if (tracker.failedAttempts >= maxAttempts) {
                tracker.blockedUntil = now + LOGIN_BLOCK_DURATION_MS;
            }
            return tracker;
        });
    }

    public void reset(String key) {
        if (key != null) {
            attempts.remove(key);
        }
    }

    public long getRemainingBlockSeconds(String key) {
        AttemptTracker tracker = attempts.get(key);
        if (tracker == null && !key.startsWith("phone:") && !key.startsWith("ip:")) {
            tracker = attempts.get("phone:" + key);
        }
        if (tracker == null || tracker.blockedUntil <= System.currentTimeMillis()) {
            return 0;
        }
        return Math.max(1, (tracker.blockedUntil - System.currentTimeMillis()) / 1000);
    }
}

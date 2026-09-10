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

    // Map of userId -> lock reason (Real-Time In-Memory Kill Switch)
    private final ConcurrentHashMap<String, String> lockedUsers = new ConcurrentHashMap<>();

    private final com.pho1986.backend.repository.UserRepository userRepository;

    public TokenRevocationService(com.pho1986.backend.repository.UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Tự động nạp danh sách các tài khoản đang bị khóa từ cơ sở dữ liệu khi khởi động ứng dụng
     */
    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    public void loadLockedUsersOnStartup() {
        try {
            // Tự động chuẩn hóa các tài khoản SUSPENDED cũ sang LOCKED (nếu có)
            java.util.List<com.pho1986.backend.model.entity.User> suspended = userRepository.findByStatusIn(java.util.List.of("SUSPENDED"));
            for (com.pho1986.backend.model.entity.User u : suspended) {
                u.setStatus("LOCKED");
                if (u.getLockType() == null) u.setLockType("ADMIN_MANUAL");
                userRepository.save(u);
            }

            java.util.List<com.pho1986.backend.model.entity.User> locked = userRepository.findByStatusIn(java.util.List.of("LOCKED"));
            for (com.pho1986.backend.model.entity.User u : locked) {
                String reason = u.getLockReason() != null ? u.getLockReason() : "Tài khoản bị khóa bởi Quản trị viên";
                lockedUsers.put(u.getId(), reason);
            }
            org.slf4j.LoggerFactory.getLogger(TokenRevocationService.class)
                    .info("[SENTINEL] Đã nạp {} tài khoản bị khóa vào In-Memory Kill Switch Cache.", locked.size());
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(TokenRevocationService.class)
                    .warn("[SENTINEL] Không thể nạp tài khoản bị khóa khi khởi động: {}", e.getMessage());
        }
    }

    /**
     * Kích hoạt Kill Switch ngay lập tức cho một tài khoản (O(1) in-memory)
     */
    public void lockUser(String userId, String reason) {
        if (userId == null || userId.isBlank()) return;
        lockedUsers.put(userId, (reason != null && !reason.isBlank()) ? reason : "Tài khoản bị khóa bởi Quản trị viên");
    }

    public void lockUser(String userId) {
        lockUser(userId, "Tài khoản bị khóa bởi Quản trị viên");
    }

    /**
     * Mở khóa Kill Switch cho tài khoản
     */
    public void unlockUser(String userId) {
        if (userId != null) {
            lockedUsers.remove(userId);
        }
    }

    /**
     * Kiểm tra trạng thái khóa O(1) không tốn chi phí truy vấn Database
     */
    public boolean isUserLocked(String userId) {
        if (userId == null || userId.isBlank()) return false;
        return lockedUsers.containsKey(userId);
    }

    public String getLockReason(String userId) {
        if (userId == null) return null;
        return lockedUsers.get(userId);
    }

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

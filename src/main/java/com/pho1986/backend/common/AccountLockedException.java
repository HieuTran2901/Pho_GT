package com.pho1986.backend.common;

import java.time.LocalDateTime;

/**
 * [SECURITY_AGENT] AccountLockedException
 * Ném ra khi tài khoản người dùng đã vượt quá 5 vòng thử (25 lần nhập sai mật khẩu)
 * và bị khóa cứng ở trạng thái LOCKED cấp cơ sở dữ liệu.
 */
public class AccountLockedException extends RuntimeException {

    private final String phone;
    private final LocalDateTime lockedAt;
    private final String lockReason;

    public AccountLockedException(String phone, String message) {
        this(phone, message, LocalDateTime.now(), "BRUTE_FORCE_EXCEEDED");
    }

    public AccountLockedException(String phone, String message, LocalDateTime lockedAt, String lockReason) {
        super(message);
        this.phone = phone;
        this.lockedAt = lockedAt;
        this.lockReason = lockReason;
    }

    public String getPhone() {
        return phone;
    }

    public LocalDateTime getLockedAt() {
        return lockedAt;
    }

    public String getLockReason() {
        return lockReason;
    }
}

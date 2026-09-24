package com.pho1986.backend.service.auth;

import com.pho1986.backend.common.AccountLockedException;
import com.pho1986.backend.common.LoginRateLimitExceededException;
import com.pho1986.backend.model.entity.User;
import com.pho1986.backend.repository.UserRepository;
import com.pho1986.backend.security.LoginRateLimiter;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Encapsulates progressive brute-force defense, account lock evaluation,
 * and rate-limiting failure tracking for login workflows.
 */
@Component
public class LoginAttemptPolicy {

    private final UserRepository userRepository;
    private final LoginRateLimiter loginRateLimiter;

    public LoginAttemptPolicy(UserRepository userRepository, LoginRateLimiter loginRateLimiter) {
        this.userRepository = userRepository;
        this.loginRateLimiter = loginRateLimiter;
    }

    public void checkPreLoginGuards(User user, String clientIp) {
        // 1. Kiểm tra chặn mức IP chống DDoS / Bot spray diện rộng (>30 lần/phút)
        if (clientIp != null && !"unknown".equals(clientIp) && loginRateLimiter.isBlocked("ip:" + clientIp)) {
            long remainingSeconds = loginRateLimiter.getRemainingBlockSeconds("ip:" + clientIp);
            int round = (user != null) ? Math.max(1, Math.min(5, user.getLockoutRounds() + 1)) : 1;
            throw new LoginRateLimitExceededException(
                    "Địa chỉ IP của bạn đang bị tạm khóa do gửi quá nhiều yêu cầu liên tiếp. Vui lòng thử lại sau " + remainingSeconds + " giây.",
                    remainingSeconds, round, 5, 5);
        }

        // 2. Nếu tài khoản đã tồn tại: Kiểm tra khóa cứng và tạm khóa theo vòng
        if (user != null) {
            // 2.1 Kiểm tra khóa cứng cấp độ cơ sở dữ liệu (Sau 5 vòng = 25 lần sai)
            if (user.isAccountLocked()) {
                throw new AccountLockedException(
                        user.getPhone(),
                        "Tài khoản của quý khách đã bị khóa vĩnh viễn do vượt quá 5 vòng thử (25 lần nhập sai). Kính mời liên hệ Hotline Phở 1986 (0986 1986 86) hoặc Quản trị viên để được hỗ trợ mở khóa.",
                        user.getLockedAt(),
                        user.getLockReason()
                );
            }

            // 2.2 Kiểm tra thời gian tạm khóa theo vòng hiện tại
            if (user.isTemporarilyBlocked()) {
                long remainingSec = user.getRemainingTemporaryLockSeconds();
                int currentRound = Math.max(1, Math.min(user.getLockoutRounds(), 5));
                int nextRound = Math.min(5, currentRound + 1);
                throw new LoginRateLimitExceededException(
                        "Quý khách đang trong thời gian tạm dừng đăng nhập của Vòng " + currentRound + "/5. Vòng tiếp theo: Vòng " + nextRound + "/5. Vui lòng thử lại sau " + remainingSec + " giây.",
                        remainingSec, currentRound, 5, 5);
            }
        }
    }

    public void handleFailedPassword(User user, String clientIp) {
        loginRateLimiter.recordLoginFailure(null, clientIp); // Ghi nhận IP

        int nextAttempt = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(nextAttempt);

        // Nếu đạt đủ 5 lần sai trong vòng hiện tại -> kích hoạt tạm khóa vòng
        if (nextAttempt >= 5) {
            int nextRound = user.getLockoutRounds() + 1;
            user.setLockoutRounds(nextRound);
            user.setFailedLoginAttempts(0); // Reset số lần đếm trong vòng

            if (nextRound >= 5) {
                // VƯỢT QUÁ 5 VÒNG THỬ -> KHÓA CỨNG TÀI KHOẢN VĨNH VIỄN
                user.setStatus("LOCKED");
                user.setLockedAt(LocalDateTime.now());
                user.setLockType("PASSWORD_FAILED");
                user.setLockReason("BRUTE_FORCE_EXCEEDED");
                user.setLockedUntil(null);
                userRepository.saveAndFlush(user);

                throw new AccountLockedException(
                        user.getPhone(),
                        "Tài khoản của bạn đã bị khóa bảo vệ do nhập sai quá 5 vòng thử (25 lần thử). Vui lòng liên hệ Hotline hoặc Quản trị viên để mở khóa.",
                        user.getLockedAt(),
                        user.getLockReason()
                );
            } else {
                // TẠM KHÓA THEO THỜI GIAN LŨY TIẾN CỦA VÒNG
                // Vòng 1: 60s, Vòng 2: 180s, Vòng 3: 300s, Vòng 4: 600s
                long cooldownSec = (nextRound == 1) ? 60L : (nextRound == 2) ? 180L : (nextRound == 3) ? 300L : 600L;
                user.setLockType("PASSWORD_FAILED");
                user.setLockedUntil(LocalDateTime.now().plusSeconds(cooldownSec));
                userRepository.saveAndFlush(user);

                int remainingRounds = 5 - nextRound;
                int upcomingRound = nextRound + 1;
                throw new LoginRateLimitExceededException(
                        "Quý khách đã sử dụng hết 5 lần thử của Vòng " + nextRound + "/5. Hệ thống tạm dừng trong " + cooldownSec + " giây. (Vòng tiếp theo: Vòng " + upcomingRound + "/5, còn " + remainingRounds + " vòng thử trước khi tài khoản bị khóa vĩnh viễn)",
                        cooldownSec, nextRound, 5, 5);
            }
        } else {
            // Chưa đủ 5 lần trong vòng hiện tại (1 -> 4 lần)
            userRepository.saveAndFlush(user);
            int remainingInRound = 5 - nextAttempt;
            int currentRound = user.getLockoutRounds() + 1;
            throw new BadCredentialsException(
                    "Số điện thoại hoặc mật khẩu không chính xác. Bạn còn " + remainingInRound + " lần thử trong Vòng " + currentRound + "/5.");
        }
    }

    public void handleSuccessfulLogin(User user, String phone, String clientIp, String deviceId) {
        user.resetLoginFailures();
        if (clientIp != null && !"unknown".equalsIgnoreCase(clientIp)) {
            user.setLastLoginIp(clientIp);
        }
        if (deviceId != null && !deviceId.isBlank()) {
            user.setLastDeviceId(deviceId);
        }
        userRepository.save(user);
        loginRateLimiter.resetLogin(phone, clientIp);
    }

    public void handleNonExistentUser(String phone, String clientIp) {
        loginRateLimiter.recordLoginFailure(phone, clientIp);
        if (loginRateLimiter.isLoginBlocked(phone, clientIp)) {
            long remainingSeconds = loginRateLimiter.getRemainingLoginBlockSeconds(phone, clientIp);
            throw new LoginRateLimitExceededException(
                    "Quý khách đã thử đăng nhập sai quá 5 lần. Vui lòng nghỉ tay và thử lại sau " + remainingSeconds + " giây.",
                    remainingSeconds, 1, 5, 5);
        }
    }
}

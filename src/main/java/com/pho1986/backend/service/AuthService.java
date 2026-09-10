package com.pho1986.backend.service;

import com.pho1986.backend.model.dto.AuthDtos.*;
import com.pho1986.backend.model.entity.*;
import com.pho1986.backend.repository.*;
import com.pho1986.backend.common.LoginRateLimitExceededException;
import com.pho1986.backend.common.AccountLockedException;
import com.pho1986.backend.security.JwtTokenProvider;
import com.pho1986.backend.security.LoginRateLimiter;
import com.pho1986.backend.security.TokenRevocationService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Date;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TasteProfileRepository tasteProfileRepository;
    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenRevocationService tokenRevocationService;
    private final LoginRateLimiter loginRateLimiter;
    private final com.pho1986.backend.security.ThreatDefenseService threatDefenseService;

    public AuthService(
            UserRepository userRepository,
            TasteProfileRepository tasteProfileRepository,
            LoyaltyAccountRepository loyaltyAccountRepository,
            LoyaltyTransactionRepository loyaltyTransactionRepository,
            OrderRepository orderRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            RefreshTokenRepository refreshTokenRepository,
            TokenRevocationService tokenRevocationService,
            LoginRateLimiter loginRateLimiter,
            com.pho1986.backend.security.ThreatDefenseService threatDefenseService) {
        this.userRepository = userRepository;
        this.tasteProfileRepository = tasteProfileRepository;
        this.loyaltyAccountRepository = loyaltyAccountRepository;
        this.loyaltyTransactionRepository = loyaltyTransactionRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenRevocationService = tokenRevocationService;
        this.loginRateLimiter = loginRateLimiter;
        this.threatDefenseService = threatDefenseService;
    }

    private String createAndSaveRefreshToken(User user) {
        String token = tokenProvider.generateRefreshToken(user.getId(), user.getRole());
        LocalDateTime expiryDate = LocalDateTime.now().plusNanos(tokenProvider.getRefreshExpirationMs() * 1_000_000);
        RefreshToken refreshToken = new RefreshToken(user, token, expiryDate);
        refreshTokenRepository.save(refreshToken);
        return token;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        return register(request, null, null);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request, String clientIp, String deviceId) {
        // [SENTINEL] Kiểm tra Blacklist SĐT và Thiết Bị
        if (threatDefenseService.isPhoneBlocked(request.getPhone())) {
            String reason = threatDefenseService.getPhoneBanReason(request.getPhone());
            throw new IllegalArgumentException("Số điện thoại này đã bị đưa vào Danh Sách Cấm của quán: " + (reason != null ? reason : "Vi phạm quy chế."));
        }
        if (deviceId != null && threatDefenseService.isDeviceBlocked(deviceId)) {
            String reason = threatDefenseService.getDeviceBanReason(deviceId);
            throw new IllegalArgumentException("Thiết bị này đã bị cấm đăng ký thành viên mới: " + (reason != null ? reason : "Vi phạm quy chế."));
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("Số điện thoại này đã được đăng ký");
        }
        if (request.getEmail() != null && !request.getEmail().isBlank() && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email này đã được sử dụng");
        }

        User user = new User(
                request.getPhone(),
                request.getFullName(),
                passwordEncoder.encode(request.getPassword()),
                (request.getEmail() != null && !request.getEmail().isBlank()) ? request.getEmail() : null
        );

        user.setLastLoginIp(clientIp);
        user.setLastDeviceId(deviceId);
        user = userRepository.save(user);

        // Khởi tạo Gu Ăn Phở mặc định 1986 nếu người dùng bật cờ ghi nhớ
        if (request.getSaveTasteProfile() == null || Boolean.TRUE.equals(request.getSaveTasteProfile())) {
            TasteProfile tasteProfile = new TasteProfile();
            tasteProfile.setUser(user);
            tasteProfile.setBrothType("DAM_DA");
            tasteProfile.setOnionStyle("NHIEU_HANH");
            tasteProfile.setHerbStyle("DU_RAU");
            tasteProfile.setSpicyLevel(1);
            tasteProfile.setCrullerPref("QUAY_GION");
            tasteProfile.setCustomNote("Chuẩn vị phở gia truyền 1986 (Đã lưu)");
            tasteProfile = tasteProfileRepository.save(tasteProfile);
            user.setTasteProfile(tasteProfile);
        }

        // Khởi tạo Bát Phở Tri Kỷ với 50 điểm chào mừng
        LoyaltyAccount loyaltyAccount = new LoyaltyAccount();
        loyaltyAccount.setUser(user);
        loyaltyAccount.setTotalPoints(50);
        loyaltyAccount.setAvailablePoints(50);
        loyaltyAccount.setMembershipTier("DONG");
        loyaltyAccount = loyaltyAccountRepository.save(loyaltyAccount);
        user.setLoyaltyAccount(loyaltyAccount);

        LoyaltyTransaction transaction = new LoyaltyTransaction(
                loyaltyAccount,
                null,
                50,
                "WELCOME_BONUS",
                50,
                "Điểm chào mừng thành viên mới Phở Gia Truyền 1986"
        );
        loyaltyTransactionRepository.save(transaction);

        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getRole());
        String refreshToken = createAndSaveRefreshToken(user);
        return new AuthResponse(user, accessToken, refreshToken, 50);
    }

    public AuthResponse login(LoginRequest request) {
        return login(request, "unknown", null);
    }

    public AuthResponse login(LoginRequest request, String clientIp) {
        return login(request, clientIp, null);
    }

    @Transactional(noRollbackFor = {
            BadCredentialsException.class,
            LoginRateLimitExceededException.class,
            AccountLockedException.class
    })
    public AuthResponse login(LoginRequest request, String clientIp, String deviceId) {
        User user = userRepository.findByPhone(request.getPhone()).orElse(null);

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

            // 2.3 So khớp mật khẩu
            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
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

            // Đăng nhập THÀNH CÔNG -> Reset toàn bộ trạng thái lỗi
            user.resetLoginFailures();
            if (clientIp != null && !"unknown".equalsIgnoreCase(clientIp)) {
                user.setLastLoginIp(clientIp);
            }
            if (deviceId != null && !deviceId.isBlank()) {
                user.setLastDeviceId(deviceId);
            }
            userRepository.save(user);
            loginRateLimiter.resetLogin(request.getPhone(), clientIp);

            String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getRole());
            String refreshToken = createAndSaveRefreshToken(user);
            return new AuthResponse(user, accessToken, refreshToken);
        }

        // 3. Nếu số điện thoại không tồn tại trong DB -> Bảo vệ bằng LoginRateLimiter (tránh enumeration)
        loginRateLimiter.recordLoginFailure(request.getPhone(), clientIp);
        if (loginRateLimiter.isLoginBlocked(request.getPhone(), clientIp)) {
            long remainingSeconds = loginRateLimiter.getRemainingLoginBlockSeconds(request.getPhone(), clientIp);
            throw new LoginRateLimitExceededException(
                    "Quý khách đã thử đăng nhập sai quá 5 lần. Vui lòng nghỉ tay và thử lại sau " + remainingSeconds + " giây.",
                    remainingSeconds, 1, 5, 5);
        }
        throw new BadCredentialsException("Số điện thoại hoặc mật khẩu không chính xác");
    }

    /**
     * [SECURITY_AGENT] Mở khóa tài khoản người dùng bởi Quản trị viên
     */
    @Transactional
    public User unlockUserAccount(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với mã ID: " + userId));
        user.unlockAccount();
        tokenRevocationService.unlockUser(user.getId());
        return userRepository.save(user);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshTokenString) {
        if (refreshTokenString == null || refreshTokenString.isBlank() || !tokenProvider.validateToken(refreshTokenString)) {
            throw new BadCredentialsException("Phiên đăng nhập đã hết hạn, quý khách vui lòng đăng nhập lại nhé!");
        }

        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenString)
                .orElseThrow(() -> new BadCredentialsException("Phiên đăng nhập không hợp lệ hoặc đã hết hiệu lực."));

        if (refreshToken.isRevoked() || refreshToken.isExpired()) {
            throw new BadCredentialsException("Phiên đăng nhập đã bị thu hồi hoặc đã hết hạn.");
        }

        // [SECURITY_AGENT] Refresh Token Rotation: Revoke old token and issue a fresh one
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        User user = userRepository.findById(refreshToken.getUser().getId()).orElse(refreshToken.getUser());

        // [SENTINEL & BLADE] Chặn triệt để cấp mới token cho tài khoản đã bị khóa
        if (user.isAccountLocked() || "LOCKED".equalsIgnoreCase(user.getStatus())) {
            refreshTokenRepository.revokeAllUserTokens(user);
            throw new AccountLockedException(
                    user.getPhone(),
                    "Tài khoản của quý khách hiện đang bị khóa bởi Quản trị viên. Kính mời liên hệ Hotline Phở 1986 (0986 1986 86) để được hỗ trợ.",
                    user.getLockedAt(),
                    user.getLockReason()
            );
        }

        String newAccessToken = tokenProvider.generateAccessToken(user.getId(), user.getRole());
        String newRefreshToken = createAndSaveRefreshToken(user);

        return new AuthResponse(user, newAccessToken, newRefreshToken);
    }

    @Transactional
    public void logout(String accessToken, String refreshTokenString) {
        // [SECURITY_AGENT] Immediate Access Token Revocation via Blacklist
        if (accessToken != null && !accessToken.isBlank()) {
            Date expiry = tokenProvider.getExpirationDateFromToken(accessToken);
            long expiryMs = (expiry != null) ? expiry.getTime() : System.currentTimeMillis() + tokenProvider.getExpirationMs();
            tokenRevocationService.revoke(accessToken, expiryMs);
            String jti = tokenProvider.getJtiFromToken(accessToken);
            if (jti != null) {
                tokenRevocationService.revoke(jti, expiryMs);
            }
        }

        // [SECURITY_AGENT] Revoke Refresh Token in persistent store
        if (refreshTokenString != null && !refreshTokenString.isBlank()) {
            refreshTokenRepository.findByToken(refreshTokenString).ifPresent(rt -> {
                rt.setRevoked(true);
                refreshTokenRepository.save(rt);
            });
        }
    }

    public User getMe(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        if (user.isAccountLocked() || "LOCKED".equalsIgnoreCase(user.getStatus())) {
            throw new AccountLockedException(
                    user.getPhone(),
                    "Tài khoản của quý khách hiện đang bị khóa bởi Quản trị viên.",
                    user.getLockedAt(),
                    user.getLockReason()
            );
        }
        return user;
    }

    @Transactional
    public AuthResponse postOrderClaim(PostOrderClaimRequest request) {
        Order order = orderRepository.findByOrderCode(request.getOrderCode())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin đơn hàng này"));

        if (order.getUser() != null) {
            throw new IllegalArgumentException("Đơn hàng này đã được gắn vào tài khoản");
        }

        // [SECURITY_AGENT] Chống chiếm đoạt đơn hàng: Bắt buộc số điện thoại claim phải khớp với số điện thoại người đặt
        String cleanClaimPhone = (request.getPhone() != null) ? request.getPhone().replaceAll("[\\s.-]+", "") : "";
        String cleanGuestPhone = (order.getGuestPhone() != null) ? order.getGuestPhone().replaceAll("[\\s.-]+", "") : "";
        if (!cleanClaimPhone.equals(cleanGuestPhone)) {
            throw new IllegalArgumentException("Số điện thoại yêu cầu tích điểm không khớp với số điện thoại đặt đơn hàng này!");
        }

        int earnedPoints = Math.max(10, (int) Math.floor(order.getFinalAmount() / 1000.0));

        User user = userRepository.findByPhone(request.getPhone()).orElse(null);

        if (user == null) {
            user = new User(
                    request.getPhone(),
                    request.getFullName(),
                    passwordEncoder.encode(request.getPassword()),
                    null
            );
            user = userRepository.save(user);

            // Tạo Gu ăn phở
            TasteProfile taste = new TasteProfile();
            taste.setUser(user);
            taste.setCustomNote("Lưu tự động từ đơn đặt đầu tiên");
            taste = tasteProfileRepository.save(taste);
            user.setTasteProfile(taste);

            // Tạo Loyalty Account
            int totalStart = 50 + earnedPoints;
            LoyaltyAccount loyalty = new LoyaltyAccount();
            loyalty.setUser(user);
            loyalty.setTotalPoints(totalStart);
            loyalty.setAvailablePoints(totalStart);
            loyalty.setTotalSpent(order.getFinalAmount());
            loyalty.setTotalOrdersCount(1);
            loyalty.setMembershipTier(totalStart >= 500 ? "BAC" : "DONG");
            loyalty = loyaltyAccountRepository.save(loyalty);
            user.setLoyaltyAccount(loyalty);

            loyaltyTransactionRepository.save(new LoyaltyTransaction(
                    loyalty, null, 50, "WELCOME_BONUS", 50, "Thưởng 50 điểm chào mừng thành viên mới"
            ));

            loyaltyTransactionRepository.save(new LoyaltyTransaction(
                    loyalty, order.getId(), earnedPoints, "EARN_ORDER", totalStart, "Tích điểm từ đơn hàng #" + order.getOrderCode()
            ));

            order.setUser(user);
            orderRepository.save(order);
        } else {
            order.setUser(user);
            orderRepository.save(order);

            LoyaltyAccount loyalty = loyaltyAccountRepository.findByUserId(user.getId()).orElse(null);
            if (loyalty != null) {
                int newTotal = loyalty.getTotalPoints() + earnedPoints;
                int newAvail = loyalty.getAvailablePoints() + earnedPoints;
                loyalty.setTotalPoints(newTotal);
                loyalty.setAvailablePoints(newAvail);
                loyalty.setTotalSpent(loyalty.getTotalSpent() + order.getFinalAmount());
                loyalty.setTotalOrdersCount(loyalty.getTotalOrdersCount() + 1);

                String tier = (newTotal >= 2000) ? "KIM_CUONG" : (newTotal >= 1000) ? "VANG" : (newTotal >= 500) ? "BAC" : "DONG";
                loyalty.setMembershipTier(tier);
                loyaltyAccountRepository.save(loyalty);

                loyaltyTransactionRepository.save(new LoyaltyTransaction(
                        loyalty, order.getId(), earnedPoints, "EARN_ORDER", newAvail, "Tích điểm từ đơn hàng #" + order.getOrderCode()
                ));
            }
        }

        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getRole());
        String refreshToken = createAndSaveRefreshToken(user);
        return new AuthResponse(user, accessToken, refreshToken, earnedPoints);
    }
}

package com.pho1986.backend.service;

import com.pho1986.backend.model.dto.AuthDtos.*;
import com.pho1986.backend.model.entity.*;
import com.pho1986.backend.repository.*;
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
            LoginRateLimiter loginRateLimiter) {
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
        if (loginRateLimiter.isBlocked(request.getPhone())) {
            long remainingSeconds = loginRateLimiter.getRemainingBlockSeconds(request.getPhone());
            throw new BadCredentialsException("Quý khách đã thử đăng nhập sai quá nhiều lần. Vui lòng nghỉ tay ít phút và thử lại sau " 
                    + remainingSeconds + " giây nữa nhé!");
        }

        User user = userRepository.findByPhone(request.getPhone()).orElse(null);
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            loginRateLimiter.recordFailure(request.getPhone());
            throw new BadCredentialsException("Số điện thoại hoặc mật khẩu không chính xác");
        }

        loginRateLimiter.reset(request.getPhone());
        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getRole());
        String refreshToken = createAndSaveRefreshToken(user);
        return new AuthResponse(user, accessToken, refreshToken);
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

        User user = refreshToken.getUser();
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
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));
    }

    @Transactional
    public AuthResponse postOrderClaim(PostOrderClaimRequest request) {
        Order order = orderRepository.findByOrderCode(request.getOrderCode())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin đơn hàng này"));

        if (order.getUser() != null) {
            throw new IllegalArgumentException("Đơn hàng này đã được gắn vào tài khoản");
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

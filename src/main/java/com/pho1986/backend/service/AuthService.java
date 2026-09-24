package com.pho1986.backend.service;

import com.pho1986.backend.common.AccountLockedException;
import com.pho1986.backend.common.LoginRateLimitExceededException;
import com.pho1986.backend.model.dto.AuthDtos.*;
import com.pho1986.backend.model.entity.*;
import com.pho1986.backend.repository.*;
import com.pho1986.backend.security.JwtTokenProvider;
import com.pho1986.backend.security.ThreatDefenseService;
import com.pho1986.backend.security.TokenHashUtil;
import com.pho1986.backend.security.TokenRevocationService;
import com.pho1986.backend.service.auth.LoginAttemptPolicy;
import com.pho1986.backend.service.auth.PostOrderClaimHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final TasteProfileRepository tasteProfileRepository;
    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenRevocationService tokenRevocationService;
    private final ThreatDefenseService threatDefenseService;
    private final CustomerGiftService customerGiftService;
    private final LoginAttemptPolicy loginAttemptPolicy;
    private final PostOrderClaimHelper postOrderClaimHelper;

    public AuthService(
            UserRepository userRepository,
            TasteProfileRepository tasteProfileRepository,
            LoyaltyAccountRepository loyaltyAccountRepository,
            LoyaltyTransactionRepository loyaltyTransactionRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            RefreshTokenRepository refreshTokenRepository,
            TokenRevocationService tokenRevocationService,
            ThreatDefenseService threatDefenseService,
            CustomerGiftService customerGiftService,
            LoginAttemptPolicy loginAttemptPolicy,
            PostOrderClaimHelper postOrderClaimHelper) {
        this.userRepository = userRepository;
        this.tasteProfileRepository = tasteProfileRepository;
        this.loyaltyAccountRepository = loyaltyAccountRepository;
        this.loyaltyTransactionRepository = loyaltyTransactionRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenRevocationService = tokenRevocationService;
        this.threatDefenseService = threatDefenseService;
        this.customerGiftService = customerGiftService;
        this.loginAttemptPolicy = loginAttemptPolicy;
        this.postOrderClaimHelper = postOrderClaimHelper;
    }

    private String createAndSaveRefreshToken(User user, String familyId) {
        String token = tokenProvider.generateRefreshToken(user.getId(), user.getRole());
        String tokenHash = TokenHashUtil.sha256Hex(token);
        String finalFamilyId = (familyId != null && !familyId.isBlank()) ? familyId : UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusNanos(tokenProvider.getRefreshExpirationMs() * 1_000_000);
        RefreshToken refreshToken = new RefreshToken(user, finalFamilyId, tokenHash, expiryDate);
        refreshTokenRepository.save(refreshToken);
        return token;
    }

    private String createAndSaveRefreshToken(User user) {
        return createAndSaveRefreshToken(user, UUID.randomUUID().toString());
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        return register(request, null, null);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request, String clientIp, String deviceId) {
        // Kiểm tra Blacklist SĐT và Thiết Bị
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

        // Gieo 3 món quà chào mừng tri kỷ chuẩn vào ví CSDL của người dùng
        customerGiftService.grantWelcomeGifts(user);

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

        loginAttemptPolicy.checkPreLoginGuards(user, clientIp);

        if (user != null) {
            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                loginAttemptPolicy.handleFailedPassword(user, clientIp);
            }

            loginAttemptPolicy.handleSuccessfulLogin(user, request.getPhone(), clientIp, deviceId);

            String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getRole());
            String refreshToken = createAndSaveRefreshToken(user);
            return new AuthResponse(user, accessToken, refreshToken);
        }

        loginAttemptPolicy.handleNonExistentUser(request.getPhone(), clientIp);
        throw new BadCredentialsException("Số điện thoại hoặc mật khẩu không chính xác");
    }

    /**
     * Mở khóa tài khoản người dùng bởi Quản trị viên
     */
    @Transactional
    public User unlockUserAccount(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với mã ID: " + userId));
        user.unlockAccount();
        tokenRevocationService.unlockUser(user.getId());
        return userRepository.save(user);
    }

    @Transactional(noRollbackFor = { BadCredentialsException.class })
    public AuthResponse refreshToken(String refreshTokenString) {
        if (refreshTokenString == null || refreshTokenString.isBlank() || !tokenProvider.validateToken(refreshTokenString)) {
            throw new BadCredentialsException("Phiên đăng nhập đã hết hạn, quý khách vui lòng đăng nhập lại nhé!");
        }

        String tokenHash = TokenHashUtil.sha256Hex(refreshTokenString);
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadCredentialsException("Phiên đăng nhập không hợp lệ hoặc đã hết hiệu lực."));

        // BREACH CONTAINMENT (RFC 6819 Section 5.2.2.3):
        // Phát hiện tái sử dụng token đã thu hồi (Token Reuse / Theft Attempt)
        if (refreshToken.isRevoked()) {
            String familyId = refreshToken.getFamilyId();
            refreshTokenRepository.revokeFamilyTokens(familyId);
            log.warn("[Security Alert] Phát hiện tái sử dụng RefreshToken đã thu hồi! User: {}, FamilyId: {}. Kích hoạt Breach Containment (thu hồi toàn bộ dòng token của phiên).",
                    refreshToken.getUser().getId(), familyId);
            throw new BadCredentialsException("CẢNH BÁO BẢO MẬT: Phát hiện dấu hiệu phiên đăng nhập bất thường. Để bảo vệ an toàn tài khoản, toàn bộ phiên của thiết bị này đã được ngắt kết nối.");
        }

        if (refreshToken.isExpired()) {
            throw new BadCredentialsException("Phiên đăng nhập đã hết hạn, quý khách vui lòng đăng nhập lại nhé!");
        }

        // Refresh Token Rotation: Revoke old token and issue a fresh one in the same family
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        User user = userRepository.findById(refreshToken.getUser().getId()).orElse(refreshToken.getUser());

        // Chặn triệt để cấp mới token cho tài khoản đã bị khóa
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
        String newRefreshToken = createAndSaveRefreshToken(user, refreshToken.getFamilyId());

        return new AuthResponse(user, newAccessToken, newRefreshToken);
    }

    @Transactional
    public void logout(String accessToken, String refreshTokenString) {
        // Immediate Access Token Revocation via Blacklist
        if (accessToken != null && !accessToken.isBlank()) {
            Date expiry = tokenProvider.getExpirationDateFromToken(accessToken);
            long expiryMs = (expiry != null) ? expiry.getTime() : System.currentTimeMillis() + tokenProvider.getExpirationMs();
            tokenRevocationService.revoke(accessToken, expiryMs);
            String jti = tokenProvider.getJtiFromToken(accessToken);
            if (jti != null) {
                tokenRevocationService.revoke(jti, expiryMs);
            }
        }

        // Revoke Refresh Token in persistent store
        if (refreshTokenString != null && !refreshTokenString.isBlank()) {
            String tokenHash = TokenHashUtil.sha256Hex(refreshTokenString);
            refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(rt -> {
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
        PostOrderClaimHelper.ClaimResult result = postOrderClaimHelper.processClaim(request);
        User user = result.user();
        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getRole());
        String refreshToken = createAndSaveRefreshToken(user);
        return new AuthResponse(user, accessToken, refreshToken, result.earnedPoints());
    }
}

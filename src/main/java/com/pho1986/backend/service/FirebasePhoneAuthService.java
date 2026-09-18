package com.pho1986.backend.service;

import com.google.firebase.auth.FirebaseToken;
import com.pho1986.backend.security.TokenHashUtil;
import com.pho1986.backend.model.dto.AuthDtos.AuthResponse;
import com.pho1986.backend.model.dto.AuthDtos.FirebasePhoneLoginRequest;
import com.pho1986.backend.model.entity.LoyaltyAccount;
import com.pho1986.backend.model.entity.RefreshToken;
import com.pho1986.backend.model.entity.TasteProfile;
import com.pho1986.backend.model.entity.User;
import com.pho1986.backend.repository.LoyaltyAccountRepository;
import com.pho1986.backend.repository.RefreshTokenRepository;
import com.pho1986.backend.repository.TasteProfileRepository;
import com.pho1986.backend.repository.UserRepository;
import com.pho1986.backend.security.JwtTokenProvider;
import com.pho1986.backend.security.ThreatDefenseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class FirebasePhoneAuthService {

    private static final Logger log = LoggerFactory.getLogger(FirebasePhoneAuthService.class);

    private final FirebaseService firebaseService;
    private final UserRepository userRepository;
    private final TasteProfileRepository tasteProfileRepository;
    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ThreatDefenseService threatDefenseService;

    public FirebasePhoneAuthService(
            FirebaseService firebaseService,
            UserRepository userRepository,
            TasteProfileRepository tasteProfileRepository,
            LoyaltyAccountRepository loyaltyAccountRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            RefreshTokenRepository refreshTokenRepository,
            ThreatDefenseService threatDefenseService) {
        this.firebaseService = firebaseService;
        this.userRepository = userRepository;
        this.tasteProfileRepository = tasteProfileRepository;
        this.loyaltyAccountRepository = loyaltyAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.refreshTokenRepository = refreshTokenRepository;
        this.threatDefenseService = threatDefenseService;
    }

    @Transactional
    public AuthResponse authenticate(FirebasePhoneLoginRequest request, String clientIp, String deviceId) {
        // 1. Xác thực ID Token qua Firebase Admin SDK
        FirebaseToken decodedToken;
        try {
            decodedToken = firebaseService.verifyIdToken(request.getIdToken());
        } catch (Exception e) {
            log.error("[FIREBASE_AUTH] Xác thực ID Token thất bại: {}", e.getMessage());
            throw new IllegalArgumentException("Mã xác thực Firebase không hợp lệ hoặc đã hết hạn: " + e.getMessage());
        }

        String rawPhone = firebaseService.extractPhoneNumber(decodedToken);
        String firebaseUid = firebaseService.extractUid(decodedToken);
        String domesticPhone = firebaseService.normalizeVietnamPhone(rawPhone);

        if (!StringUtils.hasText(domesticPhone)) {
            throw new IllegalArgumentException("Không thể trích xuất số điện thoại hợp lệ từ Firebase Token.");
        }

        // 2. Chặn Blacklist nếu có
        if (threatDefenseService.isPhoneBlocked(domesticPhone)) {
            String reason = threatDefenseService.getPhoneBanReason(domesticPhone);
            throw new IllegalArgumentException("Số điện thoại này đã bị đưa vào Danh Sách Cấm của quán: " + (reason != null ? reason : "Vi phạm quy chế."));
        }

        // 3. Tìm hoặc Tạo mới User theo số điện thoại
        Optional<User> existingUserOpt = userRepository.findByPhone(domesticPhone);
        User user;
        boolean isNewUser = false;

        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            if (user.isAccountLocked()) {
                throw new IllegalArgumentException("Tài khoản này đã bị khóa vĩnh viễn: " + user.getLockReason());
            }
            if (user.isTemporarilyBlocked()) {
                throw new IllegalArgumentException("Tài khoản đang bị tạm khóa. Vui lòng thử lại sau " + user.getRemainingTemporaryLockSeconds() + " giây.");
            }

            // Đồng bộ thông tin Firebase UID nếu chưa có
            if (!StringUtils.hasText(user.getFirebaseUid())) {
                user.setFirebaseUid(firebaseUid);
            }
            user.setAuthProvider("FIREBASE_PHONE");
            user.setLastLoginIp(clientIp);
            if (deviceId != null) {
                user.setLastDeviceId(deviceId);
            }
            user.resetLoginFailures();
            user = userRepository.save(user);
        } else {
            isNewUser = true;
            user = new User();
            user.setPhone(domesticPhone);
            user.setFullName(StringUtils.hasText(request.getFullName()) ? request.getFullName() : "Thực Khách 1986");
            user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString())); // Mật khẩu ngẫu nhiên an toàn
            user.setRole("CUSTOMER");
            user.setStatus("ACTIVE");
            user.setFirebaseUid(firebaseUid);
            user.setAuthProvider("FIREBASE_PHONE");
            user.setLastLoginIp(clientIp);
            if (deviceId != null) {
                user.setLastDeviceId(deviceId);
            }
            user = userRepository.save(user);

            // Khởi tạo TasteProfile mặc định cho khách
            TasteProfile profile = new TasteProfile();
            profile.setUser(user);
            tasteProfileRepository.save(profile);

            // Khởi tạo LoyaltyAccount và tặng 50 điểm Tri Kỷ chào mừng
            LoyaltyAccount account = new LoyaltyAccount();
            account.setUser(user);
            account.setTotalPoints(50);
            account.setAvailablePoints(50);
            account.setMembershipTier("DONG");
            loyaltyAccountRepository.save(account);

            user.setTasteProfile(profile);
            user.setLoyaltyAccount(account);
        }

        // 4. Sinh cặp Token an toàn theo chuẩn RFC 6819 & SEC-R009
        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getRole());
        String refreshToken = createAndSaveRefreshToken(user);

        log.info("[FIREBASE_AUTH] Đăng nhập SĐT [{}] thành công. User ID: [{}], Khách mới: [{}]",
                domesticPhone, user.getId(), isNewUser);

        return new AuthResponse(user, accessToken, refreshToken, isNewUser ? 50 : 0);
    }

    private String createAndSaveRefreshToken(User user) {
        String token = tokenProvider.generateRefreshToken(user.getId(), user.getRole());
        String tokenHash = TokenHashUtil.sha256Hex(token);
        String finalFamilyId = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusNanos(tokenProvider.getRefreshExpirationMs() * 1_000_000);
        RefreshToken refreshToken = new RefreshToken(user, finalFamilyId, tokenHash, expiryDate);
        refreshTokenRepository.save(refreshToken);
        return token;
    }
}

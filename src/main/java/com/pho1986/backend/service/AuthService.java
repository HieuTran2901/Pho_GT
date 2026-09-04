package com.pho1986.backend.service;

import com.pho1986.backend.model.dto.AuthDtos.*;
import com.pho1986.backend.model.entity.*;
import com.pho1986.backend.repository.*;
import com.pho1986.backend.security.JwtTokenProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TasteProfileRepository tasteProfileRepository;
    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            UserRepository userRepository,
            TasteProfileRepository tasteProfileRepository,
            LoyaltyAccountRepository loyaltyAccountRepository,
            LoyaltyTransactionRepository loyaltyTransactionRepository,
            OrderRepository orderRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.tasteProfileRepository = tasteProfileRepository;
        this.loyaltyAccountRepository = loyaltyAccountRepository;
        this.loyaltyTransactionRepository = loyaltyTransactionRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
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
        return new AuthResponse(user, accessToken, 50);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new BadCredentialsException("Số điện thoại hoặc mật khẩu không chính xác"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Số điện thoại hoặc mật khẩu không chính xác");
        }

        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getRole());
        return new AuthResponse(user, accessToken);
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
        return new AuthResponse(user, accessToken, earnedPoints);
    }
}

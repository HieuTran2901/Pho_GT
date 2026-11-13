package com.pho1986.backend.service.auth;

import com.pho1986.backend.common.AccountLockedException;
import com.pho1986.backend.model.dto.AuthDtos.PostOrderClaimRequest;
import com.pho1986.backend.model.entity.LoyaltyAccount;
import com.pho1986.backend.model.entity.LoyaltyTransaction;
import com.pho1986.backend.model.entity.Order;
import com.pho1986.backend.model.entity.TasteProfile;
import com.pho1986.backend.model.entity.User;
import com.pho1986.backend.repository.LoyaltyAccountRepository;
import com.pho1986.backend.repository.LoyaltyTransactionRepository;
import com.pho1986.backend.repository.OrderRepository;
import com.pho1986.backend.repository.TasteProfileRepository;
import com.pho1986.backend.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Handles guest post-order claim verification, customer account creation/linking,
 * taste profile setup, and loyalty rewards transactions.
 */
@Component
public class PostOrderClaimHelper {

    public record ClaimResult(User user, int earnedPoints) {}

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final TasteProfileRepository tasteProfileRepository;
    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final PasswordEncoder passwordEncoder;

    public PostOrderClaimHelper(
            OrderRepository orderRepository,
            UserRepository userRepository,
            TasteProfileRepository tasteProfileRepository,
            LoyaltyAccountRepository loyaltyAccountRepository,
            LoyaltyTransactionRepository loyaltyTransactionRepository,
            PasswordEncoder passwordEncoder) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.tasteProfileRepository = tasteProfileRepository;
        this.loyaltyAccountRepository = loyaltyAccountRepository;
        this.loyaltyTransactionRepository = loyaltyTransactionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public ClaimResult processClaim(PostOrderClaimRequest request) {
        Order order = orderRepository.findByOrderCode(request.getOrderCode())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin đơn hàng này"));

        if (order.getUser() != null) {
            throw new IllegalArgumentException("Đơn hàng này đã được gắn vào tài khoản");
        }

        String status = order.getStatus() != null ? order.getStatus().toUpperCase() : "";
        if ("CANCELLED".equals(status) || "REFUNDED".equals(status) || "REFUND_PENDING".equals(status)) {
            throw new IllegalStateException("Đơn hàng đã hủy hoặc hoàn tiền, không thể quy đổi điểm tích lũy.");
        }

        // Chống chiếm đoạt đơn hàng: Bắt buộc số điện thoại claim phải khớp với số điện thoại người đặt
        String cleanClaimPhone = (request.getPhone() != null) ? request.getPhone().replaceAll("[\\s.-]+", "") : "";
        String cleanGuestPhone = (order.getGuestPhone() != null) ? order.getGuestPhone().replaceAll("[\\s.-]+", "") : "";
        if (cleanClaimPhone.isEmpty() || !cleanClaimPhone.equals(cleanGuestPhone)) {
            throw new IllegalArgumentException("Số điện thoại yêu cầu tích điểm không khớp với số điện thoại đặt đơn hàng này!");
        }

        int earnedPoints = Math.max(10, (int) Math.floor(order.getFinalAmount() / 1000.0));

        User user = userRepository.findByPhone(cleanClaimPhone).orElse(null);

        if (user == null) {
            String method = order.getPaymentMethod() != null ? order.getPaymentMethod().toUpperCase() : "";
            boolean isPayLaterMethod = "COD".equals(method) || "POST_PAID_AT_STORE".equals(method) || "CASH".equals(method);
            if (!isPayLaterMethod && !"PAID".equalsIgnoreCase(order.getPaymentStatus())) {
                throw new IllegalStateException("Đơn hàng trực tuyến phải hoàn tất thanh toán trước khi quy đổi điểm tích lũy.");
            }

            user = new User(
                    cleanClaimPhone,
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
            // [SEC-ISSUE-01] Ngăn chặn Account Takeover: Bắt buộc xác thực mật khẩu và trạng thái thanh toán trước khi gán đơn
            if (user.isAccountLocked() || "LOCKED".equalsIgnoreCase(user.getStatus())) {
                throw new AccountLockedException(
                        user.getPhone(),
                        "Tài khoản của quý khách hiện đang bị khóa. Không thể chuyển đổi đơn hàng vào tài khoản này.",
                        user.getLockedAt(),
                        user.getLockReason()
                );
            }
            if (request.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                throw new BadCredentialsException("Mật khẩu tài khoản không chính xác. Không thể chuyển đổi đơn hàng vào tài khoản này.");
            }
            if (!"PAID".equalsIgnoreCase(order.getPaymentStatus())) {
                throw new IllegalStateException("Đơn hàng phải hoàn tất thanh toán trước khi quy đổi điểm tích lũy.");
            }

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

        return new ClaimResult(user, earnedPoints);
    }
}

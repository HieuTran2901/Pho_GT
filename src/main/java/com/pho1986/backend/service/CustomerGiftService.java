package com.pho1986.backend.service;

import com.pho1986.backend.common.PiiMaskUtils;
import com.pho1986.backend.dto.CustomerGiftDto;
import com.pho1986.backend.model.entity.CustomerGift;
import com.pho1986.backend.model.entity.LoyaltyReward;
import com.pho1986.backend.model.entity.User;
import com.pho1986.backend.repository.CustomerGiftRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class CustomerGiftService {

    private static final Logger log = LoggerFactory.getLogger(CustomerGiftService.class);
    private static final String CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final CustomerGiftRepository customerGiftRepository;

    public CustomerGiftService(CustomerGiftRepository customerGiftRepository) {
        this.customerGiftRepository = customerGiftRepository;
    }

    private String generateGiftCode(String prefix) {
        String cleanPrefix = (prefix != null && !prefix.isBlank()) ? prefix.toUpperCase() : "GIFT";
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder("TRIKY-").append(cleanPrefix).append("-");
            for (int i = 0; i < 4; i++) {
                sb.append(CODE_CHARS.charAt(SECURE_RANDOM.nextInt(CODE_CHARS.length())));
            }
            String candidate = sb.toString();
            if (!customerGiftRepository.existsByCodeIgnoreCase(candidate)) {
                return candidate;
            }
        }
        return "TRIKY-" + cleanPrefix + "-" + java.util.UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    @Transactional
    public List<CustomerGift> grantWelcomeGifts(User user) {
        if (user == null) return List.of();

        // Kiểm tra xem user này đã từng được cấp quà chào mừng chưa
        List<CustomerGift> existing = customerGiftRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        boolean hasWelcome = existing.stream().anyMatch(g -> "WELCOME".equalsIgnoreCase(g.getSource()));
        if (hasWelcome) {
            return existing;
        }

        LocalDateTime now = LocalDateTime.now();
        List<CustomerGift> welcomeGifts = new ArrayList<>();

        // 1. 01 Đĩa Quẩy Giòn Hoa Mai (3 chiếc)
        CustomerGift quay = new CustomerGift(
                user,
                generateGiftCode("QUAY"),
                "01 Đĩa Quẩy Giòn Hoa Mai (3 chiếc)",
                "Món quà khai tiệc trứ danh phố cổ, giòn xốp thơm ngậy khi nhúng nước dùng phở nóng.",
                "Món Tặng Kèm 0đ",
                "FREE_ITEM",
                "extra_quay_gion",
                "Đĩa Quẩy Giòn Hoa Mai",
                15000.0,
                50000.0,
                "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=300&q=80",
                "WELCOME",
                now.plusDays(30)
        );
        welcomeGifts.add(quay);

        // 2. 01 Trứng Gà Ta Chần Nước Béo
        CustomerGift trung = new CustomerGift(
                user,
                generateGiftCode("TRUNG"),
                "01 Trứng Gà Ta Chần Nước Béo",
                "Lòng đào béo ngậy được chần điêu luyện trong nồi nước dùng phở bò gia truyền 40 năm.",
                "Món Tặng Kèm 0đ",
                "FREE_ITEM",
                "extra_trung_chan",
                "Trứng Gà Ta Chần Nước Béo",
                15000.0,
                60000.0,
                "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=300&q=80",
                "WELCOME",
                now.plusDays(15)
        );
        welcomeGifts.add(trung);

        // 3. Voucher Giảm 20.000đ Bát Thứ Hai
        CustomerGift voucher = new CustomerGift(
                user,
                generateGiftCode("V20K"),
                "Voucher Giảm 20.000đ Bát Thứ Hai",
                "Tri ân bạn bè cùng đi ăn phở. Giảm ngay 20.000đ khi gọi từ 2 bát phở bò bất kỳ.",
                "Phiếu Giảm Giá",
                "DISCOUNT_CASH",
                null,
                null,
                20000.0,
                130000.0,
                "https://images.unsplash.com/photo-1576777647209-e8733d7b851d?auto=format&fit=crop&w=300&q=80",
                "WELCOME",
                now.plusDays(30)
        );
        welcomeGifts.add(voucher);

        List<CustomerGift> saved = customerGiftRepository.saveAll(welcomeGifts);
        log.info("🎁 [CUSTOMER_GIFT] Đã gieo 3 món quà chào mừng cho khách hàng [{}] ({})",
                user.getFullName(), PiiMaskUtils.maskPhone(user.getPhone()));
        return saved;
    }

    @Transactional
    public List<CustomerGiftDto> getMyGifts(String userId) {
        if (userId == null) return List.of();

        List<CustomerGift> gifts = customerGiftRepository.findByUserIdOrderByCreatedAtDesc(userId);
        LocalDateTime now = LocalDateTime.now();
        boolean needsUpdate = false;

        for (CustomerGift gift : gifts) {
            if ("AVAILABLE".equals(gift.getStatus()) && gift.getExpiryDate() != null && now.isAfter(gift.getExpiryDate())) {
                gift.setStatus("EXPIRED");
                needsUpdate = true;
            } else if ("RESERVED".equals(gift.getStatus()) && gift.getReservedUntil() != null && now.isAfter(gift.getReservedUntil())) {
                gift.setStatus("AVAILABLE");
                gift.setOrderId(null);
                gift.setReservedUntil(null);
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            customerGiftRepository.saveAll(gifts);
        }

        return gifts.stream().map(CustomerGiftDto::fromEntity).toList();
    }

    @Transactional
    public CustomerGiftDto createRedeemedGift(User user, LoyaltyReward reward) {
        if (user == null || reward == null) return null;

        String category = "FREE_ITEM".equalsIgnoreCase(reward.getRewardType()) ? "Món Tặng Kèm 0đ" : "Phiếu Giảm Giá";
        String dishName = reward.getTitle().replaceAll("^(01|Tặng 01)\\s*", "");

        String image = reward.getTitle().contains("Quẩy")
                ? "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=300&q=80"
                : reward.getTitle().contains("Trứng")
                ? "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=300&q=80"
                : "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=300&q=80";

        String prefix = "FREE_ITEM".equalsIgnoreCase(reward.getRewardType()) ? "REWARD" : "VOUCHER";
        CustomerGift gift = new CustomerGift(
                user,
                generateGiftCode(prefix),
                reward.getTitle(),
                reward.getDescription(),
                category,
                reward.getRewardType(),
                reward.getId(),
                dishName,
                reward.getDiscountValue(),
                0.0,
                image,
                "REDEEM",
                LocalDateTime.now().plusDays(reward.getValidityDays() != null && reward.getValidityDays() > 0 ? reward.getValidityDays() : 30)
        );
        gift.setRewardId(reward.getId());

        CustomerGift saved = customerGiftRepository.save(gift);
        log.info("⭐ [CUSTOMER_GIFT] Khách hàng [{}] đã đổi quà thành công: [{}] - Mã: [{}]",
                PiiMaskUtils.maskPhone(user.getPhone()), saved.getTitle(), saved.getCode());
        return CustomerGiftDto.fromEntity(saved);
    }

    @Transactional
    public Optional<CustomerGift> reserveGiftForOrder(String userId, String giftIdOrCode, String orderId, int durationMinutes) {
        if (giftIdOrCode == null || userId == null || orderId == null) return Optional.empty();

        String clean = giftIdOrCode.trim();
        String candidate = clean.startsWith("gift_") ? clean.substring(5) : clean;

        Optional<CustomerGift> opt = customerGiftRepository.findByIdAndUserId(clean, userId);
        if (opt.isEmpty() && !candidate.equals(clean)) {
            opt = customerGiftRepository.findByIdAndUserId(candidate, userId);
        }
        if (opt.isEmpty()) {
            opt = customerGiftRepository.findByCodeIgnoreCase(clean)
                    .filter(g -> g.getUser() != null && userId.equals(g.getUser().getId()));
        }
        if (opt.isEmpty() && !candidate.equals(clean)) {
            opt = customerGiftRepository.findByCodeIgnoreCase(candidate)
                    .filter(g -> g.getUser() != null && userId.equals(g.getUser().getId()));
        }

        if (opt.isEmpty()) return Optional.empty();

        CustomerGift gift = opt.get();
        if (gift.isExpired()) {
            gift.setStatus("EXPIRED");
            customerGiftRepository.save(gift);
            return Optional.empty();
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reservedUntil = now.plusMinutes(durationMinutes > 0 ? durationMinutes : 15);
        int updated = customerGiftRepository.reserveGiftAtomically(gift.getId(), orderId, reservedUntil, now);
        if (updated > 0) {
            gift.setStatus("RESERVED");
            gift.setOrderId(orderId);
            gift.setReservedUntil(reservedUntil);
            log.info("🔒 [CUSTOMER_GIFT] Đã giữ chỗ vé quà [{}] cho đơn hàng [{}] (Thời hạn: {} phút)",
                    gift.getCode(), orderId, durationMinutes);
            return Optional.of(gift);
        }
        log.warn("⚠️ [CUSTOMER_GIFT] Giữ chỗ thất bại: Vé quà [{}] đang được sử dụng hoặc giữ bởi đơn khác", gift.getCode());
        return Optional.empty();
    }

    @Transactional
    public boolean applyGiftToOrder(String userId, String giftIdOrCode, String orderId) {
        if (giftIdOrCode == null || userId == null || orderId == null) return false;

        String clean = giftIdOrCode.trim();
        String candidate = clean.startsWith("gift_") ? clean.substring(5) : clean;

        Optional<CustomerGift> opt = customerGiftRepository.findByIdAndUserId(clean, userId);
        if (opt.isEmpty() && !candidate.equals(clean)) {
            opt = customerGiftRepository.findByIdAndUserId(candidate, userId);
        }
        if (opt.isEmpty()) {
            opt = customerGiftRepository.findByCodeIgnoreCase(clean)
                    .filter(g -> g.getUser() != null && userId.equals(g.getUser().getId()));
        }
        if (opt.isEmpty() && !candidate.equals(clean)) {
            opt = customerGiftRepository.findByCodeIgnoreCase(candidate)
                    .filter(g -> g.getUser() != null && userId.equals(g.getUser().getId()));
        }

        if (opt.isEmpty()) return false;

        CustomerGift gift = opt.get();
        LocalDateTime now = LocalDateTime.now();
        int updated = customerGiftRepository.settleGiftAtomically(gift.getId(), orderId, now);
        if (updated > 0) {
            gift.setStatus("USED");
            gift.setUsedAt(now);
            gift.setOrderId(orderId);
            log.info("✨ [CUSTOMER_GIFT] Vé quà [{}] đã được quyết toán thành công cho đơn hàng [{}]", gift.getCode(), orderId);
            return true;
        }
        log.warn("⚠️ [CUSTOMER_GIFT] Quyết toán vé quà [{}] thất bại cho đơn hàng [{}] (Không khớp reservation hoặc đã USED)",
                gift.getCode(), orderId);
        return false;
    }

    @Transactional
    public void releaseGiftFromOrder(String orderId) {
        releaseGiftFromOrder(orderId, null);
    }

    @Transactional
    public void releaseGiftFromOrder(String orderId, String orderCode) {
        if (!StringUtils.hasText(orderId) && !StringUtils.hasText(orderCode)) return;
        int released = customerGiftRepository.releaseGiftsForOrder(orderId, orderCode);
        if (released > 0) {
            log.info("🔄 [CUSTOMER_GIFT] Đã hoàn trả {} vé quà do đơn hàng [{}/{}] bị hủy/hết hạn",
                    released, orderId, orderCode);
        }
    }
}

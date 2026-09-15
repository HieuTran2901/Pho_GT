package com.pho1986.backend.service;

import com.pho1986.backend.model.dto.AdminCustomerDtos.*;
import com.pho1986.backend.model.entity.*;
import com.pho1986.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminCustomerService {

    private final UserRepository userRepository;
    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final DishRepository dishRepository;
    private final OrderRepository orderRepository;
    private final AuthService authService;
    private final com.pho1986.backend.security.TokenRevocationService tokenRevocationService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final com.pho1986.backend.security.ThreatDefenseService threatDefenseService;

    public AdminCustomerService(
            UserRepository userRepository,
            LoyaltyAccountRepository loyaltyAccountRepository,
            LoyaltyTransactionRepository loyaltyTransactionRepository,
            DishRepository dishRepository,
            OrderRepository orderRepository,
            AuthService authService,
            com.pho1986.backend.security.TokenRevocationService tokenRevocationService,
            RefreshTokenRepository refreshTokenRepository,
            com.pho1986.backend.security.ThreatDefenseService threatDefenseService) {
        this.userRepository = userRepository;
        this.loyaltyAccountRepository = loyaltyAccountRepository;
        this.loyaltyTransactionRepository = loyaltyTransactionRepository;
        this.dishRepository = dishRepository;
        this.orderRepository = orderRepository;
        this.authService = authService;
        this.tokenRevocationService = tokenRevocationService;
        this.refreshTokenRepository = refreshTokenRepository;
        this.threatDefenseService = threatDefenseService;
    }

    @Transactional(readOnly = true)
    public List<AdminCustomerSummaryResponse> getCustomers(String search, String status, String tier) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String cleanStatus = (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status))
                ? status.trim().toUpperCase() : null;

        boolean filterLocked = "LOCKED".equalsIgnoreCase(cleanStatus);
        boolean filterPasswordLocked = "LOCKED_PASSWORD".equalsIgnoreCase(cleanStatus) || "PASSWORD_FAILED".equalsIgnoreCase(cleanStatus);
        boolean filterAdminLocked = "LOCKED_ADMIN".equalsIgnoreCase(cleanStatus) || "ADMIN_MANUAL".equalsIgnoreCase(cleanStatus);

        // Với các bộ lọc khóa, truyền queryStatus = null để tìm cả user có status = 'LOCKED' lẫn user tạm khóa theo vòng (lockedUntil > now)
        String queryStatus = (filterLocked || filterPasswordLocked || filterAdminLocked) ? null : cleanStatus;

        List<User> users = userRepository.searchCustomers(cleanSearch, queryStatus);
        LocalDateTime now = LocalDateTime.now();

        List<User> filteredUsers = users.stream()
                .filter(u -> {
                    boolean isLockedNow = "LOCKED".equalsIgnoreCase(u.getStatus()) || (u.getLockedUntil() != null && u.getLockedUntil().isAfter(now));
                    if (filterLocked) {
                        return isLockedNow;
                    }
                    if (filterPasswordLocked) {
                        return isLockedNow && u.isPasswordLocked();
                    }
                    if (filterAdminLocked) {
                        return isLockedNow && !u.isPasswordLocked();
                    }
                    return true;
                })
                .filter(u -> {
                    if (tier == null || tier.trim().isEmpty() || "ALL".equalsIgnoreCase(tier)) {
                        return true;
                    }
                    LoyaltyAccount la = u.getLoyaltyAccount();
                    String userTier = (la != null && la.getMembershipTier() != null)
                            ? la.getMembershipTier() : "DONG";
                    return tier.equalsIgnoreCase(userTier);
                })
                .collect(Collectors.toList());

        // Batch fetch món yêu thích để triệt tiêu toàn bộ vòng lặp N+1 queries
        Set<String> dishIds = filteredUsers.stream()
                .map(User::getTasteProfile)
                .filter(Objects::nonNull)
                .map(TasteProfile::getFavoriteDishId)
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toSet());

        Map<String, String> dishNames = dishIds.isEmpty() ? Collections.emptyMap() :
                dishRepository.findAllById(dishIds).stream()
                        .collect(Collectors.toMap(Dish::getId, Dish::getName, (existing, replacement) -> existing));

        return filteredUsers.stream()
                .map(u -> toSummaryResponse(u, dishNames))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCustomerMetrics() {
        // Tối ưu hóa truy vấn CSDL:
        // Thay vì kéo toàn bộ hàng chục ngàn User vào RAM JVM, thực thi các câu lệnh Aggregate COUNT trực tiếp trên Index MySQL.
        LocalDateTime now = LocalDateTime.now();

        long total = userRepository.countByRole("CUSTOMER");
        long active = userRepository.countActiveCustomers(now);
        long locked = userRepository.countLockedCustomers(now);
        long adminLocked = userRepository.countAdminLockedCustomers(now);
        long passwordLocked = Math.max(0, locked - adminLocked);
        long vipCount = userRepository.countVipCustomers();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalCustomers", total);
        metrics.put("activeCustomers", active);
        metrics.put("lockedCustomers", locked);
        metrics.put("passwordLockedCustomers", passwordLocked);
        metrics.put("adminLockedCustomers", adminLocked);
        metrics.put("vipCustomers", vipCount);
        return metrics;
    }


    @Transactional(readOnly = true)
    public AdminCustomerDetailResponse getCustomerDetail(String customerId) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khách hàng với ID: " + customerId));

        AdminCustomerDetailResponse detail = new AdminCustomerDetailResponse();
        detail.setSummary(toSummaryResponse(user));

        // Taste Profile
        TasteProfile tp = user.getTasteProfile();
        TasteProfileDetail tpDetail = new TasteProfileDetail();
        if (tp != null) {
            tpDetail.setFavoriteDishId(tp.getFavoriteDishId());
            if (tp.getFavoriteDishId() != null) {
                dishRepository.findById(tp.getFavoriteDishId())
                        .ifPresent(d -> tpDetail.setFavoriteDishName(d.getName()));
            }
            tpDetail.setBrothType(tp.getBrothType());
            tpDetail.setOnionStyle(tp.getOnionStyle());
            tpDetail.setHerbStyle(tp.getHerbStyle());
            tpDetail.setSpicyLevel(tp.getSpicyLevel());
            tpDetail.setCrullerPref(tp.getCrullerPref());
            tpDetail.setCustomNote(tp.getCustomNote());
        }
        detail.setTasteProfile(tpDetail);

        // Loyalty Transactions (10 gần nhất)
        LoyaltyAccount la = user.getLoyaltyAccount();
        if (la != null) {
            List<LoyaltyTransaction> txs = loyaltyTransactionRepository.findByLoyaltyAccountIdOrderByCreatedAtDesc(la.getId());
            List<LoyaltyTxItem> txItems = txs.stream().limit(10).map(t -> {
                LoyaltyTxItem item = new LoyaltyTxItem();
                item.setId(t.getId());
                item.setPointsChange(t.getPointsChange());
                item.setType(t.getType());
                item.setBalanceAfter(t.getBalanceAfter());
                item.setDescription(t.getDescription());
                item.setCreatedAt(t.getCreatedAt());
                return item;
            }).collect(Collectors.toList());
            detail.setLoyaltyTransactions(txItems);
        } else {
            detail.setLoyaltyTransactions(Collections.emptyList());
        }

        // Recent Orders (5 đơn gần nhất)
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<CustomerOrderBrief> briefs = orders.stream().limit(5).map(o -> {
            CustomerOrderBrief b = new CustomerOrderBrief();
            b.setId(o.getId());
            b.setOrderCode(o.getOrderCode());
            b.setStatus(o.getStatus());
            b.setFinalAmount(o.getFinalAmount());
            b.setPaymentMethod(o.getPaymentMethod());
            b.setPaymentStatus(o.getPaymentStatus());
            b.setCreatedAt(o.getCreatedAt());
            b.setItemCount(o.getItems() != null ? o.getItems().size() : 0);
            return b;
        }).collect(Collectors.toList());
        detail.setRecentOrders(briefs);

        return detail;
    }

    @Transactional
    public AdminCustomerSummaryResponse updateCustomerStatus(String customerId, UpdateCustomerStatusRequest request, String adminPhone) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khách hàng với ID: " + customerId));

        // 1. Tuyệt đối không cho phép Quản trị viên tự khóa hoặc thay đổi trạng thái chính mình
        if (adminPhone != null && (adminPhone.equals(user.getPhone()) || adminPhone.equals(user.getId()))) {
            throw new IllegalArgumentException("Hành động bị từ chối: Quản trị viên không thể tự thay đổi trạng thái hoặc khóa chính tài khoản của mình!");
        }

        // 2. Không cho phép thao tác trên tài khoản Quản trị viên qua phân khu Khách hàng
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new IllegalArgumentException("Hành động bị từ chối: Không được phép thay đổi trạng thái của tài khoản Quản trị viên qua phân khu Khách hàng!");
        }

        String newStatus = request.getStatus().toUpperCase().trim();
        if (!List.of("ACTIVE", "LOCKED").contains(newStatus)) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ: " + newStatus);
        }

        user.setStatus(newStatus);
        if ("LOCKED".equals(newStatus)) {
            user.setLockedAt(LocalDateTime.now());
            user.setLockType("ADMIN_MANUAL");
            user.setLockReason(request.getReason() != null ? request.getReason() : "Quản trị viên " + adminPhone + " chủ động khóa");

            // Kích hoạt Real-Time Kill Switch:
            // 1. Chặn đứng O(1) in-memory mọi request tiếp theo từ client
            tokenRevocationService.lockUser(user.getId(), user.getLockReason());
            // 2. Thu hồi toàn bộ Refresh Token trong database để triệt tiêu silent refresh
            refreshTokenRepository.revokeAllUserTokens(user);
        } else if ("ACTIVE".equals(newStatus)) {
            user.setFailedLoginAttempts(0);
            user.setLockoutRounds(0);
            user.setLockedUntil(null);
            user.setLockedAt(null);
            user.setLockReason(null);
            user.setLockType(null);

            // Mở khóa khỏi in-memory kill switch
            tokenRevocationService.unlockUser(user.getId());
        }

        user = userRepository.save(user);
        return toSummaryResponse(user);
    }

    @Transactional
    public AdminCustomerDetailResponse adjustCustomerPoints(String customerId, AdjustCustomerPointsRequest request, String adminPhone) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khách hàng với ID: " + customerId));

        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new IllegalArgumentException("Hành động bị từ chối: Tài khoản Quản trị viên không tham gia hệ thống tích điểm thưởng!");
        }

        LoyaltyAccount la = user.getLoyaltyAccount();
        if (la == null) {
            la = new LoyaltyAccount();
            la.setUser(user);
            la.setTotalPoints(50);
            la.setAvailablePoints(50);
            la.setMembershipTier("DONG");
            la = loyaltyAccountRepository.save(la);
            user.setLoyaltyAccount(la);
        }

        int pointsDelta = request.getPoints();
        int newAvailable = la.getAvailablePoints() + pointsDelta;
        if (newAvailable < 0) {
            throw new IllegalArgumentException("Số dư điểm khả dụng không thể nhỏ hơn 0! (Hiện có: " + la.getAvailablePoints() + " điểm)");
        }

        la.setAvailablePoints(newAvailable);
        if (pointsDelta > 0) {
            la.setTotalPoints(la.getTotalPoints() + pointsDelta);
        }

        // Tự động thăng cấp hạng hội viên
        int totalPts = la.getTotalPoints();
        if (totalPts >= 2000) la.setMembershipTier("KIM_CUONG");
        else if (totalPts >= 1000) la.setMembershipTier("VANG");
        else if (totalPts >= 400) la.setMembershipTier("BAC");
        else la.setMembershipTier("DONG");

        loyaltyAccountRepository.save(la);

        // Lưu bản ghi lịch sử giao dịch
        LoyaltyTransaction tx = new LoyaltyTransaction(
                la,
                null,
                pointsDelta,
                pointsDelta >= 0 ? "ADMIN_BONUS" : "ADMIN_DEDUCT",
                newAvailable,
                "[Quản trị viên " + adminPhone + "] " + request.getReason()
        );
        loyaltyTransactionRepository.save(tx);

        return getCustomerDetail(customerId);
    }

    @Transactional
    public AdminCustomerSummaryResponse unlockCustomer(String customerId) {
        User unlockedUser = authService.unlockUserAccount(customerId);
        if (unlockedUser.getPhone() != null) {
            threatDefenseService.unbanTarget("PHONE", unlockedUser.getPhone());
        }
        if (unlockedUser.getLastDeviceId() != null) {
            threatDefenseService.unbanTarget("DEVICE_ID", unlockedUser.getLastDeviceId());
        }
        if (unlockedUser.getLastLoginIp() != null) {
            threatDefenseService.unbanTarget("IP", unlockedUser.getLastLoginIp());
        }
        return toSummaryResponse(unlockedUser);
    }

    private AdminCustomerSummaryResponse toSummaryResponse(User user) {
        return toSummaryResponse(user, null);
    }

    private AdminCustomerSummaryResponse toSummaryResponse(User user, Map<String, String> dishNames) {
        AdminCustomerSummaryResponse res = new AdminCustomerSummaryResponse();
        res.setId(user.getId());
        res.setPhone(user.getPhone());
        res.setEmail(user.getEmail());
        res.setFullName(user.getFullName());
        res.setRole(user.getRole());

        boolean isLockedNow = "LOCKED".equalsIgnoreCase(user.getStatus()) ||
                (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now()));
        String effectiveStatus = isLockedNow ? "LOCKED" : "ACTIVE";
        res.setStatus(effectiveStatus);

        res.setFailedLoginAttempts(user.getFailedLoginAttempts());
        res.setLockoutRounds(user.getLockoutRounds());
        res.setLockedUntil(user.getLockedUntil());
        res.setLockedAt(user.getLockedAt());
        res.setLockReason(user.getLockReason());
        String inferredLockType = user.getLockType();
        if (inferredLockType == null && isLockedNow) {
            inferredLockType = user.isPasswordLocked() ? "PASSWORD_FAILED" : "ADMIN_MANUAL";
        }
        res.setLockType(inferredLockType);
        res.setCreatedAt(user.getCreatedAt());

        LoyaltyAccount la = user.getLoyaltyAccount();
        if (la != null) {
            res.setAvailablePoints(la.getAvailablePoints());
            res.setMembershipTier(la.getMembershipTier());
            res.setTotalSpent(la.getTotalSpent());
            res.setTotalOrdersCount(la.getTotalOrdersCount());
        } else {
            res.setAvailablePoints(0);
            res.setMembershipTier("DONG");
            res.setTotalSpent(0.0);
            res.setTotalOrdersCount(0);
        }

        TasteProfile tp = user.getTasteProfile();
        if (tp != null) {
            res.setBrothType(tp.getBrothType());
            res.setOnionStyle(tp.getOnionStyle());
            if (tp.getFavoriteDishId() != null) {
                if (dishNames != null && dishNames.containsKey(tp.getFavoriteDishId())) {
                    res.setFavoriteDishName(dishNames.get(tp.getFavoriteDishId()));
                } else {
                    dishRepository.findById(tp.getFavoriteDishId())
                            .ifPresent(d -> res.setFavoriteDishName(d.getName()));
                }
            }
        }

        res.setLastLoginIp(user.getLastLoginIp());
        res.setLastDeviceId(user.getLastDeviceId());

        return res;
    }

    @Transactional
    public AdminCustomerSummaryResponse blacklistCustomer(String customerId, BlacklistCustomerRequest request, String adminPhone) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khách hàng với ID: " + customerId));

        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new IllegalArgumentException("Hành động bị từ chối: Không thể đưa tài khoản Quản trị viên vào danh sách cấm!");
        }
        if (adminPhone != null && (adminPhone.equals(user.getPhone()) || adminPhone.equals(user.getId()))) {
            throw new IllegalArgumentException("Hành động bị từ chối: Quản trị viên không thể tự cấm tài khoản của chính mình!");
        }

        String reason = (request.getReason() != null && !request.getReason().isBlank())
                ? request.getReason().trim()
                : "Vi phạm nghiêm trọng quy chế hệ thống Phở 1986";

        // 1. Cấm Số điện thoại (Vĩnh viễn)
        if (request.isBanPhone() && user.getPhone() != null && !user.getPhone().isBlank()) {
            threatDefenseService.banTarget("PHONE", user.getPhone(), reason, adminPhone, null);
        }

        // 2. Cấm Thiết Bị (Vĩnh viễn)
        if (request.isBanDevice() && user.getLastDeviceId() != null && !user.getLastDeviceId().isBlank()) {
            threatDefenseService.banTarget("DEVICE_ID", user.getLastDeviceId(), reason, adminPhone, null);
        }

        // 3. Cấm Địa chỉ IP (Có thời hạn răn đe, mặc định 7 ngày, tránh chặn nhầm Whitelist)
        if (request.isBanIp() && user.getLastLoginIp() != null && !user.getLastLoginIp().isBlank()) {
            threatDefenseService.banTarget("IP", user.getLastLoginIp(), reason, adminPhone, request.getIpDurationDays());
        }

        // 4. Khóa tài khoản vĩnh viễn trong DB
        user.setStatus("LOCKED");
        user.setLockType("BLACKLISTED");
        user.setLockReason("[DANH SÁCH CẤM] " + reason);
        user.setLockedAt(LocalDateTime.now());
        userRepository.save(user);

        // 5. Kích hoạt Real-Time Kill Switch và thu hồi mọi Refresh Token
        tokenRevocationService.lockUser(user.getId(), user.getLockReason());
        refreshTokenRepository.revokeAllUserTokens(user);

        return toSummaryResponse(user);
    }
}

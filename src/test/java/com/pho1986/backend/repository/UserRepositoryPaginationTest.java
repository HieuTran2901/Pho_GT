package com.pho1986.backend.repository;

import com.pho1986.backend.model.entity.LoyaltyAccount;
import com.pho1986.backend.model.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class UserRepositoryPaginationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoyaltyAccountRepository loyaltyAccountRepository;

    private User custActiveVang;
    private User custActiveDong;
    private User custAdminLocked;
    private User custPasswordLocked;

    @BeforeEach
    void setUp() {
        // Create Cust 1: Active + VANG
        custActiveVang = new User("0901111111", "Vàng Khách", "pass", "vang@test.vn");
        custActiveVang.setRole("CUSTOMER");
        custActiveVang.setStatus("ACTIVE");
        custActiveVang = userRepository.save(custActiveVang);
        LoyaltyAccount la1 = new LoyaltyAccount();
        la1.setUser(custActiveVang);
        la1.setMembershipTier("VANG");
        loyaltyAccountRepository.save(la1);
        custActiveVang.setLoyaltyAccount(la1);

        // Create Cust 2: Active + DONG
        custActiveDong = new User("0902222222", "Đồng Khách", "pass", "dong@test.vn");
        custActiveDong.setRole("CUSTOMER");
        custActiveDong.setStatus("ACTIVE");
        custActiveDong = userRepository.save(custActiveDong);
        LoyaltyAccount la2 = new LoyaltyAccount();
        la2.setUser(custActiveDong);
        la2.setMembershipTier("DONG");
        loyaltyAccountRepository.save(la2);
        custActiveDong.setLoyaltyAccount(la2);

        // Create Cust 3: Locked by Admin
        custAdminLocked = new User("0903333333", "Khóa Admin", "pass", "adminlock@test.vn");
        custAdminLocked.setRole("CUSTOMER");
        custAdminLocked.setStatus("LOCKED");
        custAdminLocked.setLockType("ADMIN_MANUAL");
        custAdminLocked = userRepository.save(custAdminLocked);

        // Create Cust 4: Locked by Password brute force
        custPasswordLocked = new User("0904444444", "Khóa Pass", "pass", "passlock@test.vn");
        custPasswordLocked.setRole("CUSTOMER");
        custPasswordLocked.setStatus("LOCKED");
        custPasswordLocked.setLockType("PASSWORD_FAILED");
        custPasswordLocked = userRepository.save(custPasswordLocked);

        // Create Cust 5: Blacklisted by Admin
        User custBlacklisted = new User("0905555555", "Khách Cấm", "pass", "blacklist@test.vn");
        custBlacklisted.setRole("CUSTOMER");
        custBlacklisted.setStatus("LOCKED");
        custBlacklisted.setLockType("BLACKLISTED");
        userRepository.save(custBlacklisted);
    }

    @Test
    @DisplayName("R2: Database-level pagination and page slicing on H2 in-memory DB")
    void testSearchCustomersPage_PaginationSlicing() {
        LocalDateTime now = LocalDateTime.now();
        Page<User> page0 = userRepository.searchCustomersPage(null, null, null, now, PageRequest.of(0, 2));

        assertNotNull(page0);
        assertEquals(2, page0.getContent().size());
        assertTrue(page0.getTotalElements() >= 5);

        Page<User> page1 = userRepository.searchCustomersPage(null, null, null, now, PageRequest.of(1, 2));
        assertNotNull(page1);
        assertEquals(2, page1.getContent().size());
        assertNotEquals(page0.getContent().get(0).getId(), page1.getContent().get(0).getId());
    }

    @Test
    @DisplayName("R2: Database-level status filtering pushdown (ACTIVE, LOCKED, LOCKED_ADMIN, LOCKED_PASSWORD, BLACKLISTED)")
    void testSearchCustomersPage_StatusPushdown() {
        LocalDateTime now = LocalDateTime.now();

        // Filter ACTIVE
        Page<User> activePage = userRepository.searchCustomersPage(null, "ACTIVE", null, now, PageRequest.of(0, 50));
        assertTrue(activePage.getContent().stream().anyMatch(u -> u.getId().equals(custActiveVang.getId())));
        assertTrue(activePage.getContent().stream().anyMatch(u -> u.getId().equals(custActiveDong.getId())));
        assertFalse(activePage.getContent().stream().anyMatch(u -> u.getId().equals(custAdminLocked.getId())));
        assertFalse(activePage.getContent().stream().anyMatch(u -> u.getId().equals(custPasswordLocked.getId())));

        // Filter LOCKED_ADMIN includes both ADMIN_MANUAL and BLACKLISTED
        Page<User> adminLockedPage = userRepository.searchCustomersPage(null, "LOCKED_ADMIN", null, now, PageRequest.of(0, 50));
        assertTrue(adminLockedPage.getContent().stream().anyMatch(u -> u.getId().equals(custAdminLocked.getId())));
        assertTrue(adminLockedPage.getContent().stream().anyMatch(u -> "0905555555".equals(u.getPhone())));
        assertFalse(adminLockedPage.getContent().stream().anyMatch(u -> u.getId().equals(custPasswordLocked.getId())));

        // Filter LOCKED_PASSWORD excludes both ADMIN_MANUAL and BLACKLISTED
        Page<User> passLockedPage = userRepository.searchCustomersPage(null, "LOCKED_PASSWORD", null, now, PageRequest.of(0, 50));
        assertTrue(passLockedPage.getContent().stream().anyMatch(u -> u.getId().equals(custPasswordLocked.getId())));
        assertFalse(passLockedPage.getContent().stream().anyMatch(u -> u.getId().equals(custAdminLocked.getId())));
        assertFalse(passLockedPage.getContent().stream().anyMatch(u -> "0905555555".equals(u.getPhone())));

        // countAdminLockedCustomers must count both ADMIN_MANUAL and BLACKLISTED
        assertTrue(userRepository.countAdminLockedCustomers(now) >= 2);
    }

    @Test
    @DisplayName("R2: Database-level tier filtering pushdown and unpaged List fetch")
    void testSearchCustomersPage_TierPushdownAndUnpagedList() {
        LocalDateTime now = LocalDateTime.now();

        // Tier filter VANG
        Page<User> vangPage = userRepository.searchCustomersPage(null, null, "VANG", now, PageRequest.of(0, 10));
        assertTrue(vangPage.getContent().stream().anyMatch(u -> u.getId().equals(custActiveVang.getId())));
        assertFalse(vangPage.getContent().stream().anyMatch(u -> u.getId().equals(custActiveDong.getId())));

        // Unpaged searchCustomersList
        List<User> list = userRepository.searchCustomersList("0901111111", null, null, now);
        assertEquals(1, list.size());
        assertEquals(custActiveVang.getId(), list.get(0).getId());
    }
}

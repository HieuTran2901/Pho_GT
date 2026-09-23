package com.pho1986.backend.service;

import com.pho1986.backend.model.dto.AdminCustomerDtos.AdminCustomerSummaryResponse;
import com.pho1986.backend.model.entity.Dish;
import com.pho1986.backend.model.entity.LoyaltyAccount;
import com.pho1986.backend.model.entity.TasteProfile;
import com.pho1986.backend.model.entity.User;
import com.pho1986.backend.repository.*;
import com.pho1986.backend.security.ThreatDefenseService;
import com.pho1986.backend.security.TokenRevocationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminCustomerServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private LoyaltyAccountRepository loyaltyAccountRepository;

    @Mock
    private LoyaltyTransactionRepository loyaltyTransactionRepository;

    @Mock
    private DishRepository dishRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private AuthService authService;

    @Mock
    private TokenRevocationService tokenRevocationService;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private ThreatDefenseService threatDefenseService;

    private AdminCustomerService adminCustomerService;

    private User sampleUser1;
    private User sampleUser2;

    @BeforeEach
    void setUp() {
        adminCustomerService = new AdminCustomerService(
                userRepository,
                loyaltyAccountRepository,
                loyaltyTransactionRepository,
                dishRepository,
                orderRepository,
                authService,
                tokenRevocationService,
                refreshTokenRepository,
                threatDefenseService
        );

        sampleUser1 = new User("0911222333", "Trần Văn An", "hash", "an@example.com");
        sampleUser1.setId("usr-001");
        sampleUser1.setStatus("ACTIVE");
        LoyaltyAccount la1 = new LoyaltyAccount();
        la1.setMembershipTier("VANG");
        la1.setAvailablePoints(1200);
        sampleUser1.setLoyaltyAccount(la1);
        TasteProfile tp1 = new TasteProfile();
        tp1.setFavoriteDishId("dish-pho-bo");
        sampleUser1.setTasteProfile(tp1);

        sampleUser2 = new User("0922333444", "Lê Thị Bình", "hash", "binh@example.com");
        sampleUser2.setId("usr-002");
        sampleUser2.setStatus("LOCKED");
        LoyaltyAccount la2 = new LoyaltyAccount();
        la2.setMembershipTier("DONG");
        sampleUser2.setLoyaltyAccount(la2);
    }

    @Test
    @DisplayName("R2: Database-level pagination returns Page<AdminCustomerSummaryResponse> with batch dish fetch")
    void testGetCustomers_Pageable_DatabasePagination() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> mockPage = new PageImpl<>(List.of(sampleUser1, sampleUser2), pageable, 2);

        when(userRepository.searchCustomersPage(eq("Trần"), eq("ACTIVE"), eq("VANG"), any(LocalDateTime.class), eq(pageable)))
                .thenReturn(mockPage);

        Dish mockDish = new Dish();
        mockDish.setId("dish-pho-bo");
        mockDish.setName("Phở Bò Tái Lăn");
        when(dishRepository.findAllById(Set.of("dish-pho-bo"))).thenReturn(List.of(mockDish));

        Page<AdminCustomerSummaryResponse> result = adminCustomerService.getCustomers("Trần", "ACTIVE", "VANG", pageable);

        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertEquals(2, result.getContent().size());

        AdminCustomerSummaryResponse resp1 = result.getContent().get(0);
        assertEquals("usr-001", resp1.getId());
        assertEquals("Trần Văn An", resp1.getFullName());
        assertEquals("ACTIVE", resp1.getStatus());
        assertEquals("VANG", resp1.getMembershipTier());
        assertEquals("Phở Bò Tái Lăn", resp1.getFavoriteDishName());

        AdminCustomerSummaryResponse resp2 = result.getContent().get(1);
        assertEquals("usr-002", resp2.getId());
        assertEquals("LOCKED", resp2.getStatus());

        verify(userRepository).searchCustomersPage(eq("Trần"), eq("ACTIVE"), eq("VANG"), any(LocalDateTime.class), eq(pageable));
        verify(dishRepository, times(1)).findAllById(Set.of("dish-pho-bo"));
    }

    @Test
    @DisplayName("R2: Backwards-compatible unpaged getCustomers delegates to searchCustomersList")
    void testGetCustomers_Unpaged_BackwardsCompatibility() {
        when(userRepository.searchCustomersList(isNull(), isNull(), isNull(), any(LocalDateTime.class)))
                .thenReturn(List.of(sampleUser1, sampleUser2));

        Dish mockDish = new Dish();
        mockDish.setId("dish-pho-bo");
        mockDish.setName("Phở Bò Tái Lăn");
        when(dishRepository.findAllById(Set.of("dish-pho-bo"))).thenReturn(List.of(mockDish));

        List<AdminCustomerSummaryResponse> list = adminCustomerService.getCustomers(null, null, null);

        assertNotNull(list);
        assertEquals(2, list.size());
        assertEquals("usr-001", list.get(0).getId());
        assertEquals("usr-002", list.get(1).getId());

        verify(userRepository).searchCustomersList(isNull(), isNull(), isNull(), any(LocalDateTime.class));
        verify(userRepository, never()).searchCustomersPage(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("R2: Filter normalization correctly pushes status & tier into database query")
    void testFilterNormalization_Pushdown() {
        Pageable pageable = PageRequest.of(0, 5);
        when(userRepository.searchCustomersPage(any(), any(), any(), any(), any()))
                .thenReturn(Page.empty(pageable));

        // Test PASSWORD_FAILED normalizes to LOCKED_PASSWORD
        adminCustomerService.getCustomers("test", "PASSWORD_FAILED", "KIM_CUONG", pageable);
        verify(userRepository).searchCustomersPage(eq("test"), eq("LOCKED_PASSWORD"), eq("KIM_CUONG"), any(), eq(pageable));

        // Test ADMIN_MANUAL and BLACKLISTED normalize to LOCKED_ADMIN
        adminCustomerService.getCustomers("test", "ADMIN_MANUAL", "BAC", pageable);
        verify(userRepository).searchCustomersPage(eq("test"), eq("LOCKED_ADMIN"), eq("BAC"), any(), eq(pageable));

        adminCustomerService.getCustomers("test", "BLACKLISTED", "BAC", pageable);
        verify(userRepository, times(2)).searchCustomersPage(eq("test"), eq("LOCKED_ADMIN"), eq("BAC"), any(), eq(pageable));

        // Test "ALL" and empty strings normalize to null
        adminCustomerService.getCustomers("   ", "ALL", "ALL", pageable);
        adminCustomerService.getCustomers(null, "", "", pageable);
        verify(userRepository, times(2)).searchCustomersPage(isNull(), isNull(), isNull(), any(), eq(pageable));
    }

    @Test
    @DisplayName("R2: Missing/deleted dish in batch lookup does not trigger N+1 findById queries")
    void testGetCustomers_MissingDishInBatchLookup() {
        Pageable pageable = PageRequest.of(0, 10);
        User userWithOrphanDish = new User("0933333333", "Khách Mồ Côi Món", "pass", "orphan@test.vn");
        TasteProfile tp = new TasteProfile();
        tp.setFavoriteDishId("deleted-dish-999");
        userWithOrphanDish.setTasteProfile(tp);

        when(userRepository.searchCustomersPage(any(), any(), any(), any(), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(userWithOrphanDish), pageable, 1));
        // Batch query returns empty map because dish was deleted
        when(dishRepository.findAllById(Set.of("deleted-dish-999"))).thenReturn(List.of());

        Page<AdminCustomerSummaryResponse> page = adminCustomerService.getCustomers(null, null, null, pageable);

        assertNotNull(page);
        assertEquals(1, page.getContent().size());
        assertNull(page.getContent().get(0).getFavoriteDishName());
        // Crucial: verify findById was NEVER called despite dish being absent from dishNames map
        verify(dishRepository, never()).findById(any());
    }

    @Test
    @DisplayName("R2: Empty results handled safely with zero queries to dishRepository")
    void testGetCustomers_EmptyResults() {
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.searchCustomersPage(any(), any(), any(), any(), any()))
                .thenReturn(Page.empty(pageable));

        Page<AdminCustomerSummaryResponse> page = adminCustomerService.getCustomers("nonexistent", "ACTIVE", "VANG", pageable);

        assertNotNull(page);
        assertTrue(page.isEmpty());
        verify(dishRepository, never()).findAllById(any());
    }
}

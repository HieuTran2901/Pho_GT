package com.pho1986.backend.bootstrap;

import com.pho1986.backend.model.entity.User;
import com.pho1986.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataInitializerSecurityTest {

    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private DishRepository dishRepository;
    @Mock
    private LoyaltyRewardRepository loyaltyRewardRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TasteProfileRepository tasteProfileRepository;
    @Mock
    private LoyaltyAccountRepository loyaltyAccountRepository;
    @Mock
    private LoyaltyTransactionRepository loyaltyTransactionRepository;
    @Mock
    private PaymentGatewayConfigRepository paymentGatewayConfigRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private Environment environment;

    private DataInitializer dataInitializer;

    @BeforeEach
    void setUp() {
        dataInitializer = new DataInitializer(
                categoryRepository,
                dishRepository,
                loyaltyRewardRepository,
                userRepository,
                tasteProfileRepository,
                loyaltyAccountRepository,
                loyaltyTransactionRepository,
                paymentGatewayConfigRepository,
                passwordEncoder,
                environment
        );
        when(categoryRepository.count()).thenReturn(1L);
    }

    @Test
    @DisplayName("SENTINEL-SEC-01: Profile PROD - Mặc định KHÔNG gieo admin123")
    void testProdDefaultBlocksAdminSeed() {
        when(environment.getActiveProfiles()).thenReturn(new String[]{"prod"});
        ReflectionTestUtils.setField(dataInitializer, "adminSeedEnabled", false);

        dataInitializer.run();

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("SENTINEL-SEC-02: Profile PROD - Từ chối mật khẩu yếu hoặc admin123")
    void testProdRejectsWeakOrAdmin123Password() {
        when(environment.getActiveProfiles()).thenReturn(new String[]{"prod"});
        ReflectionTestUtils.setField(dataInitializer, "adminSeedEnabled", true);
        ReflectionTestUtils.setField(dataInitializer, "adminInitPhone", "0912345678");
        ReflectionTestUtils.setField(dataInitializer, "adminInitPassword", "admin123");

        dataInitializer.run();

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("SENTINEL-SEC-03: Profile PROD - Chấp nhận mật khẩu mạnh qua biến môi trường")
    void testProdAcceptsStrongPasswordFromEnv() {
        when(environment.getActiveProfiles()).thenReturn(new String[]{"prod"});
        ReflectionTestUtils.setField(dataInitializer, "adminSeedEnabled", true);
        ReflectionTestUtils.setField(dataInitializer, "adminInitPhone", "0912345678");
        ReflectionTestUtils.setField(dataInitializer, "adminInitPassword", "Secure@Ph01986_Prod!");
        when(userRepository.findByPhone("0912345678")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_pass");

        dataInitializer.run();

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("SENTINEL-SEC-04: Profile DEV - Tự động gieo tài khoản dev để tiện kiểm thử")
    void testDevProfileSeedsAdminByDefault() {
        when(environment.getActiveProfiles()).thenReturn(new String[]{"dev"});
        when(userRepository.findByPhone("0999999999")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("admin123")).thenReturn("encoded_dev_pass");

        dataInitializer.run();

        verify(userRepository, atLeastOnce()).save(any(User.class));
    }
}

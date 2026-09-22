package com.pho1986.backend.config;

import com.pho1986.backend.PhoBackendApplication;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.mock.env.MockEnvironment;

import static org.junit.jupiter.api.Assertions.*;

class ProductionSecretFailFastTest {

    private final ProductionSecretEnvironmentPostProcessor postProcessor = new ProductionSecretEnvironmentPostProcessor();

    @Test
    @DisplayName("Fail-Fast: Profile PROD - Chặn khởi động khi thiếu SPRING_DATASOURCE_PASSWORD")
    void testProdFailsFastWhenDatasourcePasswordMissing() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        env.setProperty("app.jwt.secret", "a_very_strong_production_jwt_secret_key_exceeding_32_characters");
        env.setProperty("app.payment.webhook-secret", "a_very_strong_production_webhook_secret_exceeding_32_characters");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                postProcessor.postProcessEnvironment(env, null));

        assertTrue(ex.getMessage().contains("SPRING_DATASOURCE_PASSWORD is missing or empty"));
    }

    @Test
    @DisplayName("Fail-Fast: Profile PROD - Chặn mật khẩu DB mặc định không an toàn 1234")
    void testProdFailsFastWhenDatasourcePasswordIsInsecureDefault() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        env.setProperty("spring.datasource.password", "1234");
        env.setProperty("app.jwt.secret", "a_very_strong_production_jwt_secret_key_exceeding_32_characters");
        env.setProperty("app.payment.webhook-secret", "a_very_strong_production_webhook_secret_exceeding_32_characters");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                postProcessor.postProcessEnvironment(env, null));

        assertTrue(ex.getMessage().contains("must not use insecure default value '1234'"));
    }

    @Test
    @DisplayName("Fail-Fast: Profile PROD - Chặn khởi động khi thiếu JWT_SECRET hoặc rỗng")
    void testProdFailsFastWhenJwtSecretMissing() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        env.setProperty("spring.datasource.password", "RealProdPass@2026_Secret!");
        env.setProperty("app.payment.webhook-secret", "a_very_strong_production_webhook_secret_exceeding_32_characters");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                postProcessor.postProcessEnvironment(env, null));

        assertTrue(ex.getMessage().contains("JWT_SECRET is missing or empty"));
    }

    @Test
    @DisplayName("Fail-Fast: Profile PROD - Chặn JWT_SECRET mặc định cố định")
    void testProdFailsFastWhenJwtSecretIsInsecureDefault() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        env.setProperty("spring.datasource.password", "RealProdPass@2026_Secret!");
        env.setProperty("app.jwt.secret", ProductionSecretEnvironmentPostProcessor.INSECURE_JWT_SECRET);
        env.setProperty("app.payment.webhook-secret", "a_very_strong_production_webhook_secret_exceeding_32_characters");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                postProcessor.postProcessEnvironment(env, null));

        assertTrue(ex.getMessage().contains("JWT_SECRET must not use insecure default static secret"));
    }

    @Test
    @DisplayName("Fail-Fast: Profile PROD - Chặn JWT_SECRET quá ngắn (< 32 ký tự)")
    void testProdFailsFastWhenJwtSecretTooShort() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        env.setProperty("spring.datasource.password", "RealProdPass@2026_Secret!");
        env.setProperty("app.jwt.secret", "short_jwt_secret_123");
        env.setProperty("app.payment.webhook-secret", "a_very_strong_production_webhook_secret_exceeding_32_characters");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                postProcessor.postProcessEnvironment(env, null));

        assertTrue(ex.getMessage().contains("JWT_SECRET must have at least 32 characters"));
    }

    @Test
    @DisplayName("Fail-Fast: Profile PROD - Chặn khởi động khi thiếu PAYMENT_WEBHOOK_SECRET")
    void testProdFailsFastWhenWebhookSecretMissing() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        env.setProperty("spring.datasource.password", "RealProdPass@2026_Secret!");
        env.setProperty("app.jwt.secret", "a_very_strong_production_jwt_secret_key_exceeding_32_characters");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                postProcessor.postProcessEnvironment(env, null));

        assertTrue(ex.getMessage().contains("PAYMENT_WEBHOOK_SECRET is missing or empty"));
    }

    @Test
    @DisplayName("Fail-Fast: Profile PROD - Chặn PAYMENT_WEBHOOK_SECRET mặc định cố định")
    void testProdFailsFastWhenWebhookSecretIsInsecureDefault() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        env.setProperty("spring.datasource.password", "RealProdPass@2026_Secret!");
        env.setProperty("app.jwt.secret", "a_very_strong_production_jwt_secret_key_exceeding_32_characters");
        env.setProperty("app.payment.webhook-secret", ProductionSecretEnvironmentPostProcessor.INSECURE_WEBHOOK_SECRET);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                postProcessor.postProcessEnvironment(env, null));

        assertTrue(ex.getMessage().contains("PAYMENT_WEBHOOK_SECRET must not use insecure default static secret"));
    }

    @Test
    @DisplayName("Fail-Fast: Profile PROD - Thành công khi đầy đủ tất cả secret sản xuất mạnh")
    void testProdSucceedsWhenAllSecretsValid() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        env.setProperty("spring.datasource.password", "RealProdPass@2026_Secret!");
        env.setProperty("app.jwt.secret", "a_very_strong_production_jwt_secret_key_exceeding_32_characters");
        env.setProperty("app.payment.webhook-secret", "a_very_strong_production_webhook_secret_exceeding_32_characters");

        assertDoesNotThrow(() -> postProcessor.postProcessEnvironment(env, null));
    }

    @Test
    @DisplayName("Fail-Fast: Profile DEV/TEST - Không chặn khi chạy trên môi trường phát triển")
    void testNonProdDoesNotBlockStartup() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("dev");

        assertDoesNotThrow(() -> postProcessor.postProcessEnvironment(env, null));
    }

    @Test
    @DisplayName("Fail-Fast: SpringApplication.run() ném ngoại lệ ngay lập tức trên profile PROD thiếu secret")
    void testSpringApplicationStartupFailsFastUnderProdProfile() {
        SpringApplication app = new SpringApplication(PhoBackendApplication.class);
        app.setAdditionalProfiles("prod");

        assertThrows(Exception.class, () -> app.run("--server.port=0"));
    }
}

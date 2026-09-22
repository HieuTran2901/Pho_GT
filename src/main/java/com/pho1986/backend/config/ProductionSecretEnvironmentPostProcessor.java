package com.pho1986.backend.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ProductionSecretEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    public static final String INSECURE_DB_PASS = "1234";
    public static final String INSECURE_JWT_SECRET = "pho_gia_truyen_1986_spring_boot_jwt_secret_key_very_long_for_hmac_sha_256";
    public static final String INSECURE_WEBHOOK_SECRET = "pho1986_webhook_secret_key_prod_auth_2026";
    public static final String INSECURE_ADMIN_PASS = "admin123";

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        if (!isProdEnvironment(environment)) {
            return;
        }

        List<String> violations = new ArrayList<>();

        // 1. Kiểm tra SPRING_DATASOURCE_PASSWORD
        String dbPass = environment.getProperty("spring.datasource.password");
        if (!StringUtils.hasText(dbPass)) {
            violations.add("SPRING_DATASOURCE_PASSWORD is missing or empty");
        } else if (INSECURE_DB_PASS.equals(dbPass.trim())) {
            violations.add("SPRING_DATASOURCE_PASSWORD must not use insecure default value '1234'");
        }

        // 2. Kiểm tra JWT_SECRET
        String jwtSecret = environment.getProperty("app.jwt.secret");
        if (!StringUtils.hasText(jwtSecret)) {
            violations.add("JWT_SECRET is missing or empty");
        } else if (INSECURE_JWT_SECRET.equals(jwtSecret.trim())) {
            violations.add("JWT_SECRET must not use insecure default static secret");
        } else if (jwtSecret.trim().length() < 32) {
            violations.add("JWT_SECRET must have at least 32 characters (256 bits) for HMAC-SHA256 security");
        }

        // 3. Kiểm tra PAYMENT_WEBHOOK_SECRET
        String webhookSecret = environment.getProperty("app.payment.webhook-secret");
        if (!StringUtils.hasText(webhookSecret)) {
            violations.add("PAYMENT_WEBHOOK_SECRET is missing or empty");
        } else if (INSECURE_WEBHOOK_SECRET.equals(webhookSecret.trim())) {
            violations.add("PAYMENT_WEBHOOK_SECRET must not use insecure default static secret");
        } else if (webhookSecret.trim().length() < 32) {
            violations.add("PAYMENT_WEBHOOK_SECRET must have at least 32 characters for security");
        }

        // 4. Kiểm tra admin seed password nếu bật gieo admin trên prod
        String adminSeedEnabled = environment.getProperty("app.security.admin-seed.enabled");
        if ("true".equalsIgnoreCase(adminSeedEnabled)) {
            String adminPass = environment.getProperty("app.security.admin-seed.password");
            if (!StringUtils.hasText(adminPass) || INSECURE_ADMIN_PASS.equalsIgnoreCase(adminPass.trim()) || adminPass.trim().length() < 8) {
                violations.add("ADMIN_INIT_PASSWORD must be provided, non-default, and at least 8 characters when admin seeding is enabled in prod");
            }
        }

        if (!violations.isEmpty()) {
            String errorMessage = "🚨 [FAIL-FAST SECURITY SHUTDOWN] Production secret validation failed:\n - "
                    + String.join("\n - ", violations);
            System.err.println(errorMessage);
            throw new IllegalStateException(errorMessage);
        }
    }

    public static boolean isProdEnvironment(ConfigurableEnvironment environment) {
        if (environment == null) return false;
        String[] profiles = environment.getActiveProfiles();
        if (profiles != null && profiles.length > 0) {
            return Arrays.stream(profiles).anyMatch(p -> "prod".equalsIgnoreCase(p) || "production".equalsIgnoreCase(p));
        }
        String activeProp = environment.getProperty("spring.profiles.active");
        if (StringUtils.hasText(activeProp)) {
            return Arrays.stream(activeProp.split(","))
                    .map(String::trim)
                    .anyMatch(p -> "prod".equalsIgnoreCase(p) || "production".equalsIgnoreCase(p));
        }
        String[] defaultProfiles = environment.getDefaultProfiles();
        if (defaultProfiles != null && defaultProfiles.length > 0) {
            return Arrays.stream(defaultProfiles).anyMatch(p -> "prod".equalsIgnoreCase(p) || "production".equalsIgnoreCase(p));
        }
        return false;
    }
}

package com.pho1986.backend.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
@ConfigurationProperties(prefix = "payment.sepay")
public class SepayProperties {

    private static final Logger log = LoggerFactory.getLogger(SepayProperties.class);

    private boolean enabled = false;
    private String environment = "sandbox"; // sandbox | production
    private String merchantId;
    private String secretKey;
    private String ipnSecret;
    private String ipnUrl;
    private String successUrl;
    private String errorUrl;
    private String cancelUrl;
    private String bookingFrontendRedirectUrl;
    private String frontendRedirectUrl;

    @PostConstruct
    public void validate() {
        if (!enabled) {
            log.info("[SePay] Gateway is DISABLED. Running in simulation / fallback mode.");
            return;
        }

        log.info("[SePay] Gateway is ENABLED in [{}] environment. Validating configuration...", environment);

        if (!StringUtils.hasText(merchantId)) {
            throw new IllegalStateException("Cấu hình SePay thiếu MERCHANTID khi payment.sepay.enabled=true");
        }
        if (!StringUtils.hasText(secretKey)) {
            throw new IllegalStateException("Cấu hình SePay thiếu SEPAY_SECRETKEY khi payment.sepay.enabled=true");
        }
        if (!StringUtils.hasText(ipnSecret)) {
            throw new IllegalStateException("Cấu hình SePay thiếu SEPAY_IPN_SECRET khi payment.sepay.enabled=true");
        }
        if (!StringUtils.hasText(ipnUrl)) {
            throw new IllegalStateException("Cấu hình SePay thiếu SEPAY_IPN_URL khi payment.sepay.enabled=true");
        }

        log.info("[SePay] Configuration validated successfully. Merchant ID: [{}], IPN URL: [{}]", merchantId, ipnUrl);
    }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public String getEnvironment() { return environment; }
    public void setEnvironment(String environment) { this.environment = environment; }

    public String getMerchantId() { return merchantId; }
    public void setMerchantId(String merchantId) { this.merchantId = merchantId; }

    public String getSecretKey() { return secretKey; }
    public void setSecretKey(String secretKey) { this.secretKey = secretKey; }

    public String getIpnSecret() { return ipnSecret; }
    public void setIpnSecret(String ipnSecret) { this.ipnSecret = ipnSecret; }

    public String getIpnUrl() { return ipnUrl; }
    public void setIpnUrl(String ipnUrl) { this.ipnUrl = ipnUrl; }

    public String getSuccessUrl() { return successUrl; }
    public void setSuccessUrl(String successUrl) { this.successUrl = successUrl; }

    public String getErrorUrl() { return errorUrl; }
    public void setErrorUrl(String errorUrl) { this.errorUrl = errorUrl; }

    public String getCancelUrl() { return cancelUrl; }
    public void setCancelUrl(String cancelUrl) { this.cancelUrl = cancelUrl; }

    public String getBookingFrontendRedirectUrl() { return bookingFrontendRedirectUrl; }
    public void setBookingFrontendRedirectUrl(String bookingFrontendRedirectUrl) { this.bookingFrontendRedirectUrl = bookingFrontendRedirectUrl; }

    public String getFrontendRedirectUrl() { return frontendRedirectUrl; }
    public void setFrontendRedirectUrl(String frontendRedirectUrl) { this.frontendRedirectUrl = frontendRedirectUrl; }
}

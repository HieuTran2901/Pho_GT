package com.pho1986.backend.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
@ConfigurationProperties(prefix = "payment.momo")
public class MomoProperties {

    private static final Logger log = LoggerFactory.getLogger(MomoProperties.class);

    private boolean enabled = false;
    private String partnerCode = "MOMO";
    private String accessKey;
    private String secretKey;
    private String endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
    private String redirectUrl;
    private String aiCoinRedirectUrl;
    private String ipnUrl;
    private String requestType = "captureWallet";
    private String language = "vi";
    private String timeout = "30s";

    @PostConstruct
    public void validate() {
        if (!enabled) {
            log.info("[MoMo] Gateway is DISABLED. Running in simulation / fallback mode.");
            return;
        }

        log.info("[MoMo] Gateway is ENABLED. Validating configuration...");

        if (!StringUtils.hasText(accessKey)) {
            throw new IllegalStateException("Cấu hình MoMo thiếu MOMO_ACCESSKEY khi payment.momo.enabled=true");
        }
        if (!StringUtils.hasText(secretKey)) {
            throw new IllegalStateException("Cấu hình MoMo thiếu MOMO_SECRETKEY khi payment.momo.enabled=true");
        }
        if (!StringUtils.hasText(endpoint)) {
            throw new IllegalStateException("Cấu hình MoMo thiếu MOMO_ENDPOINT khi payment.momo.enabled=true");
        }
        if (!StringUtils.hasText(ipnUrl)) {
            throw new IllegalStateException("Cấu hình MoMo thiếu MOMO_IPN_URL khi payment.momo.enabled=true");
        }
        if (!ipnUrl.startsWith("https://") && !ipnUrl.contains("localhost")) {
            log.warn("[MoMo] CẢNH BÁO: MoMo IPN URL nên bắt đầu bằng https:// để MoMo server có thể gọi về. URL hiện tại: [{}]", ipnUrl);
        }

        log.info("[MoMo] Configuration validated successfully. Partner Code: [{}], Endpoint: [{}]", partnerCode, endpoint);
    }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public String getPartnerCode() { return partnerCode; }
    public void setPartnerCode(String partnerCode) { this.partnerCode = partnerCode; }

    public String getAccessKey() { return accessKey; }
    public void setAccessKey(String accessKey) { this.accessKey = accessKey; }

    public String getSecretKey() { return secretKey; }
    public void setSecretKey(String secretKey) { this.secretKey = secretKey; }

    public String getEndpoint() { return endpoint; }
    public void setEndpoint(String endpoint) { this.endpoint = endpoint; }

    public String getRedirectUrl() { return redirectUrl; }
    public void setRedirectUrl(String redirectUrl) { this.redirectUrl = redirectUrl; }

    public String getAiCoinRedirectUrl() { return aiCoinRedirectUrl; }
    public void setAiCoinRedirectUrl(String aiCoinRedirectUrl) { this.aiCoinRedirectUrl = aiCoinRedirectUrl; }

    public String getIpnUrl() { return ipnUrl; }
    public void setIpnUrl(String ipnUrl) { this.ipnUrl = ipnUrl; }

    public String getRequestType() { return requestType; }
    public void setRequestType(String requestType) { this.requestType = requestType; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getTimeout() { return timeout; }
    public void setTimeout(String timeout) { this.timeout = timeout; }
}

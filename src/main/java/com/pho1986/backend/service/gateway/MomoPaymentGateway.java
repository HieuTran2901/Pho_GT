package com.pho1986.backend.service.gateway;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pho1986.backend.config.MomoProperties;
import com.pho1986.backend.security.MomoSigner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class MomoPaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(MomoPaymentGateway.class);

    private final MomoProperties momoProperties;
    private final MomoSigner momoSigner;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public MomoPaymentGateway(MomoProperties momoProperties, MomoSigner momoSigner, ObjectMapper objectMapper) {
        this.momoProperties = momoProperties;
        this.momoSigner = momoSigner;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    public boolean isEnabled() {
        return momoProperties.isEnabled();
    }

    public static class MomoPaymentResult {
        private final String payUrl;
        private final String qrCodeUrl;
        private final String deeplink;
        private final int resultCode;
        private final String message;

        public MomoPaymentResult(String payUrl, String qrCodeUrl, String deeplink, int resultCode, String message) {
            this.payUrl = payUrl;
            this.qrCodeUrl = qrCodeUrl;
            this.deeplink = deeplink;
            this.resultCode = resultCode;
            this.message = message;
        }

        public String getPayUrl() { return payUrl; }
        public String getQrCodeUrl() { return qrCodeUrl; }
        public String getDeeplink() { return deeplink; }
        public int getResultCode() { return resultCode; }
        public String getMessage() { return message; }
    }

    /**
     * Gửi yêu cầu khởi tạo thanh toán sang MoMo API v2
     */
    public MomoPaymentResult createPayment(String orderCode, Double amount, String note) {
        if (!isEnabled()) {
            return null;
        }

        try {
            String partnerCode = momoProperties.getPartnerCode();
            String accessKey = momoProperties.getAccessKey();
            String secretKey = momoProperties.getSecretKey();
            if (accessKey == null || accessKey.isBlank() || secretKey == null || secretKey.isBlank()) {
                log.warn("[MoMo] Chưa cấu hình MOMO_ACCESSKEY hoặc MOMO_SECRETKEY, không thể tạo phiên thanh toán MoMo.");
                return null;
            }
            String endpoint = momoProperties.getEndpoint();
            String redirectUrl = momoProperties.getRedirectUrl();
            String ipnUrl = momoProperties.getIpnUrl();
            String requestType = momoProperties.getRequestType();

            String requestId = String.valueOf(System.currentTimeMillis()) + "_" + UUID.randomUUID().toString().substring(0, 6);
            String orderInfo = "Thanh toán đơn hàng Phở 1986 #" + orderCode;
            String extraData = "";

            String signature = momoSigner.signCreatePayment(
                    accessKey,
                    amount,
                    extraData,
                    ipnUrl,
                    orderCode,
                    orderInfo,
                    partnerCode,
                    redirectUrl,
                    requestId,
                    requestType,
                    secretKey
            );

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("partnerCode", partnerCode);
            requestBody.put("partnerName", "Phở Gia Truyền 1986");
            requestBody.put("storeId", "Pho1986HangBac");
            requestBody.put("requestId", requestId);
            requestBody.put("amount", amount != null ? amount.longValue() : 0L);
            requestBody.put("orderId", orderCode);
            requestBody.put("orderInfo", orderInfo);
            requestBody.put("redirectUrl", redirectUrl);
            requestBody.put("ipnUrl", ipnUrl);
            requestBody.put("lang", momoProperties.getLanguage());
            requestBody.put("extraData", extraData);
            requestBody.put("requestType", requestType);
            requestBody.put("signature", signature);

            String jsonPayload = objectMapper.writeValueAsString(requestBody);
            log.info("[MoMo] Gửi yêu cầu tạo thanh toán cho đơn [{}]: endpoint = {}", orderCode, endpoint);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(30))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode root = objectMapper.readTree(response.body());
                int resultCode = root.path("resultCode").asInt(-1);
                String message = root.path("message").asText();
                String payUrl = root.path("payUrl").asText(null);
                String qrCodeUrl = root.path("qrCodeUrl").asText(null);
                String deeplink = root.path("deeplink").asText(null);

                log.info("[MoMo] Phản hồi từ MoMo cho đơn [{}]: resultCode = {}, message = {}", orderCode, resultCode, message);
                return new MomoPaymentResult(payUrl, qrCodeUrl, deeplink, resultCode, message);
            } else {
                log.error("[MoMo] HTTP Error {}: {}", response.statusCode(), response.body());
                return null;
            }
        } catch (Exception e) {
            log.error("[MoMo] Lỗi gửi yêu cầu thanh toán sang MoMo: {}", e.getMessage(), e);
            return null;
        }
    }
}

package com.pho1986.backend.service.gateway;

import com.pho1986.backend.config.SepayProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

@Component
public class SepayPaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(SepayPaymentGateway.class);
    private static final String HMAC_SHA256 = "HmacSHA256";

    private final SepayProperties sepayProperties;

    public SepayPaymentGateway(SepayProperties sepayProperties) {
        this.sepayProperties = sepayProperties;
    }

    public boolean isEnabled() {
        return sepayProperties.isEnabled();
    }

    public static class SepayCheckoutResult {
        private final String checkoutUrl;
        private final java.util.Map<String, Object> checkoutFields;
        private final String invoiceNumber;

        public SepayCheckoutResult(String checkoutUrl, java.util.Map<String, Object> checkoutFields, String invoiceNumber) {
            this.checkoutUrl = checkoutUrl;
            this.checkoutFields = checkoutFields;
            this.invoiceNumber = invoiceNumber;
        }

        public String getCheckoutUrl() { return checkoutUrl; }
        public java.util.Map<String, Object> getCheckoutFields() { return checkoutFields; }
        public String getInvoiceNumber() { return invoiceNumber; }
    }

    /**
     * Tạo SePay Checkout payload theo chuẩn của ai-travel-marketplace (POST Form v1/checkout/init)
     */
    public SepayCheckoutResult createCheckout(String orderCode, Double amount, String note) {
        if (!isEnabled()) {
            return null;
        }

        String merchant = sepayProperties.getMerchantId();
        String secretKey = sepayProperties.getSecretKey();
        if (merchant == null || merchant.isBlank() || secretKey == null || secretKey.isBlank()) {
            log.warn("[SePay] Chưa cấu hình MERCHANTID hoặc SEPAY_SECRETKEY, không thể tạo Checkout payload.");
            return null;
        }

        try {
            String invoiceNumber = "PHO1986_" + orderCode.replaceAll("[^a-zA-Z0-9]", "");
            String amountStr = String.valueOf(amount != null ? amount.longValue() : 0L);

            java.util.Map<String, String> fieldsToSign = new java.util.LinkedHashMap<>();
            fieldsToSign.put("operation", "PURCHASE");
            fieldsToSign.put("payment_method", "BANK_TRANSFER");
            fieldsToSign.put("order_invoice_number", invoiceNumber);
            fieldsToSign.put("order_amount", amountStr);
            fieldsToSign.put("currency", "VND");
            fieldsToSign.put("order_description", "Thanh toan don hang Pho 1986 #" + orderCode);
            fieldsToSign.put("success_url", appendPaymentRef(sepayProperties.getSuccessUrl(), invoiceNumber));
            fieldsToSign.put("error_url", appendPaymentRef(sepayProperties.getErrorUrl(), invoiceNumber));
            fieldsToSign.put("cancel_url", appendPaymentRef(sepayProperties.getCancelUrl(), invoiceNumber));
            fieldsToSign.put("merchant", merchant);

            String signature = generateSignature(fieldsToSign, secretKey);
            fieldsToSign.put("signature", signature);

            String checkoutUrl = "sandbox".equalsIgnoreCase(sepayProperties.getEnvironment())
                    ? "https://pay-sandbox.sepay.vn/v1/checkout/init"
                    : "https://pay.sepay.vn/v1/checkout/init";

            java.util.Map<String, Object> checkoutFields = new java.util.LinkedHashMap<>(fieldsToSign);
            log.info("[SePay] Đã tạo thành công SePay POST checkout payload cho đơn hàng [{}]: invoiceNumber = {}", orderCode, invoiceNumber);

            return new SepayCheckoutResult(checkoutUrl, checkoutFields, invoiceNumber);
        } catch (Exception e) {
            log.error("[SePay] Lỗi tạo Checkout payload cho đơn hàng [{}]: {}", orderCode, e.getMessage(), e);
            return null;
        }
    }

    /**
     * Thuật toán ký số HMAC-SHA256 theo chuẩn SePay (chuỗi key=value nối bằng dấu phẩy, Base64 encode)
     */
    public String generateSignature(java.util.Map<String, String> fields, String secretKey) {
        try {
            java.util.StringJoiner joiner = new java.util.StringJoiner(",");
            for (java.util.Map.Entry<String, String> entry : fields.entrySet()) {
                if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                    joiner.add(entry.getKey() + "=" + entry.getValue());
                }
            }
            String signString = joiner.toString();

            Mac sha256_HMAC = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec secret_key = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
            sha256_HMAC.init(secret_key);

            byte[] hash = sha256_HMAC.doFinal(signString.getBytes(StandardCharsets.UTF_8));
            return java.util.Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            log.error("[SePay] Lỗi ký HMAC-SHA256: {}", e.getMessage());
            throw new IllegalStateException("Lỗi tính toán chữ ký số SePay", e);
        }
    }

    private String appendPaymentRef(String url, String paymentRef) {
        if (url == null || url.isBlank()) {
            return "http://localhost:5173#order";
        }
        String separator = url.contains("?") ? "&" : "?";
        return url + separator + "paymentRef=" + URLEncoder.encode(paymentRef, StandardCharsets.UTF_8);
    }
}

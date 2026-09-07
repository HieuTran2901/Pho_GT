package com.pho1986.backend.service.payment;

import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Component
public class VietQrHelper {

    /**
     * Sinh mã định danh thanh toán duy nhất chống trùng lặp
     */
    public String generatePaymentCode(String orderCode) {
        String clean = (orderCode != null) ? orderCode.replaceAll("[^a-zA-Z0-9]", "") : "ORDER";
        String salt = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "PAY-" + clean + "-" + salt;
    }

    /**
     * Tạo nội dung chuyển khoản ngân hàng chuẩn nhận diện tự động
     */
    public String buildTransferContent(String orderCode) {
        String cleanOrderCode = (orderCode != null) ? orderCode.replaceAll("[^a-zA-Z0-9]", "") : "";
        return "PHO1986 " + cleanOrderCode;
    }

    /**
     * Tạo đường dẫn ảnh mã VietQR chuẩn Compact2 theo ngân hàng thụ hưởng
     */
    public String buildQrUrl(String bankBin, String accountNo, Double amount, String transferContent, String accountName) {
        String encodedContent = URLEncoder.encode(transferContent != null ? transferContent : "", StandardCharsets.UTF_8);
        String encodedAccountName = URLEncoder.encode(accountName != null ? accountName : "", StandardCharsets.UTF_8);
        return String.format(
                "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%.0f&addInfo=%s&accountName=%s",
                bankBin, accountNo, amount != null ? amount : 0.0, encodedContent, encodedAccountName
        );
    }
}

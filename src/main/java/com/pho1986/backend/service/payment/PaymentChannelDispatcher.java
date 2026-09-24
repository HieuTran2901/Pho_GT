package com.pho1986.backend.service.payment;

import com.pho1986.backend.model.dto.PaymentDtos.PaymentResponse;
import com.pho1986.backend.model.entity.Order;
import com.pho1986.backend.model.entity.PaymentTransaction;
import com.pho1986.backend.service.gateway.MomoPaymentGateway;
import com.pho1986.backend.service.gateway.SepayPaymentGateway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Handles payment channel-specific detail population and external gateway checkouts.
 * External checkout network calls execute strictly out-of-transaction per TEST-R015.
 */
@Component
public class PaymentChannelDispatcher {

    private final SepayPaymentGateway sepayPaymentGateway;
    private final MomoPaymentGateway momoPaymentGateway;
    private final VietQrHelper vietQrHelper;

    @Value("${app.payment.vietqr.bank-bin:970422}")
    private String defaultBankBin;
    @Value("${app.payment.vietqr.bank-name:MBBank - Ngân hàng Quân Đội}")
    private String defaultBankName;
    @Value("${app.payment.vietqr.account-no:0384090045}")
    private String defaultAccountNo;
    @Value("${app.payment.vietqr.account-name:PHO GIA TRUYEN 1986}")
    private String defaultAccountName;

    public PaymentChannelDispatcher(
            SepayPaymentGateway sepayPaymentGateway,
            MomoPaymentGateway momoPaymentGateway,
            VietQrHelper vietQrHelper) {
        this.sepayPaymentGateway = sepayPaymentGateway;
        this.momoPaymentGateway = momoPaymentGateway;
        this.vietQrHelper = vietQrHelper;
    }

    public void populateMethodDetails(
            PaymentTransaction transaction,
            PaymentResponse response,
            Order order,
            String method,
            Double amount) {
        if ("VIETQR".equals(method) || "SEPAY".equals(method)) {
            String transferContent = vietQrHelper.buildTransferContent(order.getOrderCode());
            String qrUrl = vietQrHelper.buildQrUrl(defaultBankBin, defaultAccountNo, amount, transferContent, defaultAccountName);

            transaction.setBankBin(defaultBankBin);
            transaction.setBankName(defaultBankName);
            transaction.setBankAccountNo(defaultAccountNo);
            transaction.setBankAccountName(defaultAccountName);
            transaction.setTransferContent(transferContent);
            transaction.setQrCodeUrl(qrUrl);
            transaction.setStatus("PENDING");

            response.setStatus("PENDING");
            response.setQrCodeUrl(qrUrl);
            response.setBankBin(defaultBankBin);
            response.setBankName(defaultBankName);
            response.setBankAccountNo(defaultAccountNo);
            response.setBankAccountName(defaultAccountName);
            response.setTransferContent(transferContent);
            response.setInstructions("Quý khách vui lòng mở ứng dụng ngân hàng và quét mã VietQR trên để thanh toán trong vòng 15 phút.");
            response.setCompleted(false);

            order.setPaymentMethod(method);
            order.setPaymentStatus("UNPAID");

        } else if ("COD".equals(method)) {
            transaction.setStatus("PENDING");
            response.setStatus("PENDING");
            response.setCompleted(true);
            response.setInstructions("Đơn hàng đã được xác nhận. Quý khách vui lòng chuẩn bị đúng số tiền khi nhận phở từ nhân viên giao hàng.");
            order.setPaymentMethod("COD");
            order.setPaymentStatus("UNPAID");
            order.setStatus("CONFIRMED");
        } else if ("POST_PAID_AT_STORE".equals(method)) {
            transaction.setStatus("PENDING");
            response.setStatus("PENDING");
            response.setCompleted(true);
            response.setInstructions("Bàn của quý khách đã được giữ chỗ trong 30 phút. Quý khách vui lòng thanh toán tại quầy thu ngân sau khi dùng bữa.");
            order.setPaymentMethod("POST_PAID_AT_STORE");
            order.setPaymentStatus("UNPAID");
            order.setStatus("CONFIRMED");
        } else if ("MOMO".equals(method)) {
            transaction.setStatus("PENDING");
            response.setStatus("PENDING");
            response.setCompleted(false);
            response.setInstructions("Vui lòng mở ứng dụng MoMo và quét mã để hoàn tất thanh toán.");
            if (!momoPaymentGateway.isEnabled()) {
                String cleanOrderCode = order.getOrderCode().replaceAll("[^a-zA-Z0-9]", "");
                response.setQrCodeUrl(vietQrHelper.buildQrUrl(defaultBankBin, defaultAccountNo, amount, "MOMO " + cleanOrderCode, defaultAccountName));
                response.setInstructions("Vui lòng quét mã MoMo hoặc chuyển khoản với nội dung MOMO " + cleanOrderCode + " trong vòng 15 phút.");
            }
            order.setPaymentMethod("MOMO");
            order.setPaymentStatus("UNPAID");
        } else {
            transaction.setStatus("PENDING");
            response.setStatus("PENDING");
            response.setCompleted(false);
            response.setInstructions("Phương thức thanh toán đang được xử lý.");
            order.setPaymentMethod(method);
        }
    }

    public void dispatchExternalCheckout(
            PaymentResponse response,
            String method,
            String orderCode,
            Double amount,
            String note) {
        if ("VIETQR".equals(method) || "SEPAY".equals(method)) {
            if (sepayPaymentGateway.isEnabled()) {
                SepayPaymentGateway.SepayCheckoutResult sepayResult = sepayPaymentGateway.createCheckout(orderCode, amount, note);
                if (sepayResult != null) {
                    response.setCheckoutUrl(sepayResult.getCheckoutUrl());
                    response.setCheckoutFields(sepayResult.getCheckoutFields());
                    response.setPayUrl(sepayResult.getCheckoutUrl());
                    response.setInstructions("Quý khách có thể quét mã VietQR hoặc bấm chuyển hướng để thanh toán tự động qua cổng SePay.");
                }
            }
        } else if ("MOMO".equals(method)) {
            if (momoPaymentGateway.isEnabled()) {
                MomoPaymentGateway.MomoPaymentResult momoResult = momoPaymentGateway.createPayment(orderCode, amount, note);
                if (momoResult != null && momoResult.getPayUrl() != null) {
                    response.setPayUrl(momoResult.getPayUrl());
                    if (momoResult.getQrCodeUrl() != null) {
                        response.setQrCodeUrl(momoResult.getQrCodeUrl());
                    }
                    response.setInstructions("Hệ thống đã tạo yêu cầu thanh toán MoMo. Quý khách vui lòng chuyển tiếp đến ứng dụng MoMo để hoàn tất.");
                }
            }
        }
    }
}

package com.pho1986.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class PaymentDtos {

    public static class CreatePaymentRequest {
        @NotBlank(message = "Mã đơn hàng không được để trống")
        private String orderCode;

        @NotBlank(message = "Phương thức thanh toán không được để trống")
        private String paymentMethod; // COD | VIETQR | MOMO | VNPAY | POST_PAID_AT_STORE

        private String note;

        public String getOrderCode() { return orderCode; }
        public void setOrderCode(String orderCode) { this.orderCode = orderCode; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
    }

    public static class PaymentResponse {
        private String paymentCode;
        private String orderCode;
        private Double amount;
        private String currency;
        private String paymentMethod;
        private String status;
        private String qrCodeUrl;
        private String bankBin;
        private String bankName;
        private String bankAccountNo;
        private String bankAccountName;
        private String transferContent;
        private LocalDateTime expiredAt;
        private LocalDateTime paidAt;
        private String instructions;
        private boolean completed;

        public String getPaymentCode() { return paymentCode; }
        public void setPaymentCode(String paymentCode) { this.paymentCode = paymentCode; }
        public String getOrderCode() { return orderCode; }
        public void setOrderCode(String orderCode) { this.orderCode = orderCode; }
        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getQrCodeUrl() { return qrCodeUrl; }
        public void setQrCodeUrl(String qrCodeUrl) { this.qrCodeUrl = qrCodeUrl; }
        public String getBankBin() { return bankBin; }
        public void setBankBin(String bankBin) { this.bankBin = bankBin; }
        public String getBankName() { return bankName; }
        public void setBankName(String bankName) { this.bankName = bankName; }
        public String getBankAccountNo() { return bankAccountNo; }
        public void setBankAccountNo(String bankAccountNo) { this.bankAccountNo = bankAccountNo; }
        public String getBankAccountName() { return bankAccountName; }
        public void setBankAccountName(String bankAccountName) { this.bankAccountName = bankAccountName; }
        public String getTransferContent() { return transferContent; }
        public void setTransferContent(String transferContent) { this.transferContent = transferContent; }
        public LocalDateTime getExpiredAt() { return expiredAt; }
        public void setExpiredAt(LocalDateTime expiredAt) { this.expiredAt = expiredAt; }
        public LocalDateTime getPaidAt() { return paidAt; }
        public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
        public String getInstructions() { return instructions; }
        public void setInstructions(String instructions) { this.instructions = instructions; }
        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }
    }

    public static class ConfirmPaymentRequest {
        private String transactionRef;
        private Double amount;
        private String secretKey;

        public String getTransactionRef() { return transactionRef; }
        public void setTransactionRef(String transactionRef) { this.transactionRef = transactionRef; }
        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }
        public String getSecretKey() { return secretKey; }
        public void setSecretKey(String secretKey) { this.secretKey = secretKey; }
    }

    public static class PaymentStatusResponse {
        private String paymentCode;
        private String orderCode;
        private String status;
        private String paymentMethod;
        private Double amount;
        private LocalDateTime paidAt;

        public PaymentStatusResponse(String paymentCode, String orderCode, String status, String paymentMethod, Double amount, LocalDateTime paidAt) {
            this.paymentCode = paymentCode;
            this.orderCode = orderCode;
            this.status = status;
            this.paymentMethod = paymentMethod;
            this.amount = amount;
            this.paidAt = paidAt;
        }

        public String getPaymentCode() { return paymentCode; }
        public String getOrderCode() { return orderCode; }
        public String getStatus() { return status; }
        public String getPaymentMethod() { return paymentMethod; }
        public Double getAmount() { return amount; }
        public LocalDateTime getPaidAt() { return paidAt; }
    }
}

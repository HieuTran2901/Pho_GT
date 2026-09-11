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
        private String customerName;
        private String phone;
        private String address;
        private Double amount;
        private String tableNumber;

        public String getOrderCode() { return orderCode; }
        public void setOrderCode(String orderCode) { this.orderCode = orderCode; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }
        public String getTableNumber() { return tableNumber; }
        public void setTableNumber(String tableNumber) { this.tableNumber = tableNumber; }
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

        private String payUrl;
        private String checkoutUrl;
        private java.util.Map<String, Object> checkoutFields;

        public String getPayUrl() { return payUrl; }
        public void setPayUrl(String payUrl) { this.payUrl = payUrl; }
        public String getCheckoutUrl() { return checkoutUrl; }
        public void setCheckoutUrl(String checkoutUrl) { this.checkoutUrl = checkoutUrl; }
        public java.util.Map<String, Object> getCheckoutFields() { return checkoutFields; }
        public void setCheckoutFields(java.util.Map<String, Object> checkoutFields) { this.checkoutFields = checkoutFields; }
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

    /**
     * DTO đại diện cho Webhook IPN gửi từ cổng thanh toán SePay
     */
    public static class SepayIpnPayload {
        private Long id;
        private String gateway;
        private String transactionDate;
        private String accountNumber;
        private String subAccount;
        private Double transferAmount;
        private Double amountIn;
        private Double amountOut;
        private Double accumulated;
        private String code;
        private String content;
        private String referenceCode;
        private String description;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getGateway() { return gateway; }
        public void setGateway(String gateway) { this.gateway = gateway; }
        public String getTransactionDate() { return transactionDate; }
        public void setTransactionDate(String transactionDate) { this.transactionDate = transactionDate; }
        public String getAccountNumber() { return accountNumber; }
        public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
        public String getSubAccount() { return subAccount; }
        public void setSubAccount(String subAccount) { this.subAccount = subAccount; }
        public Double getTransferAmount() { return transferAmount != null ? transferAmount : amountIn; }
        public void setTransferAmount(Double transferAmount) { this.transferAmount = transferAmount; }
        public Double getAmountIn() { return amountIn; }
        public void setAmountIn(Double amountIn) { this.amountIn = amountIn; }
        public Double getAmountOut() { return amountOut; }
        public void setAmountOut(Double amountOut) { this.amountOut = amountOut; }
        public Double getAccumulated() { return accumulated; }
        public void setAccumulated(Double accumulated) { this.accumulated = accumulated; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getReferenceCode() { return referenceCode; }
        public void setReferenceCode(String referenceCode) { this.referenceCode = referenceCode; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    /**
     * DTO đại diện cho Webhook IPN gửi từ ví điện tử MoMo
     */
    public static class MomoIpnRequest {
        private String partnerCode;
        private String orderId;
        private String requestId;
        private Long amount;
        private String orderInfo;
        private String orderType;
        private Long transId;
        private Integer resultCode;
        private String message;
        private String payType;
        private Long responseTime;
        private String extraData;
        private String signature;

        public String getPartnerCode() { return partnerCode; }
        public void setPartnerCode(String partnerCode) { this.partnerCode = partnerCode; }
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        public String getRequestId() { return requestId; }
        public void setRequestId(String requestId) { this.requestId = requestId; }
        public Long getAmount() { return amount; }
        public void setAmount(Long amount) { this.amount = amount; }
        public String getOrderInfo() { return orderInfo; }
        public void setOrderInfo(String orderInfo) { this.orderInfo = orderInfo; }
        public String getOrderType() { return orderType; }
        public void setOrderType(String orderType) { this.orderType = orderType; }
        public Long getTransId() { return transId; }
        public void setTransId(Long transId) { this.transId = transId; }
        public Integer getResultCode() { return resultCode; }
        public void setResultCode(Integer resultCode) { this.resultCode = resultCode; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getPayType() { return payType; }
        public void setPayType(String payType) { this.payType = payType; }
        public Long getResponseTime() { return responseTime; }
        public void setResponseTime(Long responseTime) { this.responseTime = responseTime; }
        public String getExtraData() { return extraData; }
        public void setExtraData(String extraData) { this.extraData = extraData; }
        public String getSignature() { return signature; }
        public void setSignature(String signature) { this.signature = signature; }
    }
}

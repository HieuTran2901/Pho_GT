package com.pho1986.backend.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 40)
    private String paymentCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false, length = 10)
    private String currency = "VND";

    @Column(nullable = false, length = 30)
    private String paymentMethod; // COD | VIETQR | MOMO | VNPAY | POST_PAID_AT_STORE

    @Column(nullable = false, length = 30)
    private String status = "PENDING"; // PENDING | SUCCESS | FAILED | EXPIRED | CANCELLED

    @Column(length = 500)
    private String qrCodeUrl;

    @Column(length = 20)
    private String bankBin;

    @Column(length = 50)
    private String bankName;

    @Column(length = 30)
    private String bankAccountNo;

    @Column(length = 100)
    private String bankAccountName;

    @Column(length = 100)
    private String transferContent;

    @Column(length = 100)
    private String transactionRef;

    @Column(length = 255)
    private String note;

    @Column(columnDefinition = "TEXT")
    private String rawWebhookData;

    private LocalDateTime paidAt;

    private LocalDateTime expiredAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public PaymentTransaction() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPaymentCode() { return paymentCode; }
    public void setPaymentCode(String paymentCode) { this.paymentCode = paymentCode; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

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

    public String getTransactionRef() { return transactionRef; }
    public void setTransactionRef(String transactionRef) { this.transactionRef = transactionRef; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getRawWebhookData() { return rawWebhookData; }
    public void setRawWebhookData(String rawWebhookData) { this.rawWebhookData = rawWebhookData; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public LocalDateTime getExpiredAt() { return expiredAt; }
    public void setExpiredAt(LocalDateTime expiredAt) { this.expiredAt = expiredAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}

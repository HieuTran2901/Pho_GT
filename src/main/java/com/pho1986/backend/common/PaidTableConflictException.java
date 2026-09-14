package com.pho1986.backend.common;

/**
 * [SENTINEL & BLADE] Ngoại lệ kích hoạt khi can thiệp vào bàn đang có đơn hàng ĐÃ THANH TOÁN.
 * Trả về HTTP 409 Conflict yêu cầu Quản trị viên đưa ra phương án xử lý rõ ràng.
 */
public class PaidTableConflictException extends RuntimeException {

    private final String orderCode;
    private final String guestName;
    private final String guestPhone;
    private final Double amount;

    public PaidTableConflictException(String orderCode, String guestName, String guestPhone, Double amount, String message) {
        super(message);
        this.orderCode = orderCode;
        this.guestName = guestName;
        this.guestPhone = guestPhone;
        this.amount = amount;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public String getGuestName() {
        return guestName;
    }

    public String getGuestPhone() {
        return guestPhone;
    }

    public Double getAmount() {
        return amount;
    }
}
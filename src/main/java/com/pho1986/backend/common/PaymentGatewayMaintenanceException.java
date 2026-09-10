package com.pho1986.backend.common;

public class PaymentGatewayMaintenanceException extends RuntimeException {

    private final String gatewayId;
    private final String maintenanceMessage;

    public PaymentGatewayMaintenanceException(String gatewayId, String maintenanceMessage) {
        super(maintenanceMessage != null && !maintenanceMessage.isBlank()
                ? maintenanceMessage
                : "Cổng thanh toán [" + gatewayId + "] hiện đang tạm bảo trì hệ thống. Quý khách vui lòng chọn phương thức thanh toán khác!");
        this.gatewayId = gatewayId;
        this.maintenanceMessage = maintenanceMessage;
    }

    public String getGatewayId() {
        return gatewayId;
    }

    public String getMaintenanceMessage() {
        return maintenanceMessage;
    }
}

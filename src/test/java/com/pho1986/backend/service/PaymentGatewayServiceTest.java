package com.pho1986.backend.service;

import com.pho1986.backend.common.PaymentGatewayMaintenanceException;
import com.pho1986.backend.model.dto.PaymentGatewayDtos.PaymentGatewayResponse;
import com.pho1986.backend.model.dto.PaymentGatewayDtos.UpdateGatewayStatusRequest;
import com.pho1986.backend.model.entity.PaymentGatewayConfig;
import com.pho1986.backend.repository.PaymentGatewayConfigRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class PaymentGatewayServiceTest {

    @Autowired
    private PaymentGatewayService paymentGatewayService;

    @Autowired
    private PaymentGatewayConfigRepository configRepository;

    @BeforeEach
    void setUp() {
        configRepository.deleteAll();
        configRepository.saveAll(List.of(
                new PaymentGatewayConfig("SEPAY", "SePay QR", "ACTIVE", "", "SYSTEM"),
                new PaymentGatewayConfig("MOMO", "Ví MoMo", "MAINTENANCE", "Bảo trì nâng cấp MoMo", "SYSTEM"),
                new PaymentGatewayConfig("VNPAY", "Cổng VNPAY", "DISABLED", "Tắt tạm thời", "SYSTEM")
        ));
    }

    @Test
    @DisplayName("Lấy danh sách tất cả cổng thanh toán thành công")
    void testGetAllGateways() {
        List<PaymentGatewayResponse> list = paymentGatewayService.getAllGateways();
        assertEquals(3, list.size());
    }

    @Test
    @DisplayName("Cổng ACTIVE không ném ngoại lệ khi assertGatewayAvailable")
    void testAssertGatewayAvailable_Active() {
        assertDoesNotThrow(() -> paymentGatewayService.assertGatewayAvailable("SEPAY"));
    }

    @Test
    @DisplayName("Cổng MAINTENANCE ném PaymentGatewayMaintenanceException")
    void testAssertGatewayAvailable_Maintenance() {
        PaymentGatewayMaintenanceException ex = assertThrows(
                PaymentGatewayMaintenanceException.class,
                () -> paymentGatewayService.assertGatewayAvailable("MOMO")
        );
        assertEquals("MOMO", ex.getGatewayId());
        assertTrue(ex.getMessage().contains("Bảo trì"));
    }

    @Test
    @DisplayName("Cổng DISABLED ném PaymentGatewayMaintenanceException")
    void testAssertGatewayAvailable_Disabled() {
        PaymentGatewayMaintenanceException ex = assertThrows(
                PaymentGatewayMaintenanceException.class,
                () -> paymentGatewayService.assertGatewayAvailable("VNPAY")
        );
        assertEquals("VNPAY", ex.getGatewayId());
    }

    @Test
    @DisplayName("Admin cập nhật trạng thái cổng thanh toán thành công")
    void testUpdateGatewayStatus() {
        UpdateGatewayStatusRequest req = new UpdateGatewayStatusRequest("ACTIVE", "");
        PaymentGatewayResponse updated = paymentGatewayService.updateGatewayStatus("MOMO", req, "0999999999");

        assertEquals("ACTIVE", updated.getStatus());
        assertEquals("0999999999", updated.getUpdatedBy());

        // Kiểm tra assertGatewayAvailable không còn ném ngoại lệ
        assertDoesNotThrow(() -> paymentGatewayService.assertGatewayAvailable("MOMO"));
    }

    @Test
    @DisplayName("Cổng CASH bảo trì sẽ chặn cả POST_PAID_AT_STORE và COD")
    void testAssertGatewayAvailable_CashAliases() {
        configRepository.save(new PaymentGatewayConfig("CASH", "Tiền mặt", "MAINTENANCE", "Tạm ngừng tiền mặt", "SYSTEM"));

        PaymentGatewayMaintenanceException ex1 = assertThrows(
                PaymentGatewayMaintenanceException.class,
                () -> paymentGatewayService.assertGatewayAvailable("POST_PAID_AT_STORE")
        );
        assertEquals("CASH", ex1.getGatewayId());

        PaymentGatewayMaintenanceException ex2 = assertThrows(
                PaymentGatewayMaintenanceException.class,
                () -> paymentGatewayService.assertGatewayAvailable("COD")
        );
        assertEquals("CASH", ex2.getGatewayId());
    }
}

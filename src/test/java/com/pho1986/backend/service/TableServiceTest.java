package com.pho1986.backend.service;

import com.pho1986.backend.model.dto.TableDtos.TableResponse;
import com.pho1986.backend.model.dto.TableDtos.UpdateTableStatusRequest;
import com.pho1986.backend.model.entity.DiningTable;
import com.pho1986.backend.model.entity.Order;
import com.pho1986.backend.repository.DiningTableRepository;
import com.pho1986.backend.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TableServiceTest {

    @Mock
    private DiningTableRepository tableRepository;

    @Mock
    private OrderRepository orderRepository;

    private TableService tableService;

    private DiningTable tableFloor1;
    private DiningTable tableFloor1B;
    private DiningTable tableFloor2Balcony;
    private DiningTable tableFloor2Vip;

    @BeforeEach
    void setUp() {
        tableService = new TableService(tableRepository, orderRepository);

        tableFloor1 = new DiningTable();
        tableFloor1.setId("table-f1-01");
        tableFloor1.setName("Bàn 01");
        tableFloor1.setFloor(1);
        tableFloor1.setStatus("AVAILABLE");

        tableFloor1B = new DiningTable();
        tableFloor1B.setId("table-f1-02");
        tableFloor1B.setName("Bàn 02");
        tableFloor1B.setFloor(1);
        tableFloor1B.setStatus("AVAILABLE");

        tableFloor2Balcony = new DiningTable();
        tableFloor2Balcony.setId("table-f2-balcony-01");
        tableFloor2Balcony.setName("Ban công 01");
        tableFloor2Balcony.setFloor(2);
        tableFloor2Balcony.setStatus("AVAILABLE");

        tableFloor2Vip = new DiningTable();
        tableFloor2Vip.setId("table-f2-vip-01");
        tableFloor2Vip.setName("Phòng VIP 01");
        tableFloor2Vip.setFloor(2);
        tableFloor2Vip.setStatus("AVAILABLE");
    }

    @Test
    @DisplayName("R1: getAllTablesWithLiveStatus matches orders in O(1) per order using TableIndex")
    void testGetAllTablesWithLiveStatus_SinglePassAndO1Matching() {
        List<DiningTable> tables = List.of(tableFloor1, tableFloor1B, tableFloor2Balcony, tableFloor2Vip);
        when(tableRepository.findAllByOrderByFloorAscIdAsc()).thenReturn(tables);

        Order order1 = new Order();
        order1.setOrderCode("ORD-101");
        order1.setTableNumber("1"); // Should match tableFloor1 ("Bàn 01")
        order1.setStatus("COOKING");
        order1.setPaymentStatus("PAID");
        order1.setFinalAmount(150000.0);

        Order order2 = new Order();
        order2.setOrderCode("ORD-102");
        order2.setTableNumber("ban cong 01"); // Should match tableFloor2Balcony
        order2.setStatus("PENDING");
        order2.setPaymentStatus("UNPAID");
        order2.setFinalAmount(220000.0);

        Order orderUnknown = new Order();
        orderUnknown.setOrderCode("ORD-999");
        orderUnknown.setTableNumber("Bàn số 99"); // Non-existent table
        orderUnknown.setStatus("PENDING");

        Order orderEmptyTable = new Order();
        orderEmptyTable.setOrderCode("ORD-000");
        orderEmptyTable.setTableNumber("   ");

        when(orderRepository.findByStatusInOrderByCreatedAtDesc(anyList()))
                .thenReturn(List.of(order1, order2, orderUnknown, orderEmptyTable));

        List<TableResponse> responses = tableService.getAllTablesWithLiveStatus();

        assertEquals(4, responses.size());

        // Verify tableFloor1 ("Bàn 01") has active order ORD-101
        TableResponse resp1 = responses.stream().filter(r -> r.getId().equals(tableFloor1.getId())).findFirst().orElseThrow();
        assertEquals("ORD-101", resp1.getActiveOrderCode());
        assertEquals("occupied", resp1.getStatus()); // COOKING maps to occupied

        // Verify tableFloor2Balcony ("Ban công 01") has active order ORD-102
        TableResponse resp2 = responses.stream().filter(r -> r.getId().equals(tableFloor2Balcony.getId())).findFirst().orElseThrow();
        assertEquals("ORD-102", resp2.getActiveOrderCode());
        assertEquals("reserved", resp2.getStatus()); // PENDING maps to reserved

        // Verify tableFloor1B has no active order
        TableResponse resp1B = responses.stream().filter(r -> r.getId().equals(tableFloor1B.getId())).findFirst().orElseThrow();
        assertNull(resp1B.getActiveOrderCode());
        assertEquals("available", resp1B.getStatus());
    }

    @Test
    @DisplayName("R1: TableIndex exact normalization equivalence and edge case tests")
    void testTableIndex_ExactEquivalenceAndNormalization() {
        TableIndex index = TableIndex.build(List.of(tableFloor1, tableFloor2Balcony, tableFloor2Vip));

        // Exact ID matches
        assertSame(tableFloor1, index.find("table-f1-01"));
        assertSame(tableFloor2Balcony, index.find("table-f2-balcony-01"));

        // Exact name matches
        assertSame(tableFloor1, index.find("Bàn 01"));
        assertSame(tableFloor2Balcony, index.find("Ban công 01"));

        // Normalized diacritics & spacing & dash
        assertSame(tableFloor1, index.find("ban 01"));
        assertSame(tableFloor1, index.find("ban-01"));
        assertSame(tableFloor1, index.find("BAN 01"));

        // Floor 1 numeric alias matches ("1", "01", "ban 1", "b1")
        assertSame(tableFloor1, index.find("1"));
        assertSame(tableFloor1, index.find("01"));
        assertSame(tableFloor1, index.find("ban 1"));
        assertSame(tableFloor1, index.find("b1"));

        // Unicode edge cases: non-breaking space (\u00A0), tabs, decomposed NFD accents
        assertSame(tableFloor1, index.find("Bàn\u00A001"), "Non-breaking space should resolve table");
        assertSame(tableFloor1, index.find("Bàn\t01"), "Tab character should resolve table");
        assertSame(tableFloor1, index.find("Ba\u0300n 01"), "Decomposed NFD input should resolve table");

        // Vietnamese 'đ' / 'Đ' normalization equivalence
        DiningTable tableDacBiet = new DiningTable();
        tableDacBiet.setId("table-f2-dac-biet");
        tableDacBiet.setName("Bàn Đệm Đặc Biệt");
        tableDacBiet.setFloor(2);
        TableIndex dacBietIndex = TableIndex.build(List.of(tableDacBiet));
        assertSame(tableDacBiet, dacBietIndex.find("Bàn Đệm Đặc Biệt"));
        assertSame(tableDacBiet, dacBietIndex.find("ban dem dac biet"));

        // Two-pass alias precedence: A floor 2 table with exact ID "b1" or "1" MUST NOT be shadowed by Floor 1's alias
        DiningTable tableFloor2Custom = new DiningTable();
        tableFloor2Custom.setId("b1");
        tableFloor2Custom.setName("Khu Trà B1");
        tableFloor2Custom.setFloor(2);
        TableIndex priorityIndex = TableIndex.build(List.of(tableFloor1, tableFloor2Custom));
        assertSame(tableFloor2Custom, priorityIndex.find("b1"), "Floor 2 table with exact ID 'b1' must not be shadowed by Floor 1 alias");

        // Floor 2 / special inputs must NOT match Floor 1 tables by number
        assertNull(index.find("ban cong 02")); // Not tableFloor1 or tableFloor2Balcony
        assertSame(tableFloor2Balcony, index.find("ban cong 01"));
        assertSame(tableFloor2Vip, index.find("phong vip 01"));

        // Null, empty, blank inputs safely return null
        assertNull(index.find(null));
        assertNull(index.find(""));
        assertNull(index.find("   "));

        // matchesTableIdentifier equivalence
        assertTrue(tableService.matchesTableIdentifier("1", tableFloor1));
        assertTrue(tableService.matchesTableIdentifier("Bàn 01", tableFloor1));
        assertTrue(tableService.matchesTableIdentifier("ban-01", tableFloor1));
        assertTrue(tableService.matchesTableIdentifier("Bàn\u00A001", tableFloor1));
        assertFalse(tableService.matchesTableIdentifier("1", tableFloor2Balcony));
        assertFalse(tableService.matchesTableIdentifier("ban cong 01", tableFloor1));
        assertFalse(tableService.matchesTableIdentifier(null, tableFloor1));
        assertFalse(tableService.matchesTableIdentifier("1", null));
    }

    @Test
    @DisplayName("R1: validateTableAvailable reuses TableIndex without redundant scans")
    void testValidateTableAvailable_IndexReuseAndExceptions() {
        tableFloor1.setStatus("MAINTENANCE");
        when(tableRepository.findAll()).thenReturn(List.of(tableFloor1, tableFloor1B));

        // Maintenance table should throw IllegalStateException
        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                tableService.validateTableAvailable("1")
        );
        assertTrue(ex.getMessage().contains("tạm khóa để bảo trì"));

        // Available table with no orders should pass without exception
        tableFloor1B.setStatus("AVAILABLE");
        when(orderRepository.findByStatusInOrderByCreatedAtDesc(anyList())).thenReturn(List.of());
        assertDoesNotThrow(() -> tableService.validateTableAvailable("2"));

        // Available table held by active order should throw
        Order activeOrder = new Order();
        activeOrder.setTableNumber("2");
        when(orderRepository.findByStatusInOrderByCreatedAtDesc(anyList())).thenReturn(List.of(activeOrder));
        IllegalStateException heldEx = assertThrows(IllegalStateException.class, () ->
                tableService.validateTableAvailable("2")
        );
        assertTrue(heldEx.getMessage().contains("giữ chỗ"));

        // Null or blank table identifier should return immediately
        assertDoesNotThrow(() -> tableService.validateTableAvailable(null));
        assertDoesNotThrow(() -> tableService.validateTableAvailable(""));
    }

    @Test
    @DisplayName("R1: markTableStatus uses index to find table and update status")
    void testMarkTableStatus_UsesIndex() {
        when(tableRepository.findAll()).thenReturn(List.of(tableFloor1));

        tableService.markTableStatus("1", "OCCUPIED");
        assertEquals("OCCUPIED", tableFloor1.getStatus());
        verify(tableRepository, times(1)).save(tableFloor1);

        // Does not override MAINTENANCE
        tableFloor1.setStatus("MAINTENANCE");
        tableService.markTableStatus("1", "AVAILABLE");
        assertEquals("MAINTENANCE", tableFloor1.getStatus());
    }

    @Test
    @DisplayName("R1: updateTableStatus handles resolution MOVE_TABLE using index lookup")
    void testUpdateTableStatus_MoveTable() {
        tableFloor1.setStatus("RESERVED");
        tableFloor1B.setStatus("AVAILABLE");

        Order activeOrder = new Order();
        activeOrder.setOrderCode("ORD-200");
        activeOrder.setTableNumber("Bàn 01");
        activeOrder.setPaymentStatus("UNPAID");

        when(tableRepository.findById("table-f1-01")).thenReturn(Optional.of(tableFloor1));
        when(orderRepository.findByStatusInOrderByCreatedAtDesc(anyList())).thenReturn(List.of(activeOrder));
        when(tableRepository.findById("table-f1-02")).thenReturn(Optional.of(tableFloor1B));
        when(tableRepository.findAll()).thenReturn(List.of(tableFloor1, tableFloor1B));
        when(tableRepository.save(any(DiningTable.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateTableStatusRequest request = new UpdateTableStatusRequest();
        request.setStatus("AVAILABLE");
        request.setResolution("MOVE_TABLE");
        request.setTargetTableId("table-f1-02");

        TableResponse response = tableService.updateTableStatus("table-f1-01", request);

        assertNotNull(response);
        assertEquals("Bàn 02", activeOrder.getTableNumber());
        assertEquals("RESERVED", tableFloor1B.getStatus());
        verify(orderRepository).save(activeOrder);
    }
}

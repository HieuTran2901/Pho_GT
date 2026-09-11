package com.pho1986.backend.service;

import com.pho1986.backend.model.dto.TableDtos.TableResponse;
import com.pho1986.backend.model.dto.TableDtos.UpdateTableStatusRequest;
import com.pho1986.backend.model.entity.DiningTable;
import com.pho1986.backend.model.entity.Order;
import com.pho1986.backend.repository.DiningTableRepository;
import com.pho1986.backend.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class TableService {

    private static final Logger log = LoggerFactory.getLogger(TableService.class);

    private final DiningTableRepository tableRepository;
    private final OrderRepository orderRepository;

    private static final List<String> ACTIVE_STATUSES = List.of(
            "PENDING", "CONFIRMED", "COOKING", "PREPARING", "DELIVERING"
    );

    public TableService(DiningTableRepository tableRepository, OrderRepository orderRepository) {
        this.tableRepository = tableRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public List<TableResponse> getAllTablesWithLiveStatus() {
        List<DiningTable> tables = tableRepository.findAllByOrderByFloorAscIdAsc();
        List<Order> activeOrders = orderRepository.findByStatusInOrderByCreatedAtDesc(ACTIVE_STATUSES);

        List<TableResponse> responses = new ArrayList<>();

        for (DiningTable table : tables) {
            TableResponse resp = toResponse(table);

            // Find matching active order
            Optional<Order> matchedOrder = activeOrders.stream()
                    .filter(o -> isOrderForTable(o, table))
                    .findFirst();

            if (matchedOrder.isPresent()) {
                Order order = matchedOrder.get();
                resp.setStatus("occupied");
                resp.setActiveOrderCode(order.getOrderCode());

                String guestName = (order.getGuestName() != null && !order.getGuestName().isBlank())
                        ? order.getGuestName()
                        : (order.getUser() != null ? order.getUser().getFullName() : "Khách tại bàn");
                resp.setActiveGuestName(guestName);

                String guestPhone = (order.getGuestPhone() != null && !order.getGuestPhone().isBlank())
                        ? order.getGuestPhone()
                        : (order.getUser() != null ? order.getUser().getPhone() : "");
                resp.setActiveGuestPhone(guestPhone);

                resp.setActiveAmount(order.getFinalAmount());
                resp.setActiveStatus(order.getStatus());
                resp.setActiveCreatedAt(order.getCreatedAt());
            } else {
                resp.setStatus(table.getStatus() != null ? table.getStatus().toLowerCase(Locale.ROOT) : "available");
            }

            responses.add(resp);
        }

        return responses;
    }

    @Transactional
    public TableResponse updateTableStatus(String tableId, UpdateTableStatusRequest request) {
        DiningTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bàn với ID: " + tableId));

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            table.setStatus(request.getStatus().toUpperCase(Locale.ROOT));
        }

        DiningTable saved = tableRepository.save(table);
        log.info("[TABLE_SERVICE] Cập nhật trạng thái bàn {}: {}", tableId, saved.getStatus());

        return toResponse(saved);
    }

    private TableResponse toResponse(DiningTable table) {
        TableResponse resp = new TableResponse();
        resp.setId(table.getId());
        resp.setName(table.getName());
        resp.setFloor(table.getFloor());
        resp.setCapacity(table.getCapacity());
        resp.setZone(table.getZone());
        resp.setZoneName(table.getZoneName());
        resp.setIsVip(table.getIsVip());
        resp.setDesc(table.getDescription());
        resp.setStatus(table.getStatus() != null ? table.getStatus().toLowerCase(Locale.ROOT) : "available");
        return resp;
    }

    private boolean isOrderForTable(Order order, DiningTable table) {
        if (order.getTableNumber() == null || order.getTableNumber().isBlank()) {
            return false;
        }

        String orderTable = order.getTableNumber().trim().toLowerCase(Locale.ROOT);
        String tableId = table.getId().toLowerCase(Locale.ROOT);
        String tableName = table.getName().toLowerCase(Locale.ROOT);

        // 1. Khớp chính xác theo ID (vd: "t1-03") hoặc Name (vd: "bàn 03", "ban công 03")
        if (orderTable.equals(tableId) || orderTable.equals(tableName)) {
            return true;
        }

        // 2. Chuẩn hóa khoảng trắng & tiền tố
        String compactOrder = orderTable.replace("-", "").replace(" ", "").replace("bàn", "ban");
        String compactId = tableId.replace("-", "").replace(" ", "");
        String compactName = tableName.replace("-", "").replace(" ", "").replace("bàn", "ban");

        if (compactOrder.equals(compactId) || compactOrder.equals(compactName)) {
            return true;
        }

        // 3. Khớp số bàn tầng 1: vd thực khách chỉ nhập "3" hoặc "03" -> chỉ áp dụng cho bàn tầng 1 dạng Bàn 0X
        try {
            String digitsOnly = orderTable.replaceAll("[^0-9]", "");
            if (!digitsOnly.isEmpty() && table.getFloor() == 1 && tableName.startsWith("bàn")) {
                int orderNum = Integer.parseInt(digitsOnly);
                int tableNum = Integer.parseInt(tableName.replaceAll("[^0-9]", ""));
                return orderNum == tableNum;
            }
        } catch (Exception ignored) {}

        return false;
    }
}

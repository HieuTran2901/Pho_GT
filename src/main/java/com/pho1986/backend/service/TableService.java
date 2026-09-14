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
            String dbStatus = table.getStatus() != null ? table.getStatus().toUpperCase(Locale.ROOT) : "AVAILABLE";

            // Find matching active order
            Optional<Order> matchedOrder = activeOrders.stream()
                    .filter(o -> isOrderForTable(o, table))
                    .findFirst();

            if (matchedOrder.isPresent()) {
                Order order = matchedOrder.get();
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
                resp.setActivePaymentStatus(order.getPaymentStatus());
                resp.setActiveCreatedAt(order.getCreatedAt());

                if ("MAINTENANCE".equals(dbStatus)) {
                    resp.setStatus("maintenance");
                } else {
                    boolean isOccupiedNow = "COOKING".equalsIgnoreCase(order.getStatus())
                            || "PREPARING".equalsIgnoreCase(order.getStatus())
                            || "DELIVERING".equalsIgnoreCase(order.getStatus())
                            || "OCCUPIED".equals(dbStatus);
                    resp.setStatus(isOccupiedNow ? "occupied" : "reserved");
                }
            } else if ("MAINTENANCE".equals(dbStatus)) {
                resp.setStatus("maintenance");
            } else if ("RESERVED".equals(dbStatus)) {
                resp.setStatus("reserved");
            } else if ("OCCUPIED".equals(dbStatus)) {
                resp.setStatus("occupied");
            } else {
                resp.setStatus(dbStatus.toLowerCase(Locale.ROOT));
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
            String newStatus = request.getStatus().toUpperCase(Locale.ROOT);

            if ("AVAILABLE".equals(newStatus)) {
                List<Order> activeOrders = orderRepository.findByStatusInOrderByCreatedAtDesc(ACTIVE_STATUSES);
                Optional<Order> matchedOrderOpt = activeOrders.stream()
                        .filter(o -> isOrderForTable(o, table))
                        .findFirst();

                if (matchedOrderOpt.isPresent()) {
                    Order order = matchedOrderOpt.get();
                    boolean isPaid = "PAID".equalsIgnoreCase(order.getPaymentStatus());
                    String resolution = request.getResolution() != null ? request.getResolution().toUpperCase(Locale.ROOT) : null;

                    // Chốt chặn: Bắt buộc chọn phương án xử lý (MOVE_TABLE, COMPLETE, CANCEL) khi bàn có đơn
                    if (resolution == null) {
                        String gName = (order.getGuestName() != null && !order.getGuestName().isBlank())
                                ? order.getGuestName()
                                : (order.getUser() != null ? order.getUser().getFullName() : "Thực khách");
                        String gPhone = (order.getGuestPhone() != null && !order.getGuestPhone().isBlank())
                                ? order.getGuestPhone()
                                : (order.getUser() != null ? order.getUser().getPhone() : "");

                        if (isPaid) {
                            throw new com.pho1986.backend.common.PaidTableConflictException(
                                    order.getOrderCode(), gName, gPhone, order.getFinalAmount(),
                                    "Bàn \"" + table.getName() + "\" đang có đơn hàng đã thanh toán #" + order.getOrderCode() +
                                    " của thực khách " + gName + ". Vui lòng chọn phương án xử lý (Đổi bàn, Hoàn tất hoặc Hủy đơn)."
                            );
                        } else {
                            throw new IllegalStateException("Bàn \"" + table.getName() + "\" đang có đơn hàng #" + order.getOrderCode() +
                                    " (" + gName + "). Vui lòng chọn phương án xử lý (Đổi bàn, Hoàn tất hoặc Hủy đơn) trước khi giải phóng bàn!");
                        }
                    }

                    // Xử lý theo Resolution
                    if ("MOVE_TABLE".equals(resolution) && request.getTargetTableId() != null && !request.getTargetTableId().isBlank()) {
                        DiningTable targetTable = tableRepository.findById(request.getTargetTableId())
                                .orElseGet(() -> tableRepository.findAll().stream()
                                        .filter(t -> matchesTableIdentifier(request.getTargetTableId(), t))
                                        .findFirst()
                                        .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bàn đích để chuyển: " + request.getTargetTableId())));

                        validateTableAvailable(targetTable.getId());
                        order.setTableNumber(targetTable.getName());
                        orderRepository.save(order);

                        targetTable.setStatus("RESERVED");
                        targetTable.setUpdatedAt(java.time.LocalDateTime.now());
                        tableRepository.save(targetTable);

                        log.info("[TABLE_SERVICE] Đã chuyển đơn #{} từ bàn {} sang bàn {}", order.getOrderCode(), table.getName(), targetTable.getName());
                    } else if ("COMPLETE".equals(resolution)) {
                        order.setStatus("COMPLETED");
                        order.setPaymentStatus("PAID");
                        order.setTableNumber(null);
                        orderRepository.save(order);
                        log.info("[TABLE_SERVICE] Đánh dấu đơn #{} COMPLETED khi dọn bàn {}", order.getOrderCode(), table.getName());
                    } else if ("CANCEL".equals(resolution)) {
                        order.setStatus("CANCELLED");
                        order.setTableNumber(null);
                        orderRepository.save(order);
                        log.info("[TABLE_SERVICE] Đánh dấu đơn #{} CANCELLED khi giải phóng bàn {}", order.getOrderCode(), table.getName());
                    } else {
                        throw new IllegalArgumentException("Phương án xử lý không hợp lệ: " + resolution + ". Chỉ chấp nhận MOVE_TABLE, COMPLETE hoặc CANCEL.");
                    }
                }
            }

            if ("MAINTENANCE".equals(newStatus)) {
                List<Order> activeOrders = orderRepository.findByStatusInOrderByCreatedAtDesc(ACTIVE_STATUSES);
                Optional<Order> matchedOrderOpt = activeOrders.stream()
                        .filter(o -> isOrderForTable(o, table))
                        .findFirst();

                if (matchedOrderOpt.isPresent()) {
                    Order order = matchedOrderOpt.get();
                    String resolution = request.getResolution() != null ? request.getResolution().toUpperCase(Locale.ROOT) : null;

                    if ("MOVE_TABLE".equals(resolution) && request.getTargetTableId() != null && !request.getTargetTableId().isBlank()) {
                        DiningTable targetTable = tableRepository.findById(request.getTargetTableId())
                                .orElseGet(() -> tableRepository.findAll().stream()
                                        .filter(t -> matchesTableIdentifier(request.getTargetTableId(), t))
                                        .findFirst()
                                        .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bàn đích để chuyển: " + request.getTargetTableId())));

                        validateTableAvailable(targetTable.getId());
                        order.setTableNumber(targetTable.getName());
                        orderRepository.save(order);

                        targetTable.setStatus("RESERVED");
                        targetTable.setUpdatedAt(java.time.LocalDateTime.now());
                        tableRepository.save(targetTable);

                        log.info("[TABLE_SERVICE] Đã chuyển đơn #{} sang bàn {} trước khi tạm khóa bàn {}", order.getOrderCode(), targetTable.getName(), table.getName());
                    } else {
                        String gName = (order.getGuestName() != null && !order.getGuestName().isBlank())
                                ? order.getGuestName()
                                : (order.getUser() != null ? order.getUser().getFullName() : "Thực khách");
                        throw new IllegalStateException("Bàn \"" + table.getName() + "\" đang có đơn hàng #" + order.getOrderCode() +
                                " (" + gName + "). Vui lòng chuyển bàn cho khách trước khi tạm khóa để bảo trì!");
                    }
                }
            }

            table.setStatus(newStatus);
            table.setUpdatedAt(java.time.LocalDateTime.now());
        }

        DiningTable saved = tableRepository.save(table);
        log.info("[TABLE_SERVICE] Cập nhật trạng thái bàn {}: {}", tableId, saved.getStatus());

        return toResponse(saved);
    }

    @Transactional
    public void markTableStatus(String tableNumberOrId, String status) {
        if (tableNumberOrId == null || tableNumberOrId.isBlank() || status == null) {
            return;
        }

        List<DiningTable> allTables = tableRepository.findAll();
        Optional<DiningTable> matchedTable = allTables.stream()
                .filter(t -> matchesTableIdentifier(tableNumberOrId, t))
                .findFirst();

        if (matchedTable.isPresent()) {
            DiningTable table = matchedTable.get();
            String current = table.getStatus() != null ? table.getStatus().toUpperCase(Locale.ROOT) : "AVAILABLE";
            if (!"MAINTENANCE".equals(current)) {
                table.setStatus(status.toUpperCase(Locale.ROOT));
                table.setUpdatedAt(java.time.LocalDateTime.now());
                tableRepository.save(table);
                log.info("[TABLE_SERVICE] Cập nhật bàn {} ({}) sang trạng thái: {}", table.getId(), table.getName(), status);
            }
        }
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

    /**
     * [BLADE & RAVEN] Validate whether a requested table is available for new orders.
     * Throws IllegalStateException if the table is locked (MAINTENANCE) by admin.
     */
    @Transactional(readOnly = true)
    public void validateTableAvailable(String tableNumberOrId) {
        if (tableNumberOrId == null || tableNumberOrId.isBlank()) {
            return;
        }

        List<DiningTable> allTables = tableRepository.findAll();
        Optional<DiningTable> matchedTable = allTables.stream()
                .filter(t -> matchesTableIdentifier(tableNumberOrId, t))
                .findFirst();

        if (matchedTable.isPresent()) {
            DiningTable table = matchedTable.get();
            String dbStatus = table.getStatus() != null ? table.getStatus().toUpperCase(Locale.ROOT) : "AVAILABLE";
            if ("MAINTENANCE".equals(dbStatus)) {
                throw new IllegalStateException("Bàn \"" + table.getName() + "\" hiện đang tạm khóa để bảo trì. Quý khách vui lòng chọn bàn khác.");
            }
            if ("OCCUPIED".equals(dbStatus)) {
                throw new IllegalStateException("Bàn \"" + table.getName() + "\" hiện đang có thực khách dùng bữa. Quý khách vui lòng chọn bàn khác.");
            }

            List<Order> activeOrders = orderRepository.findByStatusInOrderByCreatedAtDesc(ACTIVE_STATUSES);
            boolean isHeldByActiveOrder = activeOrders.stream().anyMatch(o -> isOrderForTable(o, table));
            if (isHeldByActiveOrder || "RESERVED".equals(dbStatus)) {
                throw new IllegalStateException("Bàn \"" + table.getName() + "\" vừa được một thực khách khác giữ chỗ trước. Quý khách vui lòng chọn bàn khác.");
            }
        }
    }

    public boolean matchesTableIdentifier(String identifier, DiningTable table) {
        if (identifier == null || identifier.isBlank() || table == null) {
            return false;
        }

        String raw = identifier.trim().toLowerCase(Locale.ROOT);
        String tableId = table.getId() != null ? table.getId().toLowerCase(Locale.ROOT) : "";
        String tableName = table.getName() != null ? table.getName().toLowerCase(Locale.ROOT) : "";

        if (raw.equals(tableId) || raw.equals(tableName)) {
            return true;
        }

        String normRaw = java.text.Normalizer.normalize(raw, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace("-", "")
                .replace(" ", "");

        String normName = java.text.Normalizer.normalize(tableName, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace("-", "")
                .replace(" ", "");

        String normId = tableId.replace("-", "").replace(" ", "");

        if (normRaw.equals(normName) || normRaw.equals(normId)) {
            return true;
        }

        // [BLADE & RAVEN] Chỉ match theo số khi input thực sự là bàn tầng 1 ("bàn 3", "ban 3", "3")
        // Tuyệt đối không match nếu input thuộc tầng 2 ("ban công 03", "gian tranh 02", "vip")
        boolean isFloor2OrSpecial = normRaw.contains("cong") || normRaw.contains("tranh") || normRaw.contains("vip") || normRaw.contains("tra");
        if (!isFloor2OrSpecial && table.getFloor() == 1 && normName.startsWith("ban")) {
            try {
                String digitsOnlyRaw = raw.replaceAll("[^0-9]", "");
                String digitsOnlyTable = tableName.replaceAll("[^0-9]", "");
                if (!digitsOnlyRaw.isEmpty() && !digitsOnlyTable.isEmpty()) {
                    return Integer.parseInt(digitsOnlyRaw) == Integer.parseInt(digitsOnlyTable);
                }
            } catch (Exception ignored) {}
        }

        return false;
    }

    private boolean isOrderForTable(Order order, DiningTable table) {
        if (order.getTableNumber() == null || order.getTableNumber().isBlank()) {
            return false;
        }
        return matchesTableIdentifier(order.getTableNumber(), table);
    }
}

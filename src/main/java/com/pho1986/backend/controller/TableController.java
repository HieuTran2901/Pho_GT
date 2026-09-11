package com.pho1986.backend.controller;

import com.pho1986.backend.common.ApiResponse;
import com.pho1986.backend.model.dto.TableDtos.TableResponse;
import com.pho1986.backend.model.dto.TableDtos.UpdateTableStatusRequest;
import com.pho1986.backend.service.TableService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class TableController {

    private final TableService tableService;

    public TableController(TableService tableService) {
        this.tableService = tableService;
    }

    @GetMapping("/tables")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getAllTables() {
        List<TableResponse> tables = tableService.getAllTablesWithLiveStatus();
        return ResponseEntity.ok(ApiResponse.ok(tables, "Tải danh sách sơ đồ bàn thành công"));
    }

    @PatchMapping("/admin/tables/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TableResponse>> updateTableStatus(
            @PathVariable("id") String id,
            @RequestBody UpdateTableStatusRequest request) {
        TableResponse updated = tableService.updateTableStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Cập nhật trạng thái bàn thành công"));
    }
}

package com.pho1986.backend.controller;

import com.pho1986.backend.dto.VoucherCreateUpdateDto;
import com.pho1986.backend.dto.VoucherDto;
import com.pho1986.backend.service.VoucherService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/vouchers")
@PreAuthorize("hasRole('ADMIN')")
public class AdminVoucherController {

    private final VoucherService voucherService;

    public AdminVoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @GetMapping
    public ResponseEntity<List<VoucherDto>> getAllVouchers() {
        return ResponseEntity.ok(voucherService.getAllVouchersForAdmin());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VoucherDto> getVoucherById(@PathVariable String id) {
        return voucherService.getVoucherById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createVoucher(@Valid @RequestBody VoucherCreateUpdateDto dto) {
        try {
            VoucherDto created = voucherService.createVoucher(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVoucher(
            @PathVariable String id,
            @Valid @RequestBody VoucherCreateUpdateDto dto
    ) {
        try {
            VoucherDto updated = voucherService.updateVoucher(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<?> toggleVoucherStatus(@PathVariable String id) {
        try {
            VoucherDto updated = voucherService.toggleVoucherStatus(id);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVoucher(@PathVariable String id) {
        try {
            voucherService.deleteVoucher(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa voucher thành công."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

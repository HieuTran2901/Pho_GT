package com.pho1986.backend.controller;

import com.pho1986.backend.dto.VoucherDto;
import com.pho1986.backend.dto.VoucherValidateRequestDto;
import com.pho1986.backend.dto.VoucherValidateResponseDto;
import com.pho1986.backend.service.VoucherService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vouchers")
public class VoucherController {

    private final VoucherService voucherService;

    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @GetMapping("/active")
    public ResponseEntity<List<VoucherDto>> getActiveVouchers() {
        return ResponseEntity.ok(voucherService.getActivePublicVoucherDtos());
    }

    @PostMapping("/validate")
    public ResponseEntity<VoucherValidateResponseDto> validateVoucher(
            @Valid @RequestBody VoucherValidateRequestDto request
    ) {
        VoucherValidateResponseDto response = voucherService.validateVoucher(
                request.getCode(),
                request.getOrderAmount()
        );
        return ResponseEntity.ok(response);
    }
}

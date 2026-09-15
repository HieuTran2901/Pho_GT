package com.pho1986.backend.service;

import com.pho1986.backend.dto.VoucherCreateUpdateDto;
import com.pho1986.backend.dto.VoucherDto;
import com.pho1986.backend.dto.VoucherValidateResponseDto;
import com.pho1986.backend.model.entity.Voucher;
import com.pho1986.backend.repository.VoucherRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class VoucherService {

    private static final Logger log = LoggerFactory.getLogger(VoucherService.class);

    private final VoucherRepository voucherRepository;

    // In-Memory Cache (TTL 60s) tối ưu hiệu năng truy vấn
    private volatile List<Voucher> cachedActiveVouchers = null;
    private volatile long lastCacheTime = 0L;
    private static final long CACHE_TTL_MS = 60_000L;

    public VoucherService(VoucherRepository voucherRepository) {
        this.voucherRepository = voucherRepository;
    }

    private synchronized void evictCache() {
        this.cachedActiveVouchers = null;
        this.lastCacheTime = 0L;
    }

    @Transactional(readOnly = true)
    public List<Voucher> getActivePublicVouchers() {
        long now = System.currentTimeMillis();
        List<Voucher> current = this.cachedActiveVouchers;
        if (current != null && (now - lastCacheTime) < CACHE_TTL_MS) {
            return current;
        }
        synchronized (this) {
            if (this.cachedActiveVouchers != null && (System.currentTimeMillis() - lastCacheTime) < CACHE_TTL_MS) {
                return this.cachedActiveVouchers;
            }
            try {
                this.cachedActiveVouchers = voucherRepository.findActivePublicVouchers(LocalDateTime.now());
                this.lastCacheTime = System.currentTimeMillis();
                return this.cachedActiveVouchers;
            } catch (Exception e) {
                log.warn("[VoucherService] Lỗi khi truy vấn voucher hoạt động từ DB: {}", e.getMessage());
                return this.cachedActiveVouchers != null ? this.cachedActiveVouchers : Collections.emptyList();
            }
        }
    }

    public List<VoucherDto> getActivePublicVoucherDtos() {
        return getActivePublicVouchers().stream()
                .map(VoucherDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public VoucherValidateResponseDto validateVoucher(String code, Double orderAmount) {
        if (code == null || code.isBlank()) {
            return VoucherValidateResponseDto.invalid("Vui lòng nhập mã tem phiếu.");
        }

        String cleanCode = code.trim().toUpperCase();
        Optional<Voucher> opt = voucherRepository.findByCodeIgnoreCase(cleanCode);

        if (opt.isEmpty()) {
            return VoucherValidateResponseDto.invalid(String.format("Mã tem phiếu [%s] không tồn tại.", cleanCode));
        }

        Voucher v = opt.get();

        if (Boolean.FALSE.equals(v.getIsActive())) {
            return VoucherValidateResponseDto.invalid("Mã tem phiếu này hiện đang tạm ngưng áp dụng.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (v.getStartDate() != null && now.isBefore(v.getStartDate())) {
            return VoucherValidateResponseDto.invalid("Mã tem phiếu chưa đến thời gian áp dụng.");
        }

        if (v.getEndDate() != null && now.isAfter(v.getEndDate())) {
            return VoucherValidateResponseDto.invalid("Mã tem phiếu đã hết thời hạn áp dụng.");
        }

        if (v.getUsageLimit() != null && v.getUsedCount() >= v.getUsageLimit()) {
            return VoucherValidateResponseDto.invalid("Mã tem phiếu đã hết lượt sử dụng.");
        }

        double amount = (orderAmount != null) ? orderAmount : 0.0;
        if (v.getMinOrderAmount() != null && amount < v.getMinOrderAmount()) {
            return VoucherValidateResponseDto.invalid(String.format(
                    "Mã chỉ áp dụng cho đơn hàng từ %,.0fđ trở lên (Đơn hiện tại: %,.0fđ).",
                    v.getMinOrderAmount(), amount
            ));
        }

        double discountAmount = 0.0;
        if ("PERCENT".equalsIgnoreCase(v.getDiscountType())) {
            discountAmount = amount * (v.getDiscountValue() / 100.0);
            if (v.getMaxDiscountAmount() != null && v.getMaxDiscountAmount() > 0) {
                discountAmount = Math.min(discountAmount, v.getMaxDiscountAmount());
            }
        } else {
            discountAmount = Math.min(v.getDiscountValue(), amount);
        }

        double finalAmount = Math.max(0.0, amount - discountAmount);

        return VoucherValidateResponseDto.success(
                v.getCode(),
                v.getTitle(),
                v.getDiscountType(),
                v.getDiscountValue(),
                discountAmount,
                finalAmount
        );
    }

    @Transactional
    public boolean applyVoucherUsage(String code) {
        if (code == null || code.isBlank()) return false;
        String cleanCode = code.trim().toUpperCase();
        Optional<Voucher> opt = voucherRepository.findByCodeIgnoreCase(cleanCode);
        if (opt.isPresent()) {
            int updated = voucherRepository.incrementUsedCount(opt.get().getId(), LocalDateTime.now());
            if (updated > 0) {
                evictCache();
                return true;
            }
        }
        return false;
    }

    // ==========================================
    // ADMIN OPERATIONS
    // ==========================================

    @Transactional(readOnly = true)
    public List<VoucherDto> getAllVouchersForAdmin() {
        return voucherRepository.findByOrderByCreatedAtDesc().stream()
                .map(VoucherDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<VoucherDto> getVoucherById(String id) {
        return voucherRepository.findById(id).map(VoucherDto::fromEntity);
    }

    @Transactional
    public VoucherDto createVoucher(VoucherCreateUpdateDto dto) {
        String cleanCode = dto.getCode().trim().toUpperCase();
        if (voucherRepository.existsByCodeIgnoreCase(cleanCode)) {
            throw new IllegalArgumentException(String.format("Mã voucher [%s] đã tồn tại trong hệ thống.", cleanCode));
        }

        Voucher v = new Voucher(
                cleanCode,
                dto.getTitle(),
                dto.getDescription(),
                dto.getDiscountType(),
                dto.getDiscountValue(),
                dto.getMaxDiscountAmount(),
                dto.getMinOrderAmount(),
                dto.getStartDate(),
                dto.getEndDate(),
                dto.getUsageLimit(),
                dto.getIsActive(),
                dto.getIsPublic()
        );

        Voucher saved = voucherRepository.save(v);
        evictCache();
        return VoucherDto.fromEntity(saved);
    }

    @Transactional
    public VoucherDto updateVoucher(String id, VoucherCreateUpdateDto dto) {
        Voucher v = voucherRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy voucher với ID: " + id));

        String cleanCode = dto.getCode().trim().toUpperCase();
        if (!cleanCode.equalsIgnoreCase(v.getCode()) && voucherRepository.existsByCodeIgnoreCase(cleanCode)) {
            throw new IllegalArgumentException(String.format("Mã voucher [%s] đã tồn tại.", cleanCode));
        }

        v.setCode(cleanCode);
        v.setTitle(dto.getTitle());
        v.setDescription(dto.getDescription());
        v.setDiscountType(dto.getDiscountType());
        v.setDiscountValue(dto.getDiscountValue());
        v.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        v.setMinOrderAmount(dto.getMinOrderAmount());
        v.setStartDate(dto.getStartDate());
        v.setEndDate(dto.getEndDate());
        v.setUsageLimit(dto.getUsageLimit());
        v.setIsActive(dto.getIsActive());
        v.setIsPublic(dto.getIsPublic());

        Voucher updated = voucherRepository.save(v);
        evictCache();
        return VoucherDto.fromEntity(updated);
    }

    @Transactional
    public VoucherDto toggleVoucherStatus(String id) {
        Voucher v = voucherRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy voucher với ID: " + id));

        v.setIsActive(!Boolean.TRUE.equals(v.getIsActive()));
        Voucher saved = voucherRepository.save(v);
        evictCache();
        return VoucherDto.fromEntity(saved);
    }

    @Transactional
    public void deleteVoucher(String id) {
        if (!voucherRepository.existsById(id)) {
            throw new IllegalArgumentException("Không tìm thấy voucher với ID: " + id);
        }
        voucherRepository.deleteById(id);
        evictCache();
    }
}

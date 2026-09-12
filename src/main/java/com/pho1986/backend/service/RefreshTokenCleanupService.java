package com.pho1986.backend.service;

import com.pho1986.backend.repository.RefreshTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * [DRAGON & BLADE] Automated Housekeeping Worker for Refresh Tokens.
 * - Performs chunked batch deletion (LIMIT 5000) to protect InnoDB Buffer Pool, undo/redo logs,
 *   and avoid lock contention on high-volume production databases.
 * - Strictly respects the Grace Period: Only deletes tokens whose natural expiration has elapsed (expiry_date <= NOW()).
 */
@Service
public class RefreshTokenCleanupService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenCleanupService.class);
    private static final int BATCH_SIZE = 5000;

    private final RefreshTokenRepository refreshTokenRepository;
    private final AtomicBoolean isRunning = new AtomicBoolean(false);

    public RefreshTokenCleanupService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    /**
     * Periodic cleanup of expired refresh tokens.
     * Runs every hour by default (configurable via application.yml).
     */
    @Scheduled(cron = "${app.security.token-cleanup-cron:0 0 * * * *}")
    public void scheduleCleanup() {
        if (!isRunning.compareAndSet(false, true)) {
            log.warn("[DRAGON DB HOUSEKEEPING] Tác vụ dọn dẹp token phiên trước vẫn đang chạy. Bỏ qua lượt này.");
            return;
        }

        try {
            purgeExpiredTokensInBatches();
        } finally {
            isRunning.set(false);
        }
    }

    /**
     * Executes chunked deletion loop.
     * Each batch is committed in its own transaction context to minimize row-lock duration.
     */
    public int purgeExpiredTokensInBatches() {
        LocalDateTime cutoff = LocalDateTime.now();
        int totalDeleted = 0;
        int batchDeleted;

        try {
            do {
                batchDeleted = deleteBatch(cutoff);
                totalDeleted += batchDeleted;
            } while (batchDeleted == BATCH_SIZE);

            if (totalDeleted > 0) {
                log.info("[DRAGON DB HOUSEKEEPING] Đã dọn dẹp thành công {} refresh token hết hạn theo từng lô (Batch Size: {}).",
                        totalDeleted, BATCH_SIZE);
            }
        } catch (Exception e) {
            log.error("[DRAGON DB HOUSEKEEPING] Lỗi trong quá trình dọn dẹp token hết hạn: {}", e.getMessage(), e);
        }

        return totalDeleted;
    }

    @Transactional
    public int deleteBatch(LocalDateTime cutoff) {
        return refreshTokenRepository.deleteExpiredTokensBatch(cutoff, BATCH_SIZE);
    }
}

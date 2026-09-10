package com.pho1986.backend.security;

import com.pho1986.backend.model.entity.SecurityBlacklist;
import com.pho1986.backend.repository.SecurityBlacklistRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * [SENTINEL & BLADE] Hệ thống Phòng thủ Mối đe dọa (Threat Defense Service)
 * Quản lý danh sách cấm đa tầng (SĐT + IP + Device ID) với In-Memory Cache O(1).
 */
@Service
public class ThreatDefenseService {

    private static final Logger log = LoggerFactory.getLogger(ThreatDefenseService.class);

    private final SecurityBlacklistRepository blacklistRepository;

    // In-memory cache tra cứu O(1)
    private final Map<String, String> bannedPhones = new ConcurrentHashMap<>();
    private final Map<String, String> bannedDevices = new ConcurrentHashMap<>();
    private final Map<String, IpBanRecord> bannedIps = new ConcurrentHashMap<>();

    // Danh sách IP an toàn bất khả xâm phạm (Mạng nội bộ / Máy POS / Quán phở)
    private final Set<String> whitelistIps = ConcurrentHashMap.newKeySet();

    public static record IpBanRecord(String reason, LocalDateTime expiresAt) {
        public boolean isExpired() {
            return expiresAt != null && expiresAt.isBefore(LocalDateTime.now());
        }
    }

    public ThreatDefenseService(SecurityBlacklistRepository blacklistRepository) {
        this.blacklistRepository = blacklistRepository;
        // Mặc định whitelist IP cục bộ
        whitelistIps.addAll(Set.of("127.0.0.1", "0:0:0:0:0:0:0:1", "localhost", "::1"));
    }

    @EventListener(ApplicationReadyEvent.class)
    public void loadBlacklistsOnStartup() {
        try {
            List<SecurityBlacklist> activeList = blacklistRepository.findAllActiveBlacklists(LocalDateTime.now());
            int phonesCount = 0;
            int ipsCount = 0;
            int devicesCount = 0;

            for (SecurityBlacklist b : activeList) {
                if ("PHONE".equalsIgnoreCase(b.getTargetType())) {
                    bannedPhones.put(b.getTargetValue().trim(), b.getReason() != null ? b.getReason() : "Bị cấm vĩnh viễn");
                    phonesCount++;
                } else if ("IP".equalsIgnoreCase(b.getTargetType())) {
                    if (!isWhitelistedIp(b.getTargetValue())) {
                        bannedIps.put(b.getTargetValue().trim(), new IpBanRecord(b.getReason(), b.getExpiresAt()));
                        ipsCount++;
                    }
                } else if ("DEVICE_ID".equalsIgnoreCase(b.getTargetType())) {
                    bannedDevices.put(b.getTargetValue().trim(), b.getReason() != null ? b.getReason() : "Thiết bị bị cấm");
                    devicesCount++;
                }
            }

            log.info("[SENTINEL] Đã nạp Threat Defense Cache thành công: {} SĐT, {} IP, {} Thiết bị.",
                    phonesCount, ipsCount, devicesCount);
        } catch (Exception e) {
            log.warn("[SENTINEL] Không thể nạp Threat Defense Cache lúc khởi động: {}", e.getMessage());
        }
    }

    public boolean isWhitelistedIp(String ip) {
        if (ip == null || ip.isBlank()) return false;
        String cleanIp = ip.trim();
        return whitelistIps.contains(cleanIp) || cleanIp.startsWith("192.168.") || cleanIp.startsWith("10.");
    }

    public boolean isPhoneBlocked(String phone) {
        if (phone == null || phone.isBlank()) return false;
        return bannedPhones.containsKey(phone.trim());
    }

    public String getPhoneBanReason(String phone) {
        if (phone == null) return null;
        return bannedPhones.get(phone.trim());
    }

    public boolean isDeviceBlocked(String deviceId) {
        if (deviceId == null || deviceId.isBlank()) return false;
        return bannedDevices.containsKey(deviceId.trim());
    }

    public String getDeviceBanReason(String deviceId) {
        if (deviceId == null) return null;
        return bannedDevices.get(deviceId.trim());
    }

    public boolean isIpBlocked(String ip) {
        if (ip == null || ip.isBlank() || isWhitelistedIp(ip)) return false;
        IpBanRecord record = bannedIps.get(ip.trim());
        if (record == null) return false;
        if (record.isExpired()) {
            bannedIps.remove(ip.trim());
            return false;
        }
        return true;
    }

    public String getIpBanReason(String ip) {
        if (ip == null) return null;
        IpBanRecord record = bannedIps.get(ip.trim());
        return (record != null && !record.isExpired()) ? record.reason() : null;
    }

    @Transactional
    public void banTarget(String targetType, String targetValue, String reason, String bannedBy, Integer durationDays) {
        if (targetType == null || targetValue == null || targetValue.isBlank()) return;

        String type = targetType.toUpperCase().trim();
        String val = targetValue.trim();

        // Không bao giờ cấm IP nằm trong Whitelist
        if ("IP".equals(type) && isWhitelistedIp(val)) {
            log.warn("[SENTINEL] Từ chối cấm IP {} vì nằm trong danh sách Whitelist an toàn của quán!", val);
            return;
        }

        LocalDateTime expiresAt = (durationDays != null && durationDays > 0)
                ? LocalDateTime.now().plusDays(durationDays)
                : null;

        SecurityBlacklist entity = blacklistRepository.findByTargetTypeAndTargetValue(type, val)
                .orElse(new SecurityBlacklist(type, val, reason, bannedBy, expiresAt));

        entity.setReason(reason);
        entity.setBannedBy(bannedBy);
        entity.setExpiresAt(expiresAt);
        blacklistRepository.save(entity);

        // Nạp ngay tức thì vào In-Memory Cache O(1)
        if ("PHONE".equals(type)) {
            bannedPhones.put(val, reason != null ? reason : "Bị cấm bởi Quản trị viên");
        } else if ("IP".equals(type)) {
            bannedIps.put(val, new IpBanRecord(reason, expiresAt));
        } else if ("DEVICE_ID".equals(type)) {
            bannedDevices.put(val, reason != null ? reason : "Thiết bị bị hạn chế truy cập");
        }

        log.info("[SENTINEL] Đã kích hoạt lệnh cấm {} [{}]: {}", type, val, reason);
    }

    @Transactional
    public void unbanTarget(String targetType, String targetValue) {
        if (targetType == null || targetValue == null || targetValue.isBlank()) return;

        String type = targetType.toUpperCase().trim();
        String val = targetValue.trim();

        blacklistRepository.deleteByTargetTypeAndTargetValue(type, val);

        if ("PHONE".equals(type)) bannedPhones.remove(val);
        else if ("IP".equals(type)) bannedIps.remove(val);
        else if ("DEVICE_ID".equals(type)) bannedDevices.remove(val);

        log.info("[SENTINEL] Đã dỡ bỏ lệnh cấm {} [{}]", type, val);
    }
}

package com.pho1986.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * [SENTINEL] Bộ lọc Phòng thủ Mối đe dọa (Threat Defense Gate)
 * Chạy ngay tại cổng vào của Servlet Filter để kiểm tra IP và Device ID bị cấm.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class ThreatDefenseFilter extends OncePerRequestFilter {

    private final ThreatDefenseService threatDefenseService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ThreatDefenseFilter(ThreatDefenseService threatDefenseService) {
        this.threatDefenseService = threatDefenseService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Bỏ qua các endpoint tĩnh hoặc kiểm tra sức khỏe
        String path = request.getRequestURI();
        if (path != null && (path.startsWith("/actuator") || path.endsWith(".css") || path.endsWith(".js") || path.endsWith(".ico"))) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = extractClientIp(request);
        String deviceId = extractDeviceId(request);

        // 1. Kiểm tra cấm IP
        if (threatDefenseService.isIpBlocked(clientIp)) {
            String reason = threatDefenseService.getIpBanReason(clientIp);
            sendBlockedResponse(response, HttpServletResponse.SC_FORBIDDEN, "IP_BLOCKED",
                    "Địa chỉ mạng (IP) của bạn tạm thời bị hạn chế truy cập: " + (reason != null ? reason : "Vi phạm quy chế an ninh quán."));
            return;
        }

        // 2. Kiểm tra cấm Thiết Bị (Device ID)
        if (threatDefenseService.isDeviceBlocked(deviceId)) {
            String reason = threatDefenseService.getDeviceBanReason(deviceId);
            sendBlockedResponse(response, HttpServletResponse.SC_FORBIDDEN, "DEVICE_BLOCKED",
                    "Thiết bị này đã bị cấm truy cập hệ thống Phở 1986: " + (reason != null ? reason : "Vi phạm quy định quán."));
            return;
        }

        filterChain.doFilter(request, response);
    }

    public static String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        String xr = request.getHeader("X-Real-IP");
        if (xr != null && !xr.isBlank()) {
            return xr.trim();
        }
        return request.getRemoteAddr();
    }

    public static String extractDeviceId(HttpServletRequest request) {
        String devHeader = request.getHeader("X-Device-Id");
        if (devHeader != null && !devHeader.isBlank()) {
            return devHeader.trim();
        }
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("pho1986_device_id".equals(c.getName()) && c.getValue() != null && !c.getValue().isBlank()) {
                    return c.getValue().trim();
                }
            }
        }
        return null;
    }

    private void sendBlockedResponse(HttpServletResponse response, int status, String code, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> body = Map.of(
                "success", false,
                "code", code,
                "message", message,
                "timestamp", LocalDateTime.now().toString()
        );

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}

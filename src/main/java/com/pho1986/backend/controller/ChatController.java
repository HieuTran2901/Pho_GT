package com.pho1986.backend.controller;

import com.pho1986.backend.dto.ChatRequestDto;
import com.pho1986.backend.dto.ChatResponseDto;
import com.pho1986.backend.service.ChatService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private final ChatService chatService;

    // Rate Limiter: Tối đa 25 requests / phút / IP
    private final Map<String, IpRateBucket> rateLimitMap = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_MINUTE = 25;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<ChatResponseDto> chat(
            @Valid @RequestBody ChatRequestDto request,
            HttpServletRequest servletRequest
    ) {
        String clientIp = getClientIp(servletRequest);

        if (!isAllowed(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(
                    ChatResponseDto.of("Dạ Bác gửi tin nhắn nhanh quá ạ. Tiểu Nhị xin phép chuẩn bị nước dùng trong giây lát, Bác chờ em xíu nhé!")
            );
        }

        ChatResponseDto response = chatService.processChat(request);
        return ResponseEntity.ok(response);
    }

    private boolean isAllowed(String ip) {
        long now = System.currentTimeMillis();

        // Tự động dọn dẹp các IP đã hết hạn khi kích thước map vượt 500 mục (Chống memory leak)
        if (rateLimitMap.size() > 500) {
            rateLimitMap.entrySet().removeIf(entry -> (now - entry.getValue().windowStartTime) > 120000L);
        }

        IpRateBucket bucket = rateLimitMap.compute(ip, (k, v) -> {
            if (v == null || (now - v.windowStartTime) > 60000L) {
                return new IpRateBucket(now, 1);
            }
            v.counter++;
            return v;
        });
        return bucket.counter <= MAX_REQUESTS_PER_MINUTE;
    }

    private String getClientIp(HttpServletRequest req) {
        String xForwardedFor = req.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return req.getRemoteAddr() != null ? req.getRemoteAddr() : "127.0.0.1";
    }

    private static class IpRateBucket {
        long windowStartTime;
        int counter;

        IpRateBucket(long windowStartTime, int counter) {
            this.windowStartTime = windowStartTime;
            this.counter = counter;
        }
    }
}

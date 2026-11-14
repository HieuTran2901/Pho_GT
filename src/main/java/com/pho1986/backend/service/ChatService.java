package com.pho1986.backend.service;

import com.pho1986.backend.config.GeminiProperties;
import com.pho1986.backend.dto.ChatRequestDto;
import com.pho1986.backend.dto.ChatRequestDto.ChatMessageHistoryDto;
import com.pho1986.backend.dto.ChatResponseDto;
import com.pho1986.backend.model.entity.Dish;
import com.pho1986.backend.model.entity.Voucher;
import com.pho1986.backend.repository.DishRepository;
import com.pho1986.backend.service.chat.ChatIntentResolver;
import com.pho1986.backend.service.chat.ChatIntentResolver.ChatActionDetected;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.*;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final GeminiProperties geminiProperties;
    private final RestClient restClient;
    private final DishRepository dishRepository;
    private final VoucherService voucherService;
    private final ChatIntentResolver chatIntentResolver;

    private volatile List<Dish> cachedDishes = null;
    private volatile long lastCacheTime = 0L;
    private volatile String activeWorkingModel = null;
    private static final long CACHE_TTL_MS = 60_000L;

    private static final String SYSTEM_PROMPT = """
        Bạn là "Tiểu Nhị Phố Cũ 1986" - người đàm đạo và phục vụ ẩm thực tại quán Phở Gia Truyền 1986 (Hà Nội).
        Quy tắc giao tiếp bắt buộc:
        - Trả lời TRỰC TIẾP, tự nhiên và đúng trọng tâm câu hỏi của Quý khách ngay từ câu đầu tiên; TUYỆT ĐỐI không lặp lại câu chào sáo rỗng hay văn mẫu giống nhau ở các lượt.
        - Xưng hô lịch thiệp, ấm áp chuẩn phong vị Hà Nội xưa ("Dạ", "Quý khách", "em").
        - Nếu khách hỏi về thực đơn/món ăn/khẩu vị: liệt kê trực tiếp tên món, giá tiền chính xác 100% từ dữ liệu thực tế bên dưới và gợi ý hợp gu khách.
        - Tinh hoa quán: Nước dùng ninh chậm 24 giờ than củi với xương ống bò tơ, sá sùng Quan Lạn, 5 thảo mộc (hoa hồi, thảo quả, quế chi, rễ mùi, hạt ngò), 100% không mì chính; bánh phở tráng cối đá; bát men lam Bát Tràng giữ nhiệt.
        - Giờ mở cửa: 06:00 - 23:00 hàng ngày; có đặt bàn trước và giao hàng thố giữ nhiệt 45 phút; hotline 0986.198.686.
        - Khuyến mãi: Chỉ nêu đúng mã tem phiếu từ danh mục thực tế bên dưới, không tự bịa mã hay giá.
        - Độ dài: Ngắn gọn, tự nhiên trong 2-4 câu.
        """;

    public ChatService(
            GeminiProperties geminiProperties,
            DishRepository dishRepository,
            VoucherService voucherService,
            ChatIntentResolver chatIntentResolver) {
        this.geminiProperties = geminiProperties;
        this.dishRepository = dishRepository;
        this.voucherService = voucherService;
        this.chatIntentResolver = chatIntentResolver;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(15));

        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .build();
    }

    private List<Dish> getAvailableDishes() {
        long now = System.currentTimeMillis();
        List<Dish> current = this.cachedDishes;
        if (current != null && (now - lastCacheTime) < CACHE_TTL_MS) {
            return current;
        }
        synchronized (this) {
            if (this.cachedDishes != null && (System.currentTimeMillis() - lastCacheTime) < CACHE_TTL_MS) {
                return this.cachedDishes;
            }
            try {
                this.cachedDishes = dishRepository.findByIsAvailableTrueOrderByIsSignatureDescPriceAsc();
                this.lastCacheTime = System.currentTimeMillis();
                return this.cachedDishes;
            } catch (Exception e) {
                log.warn("[ChatService] Lỗi khi tải thực đơn từ DB: {}", e.getMessage());
                return this.cachedDishes != null ? this.cachedDishes : Collections.emptyList();
            }
        }
    }

    private List<Voucher> safeGetVouchers() {
        try {
            List<Voucher> active = voucherService.getActivePublicVouchers();
            return active != null ? active : Collections.emptyList();
        } catch (Exception e) {
            log.warn("[ChatService] Lỗi khi tải voucher từ DB: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public ChatResponseDto processChat(ChatRequestDto request) {
        String userMessage = request.getMessage() != null ? request.getMessage().trim() : "";
        List<Dish> availableDishes = getAvailableDishes();
        List<Voucher> activeVouchers = safeGetVouchers();

        ChatActionDetected detectedAction = chatIntentResolver.detectAction(userMessage, availableDishes, activeVouchers);

        if (geminiProperties.isConfigured()) {
            ChatResponseDto llmResponse = callGeminiLlm(
                    userMessage, request.getHistory(), detectedAction, availableDishes, activeVouchers);
            if (llmResponse != null && llmResponse.getReply() != null && !llmResponse.getReply().isBlank()) {
                return llmResponse;
            }
        }

        return chatIntentResolver.resolveSmartKnowledge(
                userMessage, request.getHistory(), detectedAction, availableDishes, activeVouchers);
    }

    private ChatResponseDto callGeminiLlm(
            String userMessage,
            List<ChatMessageHistoryDto> history,
            ChatActionDetected detectedAction,
            List<Dish> availableDishes,
            List<Voucher> activeVouchers) {
        List<Map<String, Object>> contents = buildAlternatingContents(userMessage, history);
        String dynamicPrompt = SYSTEM_PROMPT + "\n"
                + buildDynamicMenuPrompt(availableDishes) + "\n"
                + buildDynamicVoucherPrompt(activeVouchers);

        Map<String, Object> requestBody = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", dynamicPrompt))),
                "contents", contents,
                "generationConfig", Map.of("temperature", 0.7, "maxOutputTokens", 1024)
        );

        String apiKey = geminiProperties.getApiKey();
        for (String candidateModel : resolveModelCandidates()) {
            try {
                String url = String.format("%s/%s:generateContent", geminiProperties.getEndpoint(), candidateModel);
                @SuppressWarnings("unchecked")
                Map<String, Object> response = restClient.post()
                        .uri(url)
                        .header("x-goog-api-key", apiKey)
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(requestBody)
                        .retrieve()
                        .body(Map.class);

                String replyText = extractTextFromGeminiResponse(response);
                if (replyText != null && !replyText.isEmpty()) {
                    this.activeWorkingModel = candidateModel;
                    ChatActionDetected finalAction = chatIntentResolver.enrichActionFromReply(
                            userMessage, replyText, detectedAction, availableDishes);
                    return ChatResponseDto.of(replyText, finalAction.actionType(), finalAction.payload(), false);
                }
            } catch (Exception e) {
                log.warn("[ChatService] Model {} không phản hồi ({}), thử model dự phòng...",
                        candidateModel, sanitizeError(e.getMessage(), apiKey));
            }
        }
        return null;
    }

    private List<String> resolveModelCandidates() {
        Set<String> models = new LinkedHashSet<>();
        if (activeWorkingModel != null && !activeWorkingModel.isBlank()) {
            models.add(activeWorkingModel);
        }
        models.addAll(geminiProperties.getCandidateModels());
        return new ArrayList<>(models);
    }

    private List<Map<String, Object>> buildAlternatingContents(String userMessage, List<ChatMessageHistoryDto> history) {
        List<Map<String, Object>> contents = new ArrayList<>();
        String lastRole = null;

        if (history != null && !history.isEmpty()) {
            int start = Math.max(0, history.size() - 6);
            for (int i = start; i < history.size(); i++) {
                ChatMessageHistoryDto item = history.get(i);
                if (item == null || item.getContent() == null || item.getContent().isBlank()) continue;
                String role = "user".equalsIgnoreCase(item.getRole()) ? "user" : "model";
                // Gemini generateContent requires conversation turns to start with 'user' and alternate
                if (contents.isEmpty() && "model".equals(role)) continue;
                if (role.equals(lastRole)) continue;
                contents.add(Map.of("role", role, "parts", List.of(Map.of("text", item.getContent().trim()))));
                lastRole = role;
            }
        }

        if ("user".equals(lastRole) && !contents.isEmpty()) {
            contents.remove(contents.size() - 1);
        }
        contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", userMessage))));
        return contents;
    }

    @SuppressWarnings("unchecked")
    private String extractTextFromGeminiResponse(Map<String, Object> response) {
        if (response == null || !response.containsKey("candidates")) return null;
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
        if (candidates == null || candidates.isEmpty()) return null;

        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        if (content == null || !content.containsKey("parts")) return null;

        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        StringBuilder sb = new StringBuilder();
        for (Map<String, Object> part : parts) {
            if (part == null || Boolean.TRUE.equals(part.get("thought"))) continue;
            Object text = part.get("text");
            if (text != null) sb.append(text);
        }
        return sb.toString().trim();
    }

    private String buildDynamicMenuPrompt(List<Dish> availableDishes) {
        if (availableDishes == null || availableDishes.isEmpty()) return "";
        StringBuilder sb = new StringBuilder("\nDANH MỤC MÓN ĂN & ĐỒ UỐNG THỰC TẾ TẠI QUÁN (DATABASE LIVE DATA):\n");
        for (Dish d : availableDishes) {
            String catName = (d.getCategory() != null) ? d.getCategory().getName() : "Món";
            sb.append(String.format("- [%s] %s: %,.0fđ", catName, d.getName(), d.getPrice()));
            if (Boolean.TRUE.equals(d.getIsSignature())) sb.append(" (Món Tinh Hoa)");
            if (d.getPortion() != null && !d.getPortion().isBlank()) sb.append(" (Phần: ").append(d.getPortion().trim()).append(")");
            if (d.getDescription() != null && !d.getDescription().isBlank()) sb.append(" - ").append(d.getDescription().trim());
            sb.append("\n");
        }
        return sb.toString();
    }

    private String buildDynamicVoucherPrompt(List<Voucher> activeVouchers) {
        if (activeVouchers == null || activeVouchers.isEmpty()) return "";
        StringBuilder sb = new StringBuilder("\nDANH SÁCH TEM PHIẾU / MÃ GIẢM GIÁ THỰC TẾ (DATABASE LIVE DATA):\n");
        for (Voucher v : activeVouchers) {
            String discountStr = "PERCENT".equalsIgnoreCase(v.getDiscountType())
                    ? String.format("Giảm %.0f%% (tối đa %,.0fđ)", v.getDiscountValue(),
                            v.getMaxDiscountAmount() != null ? v.getMaxDiscountAmount() : 0.0)
                    : String.format("Giảm trực tiếp %,.0fđ", v.getDiscountValue());
            String minOrderStr = (v.getMinOrderAmount() != null && v.getMinOrderAmount() > 0)
                    ? String.format(" cho đơn từ %,.0fđ", v.getMinOrderAmount()) : "";
            sb.append(String.format("- Mã [%s]: %s - %s%s. %s\n",
                    v.getCode(), v.getTitle(), discountStr, minOrderStr, v.getDescription() != null ? v.getDescription() : ""));
        }
        return sb.toString();
    }

    private String sanitizeError(String message, String apiKey) {
        if (message == null) return "Unknown error";
        if (apiKey != null && !apiKey.isEmpty()) {
            return message.replace(apiKey, "***");
        }
        return message;
    }
}

package com.pho1986.backend.service;

import com.pho1986.backend.config.GeminiProperties;
import com.pho1986.backend.dto.ChatRequestDto;
import com.pho1986.backend.dto.ChatResponseDto;
import com.pho1986.backend.model.entity.Dish;
import com.pho1986.backend.repository.DishRepository;
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

    // In-Memory Cache cho danh mục món ăn (TTL 60s) - Triệt tiêu truy vấn trùng lặp
    private volatile List<Dish> cachedDishes = null;
    private volatile long lastCacheTime = 0L;
    private static final long CACHE_TTL_MS = 60_000L;

    private static final String SYSTEM_PROMPT = """
        Bạn là "Tiểu Nhị Phố Cũ 1986" - người đàm đạo và phục vụ ẩm thực tại quán Phở Gia Truyền 1986 (Hà Nội).
        Phong cách giao tiếp:
        - Xưng hô lịch thiệp, đôn hậu, tao nhã chuẩn phong vị Hà Nội xưa ("Dạ em chào Bác", "Kính thưa Quý khách", "Mời Bác xơi phở").
        - Trích dẫn tinh thần ẩm thực của Thạch Lam, Vũ Bằng về phở Hà Nội.
        - Tinh hoa quán: Nước dùng ninh chậm 24 giờ bằng than củi đỏ lửa với xương ống bò tơ, sá sùng Quan Lạn nướng vàng, 5 thảo mộc (hoa hồi xứ Lạng, thảo quả nướng, quế chi, rễ mùi, hạt ngò); tuyệt đối không dùng mì chính; bánh phở tươi tráng cối đá mỏng như lụa; đựng trong bát chiết yêu men lam Bát Tràng giữ nhiệt bỏng rẫy.
        - Giờ mở cửa: 06:00 đến 23:00 hàng ngày.
        - Có nhận đặt bàn trước, giao hàng tận nơi đóng gói thố giữ nhiệt 45 phút.
        - Khuyến mãi: Áp dụng các mã tem phiếu tri ân theo danh mục thực tế được đính kèm bên dưới.
        - Trả lời ngắn gọn, súc tích (khoảng 2-4 câu), ấm áp, mời mọc khách thưởng vị hoặc đặt bàn.
        """;

    public ChatService(GeminiProperties geminiProperties, DishRepository dishRepository, VoucherService voucherService) {
        this.geminiProperties = geminiProperties;
        this.dishRepository = dishRepository;
        this.voucherService = voucherService;

        // Cấu hình RestClient với Connect Timeout (5s) và Read Timeout (15s) tránh giữ nghẽn luồng Tomcat
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

    public ChatResponseDto processChat(ChatRequestDto request) {
        String userMessage = request.getMessage() != null ? request.getMessage().trim() : "";

        // 1. Kiểm tra intent hành động trực tiếp trước (Action Detection)
        ChatActionDetected detectedAction = detectAction(userMessage);

        // 2. Thử gọi LLM Google Gemini nếu đã cấu hình API Key
        if (geminiProperties.isConfigured()) {
            try {
                ChatResponseDto llmResponse = callGeminiLlm(userMessage, request.getHistory(), detectedAction);
                if (llmResponse != null && llmResponse.getReply() != null && !llmResponse.getReply().isBlank()) {
                    return llmResponse;
                }
            } catch (Exception e) {
                log.warn("[ChatService] Lỗi gọi Gemini API (fallback sang tri thức nội bộ): {}", e.getMessage());
            }
        }

        // 3. Fallback sang Bộ máy Tri thức Tràng An Offline
        return resolveOfflineKnowledge(userMessage, detectedAction);
    }

    @SuppressWarnings("unchecked")
    private ChatResponseDto callGeminiLlm(String userMessage, List<ChatRequestDto.ChatMessageHistoryDto> history, ChatActionDetected detectedAction) {
        String url = String.format("%s/%s:generateContent?key=%s",
                geminiProperties.getEndpoint(),
                geminiProperties.getModel(),
                geminiProperties.getApiKey());

        List<Map<String, Object>> contents = new ArrayList<>();

        if (history != null) {
            int start = Math.max(0, history.size() - 4);
            for (int i = start; i < history.size(); i++) {
                ChatRequestDto.ChatMessageHistoryDto item = history.get(i);
                String role = "user".equalsIgnoreCase(item.getRole()) ? "user" : "model";
                contents.add(Map.of("role", role, "parts", List.of(Map.of("text", item.getContent()))));
            }
        }

        contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", userMessage))));

        String dynamicPrompt = SYSTEM_PROMPT + "\n" + buildDynamicMenuPrompt() + "\n" + buildDynamicVoucherPrompt();

        Map<String, Object> requestBody = Map.of(
                "system_instruction", Map.of("parts", List.of(Map.of("text", dynamicPrompt))),
                "contents", contents,
                "generationConfig", Map.of("temperature", 0.7, "maxOutputTokens", 2048)
        );

        Map<String, Object> response = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        if (response != null && response.containsKey("candidates")) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (!candidates.isEmpty()) {
                Map<String, Object> candidate = candidates.get(0);
                Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                if (content != null && content.containsKey("parts")) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    StringBuilder sb = new StringBuilder();
                    for (Map<String, Object> part : parts) {
                        if (part != null && part.containsKey("text")) {
                            sb.append(part.get("text"));
                        }
                    }
                    String text = sb.toString().trim();
                    if (!text.isEmpty()) {
                        return ChatResponseDto.of(
                                text,
                                detectedAction.actionType(),
                                detectedAction.payload(),
                                false
                        );
                    }
                }
            }
        }
        return null;
    }

    private ChatResponseDto resolveOfflineKnowledge(String query, ChatActionDetected action) {
        String q = query.toLowerCase(Locale.ROOT);

        if (matches(q, "chào", "hi", "hello", "ơi", "alo", "quán ơi")) {
            return ChatResponseDto.of(
                    "Dạ em kính chào Bác ạ! Bác ghé chơi quán Phở Gia Truyền 1986. Hôm nay tiết trời đẹp, Bác muốn dùng phở tái lăn áp chảo hay một bát nạm gầu giòn nóng hổi ạ?",
                    action.actionType(), action.payload(), true
            );
        }

        if (matches(q, "đặt bàn", "giữ chỗ", "bàn trống", "mấy người", "đặt chỗ")) {
            Map<String, Object> payload = Map.of("title", "Đặt Bàn Trực Quan 1986", "description", "Chọn vị trí bàn gỗ mộc hiên nhà hoặc trong gian ấm.");
            return ChatResponseDto.of(
                    "Dạ quán luôn dành sẵn những góc bàn gỗ mộc ấm cúng bên hiên ngói rêu phong. Bác bấm vào nút Đặt Bàn dưới đây để chọn chỗ ưng ý chỉ trong 30 giây ạ!",
                    "BOOKING", payload, true
            );
        }

        if (matches(q, "mã", "voucher", "ưu đãi", "khuyến mãi", "giảm giá", "phiếu")) {
            List<com.pho1986.backend.model.entity.Voucher> activeVouchers = voucherService.getActivePublicVouchers();
            if (activeVouchers != null && !activeVouchers.isEmpty()) {
                var v = activeVouchers.get(0);
                String disc = "PERCENT".equalsIgnoreCase(v.getDiscountType())
                        ? String.format("GIẢM %.0f%%", v.getDiscountValue())
                        : String.format("GIẢM %,.0fđ", v.getDiscountValue());
                String minOrder = (v.getMinOrderAmount() != null && v.getMinOrderAmount() > 0)
                        ? String.format(" cho đơn từ %,.0fđ", v.getMinOrderAmount()) : "";
                Map<String, Object> payload = Map.of("code", v.getCode(), "discount", disc, "desc", v.getTitle() + minOrder);
                return ChatResponseDto.of(
                        String.format("Dạ quán kính gửi Bác Tem Phiếu Tri Kỷ [%s] %s%s. Bác có thể sao chép mã và dùng ngay khi thanh toán ạ!", v.getCode(), disc, minOrder),
                        "VOUCHER", payload, true
                );
            }
            Map<String, Object> payload = Map.of("code", "PHO1986VIP", "discount", "GIẢM 20%", "desc", "Áp dụng đơn từ 150k khi đặt phở.");
            return ChatResponseDto.of(
                    "Dạ quán kính gửi Bác Tem Phiếu Tri Kỷ [PHO1986VIP] giảm 20% cho bữa thưởng vị hôm nay. Bác có thể sao chép mã và dùng ngay khi thanh toán ạ!",
                    "VOUCHER", payload, true
            );
        }

        if ("DISH".equals(action.actionType()) && action.payload() != null) {
            String name = (String) action.payload().get("name");
            Number price = (Number) action.payload().get("price");
            String priceStr = price != null ? String.format("%,.0fđ", price.doubleValue()) : "";
            return ChatResponseDto.of(
                    String.format("Dạ quán kính gửi Bác món %s với giá %s chuẩn niêm yết. Từng thớ thịt ngập vị ngọt tủy than củi ninh 24 giờ. Bác bấm nút dưới đây để thêm ngay vào giỏ ạ!", name, priceStr),
                    action.actionType(), action.payload(), true
            );
        }

        if (matches(q, "mì chính", "bột ngọt", "nước dùng", "sá sùng", "ninh")) {
            return ChatResponseDto.of(
                    "Dạ Bác an tâm tuyệt đối ạ! Nồi đồng quán ninh than củi ròng rã 24 giờ chắt lọc từ tủy xương ống bò tơ và sá sùng đảo Quan Lạn phơi sương, vị ngọt umami thuần khiết 100% không dùng một hạt mì chính nhân tạo nào.",
                    "NONE", null, true
            );
        }

        if (matches(q, "giờ", "mở cửa", "địa chỉ", "ở đâu")) {
            return ChatResponseDto.of(
                    "Dạ quán mở cửa đón khách từ 06:00 sáng đến 23:00 đêm mỗi ngày tại Phố Cổ Hà Nội. Khung giờ sáng sớm luôn có những bát phở đầu nồi thơm nức hương hồi quế ạ!",
                    "NONE", null, true
            );
        }

        if (matches(q, "menu", "thực đơn", "giá", "có món gì", "danh sách món")) {
            return ChatResponseDto.of(
                    "Dạ quán có đủ 26 món tinh hoa gia truyền: Phở bò tái lăn, nạm gầu giòn, đuôi bò thố đá, phở gà đồi, cùng quẩy giòn và trà sen Tây Hồ. Bác có thể xem toàn bộ thực đơn ngay dưới đây ạ!",
                    "MENU", null, true
            );
        }

        return ChatResponseDto.of(
                "Dạ từng thìa nước dùng 1986 đượm hương hoa hồi và sá sùng Quan Lạn luôn sẵn sàng phục vụ Bác. Bác muốn xem thực đơn, đặt bàn trước hay nhận mã tem phiếu tri kỷ ạ?",
                action.actionType(), action.payload(), true
        );
    }

    private ChatActionDetected detectAction(String text) {
        String q = text.toLowerCase(Locale.ROOT).trim();
        if (matches(q, "đặt bàn", "giữ chỗ", "bàn trống", "đặt chỗ")) {
            return new ChatActionDetected("BOOKING", Map.of("title", "Đặt Bàn"));
        }
        if (matches(q, "mã", "voucher", "ưu đãi", "khuyến mãi", "giảm giá", "phiếu")) {
            List<com.pho1986.backend.model.entity.Voucher> activeVouchers = voucherService.getActivePublicVouchers();
            if (activeVouchers != null && !activeVouchers.isEmpty()) {
                var v = activeVouchers.get(0);
                String disc = "PERCENT".equalsIgnoreCase(v.getDiscountType())
                        ? String.format("GIẢM %.0f%%", v.getDiscountValue())
                        : String.format("GIẢM %,.0fđ", v.getDiscountValue());
                return new ChatActionDetected("VOUCHER", Map.of("code", v.getCode(), "discount", disc));
            }
            return new ChatActionDetected("VOUCHER", Map.of("code", "PHO1986VIP", "discount", "GIẢM 20%"));
        }
        if (matches(q, "menu", "thực đơn", "toàn bộ món", "danh sách món")) {
            return new ChatActionDetected("MENU", null);
        }

        try {
            List<Dish> availableDishes = getAvailableDishes();
            if (availableDishes != null && !availableDishes.isEmpty()) {
                // Vòng 1: Tìm kiếm ưu tiên độ khớp cao (tên đầy đủ, cụm từ đặc trưng chính xác)
                for (Dish d : availableDishes) {
                    if (isHighConfidenceDishMatch(q, d.getName(), d.getSlug())) {
                        return createDishAction(d);
                    }
                }

                // Vòng 2: Tìm kiếm khớp phụ (từ khóa mở rộng)
                for (Dish d : availableDishes) {
                    if (isPartialDishMatch(q, d.getName())) {
                        return createDishAction(d);
                    }
                }

                if (matches(q, "món ngon", "gợi ý", "đặc biệt", "bán chạy", "signature")) {
                    Dish first = availableDishes.get(0);
                    return createDishAction(first);
                }
            }
        } catch (Exception e) {
            log.warn("[ChatService] Lỗi khi detectAction từ DB: {}", e.getMessage());
        }

        return new ChatActionDetected("NONE", null);
    }

    private ChatActionDetected createDishAction(Dish d) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", d.getId());
        payload.put("name", d.getName());
        payload.put("price", d.getPrice());
        payload.put("image", (d.getImageUrl() != null && !d.getImageUrl().isBlank())
                ? d.getImageUrl()
                : "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80");
        return new ChatActionDetected("DISH", payload);
    }

    private String buildDynamicMenuPrompt() {
        try {
            List<Dish> availableDishes = getAvailableDishes();
            if (availableDishes == null || availableDishes.isEmpty()) {
                return "";
            }
            StringBuilder sb = new StringBuilder("\nDANH MỤC 26 MÓN ĂN & ĐỒ UỐNG THỰC TẾ TẠI QUÁN (DATABASE LIVE DATA):\n");
            for (Dish d : availableDishes) {
                String catName = (d.getCategory() != null) ? d.getCategory().getName() : "Món";
                sb.append(String.format("- [%s] %s: %,.0fđ", catName, d.getName(), d.getPrice()));
                if (Boolean.TRUE.equals(d.getIsSignature())) {
                    sb.append(" (Món Tinh Hoa Bán Chạy)");
                }
                if (d.getPortion() != null && !d.getPortion().isBlank()) {
                    sb.append(" (Phần: ").append(d.getPortion().trim()).append(")");
                }
                if (d.getDescription() != null && !d.getDescription().isBlank()) {
                    sb.append(" - ").append(d.getDescription().trim());
                }
                sb.append("\n");
            }
            sb.append("QUY TẮC BẮT BUỘC:\n");
            sb.append("1. Báo đúng 100% tên món và giá tiền như danh mục trên, không tự bịa giá.\n");
            sb.append("2. Khi khách hỏi về bất kỳ món nào, hãy giải thích hấp dẫn và mời khách thêm vào giỏ thưởng vị.\n");
            return sb.toString();
        } catch (Exception e) {
            log.warn("[ChatService] Lỗi khi tạo dynamic menu prompt: {}", e.getMessage());
            return "";
        }
    }

    private String buildDynamicVoucherPrompt() {
        try {
            List<com.pho1986.backend.model.entity.Voucher> activeVouchers = voucherService.getActivePublicVouchers();
            if (activeVouchers == null || activeVouchers.isEmpty()) {
                return "";
            }
            StringBuilder sb = new StringBuilder("\nDANH SÁCH TEM PHIẾU / MÃ GIẢM GIÁ ĐANG ÁP DỤNG THỰC TẾ TẠI QUÁN (DATABASE LIVE DATA):\n");
            for (var v : activeVouchers) {
                String discountStr = "PERCENT".equalsIgnoreCase(v.getDiscountType())
                        ? String.format("Giảm %.0f%% (tối đa %,.0fđ)", v.getDiscountValue(), v.getMaxDiscountAmount() != null ? v.getMaxDiscountAmount() : 0.0)
                        : String.format("Giảm trực tiếp %,.0fđ", v.getDiscountValue());
                String minOrderStr = (v.getMinOrderAmount() != null && v.getMinOrderAmount() > 0)
                        ? String.format(" cho đơn từ %,.0fđ", v.getMinOrderAmount()) : "";
                sb.append(String.format("- Mã [%s]: %s - %s%s. %s\n",
                        v.getCode(), v.getTitle(), discountStr, minOrderStr, v.getDescription() != null ? v.getDescription() : ""));
            }
            sb.append("QUY TẮC BẮT BUỘC VỀ VOUCHER:\n");
            sb.append("1. Báo đúng tên mã viết hoa và điều kiện như danh mục trên, không tự chế mã.\n");
            return sb.toString();
        } catch (Exception e) {
            log.warn("[ChatService] Lỗi khi tạo dynamic voucher prompt: {}", e.getMessage());
            return "";
        }
    }

    private boolean isHighConfidenceDishMatch(String query, String dishName, String slug) {
        if (dishName == null) return false;
        String name = dishName.toLowerCase(Locale.ROOT);
        if (query.contains(name)) return true;

        String clean = name.replace("phở bò ", "")
                           .replace("phở gà ", "")
                           .replace("phở ", "")
                           .replace("hà nội", "")
                           .replace("1986", "")
                           .trim();
        if (!clean.isEmpty() && query.contains(clean)) return true;

        if (query.contains("gà đồi") && name.contains("gà đồi")) return true;
        if (query.contains("phở gà") && name.contains("phở gà")) return true;
        if (query.contains("đuôi bò") && name.contains("đuôi bò")) return true;
        if (query.contains("thố đá") && name.contains("thố đá")) return true;
        if (query.contains("sốt vang") && name.contains("sốt vang")) return true;
        if (query.contains("tái lăn") && name.contains("tái lăn")) return true;
        if (query.contains("sườn bò") && name.contains("sườn bò")) return true;
        if (query.contains("bắp hoa") && name.contains("bắp hoa")) return true;
        if (query.contains("tủy bò") && name.contains("tủy bò")) return true;
        if ((query.contains("nạm") || query.contains("gầu")) && (name.contains("nạm") || name.contains("gầu"))) return true;
        if (query.contains("nước sấu") && name.contains("sấu")) return true;
        if (query.contains("nước mơ") && name.contains("mơ")) return true;
        if (query.contains("quẩy giòn") && name.contains("quẩy")) return true;
        if (query.contains("trà sen") && name.contains("trà sen")) return true;
        if (query.contains("trứng chần") && name.contains("trứng")) return true;

        if (slug != null && !slug.isBlank()) {
            String normSlug = slug.replace("-", " ");
            if (query.contains(normSlug)) return true;
        }
        return false;
    }

    private boolean isPartialDishMatch(String query, String dishName) {
        if (dishName == null) return false;
        String name = dishName.toLowerCase(Locale.ROOT);
        if (query.contains("quẩy") && name.contains("quẩy")) return true;
        if (query.contains("sấu") && name.contains("sấu")) return true;
        if (query.contains("mơ") && name.contains("mơ")) return true;
        if ((query.contains("cà phê") || query.contains("cafe")) && (name.contains("cà phê") || name.contains("cafe"))) return true;
        return false;
    }

    private boolean matches(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }

    private record ChatActionDetected(String actionType, Map<String, Object> payload) {}
}

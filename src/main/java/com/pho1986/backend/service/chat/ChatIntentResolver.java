package com.pho1986.backend.service.chat;

import com.pho1986.backend.dto.ChatRequestDto.ChatMessageHistoryDto;
import com.pho1986.backend.dto.ChatResponseDto;
import com.pho1986.backend.model.entity.Dish;
import com.pho1986.backend.model.entity.Voucher;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class ChatIntentResolver {

    private static final String DEFAULT_DISH_IMAGE =
            "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80";

    private static final List<String> CONTEXTUAL_FALLBACKS = List.of(
            "Dạ em đã ghi nhận lời nhắn của Quý khách. Quý khách muốn em tư vấn bát phở hợp khẩu vị, xem bảng giá 26 món, hay mở sơ đồ đặt bàn giữ chỗ luôn ạ?",
            "Dạ Tiểu Nhị sẵn sàng phục vụ Quý khách ạ! Quý khách đang muốn tìm phở bò tái lăn, phở gà đồi thanh ngọt hay nhận mã ưu đãi cho đơn hôm nay?",
            "Dạ quán Phở 1986 mở cửa từ 06:00 đến 23:00 mỗi ngày, có cả ăn tại chỗ lẫn giao tận nơi giữ nhiệt. Quý khách cần em gợi ý món ngon hay đặt bàn trước không ạ?",
            "Dạ nếu Quý khách chưa chọn được món ưng ý, mình có thể bấm xem toàn bộ thực đơn bên dưới hoặc cho em biết gu ăn (béo giòn, thanh đạm hay đậm đà) để em chọn giúp ạ!"
    );

    public record ChatActionDetected(String actionType, Map<String, Object> payload) {}

    public ChatActionDetected detectAction(String userMessage, List<Dish> dishes, List<Voucher> vouchers) {
        String q = normalize(userMessage);
        if (q.isEmpty()) return new ChatActionDetected("NONE", null);

        if (isBookingQuery(q)) return new ChatActionDetected("BOOKING", Map.of("title", "Đặt Bàn"));
        if (isVoucherQuery(q)) return new ChatActionDetected("VOUCHER", buildVoucherPayload(vouchers));
        if (isExplicitMenuPhrase(q)) return menuAction();

        List<Dish> safeDishes = dishes != null ? dishes : Collections.emptyList();
        Dish matchedDish = findSpecificDish(q, safeDishes);
        if (matchedDish != null) return createDishAction(matchedDish);

        if (isMenuCombinationQuery(q)) return menuAction();
        if (isDrinkQuery(q)) return firstMatchingOrMenu(filterDrinks(safeDishes));
        if (isSideQuery(q)) return firstMatchingOrMenu(filterSides(safeDishes));
        if (isTasteQuery(q)) {
            Dish tasteDish = findTasteMatchedDish(q, safeDishes);
            if (tasteDish != null) return createDishAction(tasteDish);
        }
        if (containsAny(q, "món ngon", "gợi ý", "đặc biệt", "bán chạy", "signature", "nên ăn gì")
                && !safeDishes.isEmpty()) {
            return createDishAction(safeDishes.get(0));
        }
        return new ChatActionDetected("NONE", null);
    }

    public ChatActionDetected enrichActionFromReply(
            String userMessage, String llmReply, ChatActionDetected initialAction, List<Dish> dishes) {
        if (initialAction != null && !"NONE".equals(initialAction.actionType())) {
            return initialAction;
        }
        if (llmReply != null && !llmReply.isBlank()) {
            String replyLower = llmReply.toLowerCase(Locale.ROOT);
            if (dishes != null) {
                for (Dish d : dishes) {
                    if (d.getName() != null && replyLower.contains(d.getName().toLowerCase(Locale.ROOT))) {
                        return createDishAction(d);
                    }
                }
            }
            if (containsAny(replyLower, "thực đơn", "danh sách món", "xem menu", "toàn bộ món")) {
                return menuAction();
            }
        }
        return initialAction != null ? initialAction : new ChatActionDetected("NONE", null);
    }

    public ChatResponseDto resolveSmartKnowledge(
            String query, List<ChatMessageHistoryDto> history, ChatActionDetected action,
            List<Dish> dishes, List<Voucher> vouchers) {
        String q = normalize(query);
        List<Dish> safeDishes = dishes != null ? dishes : Collections.emptyList();
        List<Voucher> safeVouchers = vouchers != null ? vouchers : Collections.emptyList();

        if (isBookingQuery(q)) {
            Map<String, Object> payload = Map.of(
                    "title", "Đặt Bàn Trực Quan 1986",
                    "description", "Chọn vị trí bàn gỗ mộc hiên nhà hoặc trong gian ấm.");
            return ChatResponseDto.of(
                    "Dạ quán luôn dành sẵn những góc bàn gỗ mộc ấm cúng bên hiên ngói rêu phong. Quý khách bấm vào nút Đặt Bàn dưới đây để chọn chỗ ưng ý chỉ trong 30 giây ạ!",
                    "BOOKING", payload, true);
        }
        if (isVoucherQuery(q)) return buildVoucherResponse(safeVouchers);
        if (isDrinkQuery(q)) return buildGroupResponse("thức uống giải khát chuẩn vị Hà Nội", filterDrinks(safeDishes));
        if (isSideQuery(q)) return buildGroupResponse("món ăn kèm tròn vị phở xưa", filterSides(safeDishes));

        if (isExplicitMenuPhrase(q) || "MENU".equals(action.actionType())
                || (isMenuCombinationQuery(q) && !"DISH".equals(action.actionType()))) {
            return buildMenuOverviewResponse(safeDishes);
        }
        if (isTasteQuery(q)) {
            Dish tasteDish = findTasteMatchedDish(q, safeDishes);
            if (tasteDish != null) return buildDishDetailResponse(tasteDish, "rất hợp với khẩu vị Quý khách đang tìm");
        }
        if ("DISH".equals(action.actionType()) && action.payload() != null) {
            Dish matched = findDishById(safeDishes, String.valueOf(action.payload().get("id")));
            if (matched != null) return buildDishDetailResponse(matched, "là tinh hoa chuẩn niêm yết của quán em");
            String name = String.valueOf(action.payload().get("name"));
            Number price = (Number) action.payload().get("price");
            String priceStr = price != null ? String.format("%,.0fđ", price.doubleValue()) : "";
            return ChatResponseDto.of(
                    String.format("Dạ món %s có giá %s chuẩn niêm yết. Quý khách bấm nút dưới đây để thêm ngay vào giỏ ạ!", name, priceStr),
                    "DISH", action.payload(), true);
        }
        if (containsAny(q, "giá", "bao nhiêu tiền", "đắt không", "rẻ", "tầm giá", "chi phí")) {
            return buildPriceOverviewResponse(safeDishes);
        }
        if (containsAny(q, "mì chính", "bột ngọt", "nước dùng", "sá sùng", "ninh", "nguyên liệu", "an toàn", "câu chuyện")) {
            return ChatResponseDto.of(
                    "Dạ Quý khách an tâm tuyệt đối ạ! Nồi đồng quán ninh than củi ròng rã 24 giờ từ tủy xương ống bò tơ và sá sùng Quan Lạn cùng 5 vị thảo mộc, vị ngọt umami thuần khiết 100% không dùng một hạt mì chính nhân tạo nào.",
                    "NONE", null, true);
        }
        if (containsAny(q, "giờ", "mở cửa", "đóng cửa", "mấy giờ", "địa chỉ", "ở đâu", "chi nhánh", "giao hàng", "ship", "hotline")) {
            return ChatResponseDto.of(
                    "Dạ quán mở cửa từ 06:00 sáng đến 23:00 đêm mỗi ngày tại Phố Cổ Hà Nội, có giao hàng giữ nhiệt 45 phút qua thố sứ. Quý khách cần hỗ trợ gấp có thể gọi hotline 0986.198.686 ạ!",
                    "NONE", null, true);
        }
        if (containsAny(q, "bạn là ai", "em là ai", "tên gì", "tiểu nhị")) {
            return ChatResponseDto.of(
                    "Dạ em là Tiểu Nhị quán Phở Gia Truyền 1986. Em túc trực ở đây để giới thiệu thực đơn ninh 24h, tư vấn món hợp vị và hỗ trợ Quý khách đặt bàn, nhận mã ưu đãi ạ!",
                    "NONE", null, true);
        }
        if (containsAny(q, "cảm ơn", "thank", "ngon quá", "tuyệt", "ok", "oke")) {
            return ChatResponseDto.of(
                    "Dạ Tiểu Nhị xin đa tạ Quý khách! Chúc Quý khách có những phút giây thưởng phở thật ấm lòng. Cần xem món hay đặt bàn cứ nhắn em ngay nhé ạ!",
                    "NONE", null, true);
        }
        if (containsAny(q, "chào", "hi", "hello", "alo", "quán ơi")) {
            return ChatResponseDto.of(
                    "Dạ em kính chào Quý khách ạ! Hôm nay Quý khách muốn thưởng thức bát phở tái lăn áp chảo, nạm gầu giòn hay xem qua thực đơn đặc sắc của quán ạ?",
                    menuAction().actionType(), menuAction().payload(), true);
        }

        int idx = Math.abs((history != null ? history.size() : 0) + q.hashCode()) % CONTEXTUAL_FALLBACKS.size();
        return ChatResponseDto.of(CONTEXTUAL_FALLBACKS.get(idx), "MENU", menuAction().payload(), true);
    }

    private ChatResponseDto buildMenuOverviewResponse(List<Dish> dishes) {
        if (dishes.isEmpty()) {
            return ChatResponseDto.of(
                    "Dạ quán phục vụ đầy đủ Phở Bò Gia Truyền (Tái Lăn Áp Chảo, Nạm Gầu Giòn, Đuôi Bò Thố Đá), Phở Gà Đồi, cùng Quẩy Giòn, Trà Sen Tây Hồ và Nước Sấu/Nước Mơ. Quý khách bấm nút bên dưới để xem chi tiết từng món ạ!",
                    "MENU", menuAction().payload(), true);
        }
        Map<String, List<Dish>> grouped = new LinkedHashMap<>();
        for (Dish d : dishes) {
            String cat = (d.getCategory() != null && d.getCategory().getName() != null)
                    ? d.getCategory().getName() : "Món Đặc Sản";
            grouped.computeIfAbsent(cat, k -> new ArrayList<>()).add(d);
        }
        List<String> highlights = new ArrayList<>();
        for (List<Dish> catDishes : grouped.values()) {
            if (!catDishes.isEmpty() && highlights.size() < 4) {
                Dish sample = catDishes.get(0);
                highlights.add(String.format("%s (%s)", sample.getName(), formatPrice(sample.getPrice())));
            }
        }
        String categoryNames = String.join(", ", grouped.keySet());
        String reply = String.format(
                "Dạ quán hiện có %d món chia theo %s. Nổi bật nhất có %s. Quý khách bấm nút bên dưới để xem trọn bộ thực đơn và giá từng bát ạ!",
                dishes.size(), categoryNames, String.join(", ", highlights));
        return ChatResponseDto.of(reply, "MENU", menuAction().payload(), true);
    }

    private ChatResponseDto buildGroupResponse(String groupLabel, List<Dish> matched) {
        if (matched.isEmpty()) {
            return ChatResponseDto.of(
                    "Dạ quán có đầy đủ các món ăn kèm và thức uống truyền thống Hà Nội. Quý khách mở thực đơn bên dưới để chọn món ưng ý nhé ạ!",
                    "MENU", menuAction().payload(), true);
        }
        List<String> items = new ArrayList<>();
        for (int i = 0; i < Math.min(4, matched.size()); i++) {
            Dish d = matched.get(i);
            items.add(String.format("%s (%s)", d.getName(), formatPrice(d.getPrice())));
        }
        Dish top = matched.get(0);
        String reply = String.format(
                "Dạ quán hiện có các %s gồm: %s. Em gửi sẵn thẻ món %s để Quý khách thêm nhanh vào giỏ ạ!",
                groupLabel, String.join(", ", items), top.getName());
        return ChatResponseDto.of(reply, "DISH", createDishAction(top).payload(), true);
    }

    private ChatResponseDto buildDishDetailResponse(Dish dish, String reason) {
        String desc = (dish.getDescription() != null && !dish.getDescription().isBlank())
                ? " " + dish.getDescription().trim() : "";
        String reply = String.format(
                "Dạ món %s (%s) %s.%s Quý khách bấm nút bên dưới để thêm ngay vào giỏ thưởng vị ạ!",
                dish.getName(), formatPrice(dish.getPrice()), reason, desc);
        return ChatResponseDto.of(reply, "DISH", createDishAction(dish).payload(), true);
    }

    private ChatResponseDto buildPriceOverviewResponse(List<Dish> dishes) {
        if (dishes.isEmpty()) {
            return ChatResponseDto.of(
                    "Dạ các bát phở gia truyền tại quán có giá từ 60.000đ đến 115.000đ, món thêm và nước uống từ 10.000đ. Quý khách bấm xem thực đơn chi tiết bên dưới ạ!",
                    "MENU", menuAction().payload(), true);
        }
        double min = dishes.stream().map(Dish::getPrice).filter(Objects::nonNull).min(Double::compareTo).orElse(0.0);
        double max = dishes.stream().map(Dish::getPrice).filter(Objects::nonNull).max(Double::compareTo).orElse(0.0);
        String reply = String.format(
                "Dạ thực đơn %d món tại quán có mức giá từ %s đến %s tùy món thêm hay bát phở đặc biệt. Quý khách xem bảng giá chi tiết từng món ở nút bên dưới nhé ạ!",
                dishes.size(), formatPrice(min), formatPrice(max));
        return ChatResponseDto.of(reply, "MENU", menuAction().payload(), true);
    }

    private ChatResponseDto buildVoucherResponse(List<Voucher> vouchers) {
        Map<String, Object> payload = buildVoucherPayload(vouchers);
        if (vouchers != null && !vouchers.isEmpty()) {
            Voucher v = vouchers.get(0);
            String minOrder = (v.getMinOrderAmount() != null && v.getMinOrderAmount() > 0)
                    ? String.format(" cho đơn từ %,.0fđ", v.getMinOrderAmount()) : "";
            return ChatResponseDto.of(
                    String.format("Dạ quán kính gửi Quý khách Tem Phiếu Tri Kỷ [%s] %s%s. Quý khách sao chép mã dùng ngay khi thanh toán ạ!",
                            v.getCode(), payload.get("discount"), minOrder),
                    "VOUCHER", payload, true);
        }
        return ChatResponseDto.of(
                "Dạ quán kính gửi Quý khách Tem Phiếu Tri Kỷ [PHO1986VIP] giảm 20% cho bữa thưởng vị hôm nay ạ!",
                "VOUCHER", payload, true);
    }

    private Map<String, Object> buildVoucherPayload(List<Voucher> vouchers) {
        if (vouchers != null && !vouchers.isEmpty()) {
            Voucher v = vouchers.get(0);
            String disc = "PERCENT".equalsIgnoreCase(v.getDiscountType())
                    ? String.format("GIẢM %.0f%%", v.getDiscountValue())
                    : String.format("GIẢM %,.0fđ", v.getDiscountValue());
            String minOrder = (v.getMinOrderAmount() != null && v.getMinOrderAmount() > 0)
                    ? String.format(" cho đơn từ %,.0fđ", v.getMinOrderAmount()) : "";
            return Map.of("code", v.getCode(), "discount", disc,
                    "desc", (v.getTitle() != null ? v.getTitle() : "Ưu đãi tri kỷ") + minOrder);
        }
        return Map.of("code", "PHO1986VIP", "discount", "GIẢM 20%", "desc", "Áp dụng đơn từ 150k khi đặt phở.");
    }

    private Dish findSpecificDish(String q, List<Dish> dishes) {
        for (Dish d : dishes) if (isHighConfidenceDishMatch(q, d.getName(), d.getSlug())) return d;
        for (Dish d : dishes) if (isPartialDishMatch(q, d.getName())) return d;
        return null;
    }

    private static final List<String[]> DISH_KEYWORD_PAIRS = List.of(
            new String[]{"gà đồi", "gà đồi"}, new String[]{"phở gà", "phở gà"},
            new String[]{"đuôi bò", "đuôi bò"}, new String[]{"thố đá", "thố đá"},
            new String[]{"sốt vang", "sốt vang"}, new String[]{"tái lăn", "tái lăn"},
            new String[]{"sườn bò", "sườn bò"}, new String[]{"bắp hoa", "bắp hoa"},
            new String[]{"tủy bò", "tủy bò"}, new String[]{"nạm", "nạm"},
            new String[]{"gầu", "gầu"}, new String[]{"nạm", "gầu"}, new String[]{"gầu", "nạm"},
            new String[]{"nước sấu", "sấu"}, new String[]{"nước mơ", "mơ"},
            new String[]{"quẩy giòn", "quẩy"}, new String[]{"trà sen", "trà sen"},
            new String[]{"trứng chần", "trứng"}
    );
    private static final List<String[]> PARTIAL_DISH_PAIRS = List.of(
            new String[]{"quẩy", "quẩy"}, new String[]{"sấu", "sấu"},
            new String[]{"mơ", "mơ"}, new String[]{"cà phê", "cà phê"},
            new String[]{"cafe", "cafe"}, new String[]{"cà phê", "cafe"},
            new String[]{"cafe", "cà phê"}
    );
    private static final List<String> DRINK_CAT_KEYS = List.of("uống", "trà", "giải khát", "drink");
    private static final List<String> DRINK_NAME_KEYS = List.of("trà", "nước sấu", "nước mơ", "cà phê", "cafe");
    private static final List<String> SIDE_CAT_KEYS = List.of("thêm", "kèm", "phụ", "side");
    private static final List<String> SIDE_NAME_KEYS = List.of("quẩy", "trứng", "tiết", "bánh phở");

    private Dish findTasteMatchedDish(String q, List<Dish> dishes) {
        if (dishes.isEmpty()) return null;
        Dish best = null;
        int bestScore = 0;
        for (Dish d : dishes) {
            String name = normalize(d.getName());
            String hay = name + " " + normalize(d.getDescription()) + " " + normalize(d.getIngredients());
            int score = 0;
            if (containsAny(q, "giòn", "gầu", "sần sật") && containsAny(hay, "giòn", "gầu", "đuôi")) {
                score += containsAny(name, "giòn", "gầu", "đuôi") ? 3 : 2;
            }
            if (containsAny(q, "béo", "ngậy") && containsAny(hay, "tái lăn", "gầu", "tủy", "béo")) {
                score += 1;
            }
            if (containsAny(q, "thanh đạm", "ít mỡ", "không mỡ", "nhẹ bụng", "trẻ em", "người lớn tuổi")
                    && containsAny(hay, "gà", "thanh", "chín", "thăn")) {
                score += 2;
            }
            if (containsAny(q, "đậm đà", "cay") && containsAny(hay, "tái lăn", "sốt vang", "đậm")) {
                score += 2;
            }
            if (score > bestScore) {
                bestScore = score;
                best = d;
            }
        }
        return best != null ? best : dishes.get(0);
    }

    private List<Dish> filterDrinks(List<Dish> dishes) {
        return filterByCategoryOrName(dishes, DRINK_CAT_KEYS, DRINK_NAME_KEYS);
    }

    private List<Dish> filterSides(List<Dish> dishes) {
        return filterByCategoryOrName(dishes, SIDE_CAT_KEYS, SIDE_NAME_KEYS);
    }

    private List<Dish> filterByCategoryOrName(List<Dish> dishes, List<String> catKeys, List<String> nameKeys) {
        return dishes.stream().filter(d -> {
            String cat = d.getCategory() != null ? normalize(d.getCategory().getName()) : "";
            String n = normalize(d.getName());
            return catKeys.stream().anyMatch(cat::contains) || nameKeys.stream().anyMatch(n::contains);
        }).toList();
    }

    private Dish findDishById(List<Dish> dishes, String id) {
        return dishes.stream().filter(d -> Objects.equals(d.getId(), id)).findFirst().orElse(null);
    }

    private ChatActionDetected firstMatchingOrMenu(List<Dish> list) {
        return list.isEmpty() ? menuAction() : createDishAction(list.get(0));
    }

    private ChatActionDetected createDishAction(Dish d) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", d.getId());
        payload.put("name", d.getName());
        payload.put("price", d.getPrice());
        payload.put("image", (d.getImageUrl() != null && !d.getImageUrl().isBlank()) ? d.getImageUrl() : DEFAULT_DISH_IMAGE);
        return new ChatActionDetected("DISH", payload);
    }

    private ChatActionDetected menuAction() {
        return new ChatActionDetected("MENU", Map.of("title", "Thực Đơn Tinh Hoa 1986"));
    }

    private boolean isBookingQuery(String q) {
        return containsAny(q, "đặt bàn", "giữ chỗ", "bàn trống", "đặt chỗ", "chỗ ngồi", "phòng riêng", "hẹn giờ");
    }

    private boolean isVoucherQuery(String q) {
        return containsAny(q, "mã", "voucher", "ưu đãi", "khuyến mãi", "giảm giá", "phiếu", "tem phiếu", "quà tặng");
    }

    private boolean isExplicitMenuPhrase(String q) {
        return containsAny(q, "menu", "thực đơn", "danh sách món", "toàn bộ món", "tất cả các món", "xem món",
                "những món nào", "các món nào", "có món nào", "có món gì", "bán món gì", "bán những gì",
                "bán gì", "có gì ăn", "ăn gì ngon", "có phở gì", "mấy loại phở", "những loại nào", "quán có gì");
    }

    private boolean isMenuCombinationQuery(String q) {
        return containsAny(q, "món", "phở", "đồ ăn", "thực đơn")
                && containsAny(q, "nào", "gì", "những", "danh sách", "kể tên", "giới thiệu");
    }

    private boolean isDrinkQuery(String q) {
        return containsAny(q, "đồ uống", "nước uống", "thức uống", "giải khát", "uống gì", "trà", "nước sấu", "nước mơ", "cà phê", "cafe");
    }

    private boolean isSideQuery(String q) {
        return containsAny(q, "ăn kèm", "món thêm", "gọi thêm", "món phụ", "quẩy", "trứng chần", "tiết");
    }

    private boolean isTasteQuery(String q) {
        return containsAny(q, "béo", "ngậy", "giòn", "mềm", "thanh đạm", "ít mỡ", "không mỡ", "đậm đà", "cay", "trẻ em", "người lớn tuổi", "nhẹ bụng");
    }

    private boolean isHighConfidenceDishMatch(String query, String dishName, String slug) {
        if (dishName == null) return false;
        String name = normalize(dishName);
        if (query.contains(name)) return true;
        String clean = name.replace("phở bò ", "").replace("phở gà ", "").replace("phở ", "")
                .replace("hà nội", "").replace("1986", "").trim();
        if (clean.length() >= 3 && query.contains(clean)) return true;
        if (slug != null && !slug.isBlank() && query.contains(slug.replace("-", " ").toLowerCase(Locale.ROOT))) return true;
        return matchesPair(query, name, DISH_KEYWORD_PAIRS);
    }

    private boolean isPartialDishMatch(String query, String dishName) {
        return dishName != null && matchesPair(query, normalize(dishName), PARTIAL_DISH_PAIRS);
    }

    private boolean matchesPair(String query, String name, List<String[]> pairs) {
        return pairs.stream().anyMatch(pair -> query.contains(pair[0]) && name.contains(pair[1]));
    }

    private boolean containsAny(String text, String... keywords) {
        for (String kw : keywords) if (text.contains(kw)) return true;
        return false;
    }

    private String normalize(String text) {
        return text == null ? "" : text.toLowerCase(Locale.ROOT).trim();
    }

    private String formatPrice(Double price) {
        return price != null ? String.format("%,.0fđ", price) : "niêm yết";
    }
}

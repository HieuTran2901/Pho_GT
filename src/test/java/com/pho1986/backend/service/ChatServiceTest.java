package com.pho1986.backend.service;

import com.pho1986.backend.config.GeminiProperties;
import com.pho1986.backend.dto.ChatRequestDto;
import com.pho1986.backend.dto.ChatRequestDto.ChatMessageHistoryDto;
import com.pho1986.backend.dto.ChatResponseDto;
import com.pho1986.backend.model.entity.Category;
import com.pho1986.backend.model.entity.Dish;
import com.pho1986.backend.model.entity.Voucher;
import com.pho1986.backend.repository.DishRepository;
import com.pho1986.backend.service.chat.ChatIntentResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    private static final String OLD_CANNED_REPLY =
            "Dạ từng thìa nước dùng 1986 đượm hương hoa hồi và sá sùng Quan Lạn luôn sẵn sàng phục vụ Quý khách.";

    @Mock
    private DishRepository dishRepository;

    @Mock
    private VoucherService voucherService;

    private GeminiProperties geminiProperties;
    private ChatService chatService;

    @BeforeEach
    void setUp() {
        // Cô lập unit test khỏi biến môi trường GEMINI_API_KEY của máy host để kiểm thử tất định tầng Local NLU + DB Grounding
        geminiProperties = new GeminiProperties() {
            @Override
            public boolean isConfigured() {
                return false;
            }
        };

        Category phoBo = new Category("Phở Bò Gia Truyền", "pho-bo", 1);
        Category phoGa = new Category("Phở Gà Đồi", "pho-ga", 2);
        Category drinks = new Category("Đồ Uống Truyền Thống", "do-uong", 3);

        Dish taiLan = new Dish(phoBo, "Phở Bò Tái Lăn Áp Chảo", "pho-bo-tai-lan-ap-chao", 75000.0,
                "Thịt bò tơ chao lửa lớn thơm lừng tỏi phi béo ngậy.", "", true, true);
        taiLan.setId("dish-tai-lan");

        Dish namGau = new Dish(phoBo, "Phở Bò Nạm Gầu Giòn", "pho-bo-nam-gau-gion", 80000.0,
                "Gầu bò giòn sần sật hòa quyện nước dùng ninh 24h.", "", true, false);
        namGau.setId("dish-nam-gau");

        Dish gaDoi = new Dish(phoGa, "Phở Gà Đồi Thanh Ngọt", "pho-ga-doi-thanh-ngot", 70000.0,
                "Thịt gà ta săn chắc, nước dùng thanh đạm ít mỡ.", "", true, false);
        gaDoi.setId("dish-ga-doi");

        Dish traSen = new Dish(drinks, "Trà Sen Tây Hồ", "tra-sen-tay-ho", 25000.0,
                "Trà ướp bông sen Bách Diệp thơm dịu.", "", true, false);
        traSen.setId("dish-tra-sen");

        lenient().when(dishRepository.findByIsAvailableTrueOrderByIsSignatureDescPriceAsc())
                .thenReturn(List.of(taiLan, namGau, gaDoi, traSen));

        Voucher vipVoucher = new Voucher("PHO1986VIP", "Ưu Đãi Tri Kỷ", "Giảm 20% toàn đơn",
                "PERCENT", 20.0, 50000.0, 150000.0, null, null, null, true, true);
        lenient().when(voucherService.getActivePublicVouchers()).thenReturn(List.of(vipVoucher));

        chatService = new ChatService(geminiProperties, dishRepository, voucherService, new ChatIntentResolver());
    }

    @Test
    @DisplayName("Hỏi 'bạn có những món nào' phải liệt kê món thực tế từ DB và gắn action MENU")
    void testMenuListingQueryUsesLiveDishesAndMenuAction() {
        ChatResponseDto res = chatService.processChat(new ChatRequestDto("bạn có những món nào", null, List.of()));

        assertNotNull(res);
        assertFalse(res.getReply().contains(OLD_CANNED_REPLY));
        assertEquals("MENU", res.getActionType());
        assertNotNull(res.getActionPayload());
        assertTrue(res.getReply().contains("4 món"));
        assertTrue(res.getReply().contains("Phở Bò Tái Lăn Áp Chảo"));
        assertTrue(res.getReply().contains("Phở Gà Đồi Thanh Ngọt"));
    }

    @Test
    @DisplayName("Hỏi giá món cụ thể phải nhận diện đúng món và gắn thẻ DISH")
    void testSpecificDishPriceQuery() {
        ChatResponseDto res = chatService.processChat(new ChatRequestDto("phở tái lăn giá sao", null, List.of()));

        assertEquals("DISH", res.getActionType());
        assertNotNull(res.getActionPayload());
        assertEquals("Phở Bò Tái Lăn Áp Chảo", res.getActionPayload().get("name"));
        assertTrue(res.getReply().contains("75"));
    }

    @Test
    @DisplayName("Hỏi đồ uống phải lọc đúng danh mục đồ uống từ DB")
    void testDrinkQueryReturnsBeverages() {
        ChatResponseDto res = chatService.processChat(new ChatRequestDto("quán có đồ uống gì", null, List.of()));

        assertEquals("DISH", res.getActionType());
        assertTrue(res.getReply().contains("Trà Sen Tây Hồ"));
        assertTrue(res.getReply().contains("25"));
    }

    @Test
    @DisplayName("Hỏi khẩu vị giòn béo phải gợi ý đúng món phù hợp từ DB")
    void testTastePreferenceQuery() {
        ChatResponseDto res = chatService.processChat(new ChatRequestDto("mình thích ăn giòn béo", null, List.of()));

        assertEquals("DISH", res.getActionType());
        assertNotNull(res.getActionPayload());
        assertEquals("Phở Bò Nạm Gầu Giòn", res.getActionPayload().get("name"));
        assertTrue(res.getReply().contains("Phở Bò Nạm Gầu Giòn"));
    }

    @Test
    @DisplayName("Hỏi đặt bàn phải trả về action BOOKING")
    void testBookingQuery() {
        ChatResponseDto res = chatService.processChat(new ChatRequestDto("tôi muốn đặt bàn cho 4 người", null, List.of()));

        assertEquals("BOOKING", res.getActionType());
        assertNotNull(res.getActionPayload());
    }

    @Test
    @DisplayName("Hỏi mã ưu đãi phải lấy voucher thật từ VoucherService")
    void testVoucherQueryUsesDbVoucher() {
        ChatResponseDto res = chatService.processChat(new ChatRequestDto("quán có mã ưu đãi không", null, List.of()));

        assertEquals("VOUCHER", res.getActionType());
        assertNotNull(res.getActionPayload());
        assertEquals("PHO1986VIP", res.getActionPayload().get("code"));
        assertTrue(res.getReply().contains("PHO1986VIP"));
    }

    @Test
    @DisplayName("GeminiProperties chuẩn hóa model cũ 'gemini-3.6-flash' sang 'gemini-3.8-flash'")
    void testGeminiPropertiesModelNormalizationAndCandidates() {
        GeminiProperties props = new GeminiProperties();
        assertEquals("gemini-3.8-flash", props.getModel());

        props.setModel("gemini-3.6-flash");
        assertEquals("gemini-3.8-flash", props.getModel());

        props.setModel("   ");
        assertEquals("gemini-3.8-flash", props.getModel());

        List<String> candidates = props.getCandidateModels();
        assertEquals("gemini-3.8-flash", candidates.get(0));
        assertTrue(candidates.contains("gemini-3.5-flash-lite"));
        assertTrue(candidates.contains("gemini-flash-latest"));
    }

    @Test
    @DisplayName("Fallback ngoài kịch bản không lặp lại 1 câu mẫu cố định và vẫn gợi ý MENU")
    void testContextualFallbackRotatesAndIncludesMenuAction() {
        when(dishRepository.findByIsAvailableTrueOrderByIsSignatureDescPriceAsc()).thenReturn(List.of());

        ChatResponseDto turn1 = chatService.processChat(new ChatRequestDto("hôm nay trời đẹp quá", null, List.of()));
        ChatResponseDto turn2 = chatService.processChat(new ChatRequestDto("hôm nay trời đẹp quá", null,
                List.of(new ChatMessageHistoryDto("user", "a"))));

        assertEquals("MENU", turn1.getActionType());
        assertEquals("MENU", turn2.getActionType());
        assertNotNull(turn1.getActionPayload());
        assertNotEquals(turn1.getReply(), turn2.getReply());
    }
}

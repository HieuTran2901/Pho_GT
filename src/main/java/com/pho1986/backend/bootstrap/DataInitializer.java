package com.pho1986.backend.bootstrap;

import com.pho1986.backend.model.entity.Category;
import com.pho1986.backend.model.entity.Dish;
import com.pho1986.backend.model.entity.LoyaltyReward;
import com.pho1986.backend.repository.CategoryRepository;
import com.pho1986.backend.repository.DishRepository;
import com.pho1986.backend.repository.LoyaltyRewardRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final DishRepository dishRepository;
    private final LoyaltyRewardRepository loyaltyRewardRepository;

    public DataInitializer(
            CategoryRepository categoryRepository,
            DishRepository dishRepository,
            LoyaltyRewardRepository loyaltyRewardRepository) {
        this.categoryRepository = categoryRepository;
        this.dishRepository = dishRepository;
        this.loyaltyRewardRepository = loyaltyRewardRepository;
    }

    @Override
    public void run(String... args) {
        if (categoryRepository.count() > 0) {
            return;
        }

        System.out.println("🍜 [Spring Boot] Gieo dữ liệu hạt giống (Seed Data) cho Phở Gia Truyền 1986...");

        // 1. Danh mục món
        Category catPhoBo = categoryRepository.save(new Category("Phở Bò Truyền Thống", "pho-bo-truyen-thong", 1));
        Category catPhoGa = categoryRepository.save(new Category("Phở Gà Ta Chọn Lọc", "pho-ga-ta", 2));
        Category catKem = categoryRepository.save(new Category("Món Ăn Kèm Chuẩn Vị", "mon-an-kem", 3));
        Category catDoUong = categoryRepository.save(new Category("Giải Khát & Trà Hà Nội", "do-uong", 4));

        // 2. Món phở & món kèm
        List<Dish> dishes = List.of(
                new Dish(catPhoBo, "Phở Bò Tái Nạm Gầu Giòn 1986", "pho-tai-nam-gau-1986", 85000.0,
                        "Thịt bò tươi thái mỏng chần tái mềm ngọt, nạm mềm béo cùng gầu giòn sần sật, nước dùng ninh xương ống bò 18 tiếng gia truyền.",
                        "/images/pho-tai-nam.jpg", true, true),
                new Dish(catPhoBo, "Phở Bò Tái Lăn Chảo Gang", "pho-tai-lan-chao-gang", 90000.0,
                        "Bò bắp đảo nhanh trên chảo gang lửa lớn cùng tỏi đập dập thơm lừng, đậm đà ngậy vị khói.",
                        "/images/pho-tai-lan.jpg", true, true),
                new Dish(catPhoBo, "Phở Bò Bắp Hoa Đặc Biệt", "pho-bap-hoa-dac-biet", 95000.0,
                        "Từng lát bắp hoa giòn sần sật xen kẽ vân mỡ mỏng thơm phức, nước dùng thanh ngọt đậm hương quế hồi.",
                        "/images/pho-bap-hoa.jpg", true, false),
                new Dish(catPhoGa, "Phở Gà Đùi Chặt Lá Chanh", "pho-ga-dui-la-chanh", 80000.0,
                        "Gà đồi thả vườn da vàng óng giòn rụm, thịt chắc ngọt thơm thoang thoảng mùi lá chanh tươi cắt chỉ.",
                        "/images/pho-ga-dui.jpg", true, false),
                new Dish(catKem, "Quẩy Giòn Gia Truyền (Đĩa 3 chiếc)", "quay-gion-gia-truyen", 15000.0,
                        "Quẩy tự làm bột ủ lên men tự nhiên, chiên giòn tan chấm ngập nước phở béo ngọt.",
                        "/images/quay-gion.jpg", true, false),
                new Dish(catKem, "Trứng Gà Ta Chần Nước Béo", "trung-chan-nuoc-beo", 15000.0,
                        "Trứng gà ta lòng đào béo ngậy chần trong nước dùng sôi sùng sục, rắc thêm tiêu sọ thơm nồng.",
                        "/images/trung-chan.jpg", true, false),
                new Dish(catDoUong, "Trà Sen Tây Hồ Truyền Thống", "tra-sen-tay-ho", 25000.0,
                        "Trà ướp hoa sen Bách Diệp chuẩn vị Hà thành, thanh mát giải ngấy sau bữa phở thịnh soạn.",
                        "/images/tra-sen.jpg", true, false)
        );
        dishRepository.saveAll(dishes);

        // 3. Quà tặng Loyalty
        List<LoyaltyReward> rewards = List.of(
                new LoyaltyReward("01 Đĩa Quẩy Giòn Gia Truyền (3 chiếc)", "Đổi 80 điểm để nhận miễn phí đĩa quẩy nóng hổi.", 80, "FREE_ITEM", 15000.0, true),
                new LoyaltyReward("01 Trứng Gà Ta Chần Nước Béo", "Đổi 100 điểm để thưởng thức lòng đào béo ngậy kèm bát phở.", 100, "FREE_ITEM", 15000.0, true),
                new LoyaltyReward("Voucher Giảm 30.000đ Đơn Hàng", "Đổi 200 điểm nhận phiếu giảm 30k vào hóa đơn thanh toán.", 200, "DISCOUNT_CASH", 30000.0, true),
                new LoyaltyReward("Tặng 01 Bát Phở Bò Tái Nạm Đặc Biệt", "Phần thưởng cao cấp nhất dành cho Hội viên Tri Kỷ tích lũy đủ 500 điểm.", 500, "FREE_ITEM", 85000.0, true)
        );
        loyaltyRewardRepository.saveAll(rewards);

        System.out.println("✅ [Spring Boot] Gieo dữ liệu thành công vào MySQL!");
    }
}

package com.pho1986.backend.bootstrap;

import com.pho1986.backend.model.entity.*;
import com.pho1986.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final DishRepository dishRepository;
    private final LoyaltyRewardRepository loyaltyRewardRepository;
    private final UserRepository userRepository;
    private final TasteProfileRepository tasteProfileRepository;
    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final PaymentGatewayConfigRepository paymentGatewayConfigRepository;
    private final DiningTableRepository diningTableRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    @Autowired(required = false)
    private DataSource dataSource;

    @Value("${app.security.admin-seed.enabled:#{null}}")
    private Boolean adminSeedEnabled;

    @Value("${app.security.admin-seed.phone:${ADMIN_INIT_PHONE:}}")
    private String adminInitPhone;

    @Value("${app.security.admin-seed.password:${ADMIN_INIT_PASSWORD:}}")
    private String adminInitPassword;

    @Value("${app.security.admin-seed.full-name:${ADMIN_INIT_NAME:Quản Trị Viên 1986}}")
    private String adminInitFullName;

    @Value("${app.security.admin-seed.email:${ADMIN_INIT_EMAIL:admin@pho1986.vn}}")
    private String adminInitEmail;

    public DataInitializer(
            CategoryRepository categoryRepository,
            DishRepository dishRepository,
            LoyaltyRewardRepository loyaltyRewardRepository,
            UserRepository userRepository,
            TasteProfileRepository tasteProfileRepository,
            LoyaltyAccountRepository loyaltyAccountRepository,
            LoyaltyTransactionRepository loyaltyTransactionRepository,
            PaymentGatewayConfigRepository paymentGatewayConfigRepository,
            DiningTableRepository diningTableRepository,
            PasswordEncoder passwordEncoder,
            Environment environment) {
        this.categoryRepository = categoryRepository;
        this.dishRepository = dishRepository;
        this.loyaltyRewardRepository = loyaltyRewardRepository;
        this.userRepository = userRepository;
        this.tasteProfileRepository = tasteProfileRepository;
        this.loyaltyAccountRepository = loyaltyAccountRepository;
        this.loyaltyTransactionRepository = loyaltyTransactionRepository;
        this.paymentGatewayConfigRepository = paymentGatewayConfigRepository;
        this.diningTableRepository = diningTableRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    public void run(String... args) {
        // Gieo tài khoản Quản trị viên ADMIN theo chuẩn an ninh SENTINEL
        seedAdminUser();

        // Gieo tài khoản thực khách thân thiết mẫu (Chỉ gieo trên môi trường dev/non-prod)
        seedDemoMember();

        // Gieo cấu hình các Cổng Thanh Toán (M5.4 - Payment Maintenance Control Hub)
        seedPaymentGateways();

        // Gieo 22 bàn ăn di sản 2 tầng (DRAGON - DB_AGENT)
        seedDiningTables();

        long catCount = categoryRepository.count();

        // 1. Đồng bộ 25 món ăn & 100% ảnh Unsplash độc bản (DRAGON - DB_AGENT)
        syncMockDishes(catCount);

        if (catCount > 0) {
            return;
        }

        // 2. Quà tặng Loyalty
        if (loyaltyRewardRepository.count() == 0) {
            List<LoyaltyReward> rewards = List.of(
                    new LoyaltyReward("01 Đĩa Quẩy Giòn Gia Truyền (3 chiếc)", "Đổi 80 điểm để nhận miễn phí đĩa quẩy nóng hổi.", 80, "FREE_ITEM", 15000.0, true),
                    new LoyaltyReward("01 Trứng Gà Ta Chần Nước Béo", "Đổi 100 điểm để thưởng thức lòng đào béo ngậy kèm bát phở.", 100, "FREE_ITEM", 15000.0, true),
                    new LoyaltyReward("Voucher Giảm 30.000đ Đơn Hàng", "Đổi 200 điểm nhận phiếu giảm 30k vào hóa đơn thanh toán.", 200, "DISCOUNT_CASH", 30000.0, true),
                    new LoyaltyReward("Tặng 01 Bát Phở Bò Tái Nạm Đặc Biệt", "Phần thưởng cao cấp nhất dành cho Hội viên Tri Kỷ tích lũy đủ 500 điểm.", 500, "FREE_ITEM", 85000.0, true)
            );
            loyaltyRewardRepository.saveAll(rewards);
        }

        System.out.println("✅ [Spring Boot] Đồng bộ dữ liệu hạt giống thành công!");
    }

    private void syncMockDishes(long catCount) {
        if (dataSource == null) {
            return;
        }
        try {
            boolean shouldPopulate = catCount == 0 || dishRepository.count() < 20;
            if (!shouldPopulate) {
                // Kiểm tra xem có món nào còn sót ảnh placeholder /images/... không
                shouldPopulate = dishRepository.findAll().stream()
                        .anyMatch(d -> d.getImageUrl() != null && d.getImageUrl().startsWith("/images/"));
            }

            if (shouldPopulate) {
                System.out.println("🐉 [DRAGON - DB_AGENT] Bắt đầu đồng bộ 25 món ăn gia truyền & 100% ảnh Unsplash độc bản vào Database...");
                ResourceDatabasePopulator populator = new ResourceDatabasePopulator(
                        new ClassPathResource("seed_mock_dishes.sql")
                );
                populator.setIgnoreFailedDrops(true);
                populator.setContinueOnError(true);
                populator.execute(dataSource);
                System.out.println("🐉 [DRAGON - DB_AGENT] Đồng bộ thành công 25 món ăn gia truyền lên Database!");
            }
        } catch (Exception ex) {
            System.err.println("⚠️ [DRAGON - DB_AGENT] Lỗi đồng bộ SQL: " + ex.getMessage());
        }
    }

    private void seedDemoMember() {
        if (!isProdProfile() && userRepository.findByPhone("0988888888").isEmpty()) {
            User demoUser = new User(
                    "0988888888",
                    "Nguyễn Văn Hiếu",
                    passwordEncoder.encode("123456"),
                    "hieu.nguyen@pho1986.vn"
            );
            userRepository.save(demoUser);

            TasteProfile taste = new TasteProfile();
            taste.setUser(demoUser);
            taste.setBrothType("BEO_NGAY");
            taste.setOnionStyle("HANH_TRAN");
            taste.setHerbStyle("DU_RAU");
            taste.setSpicyLevel(2);
            taste.setCrullerPref("QUAY_GION");
            taste.setCustomNote("Cho nhiều nước béo thơm và hành trần riêng");
            taste = tasteProfileRepository.save(taste);
            demoUser.setTasteProfile(taste);

            LoyaltyAccount loyalty = new LoyaltyAccount();
            loyalty.setUser(demoUser);
            loyalty.setTotalPoints(135);
            loyalty.setAvailablePoints(135);
            loyalty.setMembershipTier("DONG");
            loyalty = loyaltyAccountRepository.save(loyalty);
            demoUser.setLoyaltyAccount(loyalty);

            loyaltyTransactionRepository.save(new LoyaltyTransaction(
                    loyalty, null, 50, "WELCOME_BONUS", 50, "Thưởng 50 điểm Tri Kỷ chào mừng gia nhập"
            ));
            loyaltyTransactionRepository.save(new LoyaltyTransaction(
                    loyalty, null, 85, "EARN_ORDER", 135, "Tích điểm thưởng từ đơn hàng đầu tiên"
            ));

            System.out.println("👤 [Spring Boot] Gieo tài khoản mẫu 0988888888 (Nguyễn Văn Hiếu - Tri Kỷ) thành công!");
        }
    }

    private boolean isProdProfile() {
        if (environment == null || environment.getActiveProfiles() == null) {
            return false;
        }
        return Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> p.equalsIgnoreCase("prod") || p.equalsIgnoreCase("production"));
    }

    private void seedAdminUser() {
        boolean isProd = isProdProfile();

        // Quyết định bật/tắt seed admin:
        // - Trên PROD: Mặc định TẮT (false) trừ khi ADMIN_SEED_ENABLED được cấu hình rõ ràng là true
        // - Trên NON-PROD (dev): Bật mặc định nếu không cấu hình
        boolean shouldSeed = Boolean.TRUE.equals(adminSeedEnabled) || (adminSeedEnabled == null && !isProd);

        if (!shouldSeed) {
            if (isProd) {
                System.out.println("🛡️ [SENTINEL] Profile PROD phát hiện: ĐÃ CHẶN tự động gieo tài khoản Admin mặc định.");
            }
            return;
        }

        String phone = (adminInitPhone != null && !adminInitPhone.isBlank())
                ? adminInitPhone.trim()
                : (isProd ? null : "0999999999");
        String password = (adminInitPassword != null && !adminInitPassword.isBlank())
                ? adminInitPassword.trim()
                : (isProd ? null : "admin123");

        if (phone == null || password == null) {
            System.out.println("🛡️ [SENTINEL] Bỏ qua gieo tài khoản Admin vì chưa thiết lập ADMIN_INIT_PHONE hoặc ADMIN_INIT_PASSWORD.");
            return;
        }

        // SENTINEL SECURITY RULE: Trên PROD, cấm tiệt mật khẩu yếu hoặc trùng mật khẩu mặc định "admin123"
        if (isProd) {
            if ("admin123".equalsIgnoreCase(password)
                    || "123456".equals(password)
                    || "admin".equalsIgnoreCase(password)
                    || password.length() < 8) {
                System.err.println("🚨 [SENTINEL - SECURITY BLOCK] TỪ CHỐI gieo tài khoản Admin trên PROD: Mật khẩu không an toàn (quá ngắn < 8 ký tự hoặc trùng mật khẩu mặc định).");
                return;
            }
        }

        if (userRepository.findByPhone(phone).isEmpty()) {
            User adminUser = new User(
                    phone,
                    (adminInitFullName != null && !adminInitFullName.isBlank()) ? adminInitFullName : "Quản Trị Viên 1986",
                    passwordEncoder.encode(password),
                    (adminInitEmail != null && !adminInitEmail.isBlank()) ? adminInitEmail : "admin@pho1986.vn"
            );
            adminUser.setRole("ADMIN");
            userRepository.save(adminUser);
            // Tuân thủ CWE-532: Tuyệt đối không log password ra console/log
            System.out.println("🛡️ [SENTINEL] Khởi tạo tài khoản quản trị viên ADMIN [" + phone + "] thành công!");
        }
    }

    private void seedPaymentGateways() {
        if (paymentGatewayConfigRepository.count() == 0) {
            List<PaymentGatewayConfig> defaultGateways = List.of(
                    new PaymentGatewayConfig("SEPAY", "Quét mã SePay QR (MBBank/Napas)", "ACTIVE", "", "SYSTEM"),
                    new PaymentGatewayConfig("MOMO", "Ví điện tử MoMo", "ACTIVE", "", "SYSTEM"),
                    new PaymentGatewayConfig("VNPAY", "Cổng thanh toán VNPAY-QR", "ACTIVE", "", "SYSTEM"),
                    new PaymentGatewayConfig("ZALOPAY", "Ví điện tử ZaloPay", "ACTIVE", "", "SYSTEM"),
                    new PaymentGatewayConfig("CREDIT_CARD", "Thẻ quốc tế (Visa / Mastercard)", "ACTIVE", "", "SYSTEM"),
                    new PaymentGatewayConfig("CASH", "Tiền mặt tại quán", "ACTIVE", "", "SYSTEM")
            );
            paymentGatewayConfigRepository.saveAll(defaultGateways);
            System.out.println("💳 [DRAGON & BLADE] Đã khởi tạo 6 cổng thanh toán mặc định (M5.4 Payment Hub) thành công!");
        }
    }

    private void seedDiningTables() {
        if (diningTableRepository.count() == 0) {
            List<DiningTable> defaultTables = List.of(
                    // Tầng 1 (12 bàn)
                    new DiningTable("t1-01", "Bàn 01", 1, "bep", "Cạnh Bếp Nước Dùng 90°C", 2, "Ngắm nhìn nồi nước dùng truyền thống sôi bốc khói", false),
                    new DiningTable("t1-02", "Bàn 02", 1, "bep", "Cạnh Bếp Nước Dùng 90°C", 2, "Thưởng thức phở nóng ngay khi vừa chan nước dùng", false),
                    new DiningTable("t1-03", "Bàn 03", 1, "phoco", "Gian Cổ Kính Tầng 1", 4, "Bàn gỗ lim cổ kính, quạt trần hoài niệm", false),
                    new DiningTable("t1-04", "Bàn 04", 1, "phoco", "Gian Cổ Kính Tầng 1", 4, "Bàn trung tâm không gian ấm cúng 1986", false),
                    new DiningTable("t1-05", "VIP-01", 1, "vip", "Phòng Riêng Tri Kỷ 1986", 6, "Không gian riêng tư sang trọng, đèn chùm cổ điển", true),
                    new DiningTable("t1-06", "Bàn 06", 1, "bep", "Cửa Vào Tầng 1", 2, "Bàn cạnh lối vào thoáng mát, thuận tiện gọi món", false),
                    new DiningTable("t1-07", "Bàn 07", 1, "phoco", "Gian Cổ Kính Tầng 1", 4, "Không gian thưởng phở truyền thống trang nhã", false),
                    new DiningTable("t1-08", "Bàn 08", 1, "phoco", "Gian Cổ Kính Tầng 1", 4, "Bàn gỗ lớn phù hợp nhóm bạn bè & gia đình", false),
                    new DiningTable("t1-09", "Bàn 09", 1, "cuaso", "Cạnh Cửa Sổ Phố Cổ", 2, "Ánh sáng tự nhiên ngắm nhìn phố phường Hà Nội", false),
                    new DiningTable("t1-10", "Bàn 10", 1, "cuaso", "Cạnh Cửa Sổ Phố Cổ", 2, "Góc ngồi lãng mạn cho 2 người", false),
                    new DiningTable("t1-11", "Bàn 11", 1, "trungtam", "Khu Vực Trung Tâm", 4, "Vị trí trung tâm kết nối không gian ấm cúng", false),
                    new DiningTable("t1-12", "Bàn 12", 1, "trungtam", "Khu Vực Trung Tâm", 4, "Bàn tiệc gia đình thưởng thức trọn vẹn hương vị phở", false),

                    // Tầng 2 (10 bàn)
                    new DiningTable("t2-01", "Ban Công 01", 2, "bancong", "Ban Công Tầng 2", 4, "Ngắm nhìn phố phường Hà Nội từ trên cao thoáng mát", false),
                    new DiningTable("t2-02", "Ban Công 02", 2, "bancong", "Ban Công Tầng 2", 4, "Gió thu nhè nhẹ, thưởng phở chiều tà", false),
                    new DiningTable("t2-03", "Ban Công 03", 2, "bancong", "Ban Công Tầng 2", 4, "Góc ban công thoáng đãng, lãng mạn", false),
                    new DiningTable("t2-04", "Gian Tranh 01", 2, "giantranh", "Gian Tranh Cổ Tầng 2", 4, "Trang trí tranh phố cổ Hà Nội thập niên 80", false),
                    new DiningTable("t2-05", "VIP Trúc Lâm", 2, "viptang2", "Phòng VIP Trúc Lâm", 8, "Bàn tiệc lớn cao cấp dành cho gia đình và đối tác", true),
                    new DiningTable("t2-06", "Gian Tranh 02", 2, "giantranh", "Gian Tranh Cổ Tầng 2", 2, "Góc thưởng phở bình yên, ngắm tranh sơn dầu", false),
                    new DiningTable("t2-07", "Ban Công VIP", 2, "bancong", "Ban Công VIP Phố Cổ", 6, "Vị trí ban công góc đẹp nhất nhìn trọn phố Hàng Bạc", true),
                    new DiningTable("t2-08", "Gian Thư Họa", 2, "thuhoa", "Gian Thư Họa Hà Thành", 4, "Không gian đượm chất nghệ thuật thư pháp cổ", false),
                    new DiningTable("t2-09", "Thưởng Trà 01", 2, "thuongtra", "Khu Thưởng Trà & Đọc Sách", 2, "Thưởng thức trà sen Tây Hồ sau bát phở nóng", false),
                    new DiningTable("t2-10", "Thưởng Trà 02", 2, "thuongtra", "Khu Thưởng Trà & Đọc Sách", 2, "Không gian thư thái tĩnh lặng tầng 2", false)
            );
            diningTableRepository.saveAll(defaultTables);
            System.out.println("🏮 [DRAGON] Đã khởi tạo 22 bàn ăn di sản 2 tầng chuẩn Phở Gia Truyền 1986 thành công!");
        }
    }
}

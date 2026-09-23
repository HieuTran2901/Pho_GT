package com.pho1986.backend;

import com.pho1986.backend.model.entity.User;
import com.pho1986.backend.repository.CategoryRepository;
import com.pho1986.backend.repository.DishRepository;
import com.pho1986.backend.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Tag("integration")
@EnabledIfSystemProperty(named = "live.mysql.enabled", matches = "true")
@SpringBootTest
public class MySqlLiveIntegrationTest {

    private static final Logger log = LoggerFactory.getLogger(MySqlLiveIntegrationTest.class);

    @Autowired
    private DataSource dataSource;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DishRepository dishRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    @DisplayName("Kiểm tra kết nối thực tế tới MySQL pho_1986_db với root/1234 và xác nhận Schema + Seeder")
    void testMySqlConnectionAndSeeding() throws Exception {
        assertNotNull(dataSource);

        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData meta = conn.getMetaData();
            log.info("==================================================");
            log.info("✅ [DatabaseTest] KẾT NỐI MYSQL THÀNH CÔNG RỰC RỠ!");
            log.info("   - DB Product : {} {}", meta.getDatabaseProductName(), meta.getDatabaseProductVersion());
            log.info("   - URL        : {}", meta.getURL());
            log.info("   - User       : {}", meta.getUserName());
            log.info("==================================================");

            try (ResultSet tables = meta.getTables("pho_1986_db", null, "%", new String[]{"TABLE"})) {
                log.info("📋 [DatabaseTest] Danh sách bảng được sinh ra trong pho_1986_db:");
                int count = 0;
                while (tables.next()) {
                    count++;
                    log.info("   {}. {}", count, tables.getString("TABLE_NAME"));
                }
                assertTrue(count >= 8, "Phải có ít nhất 8 bảng thực thể trong MySQL");
            }
        }

        // Kiểm tra dữ liệu hạt giống (Seed Data)
        long catCount = categoryRepository.count();
        long dishCount = dishRepository.count();
        Optional<User> demoUser = userRepository.findByPhone("0988888888");

        log.info("🍜 Số lượng danh mục phở đã tạo: {}", catCount);
        log.info("🥢 Số lượng món phở & kèm đã tạo: {}", dishCount);
        log.info("👤 Tài khoản khách mẫu: {}", (demoUser.isPresent() ? demoUser.get().getFullName() + " (" + demoUser.get().getPhone() + ")" : "Chưa có"));

        assertTrue(catCount > 0, "Danh mục phở phải được gieo hạt giống");
        assertTrue(dishCount > 0, "Thực đơn món phở phải được gieo hạt giống");
        assertTrue(demoUser.isPresent(), "Tài khoản mẫu 0988888888 phải tồn tại trong MySQL");
    }
}

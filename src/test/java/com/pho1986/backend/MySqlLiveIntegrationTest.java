package com.pho1986.backend;

import com.pho1986.backend.model.entity.User;
import com.pho1986.backend.repository.CategoryRepository;
import com.pho1986.backend.repository.DishRepository;
import com.pho1986.backend.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
public class MySqlLiveIntegrationTest {

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
            System.out.println("==================================================");
            System.out.println("✅ [DB_AGENT] KẾT NỐI MYSQL THÀNH CÔNG RỰC RỠ!");
            System.out.println("   - DB Product : " + meta.getDatabaseProductName() + " " + meta.getDatabaseProductVersion());
            System.out.println("   - URL        : " + meta.getURL());
            System.out.println("   - User       : " + meta.getUserName());
            System.out.println("==================================================");

            try (ResultSet tables = meta.getTables("pho_1986_db", null, "%", new String[]{"TABLE"})) {
                System.out.println("📋 [DB_AGENT] Danh sách bảng được sinh ra trong pho_1986_db:");
                int count = 0;
                while (tables.next()) {
                    count++;
                    System.out.println("   " + count + ". " + tables.getString("TABLE_NAME"));
                }
                assertTrue(count >= 8, "Phải có ít nhất 8 bảng thực thể trong MySQL");
            }
        }

        // Kiểm tra dữ liệu hạt giống (Seed Data)
        long catCount = categoryRepository.count();
        long dishCount = dishRepository.count();
        Optional<User> demoUser = userRepository.findByPhone("0988888888");

        System.out.println("🍜 Số lượng danh mục phở đã tạo: " + catCount);
        System.out.println("🥢 Số lượng món phở & kèm đã tạo: " + dishCount);
        System.out.println("👤 Tài khoản khách mẫu: " + (demoUser.isPresent() ? demoUser.get().getFullName() + " (" + demoUser.get().getPhone() + ")" : "Chưa có"));

        assertTrue(catCount > 0, "Danh mục phở phải được gieo hạt giống");
        assertTrue(dishCount > 0, "Thực đơn món phở phải được gieo hạt giống");
        assertTrue(demoUser.isPresent(), "Tài khoản mẫu 0988888888 phải tồn tại trong MySQL");
    }
}

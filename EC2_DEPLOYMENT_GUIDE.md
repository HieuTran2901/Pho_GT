# Hướng Dẫn Cấu Hình Backend Spring Boot Trên AWS EC2 & Kết Nối AWS RDS MySQL

Tài liệu này tổng hợp toàn bộ quy trình thiết lập máy chủ **AWS EC2 (Amazon Linux 2023)**, cấu hình bảo mật biến môi trường kết nối tới **AWS RDS MySQL (`pho-gt-mysql`)**, và cách vận hành service tự động qua **systemd**.

---

## 1. Phân Tích Lỗi & Hiện Trạng Hệ Thống

### Hiện trạng thực tế từ log:
```log
Caused by: java.sql.SQLException: Access denied for user 'pho_admin'@'172.31.46.62' (using password: NO)
```

1. **Tin vui về hạ tầng mạng**:
   - Máy ảo EC2 (`172.31.46.62`) đã gửi gói tin thành công tới cụm RDS MySQL qua cổng `3306`.
   - Security Group và định tuyến VPC đã thông suốt 100%.

2. **Nguyên nhân lỗi**:
   - `(using password: NO)` nghĩa là ứng dụng Spring Boot khi khởi động chưa được truyền mật khẩu của user `pho_admin`.
   - Do file `application-prod.yml` sử dụng biến môi trường:
     ```yaml
     spring:
       datasource:
         username: ${SPRING_DATASOURCE_USERNAME:pho_admin}
         password: ${SPRING_DATASOURCE_PASSWORD:}
     ```
   - Khi chạy qua lệnh thông thường mà thiếu biến `SPRING_DATASOURCE_PASSWORD`, mật khẩu bị rỗng dẫn đến MySQL từ chối xác thực.

---

## 2. Hướng Dẫn Các Lệnh Thực Thi Trên EC2 (Từng Bước)

Đăng nhập SSH vào máy chủ EC2 (`3.25.130.70`) bằng tài khoản `ec2-user` và thực hiện tuần tự các bước sau:

### Bước 1: Khởi tạo thư mục triển khai ứng dụng
```bash
sudo mkdir -p /opt/pho1986
sudo chown -R ec2-user:ec2-user /opt/pho1986
```

---

### Bước 2: Tạo file biến môi trường bảo mật (`.env`)
Tạo file chứa mật khẩu RDS và các thông số bảo mật, không để lộ mật khẩu ra lịch sử dòng lệnh:

```bash
sudo bash -c 'cat << "EOF" > /opt/pho1986/.env
# ==========================================
# CẤU HÌNH KẾT NỐI AWS RDS MYSQL (PRODUCTION)
# ==========================================
SPRING_DATASOURCE_PASSWORD=Dien_Mat_Khau_RDS_Cua_Ban_Vao_Day

# ==========================================
# CẤU HÌNH BẢO MẬT & ADMIN SEED (SENTINEL)
# ==========================================
# Mặc định tắt seed admin123 trên prod (Bật true nếu muốn tạo admin ban đầu)
ADMIN_SEED_ENABLED=false
# ADMIN_INIT_PHONE=0999999999
# ADMIN_INIT_PASSWORD=MatKhauAdminRatManh123!@#

# ==========================================
# KHÓA BÍ MẬT JWT & PAYMENT (TÙY CHỌN)
# ==========================================
# JWT_SECRET=pho_gia_truyen_1986_spring_boot_jwt_secret_key_very_long_for_hmac_sha_256
EOF'
```
> [!IMPORTANT]
> Hãy thay thế chuỗi `Dien_Mat_Khau_RDS_Cua_Ban_Vao_Day` bằng mật khẩu thực tế bạn đã đặt cho tài khoản `pho_admin` khi tạo cụm RDS trên AWS Console.

Phân quyền chặt chẽ (chỉ `root` và `ec2-user` được đọc, ngăn chặn các user khác xem trộm mật khẩu):
```bash
sudo chmod 600 /opt/pho1986/.env
sudo chown ec2-user:ec2-user /opt/pho1986/.env
```

---

### Bước 3: Tạo service quản lý tự động (`pho-backend.service`)
Tạo file dịch vụ systemd để Linux tự quản lý ứng dụng, tự nạp file `.env` và tự khởi động lại khi server reboot:

```bash
sudo bash -c 'cat << "EOF" > /etc/systemd/system/pho-backend.service
[Unit]
Description=Pho Viet 1986 Spring Boot Backend Service
After=syslog.target network.target

[Service]
User=ec2-user
WorkingDirectory=/opt/pho1986
EnvironmentFile=/opt/pho1986/.env
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod /opt/pho1986/pho-viet-backend.jar
SuccessExitStatus=143
Restart=always
RestartSec=10
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF'
```

---

### Bước 4: Tải lại cấu hình và khởi động Backend
Chạy các lệnh nạp service và kích hoạt:

```bash
# Tải lại cấu hình systemd
sudo systemctl daemon-reload

# Cho phép service tự bật cùng hệ điều hành khi reboot
sudo systemctl enable pho-backend

# Khởi động lại service
sudo systemctl restart pho-backend
```

---

### Bước 5: Kiểm tra trạng thái và log hoạt động

1. **Kiểm tra trạng thái service**:
   ```bash
   sudo systemctl status pho-backend
   ```
   *(Khi thành công, dòng trạng thái sẽ hiển thị `Active: active (running)` màu xanh lá).*

2. **Xem log thời gian thực (Live Log Stream)**:
   ```bash
   journalctl -u pho-backend -f
   ```
   *(Nhấn `Ctrl + C` để thoát màn hình log).*

3. **Kiểm tra phản hồi HTTP từ endpoint máy chủ**:
   ```bash
   curl -I http://localhost:8080/api/v1/auth/me
   ```
   *(Kết quả trả về `HTTP/1.1 401` là hoàn toàn chính xác theo chuẩn bảo mật Spring Security).*

---

## 3. Bảng Tra Cứu Biến Môi Trường (Environment Variables)

| Tên Biến | Bắt Buộc | Mô Tả | Giá Trị Mẫu |
| :--- | :---: | :--- | :--- |
| `SPRING_DATASOURCE_PASSWORD` | **Có** | Mật khẩu tài khoản `pho_admin` kết nối MySQL RDS | `MySecureRDS_2026!` |
| `SPRING_DATASOURCE_URL` | Không | Ghi đè URL kết nối JDBC (nếu đổi endpoint RDS) | `jdbc:mysql://...:3306/pho_1986_db` |
| `ADMIN_SEED_ENABLED` | Không | Bật/tắt gieo tài khoản Admin lần đầu trên Prod | `false` (mặc định) hoặc `true` |
| `ADMIN_INIT_PHONE` | Không | Số điện thoại Admin khởi tạo | `0988xxxxxx` |
| `ADMIN_INIT_PASSWORD` | Không | Mật khẩu Admin khởi tạo (bắt buộc $\ge 8$ ký tự) | `PhoAdmin@2026!` |
| `JWT_SECRET` | Không | Khóa HMAC bí mật sinh token | chuỗi ký tự bí mật dài |
| `CLIENT_ORIGIN` | Không | Danh sách tên miền được phép CORS | `http://localhost:5173,http://3.25.130.70` |

---

## 4. Quy Trình Vận Hành Tiếp Theo Với CI/CD

Khi đã hoàn tất các bước trên:
1. File binary `/opt/pho1986/pho-viet-backend.jar` sẽ được **GitHub Actions** tự động biên dịch và upload lên mỗi khi bạn thực hiện `git push origin master`.
2. File cấu hình `/opt/pho1986/.env` được giữ nguyên vẹn trên EC2, không bị ghi đè hay thất thoát mật khẩu.
3. Sau khi file JAR mới được chuyển đến, GitHub Actions sẽ tự động ra lệnh `sudo systemctl restart pho-backend` để cập nhật phiên bản mới chỉ trong vòng **3 - 5 giây**.

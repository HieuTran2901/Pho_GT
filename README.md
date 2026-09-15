# Phở Gia Truyền 1986 — Dịch Vụ Máy Chủ Backend (Backend Service Engine)

[![Java](https://img.shields.io/badge/Java-21-orange.svg?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.3-brightgreen.svg?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Tiêu Chuẩn Bảo Mật](https://img.shields.io/badge/Bảo_Mật-IETF%20RFC%206819-blue.svg?style=for-the-badge)](https://datatracker.ietf.org/doc/html/rfc6819)
[![Cơ Sở Dữ Liệu](https://img.shields.io/badge/Database-MySQL%208.0%20InnoDB-00758F.svg?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Lưu Trữ Đám Mây](https://img.shields.io/badge/Lưu_Trữ-AWS%20S3%20Bucket-232F3E.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/s3/)

Dịch vụ backend cấp doanh nghiệp (Enterprise-grade) phát triển trên nền tảng Spring Boot 3.4.3, cung cấp động cơ điều phối dịch vụ ẩm thực số, đặt bàn thời gian thực và thanh toán tự động cho **Phở Gia Truyền 1986**.

---

## 🏛️ KIẾN TRÚC HỆ THỐNG & LUỒNG DỮ LIỆU

```
[ Ứng Dụng Client ] (React 18 SPA / Thiết bị Di Động)
         │
         │  TLS 1.3 / HTTPS (REST Endpoints + HttpOnly SameSite Cookies)
         ▼
[ Động Cơ Spring Boot 3.4.3 ]
 ├── Chuỗi Bộ Lọc Spring Security (HS512 JWT Auth & Kiểm Soát Truy Cập RBAC)
 ├── Lớp Phòng Vệ Mối Đe Dọa & Giới Hạn Tần Suất (Sliding Window In-Memory Bucket)
 ├── Lớp Dịch Vụ & Xử Lý Nghiệp Vụ
 │    ├── OrderService & TableReservationService (Khóa Lạc Quan Optimistic Locking & TTL Hold)
 │    ├── PaymentService & SepayIpnHandler (Bảo Đảm Tính Bất Biến Webhook & Chống Replay)
 │    ├── LoyaltyService & VoucherRuleEngine (Quy Tắc Ràng Buộc Món Chính)
 │    └── ChatService (Tích Hợp Trợ Lý Ẩm Thực Google Gemini)
 └── Tầng Lưu Trữ Bền Vững (Spring Data JPA / Hibernate 6)
         │
         ├── HikariCP Connection Pool (Max: 10, Min-Idle: 5)
         ▼
[ Cơ Sở Dữ Liệu MySQL 8.0 ] ──► (Bảng: orders, users, dining_tables, refresh_tokens, vouchers)
         │
         ▼
[ Dịch Vụ Đám Mây Mở Rộng ]
 ├── AWS S3 Bucket (Lưu Trữ Hình Ảnh & Tài Nguyên Thực Đơn)
 ├── Cổng Thanh Toán VietQR / SePay (Webhook IPN Callback)
 └── Google Generative Language API (Gemini 2.5/3.0)
```

---

## 🛡️ BẢO MẬT XÁC THỰC & QUẢN LÝ PHIÊN (ĐẶC TẢ CHUẨN IETF RFC 6819)

Mục này tài liệu hóa đặc tả kiến trúc chính thức của phân hệ JSON Web Token (JWT), mô hình vận chuyển qua cookie HttpOnly kép, và cơ chế bảo vệ phiên mã hóa được triển khai tại lớp bảo mật lõi.

---

### 1. Thuật Toán Ký & Tiêu Đề Mã Hóa
- **Thuật toán**: `HS512` (HMAC với SHA-512).
- **Lý do lựa chọn**: Thay thế `HS256` thông thường bằng hàm băm mật mã 512-bit nhằm mang lại khả năng kháng va chạm (collision resistance) tối đa và không gian khóa entropy vượt trội chống lại tấn công brute-force.
- **Quản lý khóa bí mật**: Cấu hình thông qua biến môi trường độc lập `${JWT_SECRET}` (hoàn toàn tách biệt khỏi hệ thống quản lý mã nguồn).

```json
{
  "alg": "HS512",
  "typ": "JWT"
}
```

---

### 2. Kiến Trúc Token Kép (Dual-Token Claims Architecture)

#### A. Access Token Ngắn Hạn (Thời hạn: 15 Phút)
Được thiết kế phục vụ ủy quyền phi trạng thái (stateless), đáp ứng thông lượng cao trên các REST endpoint nghiệp vụ (`/api/v1/orders`, `/api/v1/tables`, `/api/v1/menu`).

```json
{
  "sub": "7effe476-d2d0-491d-8374-6cd9a34727b0",
  "role": "CUSTOMER",
  "type": "ACCESS",
  "jti": "4b6c3e21-0a1f-492e-b811-9a72d3851b40",
  "iat": 1773480000,
  "exp": 1773480900
}
```

| Khóa Claim | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `sub` | `UUID` | Định danh người dùng tương ứng trực tiếp với `users.id`. |
| `role` | `String` | Quyền hạn truy cập phân cấp RBAC (`CUSTOMER` hoặc `ADMIN`). |
| `type` | `String` | Bộ phân loại token tĩnh (`ACCESS`), ngăn chặn giả mạo hoán đổi loại token. |
| `jti` | `UUID` | Khóa định danh duy nhất của JWT, dùng làm index cho danh sách thu hồi blacklist trong bộ nhớ $O(1)$. |
| `iat` | `Epoch Sec` | Dấu thời gian phát hành token. |
| `exp` | `Epoch Sec` | Dấu thời gian hết hạn (15 phút kể từ thời điểm phát hành). |

#### B. Refresh Token Dài Hạn (Thời hạn: 7 Ngày)
Chỉ được sử dụng duy nhất cho mục đích xoay vòng cặp token thông qua endpoint `POST /api/v1/auth/refresh`.

```json
{
  "sub": "7effe476-d2d0-491d-8374-6cd9a34727b0",
  "role": "CUSTOMER",
  "type": "REFRESH",
  "jti": "9c12e874-bf43-4f9e-a134-87de31fa0592",
  "iat": 1773480000,
  "exp": 1774084800
}
```

---

### 3. Bảo Mật Vận Chuyển: Cô Lập Cookie HttpOnly Kép

Token không bao giờ được trả về dưới dạng JSON thô cho client tự lưu trữ. Thay vào đó, chúng được gửi qua các chỉ thị `Set-Cookie` được cấu hình chặt chẽ:

| Chỉ thị | Cookie Access Token | Cookie Refresh Token | Lợi ích an ninh |
|---|---|---|---|
| **Tên Cookie** | `accessToken` | `refreshToken` | Phân tách vai trò rõ ràng giữa các token. |
| **HttpOnly** | `true` | `true` | **Miễn nhiễm 100% XSS**: JavaScript client (`document.cookie`) hoàn toàn không thể truy cập. |
| **Phạm vi Path** | `Path=/` | **`Path=/api/v1/auth`** | **Thu hẹp bề mặt tấn công**: Refresh token KHÔNG BAO GIỜ bị gửi kèm trong các truy vấn duyệt web thông thường. |
| **SameSite** | `Lax` | `Lax` | **Chống tấn công CSRF**: Ngăn chặn các truy vấn trái phép bắt nguồn từ trang web bên ngoài. |
| **Secure** | `true` (HTTPS) | `true` (HTTPS) | Bắt buộc mã hóa đường truyền TLS trên môi trường production. |
| **Max-Age** | `900` (15 phút) | `604800` (7 ngày) | Thực thi vòng đời token nghiêm ngặt. |

---

### 4. Lưu Trữ Cơ Sở Dữ Liệu: Băm Một Chiều Bằng SHA-256

Khác với các triển khai đơn giản thường lưu chuỗi JWT thô (`VARCHAR(512)`), tầng lưu trữ áp dụng **Chính Sách Lưu Trữ Không Kiến Thức (Zero-Knowledge Storage Policy)**:

$$\text{Raw Token (Client)} \xrightarrow{\text{SHA-256}} \text{token\_hash (64 ký tự Hex trong CSDL)}$$

- **Entity**: `RefreshToken.java`
- **Cấu trúc Schema CSDL**:
  - `id`: Khóa chính `VARCHAR(36)` (UUID).
  - `family_id`: Khóa chuỗi phiên `VARCHAR(36)` (có đánh chỉ mục Index).
  - `token_hash`: Chuỗi băm `VARCHAR(64)` (Unique Index).
  - `expiry_date`: Thời điểm hết hạn `DATETIME` (có đánh chỉ mục Index).
  - `revoked`: Trạng thái thu hồi `BOOLEAN`.
- **Lợi ích kỹ thuật**:
  1. **Tối ưu RAM**: Giảm dung lượng chỉ mục B-Tree tới **~87%** trong bộ nhớ đệm InnoDB Buffer Pool.
  2. **Kháng rò rỉ dữ liệu**: Kể cả khi bản sao lưu CSDL bị rò rỉ, kẻ tấn công cũng không thể phục hồi chuỗi JWT hợp lệ từ các chuỗi băm SHA-256 một chiều.

---

### 5. Cơ Chế Khoanh Vùng Vi Phạm RFC 6819 (Chống Tấn Công Phát Lại Replay Attack)

Tuân thủ nghiêm ngặt **IETF RFC 6819 Mục 5.2.2.3**, máy chủ nhóm các phiên làm việc của người dùng vào các họ token bất biến (`family_id`):

```text
[Luồng Xoay Vòng Bình Thường]
RT1 (Hiệu lực) ──► Yêu cầu Làm mới ──► RT1 (Thu hồi) + RT2 (Hiệu lực, cùng họ token)
                                              │
                                              ▼
[Kẻ Tấn Công Phát Lại RT1 Đã Bị Thu Hồi]
Phát hiện RT1 (Đã thu hồi) được gửi lại!
        │
        ▼
[KÍCH HOẠT QUY TRÌNH KHOANH VÙNG VI PHẠM]
        ├── 1. Từ chối yêu cầu với mã lỗi HTTP 401 Unauthorized
        ├── 2. Vô hiệu hóa nguyên tử (Atomically) toàn bộ Family ID (hủy RT2 của kẻ tấn công)
        └── 3. Ghi nhật ký cảnh báo an ninh nghiêm trọng & đưa vào Danh sách đen Token
```

- **Phân định danh tính**: Máy chủ lập tức chấm dứt toàn bộ phiên thuộc chuỗi đó. Kẻ tấn công bị chặn hoàn toàn. Người dùng hợp pháp chỉ cần xác thực lại bằng tài khoản chính để thiết lập chuỗi phiên mới an toàn.

---

### 6. Tác Vụ Dọn Dẹp Định Kỳ & Bất Biến Thời Gian Chờ (Grace Period)
- **Khoảng thời gian bảo lưu (Grace Period)**: Token đã thu hồi vẫn được lưu trữ tạm thời trong MySQL cho đến khi `expiry_date <= NOW()` để đóng vai trò làm "bẫy" phát hiện các truy vấn phát lại trái phép.
- **Dọn dẹp phân đoạn**: `RefreshTokenCleanupService.java` thực thi lệnh xóa theo từng lô nhỏ (`LIMIT 5000`) qua tác vụ ngầm `@Scheduled` chạy mỗi giờ, ngăn ngừa tình trạng khóa bảng InnoDB và nghẽn bộ ghi nhật ký Undo/Redo.

---

## ⚡ DANH SÁCH REST API CỐT LÕI

| Phân hệ | Phương thức | Đường dẫn Endpoint | Quyền truy cập | Mô tả chức năng |
|---|:---:|---|:---:|---|
| **Xác Thực & Phiên** | `POST` | `/api/v1/auth/login` | Công khai | Xác thực thông tin đăng nhập, thiết lập cookie HttpOnly kép. |
| | `POST` | `/api/v1/auth/refresh` | Qua Cookie | Xoay vòng họ token và cấp mới access token. |
| | `POST` | `/api/v1/auth/logout` | Đã xác thực | Xóa sạch cookie và thu hồi toàn bộ họ token hoạt động. |
| **Quản Lý Bàn Ăn**| `GET` | `/api/v1/tables` | Công khai | Lấy thông tin sơ đồ bàn ăn 2 tầng và trạng thái đặt chỗ trực tiếp. |
| | `POST` | `/api/v1/tables/lock` | Đã xác thực | Khóa giữ bàn tạm thời 15 phút theo cơ chế khóa lạc quan. |
| **Đơn Hàng & Thanh Toán** | `POST` | `/api/v1/orders` | Công khai / Người dùng | Khởi tạo đơn ăn uống mới kèm chi tiết tùy biến khẩu vị món. |
| | `GET` | `/api/v1/orders/{code}` | Công khai / Người dùng | Truy vấn trạng thái đơn hàng kèm che số điện thoại PII (`098****888`). |
| | `POST` | `/api/v1/payments/sepay/ipn` | Webhook SePay | Nhận tín hiệu thông báo thanh toán ngân hàng kèm kiểm tra chữ ký. |
| **Hội Viên & Quà Tặng**| `GET` | `/api/v1/loyalty/profile` | Đã xác thực | Lấy điểm tích lũy thành viên, lịch sử đổi thưởng và két voucher. |
| | `POST` | `/api/v1/vouchers/validate`| Công khai / Người dùng | Thẩm định điều kiện voucher (thực thi quy tắc món phở chính). |

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & KIỂM THỬ TẠI LOCAL

### Yêu Cầu Môi Trường
- **JDK**: Java 21 LTS (OpenJDK / Eclipse Temurin)
- **Công cụ build**: Maven 3.9+ (hoặc sử dụng script đính kèm `./mvnw.cmd`)
- **Cơ sở dữ liệu**: MySQL 8.0 đang hoạt động tại cổng `localhost:3306`

### Khởi Chạy Dịch Vụ Backend
```powershell
# Windows PowerShell
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

Dịch vụ backend sẽ khởi chạy với cấu hình `dev` mặc định tại địa chỉ: [`http://localhost:8080`](http://localhost:8080)

### Chạy Bộ Kiểm Thử Tự Động
```powershell
# Thực thi toàn bộ unit test và integration test
.\mvnw.cmd clean test
```
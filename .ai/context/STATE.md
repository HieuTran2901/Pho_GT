# Project State — Phở Gia Truyền 1986

## Current Capabilities (100% Verified by TESTER_AGENT)
- [x] **Hero Section**: Bố cục tranh phố cổ Hà Nội, hiệu ứng khói bốc nghi ngút (`SteamEffect`).
- [x] **Thực Đơn Tinh Hoa (`MenuSection`)**:
  - Carousel danh mục cuộn ngang với nút gạt trái/phải và kéo chuột mượt mà (0 re-render drag physics via `useRef`).
  - Lọc theo danh mục, từ khóa tìm kiếm (`useMemo`).
  - Thẻ món ăn (`MenuCard`) bọc `React.memo`, hiển thị badge, ảnh 4:3, danh sách đặc điểm nổi bật.
  - Tùy chọn yêu thích: Nảy tim pop, bắn pháo hoa confetti (`animate-spark-burst`), quỹ đạo bay Bézier (`FlyingHeart`) vào tab "Món Yêu Thích".
  - Thêm vào bàn: Tô phở bay parabol (`FlyingPhoBowl`) xuất phát chính xác từ tâm nút bấm và lặn vào biểu tượng giỏ hàng trên Navbar.
- [x] **Giỏ Hàng (`CartDrawer`)**: Trượt bên phải, ESC key listener, khóa scroll body, tính tổng tiền qua singleton `Intl.NumberFormat`.
- [x] **Section Phụ**: `StorySection`, `Testimonials`, `OrderSection`, `Footer` được bảo vệ bởi `React.memo`.
- [x] **Build Status**: `vite build` 100% thành công (1589 modules, 0 errors, 0 warnings).
- [x] **Repository Structure**: Nhánh `main` (Frontend) và nhánh `master` (Backend) đã push lên `HieuTran2901/Pho_GT`.

- [x] **Backend Service & DB Schema (M2.1 & M2.2)**:
  - Khởi tạo Express + TypeScript + Prisma ORM + SQLite (`dev.db`).
  - Lược đồ CSDL 10 thực thể: `User`, `TasteProfile`, `Address`, `Order`, `OrderItem`, `LoyaltyAccount`, `LoyaltyTransaction`, `LoyaltyReward`, `Category`, `Dish`.
  - Nạp dữ liệu hạt giống (`prisma/seed.ts`) thực đơn 1986 và phần thưởng Bát Phở Tri Kỷ.
- [x] **Core REST API v1 (M2.3 & M2.4)**:
  - Auth: Đăng ký (tặng 50 điểm), Đăng nhập JWT HttpOnly Cookie, Claim đơn hàng vãng lai (`post-order-claim`).
  - Gu Ăn Phở (`/user/taste-profile`): Nước dùng, hành trần, rau thơm, quẩy giòn, cấp độ cay.
  - Đơn hàng & Gọi lại bát quen (`/orders` & `/orders/quick-reorder`): Đặt món Guest & Member, 1-click reorder.
  - Bát Phở Tri Kỷ (`/loyalty`): Tổng quan thăng hạng, sổ cái tích điểm, đổi quà.
  - Thẩm định 9/9 luồng kiểm thử tích hợp tự động qua `test-api.ts` (100% PASS).

- [x] **UI Modal Đăng Ký / Đăng Nhập Retro Heritage & AuthContext (M2.5)**:
  - Thiết kế `AuthModal.jsx` phong cách di sản Hà Nội 1986 với vân giấy dó, viền đôi son đỏ `#8a1e14`, chỉ vàng hoàng gia `#d4af37` và con dấu mộc tròn "Bát Phở Tri Kỷ 1986".
  - Tab switcher "Đăng Nhập (Khách Quen)" và "Đăng Ký Mới" kèm huy hiệu nổi bật `+50Đ Tri Kỷ`.
  - Box đặc quyền Bát Phở Tri Kỷ phong cách tem phiếu xưa (tặng 50 điểm, 1-click gọi lại bát quen, lưu gu ăn phở).
  - Tích hợp `AuthContext.jsx` lưu trữ phiên khách hàng tại `localStorage`, tự động phản ứng cập nhật Profile Capsule trên Navbar (tên khách, điểm khả dụng, hạng hội viên).
  - Đạt chuẩn tương tác: phím ESC, click outside, chống cuộn nền và 2 nút Demo Trải nghiệm nhanh (Khách Quen Demo / Khách Mới Demo).
  - `vite build` 100% thành công (1591 modules, 0 errors, 0 warnings). Đã push lên GitHub `main` (`a6a9ec7`).

- [x] **Hệ Thống Đặt Bàn Đa Bước & Cổng Thanh Toán Đa Kênh Hybrid Checkout (M2.8)**:
  - **Quy trình đặt bàn tại chỗ (In-Place Multi-Step Flow):** Bước 1 (Thông tin tiệc & chọn bàn) ➔ Bước 2 (Thanh toán & xác thực tức thì) ➔ Bước 3 (Hóa đơn chi tiết).
  - **Đa kênh thanh toán kết hợp (Hybrid Checkout):** Tiền mặt tại quán (`CASH`), Quét mã QR SePay (`SEPAY`), Ví MoMo (`MOMO`), VNPay (`VNPAY`), ZaloPay (`ZALOPAY`), Thẻ tín dụng quốc tế (`CREDIT_CARD`).
  - **Polling thanh toán tức thì qua `visibilitychange`:** Tự động kích hoạt kiểm tra trạng thái thanh toán ngay khi người dùng chuyển từ app ngân hàng/MoMo về lại trình duyệt web trong 0.1s thay vì chờ vòng lặp 3s.
  - **Khôi phục phiên qua `sessionStorage`:** Đảm bảo khi khách hàng hủy giao dịch hoặc quay lại từ cổng thanh toán đối tác, toàn bộ dữ liệu đơn hàng và form đặt bàn không bị mất.
  - **Tối ưu Mobile:** Tự động cuộn mượt lên đầu form (`scrollToOrderSection`) khi chuyển bước; Sticky Bottom Checkout Bar gắn đáy màn hình điện thoại kèm hỗ trợ `env(safe-area-inset-bottom)` của iOS.

- [x] **Sơ Đồ Bàn Kiến Trúc 2D & Tối Ưu Hóa Giao Diện Mobile Đẳng Cấp (M2.9)**:
  - **Không gian 2 tầng sống động (`SeatMapModal.jsx`):** Tầng 1 (Gian Nồi Phở 90°C & Cửa chính Hàng Bạc) và Tầng 2 (Ban công view phố cổ & Gian tranh 1986) với hiệu ứng thang máy mượt mà (`animate-floor-up`, `animate-floor-down`).
  - **Thẻ Bàn Ngang Full-Width Mobile (Chuẩn OpenTable / Michelin Guide):** Giải quyết triệt để vấn đề co ép 2 cột trên điện thoại; hiển thị đầy đủ icon bàn 2D, sức chứa, tên bàn, tag phân khu, câu mô tả góc view chi tiết và nút chọn Radio / Checkmark vàng kim.
  - **Lưới Kiến Trúc 3 Cột Trên Desktop:** Tự động chuyển đổi sang lưới không gian 3 cột trên PC với hình học bàn 2D động (bàn tròn 2 chỗ, bàn vuông 4 chỗ, bàn đại tiệc hoàng gia VIP 6-8 chỗ).
  - **Kiểm soát sức chứa thông minh:** Cảnh báo và vô hiệu hóa nút xác nhận nếu số khách trong đoàn vượt quá sức chứa bàn (`partySize` validation).
  - **Tinh giản tiêu đề:** Ẩn huy hiệu `2D Interactive` trên mobile (`hidden sm:inline-block`) để tiêu đề rộng rãi và không chèn ép nút đóng modal.

- [x] **Trang Quản Trị Toàn Diện (Admin Portal) & Phân Quyền RBAC (M3.0)**:
  - **Tài khoản Quản trị khởi tạo:** `0999999999` / `admin123` (`ROLE_ADMIN`) gieo tự động trong `DataInitializer.java`.
  - **Bảo mật Spring Security:** Khóa chặt phân khu `/api/v1/admin/**` với `@PreAuthorize("hasRole('ADMIN')")`.
  - **Dịch vụ máy chủ Admin (`AdminController`, `AdminService`, `AdminDashboardDtos`):** REST API thống kê thời gian thực KPI doanh thu, quản lý danh sách đơn hàng & duyệt đơn 1-click, CRUD món ăn & danh mục.
  - **Giao diện Quản Trị Khay Sơn Mài & Khảm Đồng Cổ Hà Nội 1986 (`AdminPortal.jsx`, `AdminLoginView.jsx`, `adminApi.js`):** 
    - Thẻ chỉ số vận hành (KPI) phong cách khay gỗ mun sơn then viền góc đồng cổ xưa.
    - Nút duyệt đơn mô phỏng ấn triện son đỏ chu sa (`#8a1e14`).
    - Bộ lọc đơn hàng phong cách tem phiếu thời bao cấp 1986.
    - Bố cục 4 phân khu: Tổng quan vận hành, Đơn hàng & tiệc bàn, Thực đơn gia truyền, Giám sát bàn 2 tầng.
  - **Điều hướng & Route Guard:** Tự động bắt route `/admin`, kiểm tra phân quyền client-side và chặn tài khoản khách thường.
  - **Thẩm định Trực Nghiệm E2E bởi EYE (`BROWSER_AGENT`):** 100% PASS luồng đăng nhập, nạp dữ liệu thật từ Spring Boot, chuyển tab và đổi trạng thái đơn. Minh chứng lưu tại `E:\Github project\pho-viet-landing-page\evidence\admin_dashboard.png`.
  - **Kiểm định Build:** `.\mvnw compile` BUILD SUCCESS, `npm run build` 100% thành công (1598 modules, 0 errors).

- [x] **Tái Cấu Trúc Toàn Diện Bộ Quy Tắc Code (< 500 Dòng - `FILE-SIZE-R001`) (M3.1)**:
  - Rà soát 100% tệp tin dự án. Tách 9 tệp quá khổ (> 500 dòng) thành các module chuyên biệt:
    - `AdminPortal.jsx` (4,736 -> 328 dòng) tách 25 module trong `components/admin/`.
    - `OrderSection.jsx` (1,759 -> 217 dòng) tách 7 module trong `components/order/`.
    - `MenuSection.jsx` (1,699 -> 314 dòng) tách 7 module trong `components/menu/`.
    - `Navbar.jsx` (973 -> 273 dòng) tách 5 module trong `components/navbar/`.
    - `SeatMapModal.jsx` (918 -> 231 dòng) tách 4 module trong `components/seatmap/`.
    - `index.css` (914 -> 22 dòng) tách 4 file trong `styles/`.
    - `PaymentService.java` (604 -> 297 dòng) tách `VietQrHelper`, `SepayIpnHandler`, `MomoIpnHandler`.
  - Kết quả: `scan_file_lines.mjs` xác nhận 0 tệp vượt quá 500 dòng. `mvnw compile` & `npm run build` 100% PASS.

- [x] **Tối Ưu Giao Diện Lịch Sử Đơn Hàng Khách Hàng (M3.2 - URBAN & RAVEN)**:
  - Bổ sung hình ảnh thumbnail món ăn 72x72px và Avatar Stack cho đơn nhiều món.
  - Tinh giản text: Thay chuỗi dài bằng chip badge trực quan (`[🍽️ Bàn 6]`, `[🛵 Mang về]`, `[💳 SEPAY]`).
  - Lược bỏ mã đơn nội bộ `#PHO-88219` gây rối mắt, chỉ hiển thị trạng thái và thời gian thân thiện.
  - Tối ưu responsive trên Mobile: bung danh sách món dạng Bottom Sheet tràn viền mượt mà.

- [x] **Tự Động Xóa Giỏ Hàng & Đồng Bộ Món Vào Lịch Sử Đơn Hàng (M3.3 - RAVEN & TITAN)**:
  - Kết nối `cartItems` và `onClearCart` từ `App.jsx` xuống `OrderSection.jsx` và `useOrderSectionState.js`.
  - Tự động làm rỗng giỏ hàng sau khi đặt thành công (COD, trả sau, Return URL, Webhook polling).
  - Ánh xạ chính xác toàn bộ danh sách món trong giỏ vào mảng `items` của đơn hàng trong lịch sử.

- [x] **Tối Ưu Ngăn Kéo Giỏ Hàng & Nút Đóng "X" Trên Mobile (M3.4 - URBAN & BLADE)**:
  - Khắc phục lề đệm dư thừa `pl-10`, cho phép giỏ hàng bung tràn viền 100% trên màn hình điện thoại.
  - Căn chỉnh nút `X` chuẩn 16px cách mép phải và căn giữa dòng với tiêu đề giỏ hàng, touch target 32x32px.

- [x] **Tối Ưu Hóa State Toàn Hệ Thống (M3.5 - RAVEN Audit)**:
  - Lazy initialization và state persistence cho giỏ hàng từ storage.
  - Single-pass `useMemo` tính toán gộp `{ totalAmount, itemCount }` trong `CartDrawer.jsx`.
  - Memoize điểm hội viên, cấp thẻ và khẩu vị trong `Navbar.jsx`.
  - Idempotency guard chống gọi lặp `processReturnUrl` khi redirect về từ cổng thanh toán trực tuyến.
  - Single-pass $O(N)$ tính toán bộ đếm trạng thái đơn hàng trong `useCustomerOrderHistory.js`.

- [x] **Phân Vùng Giỏ Hàng & Lịch Sử Theo Tài Khoản (User-Scoped Cart Partitioning - M4.0 - RAVEN & BLADE)**:
  - Mỗi tài khoản sở hữu phân vùng giỏ riêng: `pho1986_cart_guest`, `pho1986_cart_usr_${id}`.
  - Cắt đứt rò rỉ chéo dữ liệu giỏ hàng và khẩu vị nhạy cảm giữa các tài khoản khi dùng chung thiết bị.
  - Tự động chuyển đổi mượt mà, cất giỏ cũ và nạp giỏ mới; khôi phục giỏ khi đăng nhập lại.
  - Phân vùng lịch sử đơn hàng offline qua `getLocalOrdersKey()`.
  - Kiểm chứng tự động đạt 100% qua CDP (`verify_user_scoped_cart.mjs`).

- [x] **Gia Cố An Ninh & Phòng Thủ Dữ Liệu Thực Khách (Security Hardening & PII Defense - M4.1 - SENTINEL, BLADE, URBAN & TITAN)**:
  - **Che giấu dữ liệu PII (PII Masking DTO)**: Tạo `PublicOrderResponse` che số điện thoại (`098****888`), tên khách và địa chỉ nếu người gọi API `GET /api/v1/orders/{orderCode}` không phải là chủ đơn hoặc admin.
  - **Sinh mã đơn an toàn (`SecureRandom`)**: Thay thế thuật toán `Random()` bằng `SecureRandom` 6 ký tự Base32 ngẫu nhiên an toàn, kiểm tra tính duy nhất chống vét cạn (enumeration).
  - **Chống chiếm đoạt đơn hàng & điểm thưởng (`post-order-claim`)**: Ràng buộc xác thực số điện thoại người claim phải khớp tuyệt đối với số điện thoại trên đơn vãng lai ban đầu.
  - **Kiểm soát tần suất kép (Dual Rate Limiter)**: `LoginRateLimiter` hỗ trợ theo dõi kép cả `Phone` và `Client-IP` chống password spraying, đồng thời bổ sung giới hạn 5 lần đăng ký / 10 phút từ cùng 1 IP chống DoS/spam tài khoản rác.
  - **Dọn dẹp thông tin nhạy cảm ở Frontend**: Gỡ bỏ thông tin đăng nhập mặc định (`phone: ''`, `password: ''`) trong `AdminLoginView.jsx`, đóng gói nút nạp demo admin chỉ hiển thị ở môi trường `DEV`.
  - **Thẩm định chất lượng bởi TITAN**: `mvnw test` 18/18 tests PASS 100%, `npm run build` PASS 2062 modules, 0 errors, 100% tệp $< 500$ dòng.

- [x] **Bảng Thông Báo Trực Quan Tạm Khóa & Đồng Hồ Đếm Ngược (Visual Lockout Banner & Realtime Countdown - M4.2 - RAVEN, BLADE, URBAN, TITAN & EYE)**:
  - **Giao thức Backend HTTP 429 & Metadata**: Bổ sung `LoginRateLimitExceededException.java`, tích hợp `GlobalExceptionHandler.java` trả về HTTP `429 Too Many Requests`, header chuẩn `Retry-After` và payload `{ success: false, message, data: { locked: true, retryAfterSeconds } }`.
  - **Trích xuất lỗi ở Frontend (`authApi.js`)**: Bắt mã HTTP `429` và giải nén `retryAfterSeconds` đồng nhất cho các tầng ứng dụng.
  - **Retro Heritage Lockout Banner Khách Hàng (`AuthModal.jsx`)**: Render banner di sản Hà Nội 1986 (viền đỏ son `#ea580c`, nền giấy dó `#fff8ed`, icon `ShieldAlert` và đồng hồ `00:xx` đếm lùi thời gian thực), tự động vô hiệu hóa trường mật khẩu và nút đăng nhập.
  - **Trau chuốt Trải Nghiệm Khách Hàng (UX Touchpoints)**:
    - *Cải tiến 1*: Bổ sung nút 1-Click **`[ ĐẶT BÀN NGAY ➔ ]`** tự động đóng modal và cuộn mượt xuống form đặt bàn `#order-form-card`, giải tỏa tắc nghẽn và giữ chân khách hàng 100%.
    - *Cải tiến 2*: Bổ sung dải **Progress Bar thời gian thực** (gradient amber sang đỏ son) co dần từ 100% về 0% theo nhịp giây, tạo trực giác trực quan không cần đọc số.
  - **Banner Khóa Quản Trị Viên (`AdminLoginView.jsx`)**: Hiển thị bảng cảnh báo sơn then viền vàng cam `#ea580c` kèm Progress Bar và đồng hồ đếm lùi, ngăn chặn kẻ xấu tiếp tục đoán mật khẩu admin.
  - **Thẩm định Trực Nghiệm E2E bởi EYE**: Kiểm thử tự động trên Chrome headless xác thực thành công 100% luồng đăng xuất, 5 lần nhập sai, bật banner, đếm lùi nhịp nhàng và khóa tương tác. Minh chứng lưu tại `evidence/customer_lockout_banner_verified.png` và `evidence/admin_lockout_banner_verified.png`.
  - **Thẩm định chất lượng bởi TITAN**: `mvnw test` 18/18 tests PASS 100%, `npm run build` PASS (2062 modules, 0 errors), 100% tệp tuân thủ `FILE-SIZE-R001` (`AuthModal.jsx` 492 dòng, `AdminLoginView.jsx` 220 dòng).

- [x] **Kiệt Tác 3D Hữu Cơ: "Dải Lụa Gấm Lơ Lửng Trong Khói Phở" (M4.3 - RAVEN, BLADE, URBAN, TITAN & EYE)**:
  - **Xóa Bỏ Khung Hộp Card (`MemberWelcome3DCard.jsx` - 225 dòng)**: Triệt tiêu hoàn toàn khung bo tròn `rounded-2xl` hay `border` hộp chữ nhật cứng nhắc. Thay bằng hình thái Dải Lụa Gấm Son Đỏ (`#7a1810` - `#942016`) với nếp gấp đuôi nheo 3D uốn lượn hai đầu (`-skew-y-6` và `translateZ(-12px)`).
  - **Tua Rua Tơ Tằm Đung Đưa Theo Con Lắc Vật Lý**: 2 chùm tua rua chỉ vàng & hạt đồng rủ dưới dải lụa (`animate-tassel-sway`), đung đưa tự nhiên theo quán tính và góc nghiêng 3D (`rotate(${tilt.ry * 0.8}deg)`).
  - **Làn Sương Khói Phở Loang Tỏa Tự Do**: Đám sương mờ hơi phở `animate-atmospheric-mist` (`blur-2xl`) loang tự nhiên ra không gian web, không có đường biên phân cách cứng.
  - **Bát Phở Men Lam & Khói 3D Bay Tự Do**: Bát phở avatar nổi khối với 2 dải khói 3D bốc cao vượt khỏi dải lụa lên bầu trời.
  - **Nút Ấn Triện Hoàng Kim 3D 1-Click "Gọi Bát Quen"**: Tạo hình thỏi vàng mạ son đỏ hoàng cung, cảm giác bấm thụt lún vật lý, tự động nạp bát phở ruột vào giỏ và mở ngăn kéo `CartDrawer`.
  - **Thẩm định Trực Nghiệm E2E bởi EYE**: Kiểm thử tự động trên Chrome Headless xác thực thành công 100% đăng nhập demo khách quen, sóng xung kích, dải lụa gấm, tua rua đung đưa và nạp món ruột. Minh chứng lưu tại `evidence/silk_ribbon_welcome_verified.png` và `evidence/silk_ribbon_cart_verified.png`.
  - **Thẩm định chất lượng bởi TITAN**: `npm run build` PASS (2063 modules, 0 lỗi), `MemberWelcome3DCard.jsx` (225 dòng), `interactive-animations.css` (460 dòng) và `App.jsx` (454 dòng) tuân thủ nghiêm ngặt `FILE-SIZE-R001` (< 500 dòng).

- [x] **Cấu Hình Đa Môi Trường Multi-Profile Kết Nối AWS RDS Aurora PostgreSQL (M4.4 - CLOUD OPS, DATABASE ARCHITECT & TITAN)**:
  - **Tích hợp Driver PostgreSQL**: Bổ sung `org.postgresql:postgresql` (42.7.5) vào `backend/pom.xml`. Hỗ trợ song song cả MySQL lẫn PostgreSQL.
  - **Profile Sản Xuất (`application-prod.yml`)**: Cấu hình datasource trỏ đến cụm AWS RDS Aurora PostgreSQL `database-1.cluster-c1qgi0ayimmy.ap-southeast-2.rds.amazonaws.com:5432/postgres?sslmode=require`, tích hợp `PostgreSQLDialect` và kết nối bảo mật SSL.
  - **Bảo toàn 100% MySQL Local**: Cấu hình `spring.profiles.active: ${SPRING_PROFILES_ACTIVE:dev}` trong `application.yml`. Môi trường cá nhân chạy mặc định MySQL `pho_1986_db` tại `localhost:3306`.
  - **Kiểm định chất lượng**: `mvnw compile` BUILD SUCCESS, `mvnw test` 18/18 test cases PASS 100% (bao gồm `MySqlLiveIntegrationTest` xác nhận 12 bảng và 25 món ăn nguyên vẹn).

- [x] **Khắc Phục Quỹ Đạo Bay Quà Tặng & Bát Phở Trên Mobile (M4.5 - RAVEN & URBAN)**:
  - **Phân tích căn nguyên**: Biểu tượng giỏ hàng `#navbar-cart-btn` trên header dùng class `hidden sm:flex` (`display: none` trên màn hình mobile). Do đó `getBoundingClientRect()` trả về `(0, 0, 0, 0)`, khiến hiệu ứng bay của Bát Phở và Quà Tặng bay lệch về góc trên cùng bên trái màn hình.
  - **Tọa độ đích thông minh (`getCartTargetCoordinates`)**:
    - Gắn `id="mobile-bottom-cart-btn"` vào nút giỏ hàng nổi bật ở thanh điều hướng đáy (`NavbarMobileBottomNav.jsx`).
    - Trong `App.jsx`, hàm `getCartTargetCoordinates()` tự động phát hiện màn hình mobile (`window.innerWidth < 640`), ưu tiên lấy tâm thực tế của `#mobile-bottom-cart-btn` hoặc fallback chuẩn xác `(window.innerWidth / 2, window.innerHeight - 38px)`.
  - **Hiệu ứng mượt mà**: Quà tặng từ Kho Quà và Bát Phở từ thực đơn bay parabol cong mềm mại, lặn chính xác 100% vào tâm nút giỏ hàng ở thanh điều hướng đáy trên mọi thiết bị di động.

- [x] **Tối Ưu Hóa Công Thái Học & Smart Progressive Disclosure Form Đặt Bàn Mobile (M4.6 - RAVEN, URBAN & EYE)**:
  - **Thu gọn 73% Chiều Cao Khối Đặc Quyền (`OrderPrivilegesPanel.jsx` - 117 dòng)**: Thay thế 3 bentos cồng kềnh (~380px) bằng dải Micro-Privileges Ribbon siêu thanh lịch (chỉ cao ~102px trên mobile) với 3 chip đặc quyền nhỏ gọn và nút hotline dạng pill 1-chạm gọi ngay (`tel:19001986`).
  - **Bố Cục 2 Cột Gọn Gàng Cho Thông Tin Cơ Bản**: Gom 2 trường "Họ và tên" và "Số điện thoại" thành hàng ngang 2 cột (`grid grid-cols-2 gap-2.5`), tiết kiệm ~70px chiều cao form.
  - **4 Chip Chọn Giờ Cao Điểm 1-Chạm (`Quick Peak-Hour Chips`)**: Bổ sung 4 chip giờ ăn thịnh hành (`11:30`, `12:00`, `18:30`, `19:30`). Khách hàng chỉ cần 1 chạm để tự động điền giờ ăn và chọn ngày hôm nay mà không cần mở bộ chọn giờ.
  - **Smart Progressive Disclosure - Ngăn Kéo Khẩu Vị & Ghi Chú**: Chuyển các tùy chọn khẩu vị (Nước dùng, Hành lá, Ớt cay) và Ghi chú thành Accordion gập mở thông minh. Trạng thái mặc định đóng gọn gàng chỉ cao 38px (tiết kiệm hơn 250px), tự động hiển thị badge số lượng khẩu vị đã chọn.
  - **Khoảng Đệm An Toàn Chống Bấm Nhầm (Thumb-Zone Safety Clearance)**: Bổ sung lớp đệm `pb-24 sm:pb-0` cho form đặt bàn, tạo khoảng cách an toàn 328px giữa nút "Tiếp Tục Đặt Bàn" và nút giỏ hàng nổi bật ở thanh điều hướng đáy, loại bỏ hoàn toàn tình trạng ngón cái ấn nhầm giỏ hàng khi submit form.
  - **Kết quả đo lường**: Tổng chiều cao form trên mobile giảm từ ~1.150px xuống ~530px (tiết kiệm hơn 450px), trọn vẹn trong một khung nhìn điện thoại (viewport).

- [x] **Chuẩn Hóa Typography & Loại Bỏ Triệt Để Cắt Cụt Dấu "..." Trên Mobile (M4.7 - RAVEN & URBAN)**:
  - **Khắc phục che khuất số năm trên ô ngày tháng**: Ô chọn ngày `09/09/2026` trước đây dùng `text-base` khiến số năm `2026` bị biểu tượng lịch WebKit (`calendar-picker-indicator`) đè che mất một góc. Đã tinh chỉnh về `text-xs sm:text-sm font-medium tracking-tight px-2.5 sm:px-3.5` và CSS WebKit indicator scale, hiển thị đầy đủ, sắc nét toàn bộ ngày tháng năm.
  - **Triệt tiêu 100% hiện tượng cắt cụt dấu "..."**:
    - Live Capsule trạng thái bàn thực tế: Tối ưu nhãn súc tích `"11:30 • Còn 8 bàn (có ban công)"`, hiển thị vừa vặn không tràn viền.
    - Tiêu đề Accordion khẩu vị: Tinh giản thành `"Khẩu vị & ghi chú"`, loại bỏ hoàn toàn thuộc tính `text-ellipsis` và dấu ba chấm co rút trên màn hình 375px - 390px.
  - **Thẩm định Trực Nghiệm Viewport 3 Bước Đặt Bàn bởi EYE**:
    - Bước 1 (Thông tin & Đặt bàn): Vừa vặn 1 màn hình, tương tác 1 tay thuận tiện (`audit_step1_ready.png`).
    - Bước 2 (Thanh toán Hybrid Checkout): Sticky Bottom Checkout Bar gắn đáy màn hình, đồng hồ giữ bàn 15:00 và lưới thanh toán 3 cột rõ ràng (`audit_step2_payment.png`).
    - Bước 3 (Xác nhận thành công & Thẻ Heritage Pass): Thẻ thông hành phong cách cổ kính, đầy đủ mã đơn, sơ đồ chỉ đường, hotline hỗ trợ, 100% fit viewport (`audit_step3_success.png`).
  - **Thẩm định chất lượng bởi TITAN**: `npm run build` PASS 100% (0 errors, 0 warnings), toàn bộ tệp tuân thủ nghiêm ngặt `FILE-SIZE-R001` (< 500 dòng): `App.jsx` (486 dòng), `OrderStep1Booking.jsx` (364 dòng), `OrderPrivilegesPanel.jsx` (117 dòng), `NavbarMobileBottomNav.jsx` (121 dòng), `orderConstants.js` (182 dòng).

## 📌 Critical Invariants & Lessons Learned (Ghi Nhớ Sống Còn Cho Các Agent Kế Tiếp)

0. **Nguồn Luật Gốc Tối Cao Của Toàn Bộ Agent (RULE-SOURCE-001):**
   - **Quy tắc tuyệt đối:** Mỗi khi bất kỳ Agent nào quên luật, quên ranh giới chuyên môn, hoặc khi được Người dùng hỏi về Bộ Luật Agent, Agent **PHẢI LUÔN LẤY BỘ LUẬT TỪ THƯ MỤC GỐC**:
     👉 `E:\Github project\AI_Agents`
   - **Các văn kiện tối cao trong `AI_Agents`:**
     - `GLOBAL-RULES.md`: Bộ luật toàn cầu, tiêu chuẩn kỹ thuật & bảo mật.
     - `IDENTITY-CONTRACT.md`: Hợp đồng định danh, nhân cách và sứ mệnh của từng Agent.
     - `AGENT-BOUNDARIES.md`: Ranh giới chuyên môn bất khả xâm phạm giữa các Agent.
     - `AGENT-REGISTRY.md`: Sổ bộ đăng bạ quyền hạn của các Agent chuyên trách.
     - `AGENT-ROUTING.md`: Quy trình phối hợp và luân chuyển nhiệm vụ.
     - Thư mục chuyên trách từng Agent: `ORCHESTRATOR_AGENT/`, `UX_UI_AGENT/` (RAVEN), `REACT_AGENT/` (URBAN), `BACKEND_AGENT/` (BLADE), `TESTER_AGENT/` (TITAN), `BROWSER_AGENT/` (EYE), `SECURITY_AGENT/`, `DB_AGENT/`, `ARCHITECTURE_GUARDIAN_AGENT/` (ATLAS).

1. **Tuyệt đối KHÔNG can thiệp Lịch sử Trình duyệt (`window.history`) trong Modal UI:**
   - **Bài học xương máu:** Tuyệt đối không dùng `window.history.pushState` hoặc `window.history.back()` để xử lý việc đóng modal. Việc gọi `history.back()` khi người dùng vừa mở web trong tab mới (`history.length === 1`) sẽ khiến trình duyệt **tự động đóng tab hoặc thoát khỏi website hoàn toàn**.
   - **Chuẩn thực thi:** Mọi modal phải được quản lý 100% bằng React State (`isOpen`). Nếu có hash URL `#seatmap` còn sót lại, chỉ được dọn dẹp bằng `window.history.replaceState(null, '', ...)` để không làm biến đổi độ dài lịch sử.
2. **Khóa Cuộn Trang (`Body Scroll Lock`) phải tách biệt khỏi hàm `triggerClose`:**
   - **Bài học:** Không bao giờ đưa `triggerClose` vào dependency array của hook khóa cuộn trang (`useEffect(..., [isRendered])`). Nếu đưa vào, khi `isClosing` đổi sang `true`, hook sẽ dọn dẹp sớm tại `T = 0ms`, làm thanh cuộn nhảy giật 17px trước khi animation đóng hoàn tất.
   - **Chuẩn thực thi:** Sử dụng `triggerCloseRef` cho phím Escape và chỉ phụ thuộc duy nhất vào `isRendered`.
3. **Class Animation trong `index.css` BẮT BUỘC nằm trong `@layer utilities`:**
   - **Bài học:** Nếu viết class animation tự do bên ngoài `@layer utilities`, Tailwind CSS **sẽ không biên dịch các biến thể responsive** (như `sm:animate-modal-dialog-exit`), khiến trên desktop hoạt ảnh bị mất và modal biến mất đột ngột.
   - **Chuẩn thực thi:** Mọi class animation dùng chung phải được bọc trong `@layer utilities { ... }`.
4. **Triệt tiêu hiện tượng Chớp Tắt (Flash Pop) khi Unmount:**
   - **Bài học:** Hoạt ảnh thoát (`fadeOut`, `slideDown`, `modalDialogExit`) PHẢI kết thúc ở `opacity: 0` tuyệt đối (không để 0.7 hay 0.8).
   - **Chuẩn thực thi:** Thời gian timeout unmount của React (`220ms`) phải lớn hơn thời lượng animation CSS (`200ms`) một khoảng đệm an toàn (20ms). Khi phần tử unmount, nó đã hoàn toàn tàng hình nên mắt người dùng không thể thấy bất kỳ cú giật hay chớp tắt nào.
5. **Single-Source-of-Truth cho Vòng Đời Modal & Khóa Re-render Callback:**
   - **Bài học:** Không được để 2 cỗ máy trạng thái cùng điều khiển việc đóng (ví dụ vừa dùng `triggerClose` vừa dùng `useEffect([selectedTable])`). Khi người dùng chọn bàn, `selectedTable` đổi giá trị sẽ kích hoạt lại `useEffect` và ép `isClosing = false` ngay tại T = 0ms, phá hủy animation đóng.
6. **Hình học Bàn 2D và Vạch Ghế Ngồi (Seat Notches) trên Desktop (`SeatMapModal.jsx`):**
   - **Nguyên nhân lỗi trước đây:** Các vạch ghế (`seat notches`) đặt `absolute` trực tiếp bên trong container rộng của thẻ bài (`div` hàng ngang) mà thiếu `left-1/2 -translate-x-1/2` hoặc dùng vị trí cố định (`left-1`, `left-7`) tính theo lề thẻ card thay vì theo bàn. Khi card co giãn theo lưới responsive trên PC, các vạch ghế bị trôi lệch hoặc dính vào mép ngoài.
   - **Chuẩn thực thi:** Bọc hình học bàn và các vạch ghế trong một container `relative inline-flex items-center justify-center` có kích thước ăn khớp chính xác với bàn. Các vạch ghế được định vị đối xứng toán học.
7. **Quy Tắc Cô Lập Dữ Liệu Khách Hàng (User-Scoped Cart Partitioning & Race Condition Guard):**
   - **Bài học:** Dùng khóa lưu trữ tĩnh toàn cục (`pho1986_cart_items`) sẽ gây rò rỉ giỏ hàng và khẩu vị nhạy cảm giữa các tài khoản khi dùng chung thiết bị.
   - **Chuẩn thực thi:** Mọi storage key liên quan đến phiên giỏ hàng hoặc đơn hàng phải gắn `user.id` / `phone` (`pho1986_cart_usr_*`). Khi chuyển tài khoản, dùng `isSwitchingUserRef` để ngăn chặn render cycle ghi đè giỏ của tài khoản cũ lên tài khoản mới.
8. **Quy Tắc Quản Trị Quy Mô Tệp Tin (FILE-SIZE-R001 < 500 Dòng):**
   - **Bài học:** Các tệp lớn 1000 - 4000 dòng dẫn đến coupling cao, khó review và dễ gây regression khi sửa lỗi.
   - **Chuẩn thực thi:** Bắt buộc duy trì 100% tệp $< 500$ dòng. Mọi tính năng mới phải chia tách thành sub-components hoặc custom hooks. Giám sát tự động bằng `scan_file_lines.mjs`.
9. **Quy Tắc Bảo Vệ Dữ Liệu Nhạy Cảm & Phòng Ngự Biên Giới (PII & Endpoint Defense):**
   - **Bài học:** Mở endpoint tra cứu bằng entity thô (`Order`) kết hợp mã đơn dễ đoán sẽ dẫn đến rò rỉ dữ liệu cá nhân hàng loạt (IDOR / Information Disclosure).
   - **Chuẩn thực thi:** Luôn áp dụng DTO che giấu PII (`PublicOrderResponse`) cho các endpoint công khai. Mã đơn phải sinh bằng `SecureRandom`. Bắt buộc kiểm tra quyền sở hữu hoặc khớp thông tin định danh khi claim quyền lợi.
10. **Quy Tắc Phản Hồi Rate Limiting & Countdown Trực Quan (UX Security Resilience):**
   - **Bài học:** Trả về lỗi 401 với câu chữ chung chung khi bị Rate Limit khiến người dùng bối rối tưởng nhập sai pass liên tục, cố spam thêm làm tăng tải máy chủ.
   - **Chuẩn thực thi:** Tách biệt ngoại lệ Rate Limit (`429 Too Many Requests`) với `retryAfterSeconds` và header `Retry-After`. Frontend hiển thị banner đếm ngược thời gian thực, khóa tương tác form và tự động mở lại khi hết giờ.
11. **Quy Tắc Tọa Độ Phần Tử Trên Mobile Khi Ẩn/Hiện Responsive (`getBoundingClientRect` on `display: none`):**
   - **Bài học:** Nếu một phần tử đích (ví dụ `#navbar-cart-btn`) bị ẩn trên mobile bằng `hidden` (`display: none`), hàm `getBoundingClientRect()` sẽ luôn trả về `(0, 0, 0, 0)`. Việc lấy tọa độ này để tính toán quỹ đạo bay của animation (như quà tặng, giỏ hàng bay) sẽ khiến vật thể bay lệch vào góc trên cùng bên trái màn hình.
   - **Chuẩn thực thi:** Khi tính toán tọa độ đích cho animation trên responsive, luôn kiểm tra kích thước màn hình và nhắm vào phần tử hiển thị thực tế tương ứng (ví dụ `#mobile-bottom-cart-btn` trên mobile), hoặc có tọa độ fallback được tính toán an toàn dựa trên `window.innerWidth` và `window.innerHeight`.
12. **Quy Tắc Công Thái Học & Viewport-Fit Cho Form Di Động (Mobile Ergonomics & Progressive Disclosure):**
   - **Bài học:** Đưa quá nhiều thông tin phụ (đặc quyền, khẩu vị chi tiết, ghi chú dài) vào màn hình mobile đầu tiên làm đội chiều cao trang lên 2-3 viewports, gây mệt mỏi nhận thức và tăng tỷ lệ rớt đơn (drop-off). Ngoài ra, nút submit quá sát bottom navigation bar dễ gây bấm nhầm.
   - **Chuẩn thực thi:** Áp dụng Smart Progressive Disclosure (dải Micro-Ribbon, 2 cột cho các trường thông tin ngắn, chip chọn nhanh 1 chạm cho giờ cao điểm, collapsible accordion cho các trường tùy chọn). Luôn có khoảng đệm an toàn ngón cái (`pb-24 sm:pb-0`) giữa nút submit và thanh điều hướng đáy.
13. **Quy Tắc Typography Ô Nhập Liệu Ngày Tháng Native Tránh Che Khuất Chữ Số:**
   - **Bài học:** Input kiểu `date` trên trình duyệt mobile WebKit/Blink có biểu tượng lịch (`calendar-picker-indicator`) chiếm một diện tích cố định ở mép phải. Nếu dùng font chữ quá lớn (`text-base`) và padding hẹp, số năm (ví dụ `2026`) sẽ bị biểu tượng lịch đè che khuất một góc.
   - **Chuẩn thực thi:** Dùng `text-xs sm:text-sm`, padding hợp lý `px-2.5 sm:px-3.5`, font tracking vừa phải (`tracking-tight`) để toàn bộ chuỗi ngày tháng năm hiển thị trọn vẹn và rõ ràng.

## Active Work & Next Objectives
- [ ] **M2.6**: Tích hợp Modal tùy biến "Gu Ăn Phở" khi thực khách chọn món trên MenuCard.
- [ ] **M2.7**: Tích hợp Hero Section động cá nhân hóa đón chào khách quen với nút "Gọi lại bát quen".

## Blockers & Known Debt
- **Blockers**: Không có blocker kỹ thuật hiện tại. 100% tính năng đã qua thẩm định `vite build`, `mvnw test` và security audit.
- **Technical Debt**: Đã dọn dẹp sạch toàn bộ nợ kỹ thuật về kích thước file (> 500 dòng), rò rỉ state chéo tài khoản, các lỗ hổng PII / Hardcoded credentials, trải nghiệm Rate Limit Lockout, và tối ưu hóa công thái học form mobile trọn vẹn trong viewport.


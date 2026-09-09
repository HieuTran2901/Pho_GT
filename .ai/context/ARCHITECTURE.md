# System Architecture — Phở Gia Truyền 1986

## 1. System Map & Subsystem Boundaries

```text
CLIENT BROWSER (User / Admin)
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (React 18 + Vite) [Branch: main]                   │
│                                                             │
│  Landing Page: Navbar ── Hero ── MenuSection ── CartDrawer  │
│                StorySection ── Testimonials ── OrderSection │
│                                                             │
│  Admin Portal (/admin):                                     │
│     AdminLoginView ◄─── (Route Guard / RBAC)                │
│     AdminPortal (Dashboard KPI, Orders, Dishes, Tables)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST API (Credentials: include)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (Spring Boot 3.4.3 / Java 21) [Branch: master]       │
│                                                             │
│  SecurityFilterChain (JwtAuthFilter, HttpOnly Cookie, RBAC) │
│     │                                                       │
│  Controllers: AuthController, OrderController,              │
│               PaymentController, AdminController            │
│     │                                                       │
│  Services & Repositories: Hibernate / Spring Data JPA       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
                     DATABASE (MySQL 8.0 / H2 Test)
```

## 2. Communication Protocols & Data Invariants
- **Client State & Data Partitioning (User-Scoped Isolation)**:
  - `cartItems`: Quản lý tại root `App.jsx`, đồng bộ vào `CartDrawer`. Phân vùng lưu trữ độc lập theo định danh tài khoản: `pho1986_cart_guest` (khách vãng lai) và `pho1986_cart_usr_${user.id}` (hội viên). Có cơ chế cờ `isSwitchingUserRef` chống race condition lưu đè khi chuyển đổi tài khoản. Tự động dọn dẹp khi tạo đơn thành công qua `onClearCart()`.
  - `orderHistory`: Quản lý qua `useCustomerOrderHistory` và `orderApi.js`. Phân vùng lưu trữ offline theo `getLocalOrdersKey()` (`pho1986_customer_order_history_usr_${uid}`), loại bỏ nguy cơ lộ đơn hàng và khẩu vị cá nhân giữa các user trên thiết bị dùng chung.
  - `favoriteIds`: Lưu trữ bền vững tại `localStorage ('pho_favorites')`.
  - `dragRef`: Tọa độ kéo chuột lưu tại `useRef` bên trong `MenuSection`, không kích hoạt React re-render.
  - `selectedTable`: Quản lý tại `OrderSection.jsx`, đồng bộ 2 chiều với `SeatMapModal` qua Portal (`createPortal(..., document.body)`).
  - `orderSession`: Lưu trữ bền vững tại `sessionStorage` (`pho1986_order_{orderCode}`) để khôi phục form đặt bàn và phương thức thanh toán sau khi redirect từ cổng thanh toán SePay / MoMo.
- **Component Render Boundaries & FILE-SIZE-R001 Standards**:
  - Mọi tệp mã nguồn tuân thủ nghiêm ngặt quy tắc **FILE-SIZE-R001 (< 500 dòng)**:
    - `AdminPortal` tách thành 25 sub-modules chuyên trách trong `src/components/admin/`.
    - `OrderSection` tách thành 7 modules chuyên trách trong `src/components/order/`.
    - `MenuSection` tách thành 7 modules trong `src/components/menu/`.
    - `Navbar` tách thành 5 modules trong `src/components/navbar/`.
    - `PaymentService.java` tách thành các handler chuyên trách (`VietQrHelper`, `SepayIpnHandler`, `MomoIpnHandler`).
  - Mọi section cấp 1 (`Hero`, `MenuSection`, `StorySection`, `Testimonials`, `OrderSection`, `Footer`, `Navbar`, `CartDrawer`) đều có rào chắn `React.memo`.
  - Thẻ món ăn con `MenuCard` bọc `React.memo`, tham chiếu callback `onAdd` và `onToggleLike` là bất biến.
  - `SeatMapModal` render qua React Portal ở root `document.body` để cách ly hoàn toàn khỏi cây DOM của `OrderSection`.
- **Payment Gateway Webhook & Polling Lifecycle**:
  - `visibilitychange`: Tự động gọi API kiểm tra trạng thái thanh toán ngay khi thực khách chuyển từ ứng dụng Mobile Banking / Ví MoMo về lại trình duyệt web.
  - Idempotency guard: `lastProcessedUrlRef` ngăn ngừa thực thi lặp `processReturnUrl` khi khách chuyển hướng từ cổng trực tuyến về web.
  - Polling định kỳ: Chu kỳ 3s tự động kiểm tra trạng thái thanh toán và dừng ngay khi đơn hoàn tất hoặc chuyển tab.
- **API Contracts**:
  - `GET /api/v1/dishes`: Trả về danh sách món phở và danh mục.
  - `POST /api/v1/orders`: Tiếp nhận đặt bàn / giao hàng, payload được validate chặt chẽ.
  - `GET /api/v1/orders/check-payment`: Kiểm tra trạng thái thanh toán đơn hàng theo mã `orderCode`.
  - `GET /api/v1/orders/history`: Lấy lịch sử đơn hàng của tài khoản hội viên.


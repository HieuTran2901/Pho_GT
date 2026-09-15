# Phở Gia Truyền 1986 — Frontend Web Experience

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.14-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-13.2.0-black?logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-0.460.0-F56565)](https://lucide.dev/)
[![Branch](https://img.shields.io/badge/Branch-main-success.svg)](https://github.com/HieuTran2901/Pho_GT)

Giao diện Web tương tác cao cấp tái hiện trọn vẹn phong vị ẩm thực Hà Thành năm 1986 kết hợp cùng kiến trúc ứng dụng Web Reactive hiện đại, mượt mà và tối ưu công thái học (Ergonomics).

---

## 🏮 TRIẾT LÝ THIẾT KẾ & BẢNG MÀU DI SẢN (HERITAGE DESIGN SYSTEM)

Dự án được xây dựng dựa trên sự giao thoa giữa **Mỹ học Cổ truyền Kinh Kỳ** và **Giao diện Người dùng Hiện đại (Modern UI/UX)**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      BẢNG MÀU DI SẢN KINH KỲ 1986                      │
├──────────────┬──────────────┬──────────────┬─────────────┬─────────────┤
│  ĐỎ HUYẾT DỤ │  NGỌC BÍCH   │  ĐỒNG THAU   │  GIẤY ĐIỆP  │ GỖ MUN TRẦM │
│   #96281b    │   #1b3425    │   #d4af37    │   #faf6ef   │   #0c1f17   │
│ (Nước Dùng)  │ (Hành Rau)   │ (Chỉ Dát Vàng│(Bánh Phở Tươi(Khung Sơn Mài│
└──────────────┴──────────────┴──────────────┴─────────────┴─────────────┘
```

- **Mỹ học Sơn Mài & Giấy Điệp**: Tông nền kem ngà gợi nhớ bánh phở tráng thủ công mỗi sớm mai, điểm xuyết sắc đỏ huyết dụ gia truyền và đường viền chỉ đồng thau dát vàng hoài niệm.
- **Công Thái Học Di Động (Mobile-First Ergonomics)**: 100% nút bấm và menu điều hướng được phân bổ chuẩn theo vùng **Natural Thumb Zone** (ngón cái chạm tới dễ dàng mà không cần với tay).
- **GPU Transform 60fps**: Mọi chuyển động mở hộp thoại, bay voucher hay hiệu ứng lướt đều tận dụng CSS Hardware Acceleration và Framer Motion, triệt tiêu hoàn toàn giật lag (`Jank-Free`).

---

## 🍜 TÍNH NĂNG NỔI BẬT (KEY EXPERIENCES)

### 1. Sổ Tay Thực Khách 1986 & Điều Hướng Thông Minh
- **Nút Nổi Viên Ngọc Tràng Tiền**: Định vị chính giữa đáy màn hình (`bottom-center`), tự động xuất hiện êm dịu khi lướt trong thực đơn và tự ẩn khi ra ngoài.
- **Mini Bottom Sheet / Popover Sơn Mài**:
  - Không dùng emoji đơn điệu; thay bằng huy hiệu đồng thau dập nổi tinh xảo.
  - Chuẩn nghiệp vụ ẩm thực F&B: Hiển thị mức giá khởi điểm (`Từ 75.000đ`), đặc trưng hương vị ninh tủy 24h, và badge chất lượng (`🔥 Bestseller`, `⭐ Đệ Nhất 1986`, `🌱 Thanh Ngọt`).
  - Hiệu ứng mở lụa nở hoa (Unfold Bloom) và các dòng danh mục lướt vào so le (`staggerChildren: 35ms`).
- **Điểm Neo Tránh Giật Trang (`#menu-catalog`)**: Nhảy thẳng vào thanh chọn món thay vì giật ngược lên tiêu đề giới thiệu trên cùng.

### 2. Trợ Lý AI Ảo — "Tiểu Nhị 1986" (Heritage AI Chatbox)
- **Tích hợp Trí tuệ Nhân tạo**: Kết nối trực tiếp mô hình Google Gemini qua Spring Boot Backend Service.
- **Giao diện Huân Chương Khắc Triện**: Bát phở đồng bốc khói nghi ngút (`SteamEffect`) với lời chào tao nhã: *"Bác muốn dùng phở gì hôm nay ạ?"*.
- **Nghiệp vụ tức thời**: Gợi ý khẩu vị phở cá nhân hóa (nước trong, nước béo, gầu giòn, hành trần), áp mã ưu đãi và hỗ trợ thêm món vào giỏ hàng 1 chạm (`1-Click Add-to-Cart`).

### 3. Đặt Bàn & Thanh Toán Không Cần Chạm (Zero-Click Payment)
- **VietQR Napas 247 & SePay Webhook**:
  - Khách hàng quét mã QR trên ứng dụng ngân hàng.
  - Ngay khi tiền vào tài khoản, hệ thống **tự động chuyển sang màn hình Vé Lên Tàu Di Sản** trong vòng 1–3 giây mà khách hàng **không cần bấm bất kỳ nút nào**.
- **Cơ Chế Chống Gian Lận (Zero-Trust Anti-Fraud)**: Nút đối soát thời gian thực bảo vệ trạng thái đơn hàng từ máy chủ.
- **Sơ Đồ Bàn Ăn Trực Quan**: Lựa chọn chỗ ngồi thời gian thực (Tầng 1 Phố Cổ, Tầng 2 Ban Công / Gian Tranh / VIP Trúc Lâm).

### 4. Két Quà Tri Kỷ & Hội Viên Thưởng Vị (Loyalty & Gamification)
- **4 Cấp Bậc Bạn Quen**: `Khởi Vị` 🌱 ➔ `Bạn Đũa` 🥢 ➔ `Tri Kỷ` ⚜️ ➔ `Nghệ Nhân` 👑.
- **Quỹ Điểm Tri Kỷ**: Tích lũy và quy đổi voucher thưởng phở, quẩy giòn hoa mai, trứng chần nước béo.
- **Chính Sách Chống Spam Voucher**: Yêu cầu ít nhất 01 món chính trong thực đơn để bảo toàn tính công bằng của chương trình tri ân.
- **Hiệu Ứng Quà Bay Parabolic**: Voucher và trái tim yêu thích bay theo đường cong vật lý parabol rơi thẳng vào tab ví quà.

### 5. Cổng Điều Phối Quản Trị Viên (Admin Diorama Portal)
- Sơ đồ bàn ăn Diorama hiển thị tình trạng bàn trực quan (`Trống`, `Đang phục vụ`, `Bảo trì`).
- Quản lý thực đơn, duyệt đơn hàng và đối soát thanh toán trực tuyến.

---

## 🏛️ CẤU TRÚC MÃ NGUỒN (PROJECT ARCHITECTURE)

```
frontend/src/
├── components/
│   ├── admin/                # Cổng quản trị Diorama, sơ đồ bàn & thống kê
│   ├── chat/                 # Trợ lý ảo "Tiểu Nhị 1986", launcher bát phở bốc khói
│   ├── common/               # Modal, toast di sản, route loading
│   ├── loyalty/              # Két quà Tri Kỷ, voucher flying effect, ví hội viên
│   ├── menu/                 # Thực đơn tinh hoa, thẻ món, Sổ Tay Thực Khách
│   │   ├── DishDetailModal.jsx
│   │   ├── MenuCard.jsx
│   │   ├── MenuFilterBar.jsx
│   │   ├── MenuQuickNavigator.jsx   # Nút nổi danh mục Sổ Tay 1986
│   │   └── useMenuSectionState.js
│   ├── navbar/               # Header di sản, Mobile bottom navigation, drawer
│   ├── order/                # Quy trình đặt bàn 3 bước, thanh toán SePay/VietQR
│   └── seatmap/              # Sơ đồ chỗ ngồi 2 tầng, chọn bàn tương tác
├── context/
│   ├── AuthContext.jsx       # Quản lý phiên xác thực JWT & thông tin hội viên
│   └── CartContext.jsx       # Giỏ hàng, tính giá, voucher validation
├── hooks/                    # Custom hooks (ScrollReveal, AppRouting, Media)
├── services/                 # REST API Clients (menu, order, loyalty, table, chat)
└── utils/                    # Helper tính toán, mã hóa PII, format tiền tệ
```

---

## ⚡ BỘ QUY CHUẨN KỸ THUẬT CỐT LÕI (CORE INVARIANTS)

1. **`FILE-SIZE-R001`**: 100% tệp mã nguồn React (`.jsx`, `.js`) **bắt buộc dưới 500 dòng**. Đảm bảo tính module hóa và dễ bảo trì.
2. **Two-Key Release Gate**: Mã nguồn được kiểm soát độc lập qua 2 cổng:
   - **Cổng An ninh (`SENTINEL`)**: Masking PII số điện thoại (`098****888`), HttpOnly Cookie JWT, Zero Token Leakage.
   - **Cổng Chất lượng (`TITAN`)**: Static Analysis, kiểm tra bộ nhớ re-render, Build Pass.
3. **Data Isolation**: Lưu trữ kép lịch sử đơn hàng trên `sessionStorage` (phiên vé hiện tại) và `localStorage` (theo User ID/Guest).

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY (QUICK START)

### Yêu Cầu Môi Trường
- **Node.js**: Phiên bản 18.x hoặc 20.x trở lên
- **Trình quản lý gói**: `npm` hoặc `pnpm` / `yarn`
- **Backend Service**: Spring Boot 3.4.3 (chạy tại cổng `http://localhost:8080`)

### Các Lệnh Thao Tác

```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Khởi động môi trường phát triển (HMR tức thì)
npm run dev

# 3. Biên dịch bản đóng gói Production
npm run build

# 4. Xem trước bản Production sau khi đóng gói
npm run preview
```

Mặc định máy chủ phát triển sẽ khởi chạy tại: [`http://localhost:5173`](http://localhost:5173)

---

## 📜 GIẤY PHÉP & BẢN QUYỀN

Dự án được xây dựng và bảo tồn bởi **Đội ngũ Công nghệ Phở Gia Truyền 1986**.  
*Mọi giá trị ẩm thực và di sản văn hóa Hà Thành được tôn vinh trọn vẹn trong từng dòng mã nguồn.*

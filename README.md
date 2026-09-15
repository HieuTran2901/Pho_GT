<div align="center">

# 🍜 PHỞ GIA TRUYỀN 1986 — FRONTEND WEB EXPERIENCE
### *Nơi Di Sản Ẩm Thực Hà Thành 1986 Giao Thoa Cùng Công Nghệ Web Hiện Đại*

<br/>

<p align="center">
  <img src="docs/screenshots/hero-showcase.png" alt="Phở Gia Truyền 1986 Web Interface" width="98%" style="border-radius: 16px; box-shadow: 0 20px 45px rgba(0,0,0,0.35); border: 1px solid rgba(212, 175, 55, 0.4);" />
</p>

<br/>

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.14-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-13.2.0-EA4C89?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![VietQR & SePay](https://img.shields.io/badge/Payment-VietQR_Napas_247-005BAA?style=for-the-badge)](https://vietqr.net/)
[![Responsive](https://img.shields.io/badge/Mobile--First-Ergonomic_UX-orange?style=for-the-badge)](https://web.dev/responsive-web-design-basics/)

<br/>

**Phở Gia Truyền 1986** là nền tảng thương mại ẩm thực số cao cấp, chuyển hóa nghệ thuật phở bò Hà Thành gần 40 năm vào giao diện web mượt mà, trực quan và bảo mật. Toàn bộ kiến trúc được xây dựng theo chuẩn **Single Page Application (SPA)** với khả năng phản hồi tức thì dưới 100ms và hiệu ứng chuyển động GPU 60fps không giật lag.

</div>

---

## 🧭 HÀNH TRÌNH TRẢI NGHIỆM GIAO DIỆN (USER JOURNEY SHOWCASE)

Hệ thống được thiết kế theo luồng tương tác khép kín của thực khách: từ lúc bước vào không gian quán, chọn chỗ ngồi yêu thích, tùy biến khẩu vị bát phở, thanh toán tự động cho đến tích điểm thành viên.

---

### 1. Khám Phá Không Gian & Sơ Đồ Bàn Ăn Tương Tác (Interactive Seat Map)
<p align="center">
  <img src="docs/screenshots/seatmap-modal.png" alt="Sơ Đồ Chỗ Ngồi 2 Tầng" width="94%" style="border-radius: 14px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.25);" />
</p>

* **Bản đồ 2 tầng trực quan**: Tầng 1 Phố Cổ nhộn nhịp và Tầng 2 Ban Công ngắm phố, Gian Tranh hoài niệm cùng phòng VIP Trúc Lâm sang trọng.
* **Thời gian thực (Real-time Availability)**: Trạng thái bàn cập nhật tức thì (`Bàn Trống`, `Đang Phục Vụ`, `Đã Đặt`).
* **Hỗ trợ chọn bàn tự động thông minh**: Tính năng xếp bàn nhanh giúp khách nhóm đông người luôn tìm được cụm bàn liền kề phù hợp.

---

### 2. Giỏ Hàng Di Sản & Tùy Biến Khẩu Vị Bát Phở (Customization & Cart Drawer)
<p align="center">
  <img src="docs/screenshots/cart-drawer.png" alt="Giỏ Hàng Di Sản & Tùy Biến Khẩu Vị" width="94%" style="border-radius: 14px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.25);" />
</p>

* **Tùy biến chuẩn vị gia truyền**: Tùy chỉnh độ đậm nước dùng (nước trong thanh tao / nước béo ngậy), độ chín thớ thịt (tái lăn, nạm, gầu giòn), cùng sở thích hành trần, rau thơm hay ớt chưng.
* **Tính năng 1-Click Quick Reorder**: Ghi nhớ bát phở ruột của hội viên quen quán để đặt lại tức thì chỉ với một chạm.
* **Áp dụng Ưu đãi Tri Kỷ**: Tích hợp kiểm tra tính hợp lệ của Voucher tự động, chống lạm dụng mã giảm giá và tính toán số tiền khấu trừ minh bạch.

---

### 3. Cổng Thanh Toán Không Cần Chạm (Zero-Click VietQR Napas 247)
<p align="center">
  <img src="docs/screenshots/vietqr-payment.png" alt="Thanh Toán Tự Động VietQR Napas 247" width="94%" style="border-radius: 14px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.25);" />
</p>

* **Tự động hóa 100% không chạm**: Khách hàng quét mã QR trên ứng dụng của hơn 40 ngân hàng tại Việt Nam. Ngay khi giao dịch thành công, hệ thống tự động xác nhận và xuất **Vé Lên Tàu Di Sản** trong vòng 1–3 giây mà khách hàng không cần bấm nút xác nhận thủ công.
* **Đối soát an toàn (Anti-Fraud Guard)**: Nút kiểm tra giao dịch tức thì giúp tra cứu trạng thái thanh toán trực tiếp từ máy chủ ngân hàng, ngăn chặn hoàn toàn việc chụp ảnh giả mạo.
* **Mã hóa dữ liệu PII**: Số điện thoại và thông tin đơn hàng được bảo vệ và ẩn tự động (`098****888`).

---

### 4. Sổ Tay Khách Quen & Thẻ Hội Viên Tri Kỷ (Loyalty & Gamification)
<p align="center">
  <img src="docs/screenshots/loyalty-cards.png" alt="Két Quà Tri Kỷ & Thẻ Hội Viên 1986" width="94%" style="border-radius: 14px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.25);" />
</p>

* **Hệ thống 4 Hạng Thẻ Bạn Quen**:
  * 🌱 **Khởi Vị**: Tặng đĩa quẩy giòn hoa mai & ghi nhớ khẩu vị riêng.
  * 🥢 **Bạn Đũa**: Tặng trứng gà chần béo & trà lài thơm ngát.
  * ⚜️ **Tri Kỷ**: Ưu tiên vị trí bàn góc phố & tùy biến độ đậm nước dùng.
  * 👑 **Nghệ Nhân**: Bàn danh dự bảo lưu & đặc quyền thưởng phở thố đá Đệ Nhất.
* **Két quà tặng tương tác**: Hiệu ứng quà bay Parabolic thả voucher vào ví thẻ hội viên khi tích đủ điểm thưởng.

---

### 5. Cổng Quản Trị Sơ Đồ Bàn Ăn Thời Gian Thực (Admin Table Management)
<p align="center">
  <img src="docs/screenshots/admin-diorama.png" alt="Cổng Quản Trị Sơ Đồ Bàn Ăn Thời Gian Thực" width="94%" style="border-radius: 14px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.25);" />
</p>

* **Bảng điều phối Diorama 2 tầng**: Cho phép nhân viên nhà hàng theo dõi trực quan vị trí từng bàn, mã vé khách đang ngồi, tổng hóa đơn và thời gian phục vụ.
* **Thao tác nhanh 1 chạm**: Đổi trạng thái bàn, khóa bàn bảo trì hoặc giải phóng bàn ngay sau khi khách hoàn tất dùng bữa.

---

### 6. Tối Ưu Công Thái Học Trên Thiết Bị Di Động (Mobile-First Ergonomics)
<p align="center">
  <img src="docs/screenshots/mobile-ui.png" alt="Giao Diện Di Động Chuẩn Công Thái Học" width="94%" style="border-radius: 14px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.25);" />
</p>

* **Vùng chạm ngón cái tự nhiên (Natural Thumb Zone)**: Toàn bộ nút giỏ hàng, menu điều hướng nhanh và nút gọi món đều nằm ở nửa dưới màn hình di động.
* **Sổ Tay Thực Khách Nổi Chính Giữa**: Nút chọn món nhanh nổi nhẹ nhàng ở đáy màn hình, mở Mini Bottom Sheet dạng lụa lướt êm ái mà không che khuất màn hình hay chatbox.

---

## 🏮 TRIẾT LÝ BẢNG MÀU DI SẢN (HERITAGE DESIGN SYSTEM)

```
┌────────────────────────────────────────────────────────────────────────┐
│                      BẢNG MÀU DI SẢN KINH KỲ 1986                      │
├──────────────┬──────────────┬──────────────┬─────────────┬─────────────┤
│  ĐỎ HUYẾT DỤ │  NGỌC BÍCH   │  ĐỒNG THAU   │  GIẤY ĐIỆP  │ GỖ MUN TRẦM │
│   #96281b    │   #1b3425    │   #d4af37    │   #faf6ef   │   #0c1f17   │
│ (Nước Dùng)  │ (Hành Rau)   │ (Chỉ Dát Vàng│(Bánh Phở Tươi(Khung Sơn Mài│
└──────────────┴──────────────┴──────────────┴─────────────┴─────────────┘
```

* **Đỏ Huyết Dụ (`#96281b`)**: Màu nước phở ninh tủy 24h & dấu triện son 1986 — Ứng dụng cho nút hành động chính (CTA) và nhãn Bestseller.
* **Ngọc Bích Đen (`#0c1f17`)**: Màu then sơn mài & gỗ mun cổ — Ứng dụng cho khung Sổ Tay Thực Khách và nền thanh điều hướng nổi.
* **Đồng Thau Dát Vàng (`#d4af37`)**: Ánh kim dập nổi của đồ đồng Thăng Long — Ứng dụng cho viền thẻ món, hiệu ứng phát sáng nhẹ và icon cao cấp.
* **Giấy Điệp Ngà (`#faf6ef`)**: Sắc trắng ngà của bánh phở tươi tráng thủ công — Ứng dụng cho nền toàn trang, dịu mắt và thanh nhã.

---

## 🏛️ CẤU TRÚC THƯ MỤC DỰ ÁN (PROJECT STRUCTURE)

```
frontend/
├── docs/
│   └── screenshots/          # Toàn bộ hình ảnh thực tế của ứng dụng Web
├── public/                   # Asset tĩnh, logo di sản & biểu tượng PWA
├── src/
│   ├── components/
│   │   ├── admin/            # Cổng quản trị sơ đồ bàn, đơn hàng & thực đơn
│   │   ├── chat/             # Trợ lý ảo "Tiểu Nhị 1986" với hiệu ứng khói bốc
│   │   ├── common/           # Modal, toast thông báo, skeleton loading
│   │   ├── loyalty/          # Két quà Tri Kỷ, ví thẻ hội viên, hiệu ứng quà bay
│   │   ├── menu/             # Thực đơn tinh hoa & Sổ Tay Thực Khách 1986
│   │   ├── navbar/           # Header di sản & Thanh điều hướng đáy di động
│   │   ├── order/            # Quy trình đặt bàn 3 bước & thanh toán VietQR
│   │   └── seatmap/          # Sơ đồ chỗ ngồi 2 tầng tương tác trực quan
│   ├── context/              # Quản lý State toàn cục (AuthContext, CartContext)
│   ├── hooks/                # Custom React hooks (useScrollReveal, useAppRouting)
│   ├── services/             # REST API Client kết nối máy chủ Spring Boot
│   └── utils/                # Helper định dạng tiền tệ, xử lý ảnh & che PII
├── index.html
├── package.json
└── vite.config.js
```

---

## ⚡ CHUẨN MỰC KỸ THUẬT & HIỆU NĂNG

* **Kiến Trúc Module Tinh Gọn**: 100% tệp mã nguồn React duy trì nghiêm ngặt **dưới 500 dòng**, tuân thủ nguyên lý Single Responsibility.
* **Bảo Vệ Dữ Liệu Khách Hàng (PII Privacy)**: Toàn bộ số điện thoại hiển thị công khai đều được che tự động theo định dạng an toàn (`098****888`).
* **Tối Ưu Render Loop $O(1)$**: Sử dụng Set memoized (`favoriteIdsSet`, `addedItemIdsSet`) giúp tra cứu trạng thái yêu thích và giỏ hàng tức thì, triệt tiêu hiện tượng lag giật khi lướt danh sách món dài.
* **Lưu Trữ Phiên Kép (Dual Session Resilience)**: Bảo toàn giỏ hàng và mã đặt bàn đồng thời trên `sessionStorage` (giữ trạng thái khi tải lại trang F5) và `localStorage` (lịch sử đơn hàng cá nhân).

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY (QUICK START)

### Yêu Cầu Môi Trường
- **Node.js**: Phiên bản 18.x hoặc 20.x trở lên
- **Trình quản lý gói**: `npm` hoặc `pnpm` / `yarn`
- **Backend Service**: Spring Boot 3.4.3 (khởi chạy tại `http://localhost:8080`)

### Các Lệnh Thao Tác

```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Khởi động máy chủ phát triển (Hot Module Replacement tức thì)
npm run dev

# 3. Biên dịch đóng gói Production tối ưu
npm run build

# 4. Xem trước bản Production sau khi đóng gói
npm run preview
```

Giao diện phát triển mặc định sẵn sàng tại: [`http://localhost:5173`](http://localhost:5173)

---

<div align="center">

### 🥢 PHỞ GIA TRUYỀN 1986 — GÌN GIỮ TINH HOA ẨM THỰC VIỆT
*Chế tác với tất cả tâm huyết dành cho văn hóa ẩm thực truyền thống và trải nghiệm người dùng hiện đại.*

</div>

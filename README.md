<div align="center">

# 🍜 PHỞ GIA TRUYỀN 1986 — FRONTEND WEB APPLICATION
### *Digital Dining Platform & Real-Time Table Reservation Experience*

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

A modern fullstack food-commerce Single Page Application (SPA) providing real-time 2-floor table reservation, customized dining ordering, automated bank transfer webhook checkout, and member loyalty vaults.

[Live Demo](https://pho-gt.vercel.app) • [API Documentation](#-core-rest-api-integration) • [Architecture Highlights](#-key-engineering-challenges--solutions)

</div>

---

## 🌐 LIVE DEMO & TEST CREDENTIALS

| Environment | URL | Test Account | Role |
|---|---|---|---|
| **Production Staging** | [`https://pho-gt.vercel.app`](https://pho-gt.vercel.app) | `0987654321` (OTP: `198686`) | Customer |
| **Admin Portal** | [`https://pho-gt.vercel.app/#admin`](https://pho-gt.vercel.app/#admin) | `admin@pho1986.vn` / `admin123` | Store Manager |
| **Local Development** | [`http://localhost:5173`](http://localhost:5173) | Seeded via `DataInitializer.java` | All Roles |

---

## 🧭 USER JOURNEY & TECHNICAL BREAKDOWN

The application coordinates the complete customer dining lifecycle across 6 distinct engineering modules:

---

### 1. Interactive 2-Floor Seat Map & Table Hold
<p align="center">
  <img src="docs/screenshots/seatmap-modal.png" alt="Sơ Đồ Chỗ Ngồi 2 Tầng" width="94%" style="border-radius: 14px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.25);" />
</p>

| Technical Dimension | Implementation Details |
|---|---|
| **Core Components** | `src/components/SeatMapModal.jsx`, `src/components/seatmap/TableCard.jsx` |
| **State & API** | `tableApi.getAllTables()`, dynamic polling interval (`3000ms`), optimistic selection state |
| **Key Challenge** | **Race Condition Prevention**: Prevents double-booking when multiple users open the seat map concurrently. Tables transition to `RESERVED` with a 15-minute TTL lock upon order draft creation. |
| **Styling Strategy** | Responsive CSS Grid layout accommodating 2 floors (Floor 1: Street dining, Floor 2: Balcony & VIP suites) down to 320px mobile viewports. |

---

### 2. Dish Customization & Cart Drawer
<p align="center">
  <img src="docs/screenshots/cart-drawer.png" alt="Giỏ Hàng Di Sản & Tùy Biến Khẩu Vị" width="94%" style="border-radius: 14px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.25);" />
</p>

| Technical Dimension | Implementation Details |
|---|---|
| **Core Components** | `src/components/CartDrawer.jsx`, `src/context/CartContext.jsx` |
| **State & Storage** | Local state synchronized to `localStorage` under isolated key `pho1986_cart_usr_${userId}` |
| **Key Challenge** | **Anti-Voucher Abuse Invariant**: Enforces a strict validation policy requiring at least 01 main dish before discount vouchers can be applied, eliminating single-beverage or side-dish voucher exploitation. |
| **Performance** | Memoized cart totals (`totalAmount`, `discountAmount`, `finalAmount`) computed via `useMemo` to prevent unnecessary DOM re-renders. |

---

### 3. Zero-Click VietQR Napas 247 Automated Checkout
<p align="center">
  <img src="docs/screenshots/vietqr-payment.png" alt="Thanh Toán Tự Động VietQR Napas 247" width="94%" style="border-radius: 14px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.25);" />
</p>

| Technical Dimension | Implementation Details |
|---|---|
| **Core Components** | `src/components/order/OrderStep3QrPayment.jsx`, `src/components/order/OrderStep3Success.jsx` |
| **Payment Gateway** | VietQR dynamic payload generation (EMVCo compliant) + SePay IPN Webhook integration |
| **Key Challenge** | **Zero-Click Transition**: Automatically polls `/api/v1/payments/status/{code}` every 2.5s. As soon as the bank transmits payment webhook confirmation, the UI transitions to the ticket confirmation screen without user click. |
| **Security & Anti-Fraud** | On-demand "Verify Transaction" trigger performs an immediate server-side state lookup, preventing client-side inspection spoofing. |

---

### 4. Loyalty Gamification & Customer Gift Vault
<p align="center">
  <img src="docs/screenshots/loyalty-cards.png" alt="Két Quà Tri Kỷ & Thẻ Hội Viên 1986" width="94%" style="border-radius: 14px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.25);" />
</p>

| Technical Dimension | Implementation Details |
|---|---|
| **Core Components** | `src/components/loyalty/GiftVaultModal.jsx`, `src/components/loyalty/FlyingRedeemedVoucher.jsx` |
| **Tier Calculation** | Client-side tier thresholds matching backend service (Bronze, Silver, Gold, Diamond) |
| **Animation Engine** | Framer Motion parabolic trajectory curve animating voucher redemption directly into the member wallet tab. |
| **Data Privacy** | All member phone numbers and identification numbers are sanitized with PII masking (`098****888`). |

---

### 5. Real-Time Admin Diorama Table Management
<p align="center">
  <img src="docs/screenshots/admin-diorama.png" alt="Cổng Quản Trị Sơ Đồ Bàn Ăn Thời Gian Thực" width="94%" style="border-radius: 14px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.25);" />
</p>

| Technical Dimension | Implementation Details |
|---|---|
| **Core Components** | `src/components/admin/AdminPortal.jsx`, `src/components/admin/tabs/AdminTablesTab.jsx` |
| **Operations** | Live table occupancy tracking, order code linking, manual table release, maintenance toggle |
| **Authorization** | Protected route verifying JWT role claim (`ADMIN`) backed by HttpOnly cookie authorization. |

---

### 6. Mobile-First Ergonomics & Quick Category Navigator
<p align="center">
  <img src="docs/screenshots/mobile-ui.png" alt="Giao Diện Di Động Chuẩn Công Thái Học" width="94%" style="border-radius: 14px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.25);" />
</p>

| Technical Dimension | Implementation Details |
|---|---|
| **Core Components** | `src/components/menu/MenuQuickNavigator.jsx`, `src/components/navbar/NavbarMobileBottomNav.jsx` |
| **Ergonomics** | **Natural Thumb Zone**: Controls anchored at bottom center (`bottom-[74px] left-1/2 -translate-x-1/2`), easily reachable with one hand on mobile devices without overlapping the bottom navigation or chat launcher. |
| **Smooth Navigation** | `#menu-catalog` anchor offset calculation prevents header jump; category tab auto-centers on active section via ScrollSpy. |

---

## ⚡ KEY ENGINEERING CHALLENGES & SOLUTIONS

### 1. Dual-Storage Session Resilience
- **Problem**: When a customer refreshes (F5) during payment or ticket viewing, naive single-page applications lose transient order state, dumping the user back to step 1.
- **Solution**: Implemented a two-tier storage strategy:
  - `sessionStorage`: Stores active booking ticket code (`pho1986_order_session_${code}`) allowing seamless refresh recovery.
  - `localStorage`: Stores permanent customer order history segmented by authenticated User ID (`pho1986_customer_order_history_usr_${uid}`) or guest mode (`_guest`), ensuring zero data collision across accounts on shared devices.

### 2. Render Pipeline & Memory Optimization
- **Problem**: Long menu catalogs with 20+ dishes, frequent cart updates, and favorite toggles can trigger cascading re-renders across the whole page.
- **Solution**:
  - Replaced $O(N)$ array `.find()` / `.some()` checks with memoized `Set` lookups ($O(1)$) for `favoriteIdsSet` and `addedItemIdsSet`.
  - Wrapped heavy sub-trees with `React.memo` and extracted complex logic into isolated custom hooks (`useMenuSectionState.js`, `useOrderSectionState.js`, `useGiftVaultState.js`).

### 3. IETF RFC 6819 Security Transport
- **Problem**: Storing JWT access/refresh tokens in browser `localStorage` leaves sessions vulnerable to Cross-Site Scripting (XSS) extraction.
- **Solution**: Access and refresh tokens are strictly scoped to **HttpOnly + SameSite=Lax Cookies**, completely inaccessible to client-side JavaScript (`document.cookie`), neutralizing token theft vectors.

---

## 🏛️ PROJECT DIRECTORY STRUCTURE

```
frontend/
├── docs/
│   └── screenshots/          # High-resolution application UI screenshots
├── public/                   # Static assets, manifests, icons
├── src/
│   ├── components/
│   │   ├── admin/            # Diorama table manager, order moderation, menu CRUD
│   │   ├── chat/             # AI dining assistant ("Tiểu Nhị 1986") with steam effect
│   │   ├── common/           # Accessible modals, toasts, route loading indicators
│   │   ├── loyalty/          # Member tier progression, gift ledger, flying voucher
│   │   ├── menu/             # Menu catalog, detail sheets, MenuQuickNavigator
│   │   ├── navbar/           # Heritage top navbar & mobile bottom navigation rail
│   │   ├── order/            # 3-step checkout flow, VietQR dynamic payment
│   │   └── seatmap/          # 2-floor interactive table reservation modal
│   ├── context/              # Global state providers (AuthContext, CartContext)
│   ├── hooks/                # Reusable hooks (useScrollReveal, useAppRouting)
│   ├── services/             # Axios/Fetch API clients (auth, order, table, payment)
│   └── utils/                # Currency formatters, PII masking, table helpers
├── index.html
├── package.json
└── vite.config.js
```

---

## 🛠️ LOCAL SETUP & VERIFICATION

### Prerequisites
- **Node.js**: `v18.x` or `v20.x+`
- **Package Manager**: `npm` / `pnpm` / `yarn`
- **Backend API**: Spring Boot running on `http://localhost:8080`

### Step-by-Step Installation
```bash
# 1. Clone repository
git clone git@github.com:HieuTran2901/Pho_GT.git
cd Pho_GT/frontend

# 2. Install dependencies
npm install

# 3. Launch local Vite development server
npm run dev

# 4. Compile optimized production build
npm run build

# 5. Preview production bundle
npm run preview
```

The application will be accessible at: [`http://localhost:5173`](http://localhost:5173)

---

## 📄 LICENSE

Developed and maintained by **Hieu Tran** — Software Engineering Portfolio Project.
All rights reserved.

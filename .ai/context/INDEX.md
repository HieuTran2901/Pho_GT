# Project Index — Phở Gia Truyền 1986

## Identity & Mission
- **Project**: Phở Gia Truyền 1986 (Website trải nghiệm & đặt món phở gia truyền).
- **Architecture**: Dual-Root Repository (Frontend `main`, Backend `master`).
- **Target Audience**: Thực khách yêu ẩm thực truyền thống Hà Nội, đặt bàn & gọi giao hàng.

## Active Status
- **Current Phase**: Phase 4 — Hoàn Thiện Trải Nghiệm Khách Hàng, Tối Ưu State & Tối Ưu Hóa Công Thái Học Mobile.
- **Active Milestone**: M4.7 — Chuẩn Hóa Typography & Loại Bỏ Triệt Để Cắt Cụt Dấu "..." Trên Mobile.
- **Context Version**: 2.3.0

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS 3, Lucide React, Framer Motion.
- **Backend**: Spring Boot 3.4.3 (Java 21), Spring Security, JWT HttpOnly Cookie, VietQR Napas, SePay Checkout, MoMo, Hibernate/JPA.
- **Database**: MySQL 8.0 (H2 fallback for tests).

## Critical Invariants & Constraints
0. **MASTER AGENT GOVERNANCE & SOURCE OF TRUTH (RULE-SOURCE-001)**: Toàn bộ bộ luật gốc, quy chế ranh giới chuyên môn (`AGENT-BOUNDARIES.md`), hợp đồng định danh (`IDENTITY-CONTRACT.md`), điều phối luồng (`AGENT-ROUTING.md`) và quy chuẩn chung (`GLOBAL-RULES.md`) của tất cả các Agent được lưu trữ tối cao tại thư mục: `E:\Github project\AI_Agents`. Mỗi khi bất kỳ Agent nào quên luật hoặc khi được Người dùng hỏi về Bộ Luật Agent, Agent **PHẢI LUÔN LẤY BỘ LUẬT TỪ `E:\Github project\AI_Agents`**.
1. **Frontend Branch**: Toàn bộ mã nguồn giao diện lưu tại nhánh `main`, thư mục `frontend/`.
2. **Backend Branch**: Toàn bộ mã nguồn dịch vụ máy chủ lưu tại nhánh `master`, thư mục `backend/`.
3. **FILE-SIZE-R001**: 100% tệp mã nguồn (Frontend & Backend) BẮT BUỘC có độ dài **dưới 500 dòng**, module hóa rõ ràng, kiểm tra tự động qua `scan_file_lines.mjs`.
4. **User Data Isolation**: Mọi dữ liệu giỏ hàng (`pho1986_cart_usr_*`) và lịch sử offline (`pho1986_customer_order_history_usr_*`) phải được phân vùng độc lập theo User ID/Phone; tuyệt đối không rò rỉ chéo khi đổi tài khoản.
5. **No Cross-Domain Hijacking**: Mỗi Agent (RAVEN, URBAN, BLADE, SENTINEL, TITAN) tuân thủ ranh giới domain nghiêm ngặt theo `E:\Github project\AI_Agents\AGENT-BOUNDARIES.md`.
6. **Verified Performance**: Frontend duy trì 60-120fps, zero passive re-renders, 100% async cleanup.
7. **No Blind Full Rescan**: Mọi phân tích mã nguồn phải thông qua `@guard` với Git blob fingerprints.
8. **PII Masking & Threat Defense**: Dữ liệu PII (SĐT, địa chỉ) bắt buộc phải che giấu trên API công khai; mã đơn sinh bằng `SecureRandom`; claim đơn phải khớp số điện thoại người đặt.

## Context Directory Map
- `STATE.md`: Trạng thái năng lực đã xác minh, 18 mốc năng lực và bài học sống còn.
- `ARCHITECTURE.md`: Bản đồ luồng dữ liệu, phân vùng giỏ hàng, phân tầng frontend/backend và giao thức tương tác.
- `FILE-INDEX.md`: Bảng tổng hợp trạng thái xử lý từng tệp theo `PATH | AGENT | SCOPE`.

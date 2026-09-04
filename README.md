# Phở Việt — Backend Service

Thư mục chứa mã nguồn tầng Backend cho dự án Phở Gia Truyền 1986.

## Trách nhiệm dự kiến

1. **REST APIs (@backend):**
   - `GET /api/dishes`: Danh mục và danh sách món ăn.
   - `GET /api/dishes/:id`: Chi tiết món ăn và topping.
   - `POST /api/orders`: Tiếp nhận đơn đặt bàn hoặc giao hàng.

2. **Cơ sở dữ liệu (@db):**
   - Quản lý bảng món ăn, danh mục, đơn hàng.

3. **Bảo mật (@security):**
   - Rate limiting, chống spam form, cấu hình CORS an toàn với Frontend.

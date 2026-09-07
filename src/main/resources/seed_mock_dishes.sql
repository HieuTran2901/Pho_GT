-- ==============================================================================
-- PHỞ GIA TRUYỀN 1986 - SEED DATA 25 MÓN ĂN GIA TRUYỀN ĐA DẠNG & 100% ẢNH ĐỘC BẢN
-- Tự động dọn dẹp các món ảnh lỗi (/images/...) và thiếu nội dung
-- Đảm bảo 25/25 món có 25 hình ảnh Unsplash ĐỘC LẬP, KHÔNG TRÙNG LẶP (Đã kiểm tra HTTP 200)
-- Bảng mã: utf8mb4 | Idempotent (ON DUPLICATE KEY UPDATE)
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. ĐẢM BẢO 4 DANH MỤC CỐT LÕI
INSERT INTO categories (id, name, slug, display_order, created_at)
VALUES 
  ('cat-pho-bo-1986', 'Phở Bò Truyền Thống', 'pho-bo-truyen-thong', 1, NOW()),
  ('cat-pho-ga-1986', 'Phở Gà Ta Chọn Lọc', 'pho-ga-ta', 2, NOW()),
  ('cat-mon-kem-1986', 'Món Ăn Kèm Chuẩn Vị', 'mon-an-kem', 3, NOW()),
  ('cat-do-uong-1986', 'Giải Khát & Trà Hà Nội', 'do-uong', 4, NOW())
ON DUPLICATE KEY UPDATE 
  name = VALUES(name),
  display_order = VALUES(display_order);

-- 2. XÓA TRIỆT ĐỂ CÁC MÓN ĂN LỖI ẢNH, THIẾU NỘI DUNG HOẶC THỬ NGHIỆM TRÙNG LẶP
DELETE FROM dishes 
WHERE image_url LIKE '/images/%' 
   OR portion IS NULL 
   OR tag IS NULL 
   OR description IS NULL 
   OR description = ''
   OR slug LIKE 'pho-bo-tai-lan-truc-chuan-sentinel%'
   OR slug LIKE 'pho-uoi-bo-tho-a-1986%'
   OR slug LIKE 'pho-ga-oi-chat%'
   OR slug LIKE 'tra-a-giai-khat%'
   OR slug LIKE 'pho-bo-tai-lan-hoang-gia%';

-- 3. NẠP 25 MÓN ĂN PHONG PHÚ ĐA DẠNG (100% ẢNH ĐỘC BẢN KHÔNG TRÙNG LẶP)

-- ==============================================================================
-- NHÓM 1: PHỞ BÒ TRUYỀN THỐNG (6 MÓN ĐỘC BẢN)
-- ==============================================================================

-- 1. Phở Bò Tái Lăn Hà Nội
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-01-pho-bo-tai-lan-hn',
  (SELECT id FROM categories WHERE slug = 'pho-bo-truyen-thong' LIMIT 1),
  'Phở Bò Tái Lăn Hà Nội',
  'pho-bo-tai-lan-ha-noi',
  65000,
  'Tô thường',
  'Best Seller',
  'star',
  'Bò tươi thái mỏng, Bánh phở tươi tráng tay, Hành hoa & ngò gai, Nước dùng ninh 24h',
  'Thịt bò tươi xào lăn nhanh tay trên chảo gang lửa lớn với tỏi thơm nức, giữ trọn độ mềm ngọt tự nhiên, hòa quyện trong nước dùng thanh trong.',
  'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
  1, 0, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 2. Phở Bò Tái Nạm Giòn
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-02-pho-bo-tai-nam-gion',
  (SELECT id FROM categories WHERE slug = 'pho-bo-truyen-thong' LIMIT 1),
  'Phở Bò Tái Nạm Giòn',
  'pho-bo-tai-nam-gion',
  60000,
  'Tô thường',
  'Đậm Vị!',
  'flame',
  'Thịt bò tái tơ, Nạm giòn hoa văn, Bánh phở mềm mượt, Nước dùng trong vắt',
  'Sự kết hợp hoàn hảo giữa vị ngọt mềm của thịt bò tái nhúng vừa tới và độ giòn sần sật, thơm ngậy của nạm bò hoa hảo hạng.',
  'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=800&q=80',
  1, 0, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 3. Phở Tái Bắp Bò Hoa
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-03-pho-tai-bap-bo-hoa',
  (SELECT id FROM categories WHERE slug = 'pho-bo-truyen-thong' LIMIT 1),
  'Phở Tái Bắp Bò Hoa',
  'pho-tai-bap-bo-hoa',
  70000,
  'Tô thường',
  'Hảo Hạng',
  'star',
  'Bắp bò hoa tươi, Bánh phở tráng tay, Gừng nướng hạ thổ, Nước dùng trong vắt',
  'Bắp bò hoa thái mỏng trần tái giữ trọn vị ngọt đậm đà, thớ thịt gân giòn sần sật hòa quyện trong nước dùng ninh 24h.',
  'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80',
  1, 0, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 4. Phở Bò Tái Gầu Giòn
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-04-pho-bo-tai-gau-gion',
  (SELECT id FROM categories WHERE slug = 'pho-bo-truyen-thong' LIMIT 1),
  'Phở Bò Tái Gầu Giòn',
  'pho-bo-tai-gau-gion',
  65000,
  'Tô thường',
  'Béo Ngậy',
  'flame',
  'Gầu giòn hảo hạng, Thịt tái mềm, Hành lá tươi, Nước dùng thanh',
  'Gầu bò hoa luộc chín tới thơm giòn béo ngậy kết hợp thịt bò tái mềm mọng nước, chan nước dùng thanh ngọt tủy xương.',
  'https://images.unsplash.com/photo-1503764654157-72d979d9af2f?auto=format&fit=crop&w=800&q=80',
  1, 0, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 5. Phở Bò Chín Nạm Gân Trong
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-05-pho-bo-chin-nam-gan',
  (SELECT id FROM categories WHERE slug = 'pho-bo-truyen-thong' LIMIT 1),
  'Phở Bò Chín Nạm Gân Trong',
  'pho-bo-chin-nam-gan-trong',
  65000,
  'Tô thường',
  'Truyền Thống',
  'leaf',
  'Nạm chín mềm thơm, Gân bò dẻo giòn, Bánh phở tươi, Quế hồi thảo mộc',
  'Thịt nạm bò thái lát bản to luộc chín mềm thơm nức mũi, kết hợp miếng gân bò ninh trong dẻo giòn sần sật đậm đà.',
  'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=800&q=80',
  1, 0, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 6. Phở Bò Tái Lăn Tỏi Tươi Hạ Thổ
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-06-pho-tai-lan-toi-tuoi',
  (SELECT id FROM categories WHERE slug = 'pho-bo-truyen-thong' LIMIT 1),
  'Phở Bò Tái Lăn Tỏi Tươi Hạ Thổ',
  'pho-bo-tai-lan-toi-tuoi-ha-tho',
  70000,
  'Tô thường',
  'Đặc Sản',
  'flame',
  'Bò tơ tươi thái lát, Tỏi nếp đập dập, Tiêu rừng giã tay, Hành hoa tươi',
  'Thịt bò tơ xào cùng tỏi nếp đập dập trên chảo lửa lớn bốc khói ngùn ngụt, dậy mùi hương thơm đặc trưng của phở xào lăn phố cổ.',
  'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=800&q=80',
  1, 0, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);


-- ==============================================================================
-- NHÓM 2: MÓN ĐẶC BIỆT & THỐ ĐÁ SÔI SÙNG SỤC (6 MÓN ĐỘC BẢN - IS_SIGNATURE = 1)
-- ==============================================================================

-- 7. Phở Đặc Biệt — Bát Đầy Đủ
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-07-pho-dac-biet-bat-day-du',
  (SELECT id FROM categories WHERE slug = 'pho-bo-truyen-thong' LIMIT 1),
  'Phở Đặc Biệt — Bát Đầy Đủ',
  'pho-dac-biet-bat-day-du',
  85000,
  'Tô lớn',
  'Signature',
  'leaf',
  'Tái, Nạm, Gầu, Gân, Bò viên, Trứng chần lòng đào, Hành củ chần, Nước béo',
  'Tinh hoa tụ hội: Tái, chín nạm thơm béo, gầu giòn sần sật, gân bò dẻo quánh cùng viên bò hảo hạng và quả trứng chần lòng đào béo ngậy.',
  'https://images.unsplash.com/photo-1631709497146-a239ef373cf1?auto=format&fit=crop&w=800&q=80',
  1, 1, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 8. Phở Bò Sốt Vang Cổ Truyền
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-08-pho-bo-sot-vang-co-truyen',
  (SELECT id FROM categories WHERE slug = 'pho-bo-truyen-thong' LIMIT 1),
  'Phở Bò Sốt Vang Cổ Truyền',
  'pho-bo-sot-vang-co-truyen',
  75000,
  'Tô thường',
  'Gia Truyền',
  'sparkles',
  'Bắp bò hoa, Gia vị sốt vang thảo mộc, Rau mùi tàu, Ớt tươi',
  'Bắp bò hầm mềm rục cùng rượu vang đỏ, hoa hồi, quế chi và cà chua bi, tạo nên màu nước dùng hổ phách sánh óng ánh và hương thơm nồng nàn.',
  'https://images.unsplash.com/photo-1576777647209-e8733d7b851d?auto=format&fit=crop&w=800&q=80',
  1, 1, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 9. Phở Thố Đá Núi Lửa Sôi Sùng Sục
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-09-pho-tho-da-nui-lua',
  (SELECT id FROM categories WHERE slug = 'pho-bo-truyen-thong' LIMIT 1),
  'Phở Thố Đá Núi Lửa Sôi Sùng Sục',
  'pho-tho-da-nui-lua-soi-sung-suc',
  95000,
  'Thố đá nóng',
  'Đỉnh Cao',
  'flame',
  'Thịt bò hảo hạng, Thố đá giữ nhiệt 300°C, Trứng gà ta, Nước dùng cốt bò',
  'Nước dùng sôi sùng sục trong thố đá nóng 300 độ C, giữ nhiệt suốt bữa ăn; thực khách tự tay nhúng thịt bò tươi và bánh phở.',
  'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
  1, 1, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 10. Phở Đuôi Bò Thố Đá Gia Truyền 1986
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-10-pho-duoi-bo-tho-da',
  (SELECT id FROM categories WHERE slug = 'pho-bo-truyen-thong' LIMIT 1),
  'Phở Đuôi Bò Thố Đá Gia Truyền 1986',
  'pho-duoi-bo-tho-da-gia-truyen-1986',
  95000,
  'Thố đá nóng',
  'Best Seller',
  'star',
  'Đuôi bò hầm thảo mộc, Thố đá giữ nhiệt 300°C, Bánh phở tươi, Hành củ chần',
  'Từng khúc đuôi bò hầm thảo mộc mềm nhừ tan trong miệng, nước dùng sánh đậm tủy ngậy sôi ùng ục trong thố đá giữ nhiệt.',
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  1, 1, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 11. Phở Sườn Bò Rút Xương Sốt Vang
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-11-pho-suon-bo-sot-vang',
  (SELECT id FROM categories WHERE slug = 'pho-bo-truyen-thong' LIMIT 1),
  'Phở Sườn Bò Rút Xương Sốt Vang',
  'pho-suon-bo-rut-xuong-sot-vang',
  90000,
  'Tô lớn',
  'Thượng Hạng',
  'sparkles',
  'Dẻ sườn bò rút xương, Sốt vang thảo mộc, Bánh phở tươi tráng tay, Mùi tàu thái chỉ',
  'Dẻ sườn bò tơ rút xương hầm nhừ cùng rượu vang đỏ và ngũ vị thảo mộc, thớ thịt đậm đà, nước sốt sánh màu hổ phách.',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  1, 1, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 12. Phở Tủy Bò & Bắp Hoa Thố Đá
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-12-pho-tuy-bo-bap-hoa',
  (SELECT id FROM categories WHERE slug = 'pho-bo-truyen-thong' LIMIT 1),
  'Phở Tủy Bò & Bắp Hoa Thố Đá',
  'pho-tuy-bo-bap-hoa-tho-da',
  98000,
  'Thố đá nóng',
  'Độc Bản',
  'flame',
  'Tủy bò béo ngậy, Bắp hoa tươi thái mỏng, Thố đá núi lửa, Nước dùng cốt xương 24h',
  'Món phở thố đá xa xỉ tụ hội tủy bò bổ dưỡng béo ngậy tan trên đầu lưỡi và bắp hoa giòn ngọt, giữ nóng sôi bỏng tới giọt cuối cùng.',
  'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
  1, 1, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);


-- ==============================================================================
-- NHÓM 3: PHỞ GÀ ĐỒI TA (6 MÓN ĐỘC BẢN)
-- ==============================================================================

-- 13. Phở Gà Đồi Chặt Lá Chanh
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-13-pho-ga-doi-chat-la-chanh',
  (SELECT id FROM categories WHERE slug = 'pho-ga-ta' LIMIT 1),
  'Phở Gà Đồi Chặt Lá Chanh',
  'pho-ga-doi-chat-la-chanh',
  60000,
  'Tô thường',
  'Món Mới',
  'leaf',
  'Thịt gà đồi da vàng, Lá chanh tươi, Hành hoa tỉa, Nước dùng gà ngọt thanh',
  'Thịt gà đồi ta thả vườn chắc thịt, da vàng ươm giòn sần sật, thái thớ đượm hương thơm thanh thoát của lá chanh tươi thái chỉ.',
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  1, 0, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 14. Phở Đùi Gà Rút Xương
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-14-pho-dui-ga-rut-xuong',
  (SELECT id FROM categories WHERE slug = 'pho-ga-ta' LIMIT 1),
  'Phở Đùi Gà Rút Xương',
  'pho-dui-ga-rut-xuong',
  70000,
  'Tô lớn',
  'Được Yêu Thích',
  'star',
  'Đùi gà ta nguyên chiếc, Gia vị chấm truyền thống, Nước dùng thảo mộc',
  'Nguyên chiếc đùi gà góc phần tư vàng óng ả, rút xương khéo léo, thịt mọng nước ngọt đậm đà chấm cùng muối tiêu ớt chanh ớt gió Hà Giang.',
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
  1, 0, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 15. Phở Gà Xé Lòng Trứng Non
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-15-pho-ga-xe-long-trung-non',
  (SELECT id FROM categories WHERE slug = 'pho-ga-ta' LIMIT 1),
  'Phở Gà Xé Lòng Trứng Non',
  'pho-ga-xe-long-trung-non',
  75000,
  'Tô lớn',
  'Đặc Sắc',
  'sparkles',
  'Gà đồi xé phay, Chùm trứng non, Lòng mề rim, Lá chanh tươi',
  'Thịt ức và đùi gà xé phay bùi ngọt, kèm chùm trứng non vàng ươm béo ngậy và bộ lòng mề gà rim thơm nức mũi.',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  1, 0, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 16. Phở Gà Trộn Chua Ngọt Hà Thành
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-16-pho-ga-tron-chua-ngot',
  (SELECT id FROM categories WHERE slug = 'pho-ga-ta' LIMIT 1),
  'Phở Gà Trộn Chua Ngọt Hà Thành',
  'pho-ga-tron-chua-ngot-ha-thanh',
  65000,
  'Tô thường',
  'Món Hot',
  'star',
  'Gà đồi xé, Sốt trộn bí truyền, Lạc rang & hành phi, Rau thơm các loại',
  'Bánh phở mềm trộn sốt tương ớt chua ngọt gia truyền, thịt gà đồi xé, lạc rang giòn bùi và hành phi vàng ruộm.',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  1, 0, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 17. Phở Gà Đồi Châm Muối Tiêu Ớt Gió
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-17-pho-ga-doi-muoi-tieu',
  (SELECT id FROM categories WHERE slug = 'pho-ga-ta' LIMIT 1),
  'Phở Gà Đồi Châm Muối Tiêu Ớt Gió',
  'pho-ga-doi-cham-muoi-tieu-ot-gio',
  65000,
  'Tô thường',
  'Đậm Vị!',
  'flame',
  'Gà đồi luộc da vàng, Muối tiêu chanh, Ớt gió Hà Giang, Nước dùng gà ninh thảo mộc',
  'Từng miếng thịt gà đồi ta luộc da vàng ươm giòn sần sật, chấm đĩa muối tiêu chanh ớt gió cay xè kích thích vị giác.',
  'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
  1, 0, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 18. Phở Đùi Cánh Gà Ta Rút Xương Hảo Hạng
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-18-pho-dui-canh-ga-ta',
  (SELECT id FROM categories WHERE slug = 'pho-ga-ta' LIMIT 1),
  'Phở Đùi Cánh Gà Ta Rút Xương Hảo Hạng',
  'pho-dui-canh-ga-ta-rut-xuong',
  75000,
  'Tô lớn',
  'Hảo Hạng',
  'star',
  'Đùi cánh gà ta, Da vàng giòn, Lá chanh tươi, Nước dùng thanh ngọt',
  'Sự kết hợp giữa phần thịt đùi chắc giòn và phần cánh mềm ngậy, rút xương hoàn toàn mang lại trải nghiệm ẩm thực tinh tế.',
  'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80',
  1, 0, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);


-- ==============================================================================
-- NHÓM 4: MÓN ĂN KÈM & GIẢI KHÁT PHỐ CỔ (7 MÓN ĐỘC BẢN)
-- ==============================================================================

-- 19. Quẩy Giòn Chiên Phồng (Đĩa 3 cái)
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-19-quay-gion-chien-phong',
  (SELECT id FROM categories WHERE slug = 'mon-an-kem' LIMIT 1),
  'Quẩy Giòn Chiên Phồng (Đĩa 3 cái)',
  'quay-gion-chien-phong-dia-3-cai',
  15000,
  'Đĩa 3 cái',
  'Ăn Kèm',
  'flame',
  'Bột mì ủ truyền thống, Dầu chiên mới trong ngày',
  'Quẩy vàng ruộm, vỏ ngoài giòn rụm bên trong xốp mềm, chấm ngập nước phở béo nóng hổi là chuẩn vị bữa sáng Hà Thành.',
  'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
  1, 0, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 20. Trứng Gà Chần Nước Béo & Tiết Canh Phở
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-20-trung-ga-chan-nuoc-beo',
  (SELECT id FROM categories WHERE slug = 'mon-an-kem' LIMIT 1),
  'Trứng Gà Chần Nước Béo & Tiết Canh Phở',
  'trung-ga-chan-nuoc-beo-tiet-canh-pho',
  15000,
  'Bát riêng',
  'Đặc Sắc',
  'sparkles',
  'Trứng gà ta sạch, Nước béo phở bò, Tiêu sọ Phú Quốc',
  'Trứng gà ta lòng đào béo ngậy được chần điệu nghệ trong muôi nước béo sôi sùng sục, rắc thêm chút tiêu sọ xay mịn ấm nồng.',
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
  1, 0, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 21. Tiết Bò Hầm Nước Dùng Hành Hoa
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-21-tiet-bo-ham-hanh-hoa',
  (SELECT id FROM categories WHERE slug = 'mon-an-kem' LIMIT 1),
  'Tiết Bò Hầm Nước Dùng Hành Hoa',
  'tiet-bo-ham-nuoc-dung-hanh-hoa',
  15000,
  'Bát riêng',
  'Ăn Kèm',
  'leaf',
  'Tiết bò tươi mềm, Nước dùng tủy bò, Hành hoa tươi thái mịn, Tiêu sọ xay',
  'Miếng tiết bò mềm mướt như thạch, đượm đà nước dùng tủy xương nóng hổi hòa quyện cùng hành hoa tươi xanh ngọt bùi.',
  'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80',
  1, 0, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 22. Trà Sen Tây Hồ Thượng Hạng
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-22-tra-sen-tay-ho',
  (SELECT id FROM categories WHERE slug = 'do-uong' LIMIT 1),
  'Trà Sen Tây Hồ Thượng Hạng',
  'tra-sen-tay-ho-thuong-hang',
  20000,
  'Tách ấm',
  'Thức Uống',
  'leaf',
  'Trà Tân Cương, Gạo sen Bách Diệp, Nước khoáng tinh khiết',
  'Trà búp Tân Cương ướp hoa sen Bách Diệp Hồ Tây tươi ngát, thanh lọc vị giác sau khi thưởng thức tô phở nóng sốt.',
  'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
  1, 0, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 23. Sữa Đậu Nành Lá Dứa Thơm Mát
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-23-sua-dau-nanh-la-dua',
  (SELECT id FROM categories WHERE slug = 'do-uong' LIMIT 1),
  'Sữa Đậu Nành Lá Dứa Thơm Mát',
  'sua-dau-nanh-la-dua-thom-mat',
  18000,
  'Ly đá',
  'Giải Nhiệt',
  'leaf',
  'Đậu nành hạt nguyên chất, Lá dứa tươi nếp, Đường phèn thanh',
  'Đậu nành hạt tuyển nấu cùng lá dứa tươi xay nhuyễn, vị ngọt dịu thanh mát, cân bằng hoàn hảo sau bát phở nóng.',
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  1, 0, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 24. Nước Sấu Hà Nội Ngâm Gừng Giòn
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-24-nuoc-sau-ngam-gung',
  (SELECT id FROM categories WHERE slug = 'do-uong' LIMIT 1),
  'Nước Sấu Hà Nội Ngâm Gừng Giòn',
  'nuoc-sau-ha-noi-ngam-gung-gion',
  20000,
  'Ly đá',
  'Phố Cổ',
  'sparkles',
  'Quả sấu tươi ngâm giòn, Gừng già giã dập, Đường mía nguyên chất, Nước đá tinh khiết',
  'Đặc sản thức uống phố cổ mùa hè với quả sấu ngâm đường phèn giòn tan, vị chua ngọt hài hòa thoang thoảng hương gừng ấm.',
  'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
  1, 0, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

-- 25. Nước Mơ Má Đào Chùa Hương Ngâm Đường Phèn
INSERT INTO dishes (id, category_id, name, slug, price, portion, tag, tag_icon, ingredients, description, image_url, is_available, is_signature, created_at)
VALUES (
  'dish-25-nuoc-mo-ma-dao',
  (SELECT id FROM categories WHERE slug = 'do-uong' LIMIT 1),
  'Nước Mơ Má Đào Chùa Hương Ngâm Đường Phèn',
  'nuoc-mo-ma-dao-chua-huong-ngam-duong-phen',
  20000,
  'Ly đá',
  'Giải Nhiệt',
  'leaf',
  'Mơ má đào Chùa Hương, Đường phèn kết tinh, Nước đá sạch mát lạnh',
  'Mơ má đào ủ đường phèn tự nhiên dậy men thơm nức, vị chua dịu thanh tao giải khát tức thì sau bữa phở gia truyền.',
  'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
  1, 0, NOW()
)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id), name = VALUES(name), price = VALUES(price), portion = VALUES(portion),
  tag = VALUES(tag), tag_icon = VALUES(tag_icon), ingredients = VALUES(ingredients), description = VALUES(description),
  image_url = VALUES(image_url), is_available = VALUES(is_available), is_signature = VALUES(is_signature);

SET FOREIGN_KEY_CHECKS = 1;

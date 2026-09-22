-- ==============================================================================
-- PHỞ GIA TRUYỀN 1986 - SEED DATA PART 1: DANH MỤC & PHỞ BÒ TRUYỀN THỐNG (12 MÓN)
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
   OR slug LIKE 'pho-bo-tai-lan-truc-chuan%'
   OR slug LIKE 'pho-uoi-bo-tho-a-1986%'
   OR slug LIKE 'pho-ga-oi-chat%'
   OR slug LIKE 'tra-a-giai-khat%'
   OR slug LIKE 'pho-bo-tai-lan-hoang-gia%';

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

SET FOREIGN_KEY_CHECKS = 1;

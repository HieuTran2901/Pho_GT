-- ==============================================================================
-- PHỞ GIA TRUYỀN 1986 - SEED DATA PART 2: PHỞ GÀ ĐỒI TA, MÓN KÈM, ĐỒ UỐNG HÀ NỘI
-- Bảng mã: utf8mb4 | Idempotent (ON DUPLICATE KEY UPDATE)
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

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
  'https://images.unsplash.com/photo-1576577445504-6af96477db52?auto=format&fit=crop&w=800&q=80',
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

/**
 * MARKETING CAMPAIGN CONSTANTS — PHỞ GIA TRUYỀN 1986
 * Tinh hoa ẩm thực Hà Nội xưa: Trực quan, giản dị, ấm áp phong vị 1986
 */

export const MARKETING_CAMPAIGN = {
  title: 'HÀ NỘI 1986 — BÁT PHỞ TRÀNG AN',
  badge: 'PHỞ GIA TRUYỀN TỪ NĂM 1986',
  quote: '“Phở là một thứ quà đặc biệt của Hà Nội, không phải chỉ riêng Hà Nội mới có, nhưng chính là vì chỉ ở Hà Nội mới ngon.”',
  author: '— Thạch Lam (Hà Nội 36 Phố Phường)',
  tagline: 'Nước Dùng Trong Vắt Hổ Phách Ninh Chậm 24H • Bát Chiết Yêu Gốm Bát Tràng',
  subheading: 'Kính mời tao nhân mặc khách cùng bước vào gian bếp củi than hoa, lắng nghe tiếng sôi lăn tăn của nồi đồng 1986.',
  ctaPrimary: 'Nhận Phiếu Ưu Đãi 20%',
  ctaSecondary: 'Thưởng Thức Thực Đơn',
};

export const MARKETING_BOTANICALS = [
  {
    id: 'bot_1',
    name: 'Hoa Hồi Xứ Lạng',
    pinyin: '八角 — Hương Ấm Núi Rừng',
    role: 'Hương Thơm Đầu Vị',
    desc: 'Hồi tám cánh già sao vàng trên chảo gang đượm khói bếp, đánh thức khứu giác bằng tinh dầu cay ngọt ấm nồng.',
    origin: 'Rừng Hồi Lạng Sơn',
    icon: '✨',
    material: 'Mộc Hương Bát Giác'
  },
  {
    id: 'bot_2',
    name: 'Thảo Quả Nướng Than',
    pinyin: '草果 — Hồn Đất Hoàng Liên',
    role: 'Nốt Trầm Vang Bóng',
    desc: 'Nướng xém cạnh trên than củi hồng rực, đập dập bung tỏa hạt thơm cay nồng lưu giữ phong vị phở cổ truyền.',
    origin: 'Dãy Hoàng Liên Sơn',
    icon: '🌰',
    material: 'Dược Quý Rừng Già'
  },
  {
    id: 'bot_3',
    name: 'Quế Chi Đồi Già',
    pinyin: '桂皮 — Vị Ngọt Mùa Đông',
    role: 'Hài Hòa Vị Giác',
    desc: 'Vỏ quế đồi già cuộn tròn vỏ đỏ thẫm, mang vị cay dịu và hậu ngọt sâu sưởi ấm những buổi sớm mùa đông phố cổ.',
    origin: 'Văn Yên, Yên Bái',
    icon: '🪵',
    material: 'Vỏ Quế Rừng Cũ'
  },
  {
    id: 'bot_4',
    name: 'Sá Sùng Đảo Ngọc',
    pinyin: '沙虫 — Vàng Mười Của Biển',
    role: 'Vị Ngọt Tự Nhiên',
    desc: 'Sá sùng phơi sương nướng vàng rộm, bí quyết ngọt umami thuần khiết không cần một hạt mì chính nhân tạo.',
    origin: 'Đảo Quan Lạn, Quảng Ninh',
    icon: '🌊',
    material: 'Hải Vị Độc Bản'
  },
  {
    id: 'bot_5',
    name: 'Hạt Ngò & Rễ Mùi Ta',
    pinyin: '芫荽 — Dư Âm Thanh Nhã',
    role: 'Dư Vị Thanh Khiết',
    desc: 'Hạt mùi ta rang thơm lừng cùng rễ mùi già tươi nguyên, tạo nốt hương thanh lịch vương vấn nơi đầu lưỡi.',
    origin: 'Đồng Bằng Bắc Bộ',
    icon: '🌿',
    material: 'Hương Đồng Gió Nội'
  }
];

export const MARKETING_TIMELINE = [
  {
    hour: '04:00',
    title: 'Khử Tạp & Rửa Xương Ống Tơ',
    highlight: 'Gừng Nướng & Nước Sôi',
    desc: 'Khi phố cổ còn chìm trong sương sớm, xương ống bò tơ được cạo sạch, chần gừng nướng than để nước dùng tinh khiết.',
    step: 'Canh Một'
  },
  {
    hour: '12:00',
    title: 'Thả Túi Thảo Mộc Sao Than',
    highlight: 'Hoa Hồi & Thảo Quả',
    desc: 'Túi gấm chứa hồi nướng, quế chi, thảo quả được thả nhẹ vào nồi nước dùng đang sôi lăn tăn, tỏa hương khắp ngõ nhỏ.',
    step: 'Canh Hai'
  },
  {
    hour: '18:00',
    title: 'Sá Sùng Thấm Sâu Vị Ngọt',
    highlight: 'Umami Thuần Khiết',
    desc: 'Sá sùng đảo Quan Lạn thả ninh chậm, đạm tự nhiên hòa quyện tạo nên màu nước dùng hổ phách sóng sánh.',
    step: 'Canh Ba'
  },
  {
    hour: '24:00',
    title: 'Nước Dùng Hoàn Mỹ Xuất Bếp',
    highlight: 'Bát Chiết Yêu Men Lam',
    desc: 'Sau đúng 24 giờ canh lửa, nước dùng trong vắt, béo ngọt tủy xương sẵn sàng chan lên những sợi bánh phở tráng lụa.',
    step: 'Đỉnh Vị'
  }
];

export const MARKETING_BOWL_LAYERS = [
  {
    id: 'layer_4',
    title: 'Tầng 4: Sắc Xanh Phố Cổ',
    name: 'Hành Hoa Chẻ Tơ & Ớt Chỉ Thiên',
    desc: 'Cọng hành hoa chẻ xoăn tơ mơn mởn, rau mùi thơm ngát cùng lát ớt đỏ tươi kích thích vị giác.',
    badge: 'Mỹ Cảm',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'layer_3',
    title: 'Tầng 3: Tinh Túy Bò Tơ',
    name: 'Bò Tái Lăn Áp Chảo & Gầu Giòn',
    desc: 'Thịt bò tơ thái mỏng áp chảo lửa lớn thơm lừng tỏi phi, xen lẫn lát gầu giòn sần sật béo ngậy.',
    badge: 'Đậm Đà',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'layer_2',
    title: 'Tầng 2: Dải Lụa Tráng Tay',
    name: 'Bánh Phở Tươi Mềm Mướt Như Lụa',
    desc: 'Gạo mùa xay cối đá tráng thủ công mỏng manh mướt mịn, ngậm trọn nước dùng mà không hề nát.',
    badge: 'Thủ Công',
    image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'layer_1',
    title: 'Tầng 1: Đất Mẹ Giữ Nhiệt',
    name: 'Bát Chiết Yêu Men Lam Bát Tràng',
    desc: 'Bát chiết yêu thon đáy xòe miệng giữ nhiệt độ sôi bỏng rẫy từ thìa đầu tiên đến giọt nước dùng cuối cùng.',
    badge: 'Cốt Cách',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=400&q=80'
  }
];

export const MARKETING_PROMOS = [
  {
    code: 'PHO1986VIP',
    discount: 'GIẢM 20%',
    title: 'Phiếu Thưởng Vị Tri Ân',
    condition: 'Áp dụng cho đơn hàng đầu tiên từ 150.000đ',
    expiry: 'Có giá trị đến hết 30/10/2026',
    stamp: 'TEM PHIẾU 1986'
  },
  {
    code: 'TRIKY1986',
    discount: 'TẶNG QUẨY & TRÀ',
    title: 'Combo Tri Kỷ Phố Cũ',
    condition: 'Tặng kèm 1 đĩa quẩy giòn hoa mai + 1 tách trà sen Tây Hồ thơm nức',
    expiry: 'Khung giờ vàng 06:00 - 09:30 hàng ngày',
    stamp: 'PHIẾU TRI KỶ'
  }
];

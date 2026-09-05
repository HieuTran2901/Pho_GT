export const MENU_CATEGORIES = [
  { id: 'all', name: 'Tất Cả Món' },
  { id: 'pho-bo', name: 'Phở Bò Truyền Thống' },
  { id: 'pho-ga', name: 'Phở Gà Đồi Ta' },
  { id: 'special', name: 'Món Đặc Biệt' },
  { id: 'sides', name: 'Món Ăn Kèm & Nước' },
];

export const MENU_ITEMS = [
  {
    id: 1,
    name: 'Phở Bò Tái Lăn Hà Nội',
    category: 'pho-bo',
    price: 65000,
    tag: 'Best Seller',
    tagIcon: 'star',
    portion: 'Tô thường',
    theme: 'red',
    description: 'Thịt bò tươi xào lăn nhanh tay trên chảo gang lửa lớn với tỏi thơm nức, giữ trọn độ mềm ngọt tự nhiên, hòa quyện trong nước dùng thanh trong.',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Bò tươi thái mỏng', 'Bánh phở tươi tráng tay', 'Hành hoa & ngò gai', 'Nước dùng ninh 24h'],
    featurePills: [
      { label: 'Bò tươi', sub: 'Thái mỏng', type: 'meat' },
      { label: 'Bánh phở', sub: 'Tươi mỗi ngày', type: 'noodle' },
      { label: 'Nước dùng', sub: 'Ninh 24h', type: 'broth' },
      { label: 'Hành hoa', sub: 'Tươi sạch', type: 'herb' }
    ],
    highlights: [
      'Thịt bò tái mềm ngọt',
      'Hành hoa, ngò gai thơm ngon',
      'Nước dùng trong, thanh',
      'Phở tươi tráng thủ công'
    ]
  },
  {
    id: 2,
    name: 'Phở Đặc Biệt — Bát Đầy Đủ',
    category: 'special',
    price: 85000,
    tag: 'Signature',
    tagIcon: 'leaf',
    portion: 'Tô lớn',
    theme: 'green',
    description: 'Tinh hoa tụ hội: Tái, chín nạm thơm béo, gầu giòn sần sật, gân bò dẻo quánh cùng viên bò hảo hạng và quả trứng chần lòng đào béo ngậy.',
    image: 'https://images.unsplash.com/photo-1631709497146-a239ef373cf1?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Tái, Nạm, Gầu, Gân, Bò viên', 'Trứng chần lòng đào', 'Hành củ chần', 'Nước béo'],
    featurePills: [
      { label: 'Đầy đủ', sub: '7 loại topping', type: 'special' },
      { label: 'Bò tuyển chọn', sub: 'Tươi mỗi ngày', type: 'meat' },
      { label: 'Nước dùng', sub: 'Ninh xương 24h', type: 'broth' },
      { label: 'Gia vị', sub: 'Chuẩn vị 1986', type: 'spice' }
    ],
    highlights: [
      '7 loại topping đặc biệt',
      'Trứng chần lòng đào béo ngậy',
      'Nước dùng đậm đà, ngọt thanh',
      'Bánh phở tươi dai mềm'
    ]
  },
  {
    id: 3,
    name: 'Phở Bò Tái Nạm Giòn',
    category: 'pho-bo',
    price: 60000,
    tag: 'Đậm Vị!',
    tagIcon: 'flame',
    portion: 'Tô thường',
    theme: 'red',
    description: 'Sự kết hợp hoàn hảo giữa vị ngọt mềm của thịt bò tái nhúng vừa tới và độ giòn sần sật, thơm ngậy của nạm bò hoa hảo hạng.',
    image: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Thịt bò tái tơ', 'Nạm giòn hoa văn', 'Bánh phở mềm mượt', 'Nước dùng trong vắt'],
    featurePills: [
      { label: 'Nạm giòn', sub: 'Hoa vàng', type: 'meat' },
      { label: 'Thịt tái', sub: 'Mềm ngọt', type: 'meat' },
      { label: 'Bánh phở', sub: 'Mềm dai', type: 'noodle' },
      { label: 'Nước dùng', sub: 'Đậm đà', type: 'broth' }
    ],
    highlights: [
      'Nạm giòn sần sật',
      'Nước dùng đậm đà, thơm',
      'Thịt tái mềm, ngọt tự nhiên',
      'Phở tươi mỗi ngày'
    ]
  },
  {
    id: 4,
    name: 'Phở Bò Sốt Vang Cổ Truyền',
    category: 'special',
    price: 75000,
    tag: 'Gia Truyền',
    tagIcon: 'sparkles',
    portion: 'Tô thường',
    theme: 'red',
    description: 'Bắp bò hầm mềm rục cùng rượu vang đỏ, hoa hồi, quế chi và cà chua bi, tạo nên màu nước dùng hổ phách sánh óng ánh và hương thơm nồng nàn.',
    image: 'https://images.unsplash.com/photo-1576777647209-e8733d7b851d?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Bắp bò hoa', 'Gia vị sốt vang thảo mộc', 'Rau mùi tàu', 'Ớt tươi'],
    featurePills: [
      { label: 'Bắp hoa', sub: 'Hầm mềm', type: 'meat' },
      { label: 'Vang đỏ', sub: 'Thơm nồng', type: 'spice' },
      { label: 'Hồi quế', sub: 'Gia truyền', type: 'spice' },
      { label: 'Nước sốt', sub: 'Hổ phách', type: 'broth' }
    ],
    highlights: [
      'Bắp bò hoa hầm mềm',
      'Rượu vang đỏ thơm nồng',
      'Nước dùng hổ phách sánh',
      'Gia vị quế hồi hạ thổ'
    ]
  },
  {
    id: 5,
    name: 'Phở Gà Đồi Chặt Lá Chanh',
    category: 'pho-ga',
    price: 60000,
    tag: 'Món Mới',
    tagIcon: 'leaf',
    portion: 'Tô thường',
    theme: 'red',
    description: 'Thịt gà đồi ta thả vườn chắc thịt, da vàng ươm giòn sần sật, thái thớ đượm hương thơm thanh thoát của lá chanh tươi thái chỉ.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Thịt gà đồi da vàng', 'Lá chanh tươi', 'Hành hoa tỉa', 'Nước dùng gà ngọt thanh'],
    featurePills: [
      { label: 'Gà đồi ta', sub: 'Thịt chắc', type: 'meat' },
      { label: 'Da vàng', sub: 'Giòn sần sật', type: 'meat' },
      { label: 'Lá chanh', sub: 'Thái chỉ thơm', type: 'herb' },
      { label: 'Nước dùng', sub: 'Thanh ngọt', type: 'broth' }
    ],
    highlights: [
      'Gà đồi ta thả vườn',
      'Da vàng ươm giòn sần sật',
      'Lá chanh tươi thái chỉ',
      'Nước dùng gà thanh ngọt'
    ]
  },
  {
    id: 6,
    name: 'Phở Đùi Gà Rút Xương',
    category: 'pho-ga',
    price: 70000,
    tag: 'Được Yêu Thích',
    tagIcon: 'star',
    portion: 'Tô lớn',
    theme: 'red',
    description: 'Nguyên chiếc đùi gà góc phần tư vàng óng ả, rút xương khéo léo, thịt mọng nước ngọt đậm đà chấm cùng muối tiêu ớt chanh ớt gió Hà Giang.',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Đùi gà ta nguyên chiếc', 'Gia vị chấm truyền thống', 'Nước dùng thảo mộc'],
    featurePills: [
      { label: 'Đùi góc tư', sub: 'Nguyên chiếc', type: 'meat' },
      { label: 'Rút xương', sub: 'Khéo léo', type: 'meat' },
      { label: 'Muối tiêu', sub: 'Chanh ớt gió', type: 'spice' },
      { label: 'Nước dùng', sub: 'Hầm thảo mộc', type: 'broth' }
    ],
    highlights: [
      'Đùi gà ta nguyên chiếc',
      'Rút xương khéo léo',
      'Thịt mọng nước ngọt đậm',
      'Muối tiêu chanh ớt gió'
    ]
  },
  {
    id: 7,
    name: 'Quẩy Giòn Chiên Phồng (Đĩa 3 cái)',
    category: 'sides',
    price: 15000,
    tag: 'Ăn Kèm',
    tagIcon: 'flame',
    portion: 'Đĩa 3 cái',
    theme: 'red',
    description: 'Quẩy vàng ruộm, vỏ ngoài giòn rụm bên trong xốp mềm, chấm ngập nước phở béo nóng hổi là chuẩn vị bữa sáng Hà Thành.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Bột mì ủ truyền thống', 'Dầu chiên mới trong ngày'],
    featurePills: [
      { label: 'Vỏ quẩy', sub: 'Giòn rụm', type: 'bread' },
      { label: 'Ruột bánh', sub: 'Xốp mềm', type: 'bread' },
      { label: 'Dầu chiên', sub: 'Mới trong ngày', type: 'flame' },
      { label: 'Ăn kèm', sub: 'Hút nước dùng', type: 'broth' }
    ],
    highlights: [
      'Vỏ ngoài giòn rụm',
      'Bên trong xốp mềm',
      'Chiên dầu mới mỗi ngày',
      'Hút trọn nước dùng béo'
    ]
  },
  {
    id: 8,
    name: 'Trứng Gà Chần Nước Béo & Tiết Canh Phở',
    category: 'sides',
    price: 15000,
    tag: 'Đặc Sắc',
    tagIcon: 'sparkles',
    portion: 'Bát riêng',
    theme: 'red',
    description: 'Trứng gà ta lòng đào béo ngậy được chần điệu nghệ trong muôi nước béo sôi sùng sục, rắc thêm chút tiêu sọ xay mịn ấm nồng.',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Trứng gà ta sạch', 'Nước béo phở bò', 'Tiêu sọ Phú Quốc'],
    featurePills: [
      { label: 'Trứng gà ta', sub: 'Lòng đào', type: 'egg' },
      { label: 'Nước béo', sub: 'Sôi sùng sục', type: 'broth' },
      { label: 'Tiêu sọ', sub: 'Phú Quốc', type: 'spice' },
      { label: 'Dinh dưỡng', sub: 'Ấm nồng vị', type: 'special' }
    ],
    highlights: [
      'Lòng đào béo ngậy',
      'Trứng gà ta chọn lọc',
      'Chần nước béo nóng hổi',
      'Tiêu sọ ấm nồng'
    ]
  },
  {
    id: 9,
    name: 'Trà Sen Tây Hồ Thượng Hạng',
    category: 'sides',
    price: 20000,
    tag: 'Thức Uống',
    tagIcon: 'leaf',
    portion: 'Tách ấm',
    theme: 'red',
    description: 'Trà búp Tân Cương ướp hoa sen Bách Diệp Hồ Tây tươi ngát, thanh lọc vị giác sau khi thưởng thức tô phở nóng sốt.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Trà Tân Cương', 'Gạo sen Bách Diệp', 'Nước khoáng tinh khiết'],
    featurePills: [
      { label: 'Trà búp', sub: 'Tân Cương', type: 'tea' },
      { label: 'Sen Tây Hồ', sub: 'Bách Diệp', type: 'flower' },
      { label: 'Hương vị', sub: 'Thanh tao ngát', type: 'herb' },
      { label: 'Thanh lọc', sub: 'Hài hòa vị', type: 'tea' }
    ],
    highlights: [
      'Trà búp Tân Cương',
      'Gạo sen Bách Diệp',
      'Thanh lọc vị giác',
      'Hương thơm thanh tao'
    ]
  },
  {
    id: 10,
    name: 'Phở Tái Bắp Bò Hoa',
    category: 'pho-bo',
    price: 70000,
    tag: 'Hảo Hạng',
    tagIcon: 'star',
    portion: 'Tô thường',
    theme: 'red',
    description: 'Bắp bò hoa thái mỏng trần tái giữ trọn vị ngọt đậm đà, thớ thịt gân giòn sần sật hòa quyện trong nước dùng ninh 24h.',
    image: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Bắp bò hoa tươi', 'Bánh phở tráng tay', 'Gừng nướng hạ thổ', 'Nước dùng trong vắt'],
    featurePills: [
      { label: 'Bắp hoa', sub: 'Giòn sần sật', type: 'meat' },
      { label: 'Bánh phở', sub: 'Tráng tay tươi', type: 'noodle' },
      { label: 'Nước dùng', sub: 'Ninh 24h', type: 'broth' },
      { label: 'Hành hoa', sub: 'Thơm lừng', type: 'herb' }
    ],
    highlights: [
      'Bắp bò hoa giòn ngọt',
      'Thịt bò tơ tươi trong ngày',
      'Nước dùng thanh trong',
      'Bánh phở dai mềm mướt'
    ]
  },
  {
    id: 11,
    name: 'Phở Bò Tái Gầu Giòn',
    category: 'pho-bo',
    price: 65000,
    tag: 'Béo Ngậy',
    tagIcon: 'flame',
    portion: 'Tô thường',
    theme: 'red',
    description: 'Gầu bò hoa luộc chín tới thơm giòn béo ngậy kết hợp thịt bò tái mềm mọng nước, chan nước dùng thanh ngọt tủy xương.',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Gầu giòn hảo hạng', 'Thịt tái mềm', 'Hành lá tươi', 'Nước dùng thanh'],
    featurePills: [
      { label: 'Gầu giòn', sub: 'Béo ngậy', type: 'meat' },
      { label: 'Bò tái', sub: 'Mềm mọng', type: 'meat' },
      { label: 'Nước dùng', sub: 'Đậm đà', type: 'broth' },
      { label: 'Hành hoa', sub: 'Tươi sạch', type: 'herb' }
    ],
    highlights: [
      'Gầu bò giòn sần sật',
      'Thịt bò tái ngọt mềm',
      'Nước dùng đậm vị truyền thống',
      'Hương thơm thảo mộc xưa'
    ]
  },
  {
    id: 12,
    name: 'Phở Gà Xé Lòng Trứng Non',
    category: 'pho-ga',
    price: 75000,
    tag: 'Đặc Sắc',
    tagIcon: 'sparkles',
    portion: 'Tô lớn',
    theme: 'red',
    description: 'Thịt ức và đùi gà xé phay bùi ngọt, kèm chùm trứng non vàng ươm béo ngậy và bộ lòng mề gà rim thơm nức mũi.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Gà đồi xé phay', 'Chùm trứng non', 'Lòng mề rim', 'Lá chanh tươi'],
    featurePills: [
      { label: 'Gà đồi', sub: 'Xé phay ngọt', type: 'meat' },
      { label: 'Trứng non', sub: 'Vàng ươm béo', type: 'egg' },
      { label: 'Lòng mề', sub: 'Rim thơm', type: 'special' },
      { label: 'Lá chanh', sub: 'Thái chỉ', type: 'herb' }
    ],
    highlights: [
      'Trứng non vàng ươm béo bùi',
      'Thịt gà đồi ta chắc ngọt',
      'Lòng mề rim gia truyền',
      'Nước dùng gà thanh dịu'
    ]
  },
  {
    id: 13,
    name: 'Phở Gà Trộn Chua Ngọt Hà Thành',
    category: 'pho-ga',
    price: 65000,
    tag: 'Món Hot',
    tagIcon: 'star',
    portion: 'Tô thường',
    theme: 'green',
    description: 'Bánh phở mềm trộn sốt tương ớt chua ngọt gia truyền, thịt gà đồi xé, lạc rang giòn bùi và hành phi vàng ruộm.',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Gà đồi xé', 'Sốt trộn bí truyền', 'Lạc rang & hành phi', 'Rau thơm các loại'],
    featurePills: [
      { label: 'Gà đồi', sub: 'Thịt chắc giòn', type: 'meat' },
      { label: 'Sốt trộn', sub: 'Chua ngọt 1986', type: 'spice' },
      { label: 'Lạc rang', sub: 'Giòn bùi thơm', type: 'special' },
      { label: 'Hành phi', sub: 'Vàng ruộm', type: 'herb' }
    ],
    highlights: [
      'Sốt trộn chua ngọt thanh tao',
      'Gà đồi da giòn thịt ngọt',
      'Lạc rang bùi, hành phi giòn',
      'Tặng kèm bát nước dùng nóng'
    ]
  },
  {
    id: 14,
    name: 'Phở Thố Đá Núi Lửa Sôi Sùng Sục',
    category: 'special',
    price: 95000,
    tag: 'Đỉnh Cao',
    tagIcon: 'flame',
    portion: 'Thố đá nóng',
    theme: 'green',
    description: 'Nước dùng sôi sùng sục trong thố đá nóng 300 độ C, giữ nhiệt suốt bữa ăn; thực khách tự tay nhúng thịt bò tươi và bánh phở.',
    image: 'https://images.unsplash.com/photo-1631709497146-a239ef373cf1?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Thịt bò hảo hạng', 'Thố đá giữ nhiệt 300°C', 'Trứng gà ta', 'Nước dùng cốt bò'],
    featurePills: [
      { label: 'Thố đá', sub: 'Nóng 300°C', type: 'flame' },
      { label: 'Bò tơ tươi', sub: 'Tự tay nhúng', type: 'meat' },
      { label: 'Nước cốt', sub: 'Sôi sùng sục', type: 'broth' },
      { label: 'Trứng gà', sub: 'Lòng đào béo', type: 'egg' }
    ],
    highlights: [
      'Nóng bỏng tay tới giọt cuối cùng',
      'Trải nghiệm tự tay nhúng thịt bò',
      'Hương vị bùng nổ trong thố đá',
      'Thịt bò tơ hảo hạng tươi mềm'
    ]
  },
  {
    id: 15,
    name: 'Sữa Đậu Nành Lá Dứa Thơm Mát',
    category: 'sides',
    price: 18000,
    tag: 'Giải Nhiệt',
    tagIcon: 'leaf',
    portion: 'Ly đá',
    theme: 'red',
    description: 'Đậu nành hạt tuyển nấu cùng lá dứa tươi xay nhuyễn, vị ngọt dịu thanh mát, cân bằng hoàn hảo sau bát phở nóng.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Đậu nành hạt nguyên chất', 'Lá dứa tươi nếp', 'Đường phèn thanh'],
    featurePills: [
      { label: 'Đậu nành', sub: 'Nguyên chất', type: 'tea' },
      { label: 'Lá dứa', sub: 'Tươi nếp thơm', type: 'herb' },
      { label: 'Đường phèn', sub: 'Ngọt dịu', type: 'spice' },
      { label: 'Thức uống', sub: 'Thanh nhiệt', type: 'special' }
    ],
    highlights: [
      'Đậu nành xay tươi mỗi sáng',
      'Hương lá dứa thơm mát dịu',
      'Đường phèn ngọt thanh không gắt',
      'Hòa quyện hoàn hảo với phở nóng'
    ]
  }
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'NSƯT Hoàng Trung Kiên',
    role: 'Nghệ sĩ Nhà hát Kịch Hà Nội',
    badge: 'Khách ruột 15 năm',
    category: 'heritage',
    favoriteDish: 'Phở Tái Bắp Bò Hoa',
    content: 'Từ ngày quán còn ở góc phố nhỏ năm 1986 đến nay, hương vị nước phở vẫn trong veo và ngọt hậu sâu từ xương bò, không lẫn chút bột ngọt hoá học nào.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 2,
    name: 'Food Blogger Vũ Thùy Linh',
    role: 'Sáng lập kênh Mê Ẩm Thực',
    badge: 'Food Reviewer',
    category: 'sotvang',
    favoriteDish: 'Phở Bò Sốt Vang Cung Đình',
    content: 'Bát phở sốt vang và nạm giòn ở đây thực sự đỉnh cao! Bánh phở tươi mềm mướt không nát, thịt bò tươi ngọt lịm. Quán giữ được cái hồn phở cổ Hà Nội nguyên bản.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 3,
    name: 'David Miller',
    role: 'Du khách từ Melbourne, Úc',
    badge: 'Du khách Quốc tế',
    category: 'broth',
    favoriteDish: 'Special Beef Combo Pho',
    content: 'The best Pho I have ever tasted in Vietnam! The broth is so aromatic with star anise and cinnamon. The staff is extremely warm and helpful.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 4,
    name: 'Cô Nguyễn Thị Mai',
    role: 'Cư dân Hàng Bạc, Hoàn Kiếm',
    badge: 'Tri kỷ Phố Cổ 30 năm',
    category: 'heritage',
    favoriteDish: 'Phở Tái Nạm Giòn Cổ Truyền',
    content: 'Cứ mỗi sớm mùa đông gió lạnh, sang quán làm bát tái nạm thêm vài cọng hành trần hoa hoa là thấy cả tuổi thơ ùa về. Nước dùng thanh tao không nơi nào sánh được.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 5,
    name: 'Bác Trần Văn Hưng',
    role: 'Nhà nghiên cứu Văn hóa Dân gian',
    badge: 'Thực khách sành vị',
    category: 'broth',
    favoriteDish: 'Phở Gầu Giòn Ninh Than Hoa',
    content: 'Nấu phở bằng than hoa liu riu suốt 24 giờ là kỳ công mà hiếm quán nào ngày nay còn đủ kiên nhẫn lưu giữ. Vị ngọt tủy bò ngấm vào từng sợi phở thật đượm.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'
  }
];

export const HERITAGE_FEATURES = [
  {
    title: 'Hầm Xương 24 Tiếng',
    desc: '100% xương ống bò tươi tuyển chọn mỗi sớm, ninh liu riu cùng gừng nướng và hành nướng trên than hồng đúng 24 giờ.'
  },
  {
    title: 'Gia Vị Thảo Mộc Tự Nhiên',
    desc: 'Hoa hồi Lạng Sơn, quế thanh Yên Bái, thảo quả Hà Giang và tiêu sọ Phú Quốc sao vàng hạ thổ tạo nên hương vị bất biến.'
  },
  {
    title: 'Bánh Phở Tươi Thủ Công',
    desc: 'Xay từ gạo mùa thơm dẻo, tráng mỏng thủ công và thái tay mỗi sáng sớm. Không chất bảo quản, không hàn the.'
  },
  {
    title: 'Thịt Bò Tươi Nóng Trong Ngày',
    desc: 'Chỉ nhập thịt bò tơ tươi loại 1 từ lò mổ sáng sớm, thớ thịt đỏ tươi mọng, không cấp đông qua đêm.'
  }
];

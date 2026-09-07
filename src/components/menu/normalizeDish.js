/**
 * [RAVEN & URBAN] Adapter chuẩn hóa dữ liệu món ăn từ Spring Boot sang giao diện khách hàng
 */
export function normalizeBackendDish(dish) {
  // 1. Phân tách danh sách nguyên liệu
  let parsedIngredients = [];
  if (Array.isArray(dish.ingredients)) {
    parsedIngredients = dish.ingredients;
  } else if (typeof dish.ingredients === 'string' && dish.ingredients.trim()) {
    parsedIngredients = dish.ingredients
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (parsedIngredients.length === 0) {
    parsedIngredients = ['Bánh phở tươi tráng tay', 'Nước dùng ninh tủy xương 24h', 'Hành hoa & ngò gai'];
  }

  // 2. Map danh mục chuẩn xác theo FOOD_GROUPS ('pho-bo', 'special', 'pho-ga', 'sides')
  const catSlug = (dish.category?.slug || '').toLowerCase();
  const nameLower = (dish.name || '').toLowerCase();
  let resolvedCat = 'pho-bo';

  // 1. Phở Đặc Biệt / Signature / Sốt Vang / Thố Đá
  if (
    dish.isSignature ||
    catSlug.includes('special') ||
    catSlug.includes('dac-biet') ||
    nameLower.includes('đặc biệt') ||
    nameLower.includes('thố đá') ||
    nameLower.includes('sốt vang')
  ) {
    resolvedCat = 'special';
  }
  // 2. Món ăn kèm / Giải khát / Đồ uống (chỉ khi không phải bát phở)
  else if (
    (catSlug.includes('kem') ||
     catSlug.includes('uong') ||
     catSlug.includes('do-uong') ||
     catSlug.includes('sides') ||
     nameLower.includes('quẩy') ||
     nameLower.includes('trà') ||
     nameLower.includes('nước') ||
     nameLower.includes('sữa') ||
     nameLower.includes('tiết')) &&
    !nameLower.includes('phở')
  ) {
    resolvedCat = 'sides';
  }
  // 3. Phở Gà Ta (chỉ phở gà thật sự, ngoại trừ trứng gà chần)
  else if (
    (catSlug.includes('ga') || nameLower.includes('gà')) &&
    !nameLower.includes('trứng')
  ) {
    resolvedCat = 'pho-ga';
  }
  // 4. Trứng gà chần nước béo -> thuộc món ăn kèm
  else if (nameLower.includes('trứng')) {
    resolvedCat = 'sides';
  }
  // 5. Mặc định là Phở Bò Truyền Thống
  else {
    resolvedCat = 'pho-bo';
  }

  // 3. Tự động sinh Feature Pills nếu chưa có
  const featurePills = parsedIngredients.slice(0, 4).map((ing) => {
    const ingLower = ing.toLowerCase();
    let type = 'herb';
    if (ingLower.includes('bò') || ingLower.includes('tái') || ingLower.includes('nạm') || ingLower.includes('gầu')) {
      type = 'meat';
    } else if (ingLower.includes('gà')) {
      type = 'chicken';
    } else if (ingLower.includes('nước') || ingLower.includes('xương') || ingLower.includes('dùng')) {
      type = 'broth';
    } else if (ingLower.includes('phở') || ingLower.includes('bánh')) {
      type = 'noodle';
    } else if (ingLower.includes('trứng')) {
      type = 'egg';
    } else if (ingLower.includes('quẩy')) {
      type = 'bread';
    } else if (ingLower.includes('trà') || ingLower.includes('sen')) {
      type = 'tea';
    }
    return {
      label: ing,
      sub: 'Chuẩn vị 1986',
      type,
    };
  });

  const highlights = parsedIngredients.map((i) => `Nguyên liệu tuyển chọn: ${i}`);

  return {
    id: dish.id,
    name: dish.name,
    category: resolvedCat,
    price: typeof dish.price === 'number' ? dish.price : parseFloat(dish.price) || 0,
    portion: dish.portion || 'Tô thường',
    tag: dish.tag || (dish.isSignature ? 'Signature' : null),
    tagIcon: dish.tagIcon || (dish.isSignature ? 'star' : 'leaf'),
    theme: resolvedCat === 'special' ? 'green' : 'red',
    description: dish.description || 'Hương vị nước dùng thanh ngọt ninh tủy xương bò 24h quyện cùng quế hồi gia truyền 1986.',
    image: dish.imageUrl || 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    ingredients: parsedIngredients,
    featurePills,
    highlights,
    isAvailable: dish.isAvailable ?? true,
    isSignature: dish.isSignature ?? false,
  };
}

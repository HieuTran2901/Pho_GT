import { MENU_ITEMS } from '../data/menuData';

export const DEFAULT_PHO_IMAGE =
  'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80';

export const DEFAULT_DRINK_IMAGE =
  'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80';

export const DEFAULT_SIDE_IMAGE =
  'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80';

/**
 * Tự động tìm kiếm ảnh món ăn từ id hoặc tên món (Fuzzy keyword match)
 */
export function getDishImage(item) {
  if (!item) return DEFAULT_PHO_IMAGE;

  // 1. Nếu item đã có thuộc tính image hợp lệ
  if (item.image && typeof item.image === 'string' && item.image.startsWith('http')) {
    return item.image;
  }

  // 2. Tìm theo id trong MENU_ITEMS
  if (item.id || item.dishId) {
    const targetId = Number(item.id || item.dishId);
    const foundById = MENU_ITEMS.find((m) => m.id === targetId);
    if (foundById?.image) return foundById.image;
  }

  // 3. Tìm theo tên món ăn
  const name = (item.name || item.dishName || '').toLowerCase().trim();
  if (!name) return DEFAULT_PHO_IMAGE;

  // Tìm kiếm so khớp tên trong MENU_ITEMS
  const foundByName = MENU_ITEMS.find((m) => {
    const mName = m.name.toLowerCase();
    return mName.includes(name) || name.includes(mName);
  });
  if (foundByName?.image) return foundByName.image;

  // 4. Từ khóa đặc thù (Keyword Mapping)
  if (name.includes('tái lăn')) {
    return 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('thố đá') || name.includes('đặc biệt')) {
    return 'https://images.unsplash.com/photo-1631709497146-a239ef373cf1?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('sốt vang')) {
    return 'https://images.unsplash.com/photo-1576777647209-e8733d7b851d?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('gà')) {
    return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('nạm') || name.includes('bắp') || name.includes('gầu')) {
    return 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('quẩy')) {
    return DEFAULT_SIDE_IMAGE;
  }
  if (name.includes('trứng')) {
    return 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('trà') || name.includes('mía') || name.includes('nước') || name.includes('đậu nành')) {
    return DEFAULT_DRINK_IMAGE;
  }

  return DEFAULT_PHO_IMAGE;
}

/**
 * Trả về danh sách ảnh thu nhỏ của các món trong đơn hàng (Tối đa 3 ảnh cho Stack)
 */
export function getOrderThumbnails(order) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) {
    return [DEFAULT_PHO_IMAGE];
  }
  const thumbs = [];
  const seenUrls = new Set();

  for (const item of order.items) {
    const imgUrl = getDishImage(item);
    if (!seenUrls.has(imgUrl)) {
      seenUrls.add(imgUrl);
      thumbs.push({
        url: imgUrl,
        name: item.name || 'Món phở',
        quantity: item.quantity || 1
      });
    }
    if (thumbs.length >= 3) break;
  }

  return thumbs.length > 0 ? thumbs : [{ url: DEFAULT_PHO_IMAGE, name: 'Phở Gia Truyền', quantity: 1 }];
}

/**
 * Định dạng thời gian tương đối thân thiện (VD: Hôm nay 20:55, Hôm qua 19:30, v.v.)
 */
export function formatOrderTimeAgo(dateString) {
  if (!dateString) return 'Gần đây';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;

    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return `Hôm nay, ${timeStr}`;

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();
    if (isYesterday) return `Hôm qua, ${timeStr}`;

    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ` • ${timeStr}`;
  } catch {
    return dateString;
  }
}

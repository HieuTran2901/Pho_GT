import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Leaf,
  Sparkles,
  Coffee,
  Star,
  UtensilsCrossed
} from 'lucide-react';

// Bộ ảnh mẫu chuẩn Phở Gia Truyền 1986 cho phép quản trị viên chọn nhanh 1-click
export const PRESET_DISH_IMAGES = [
  {
    name: 'Phở Bò Tái Lăn',
    url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    tag: 'Best Seller',
    tagIcon: 'star',
    portion: 'Tô thường',
    price: 65000
  },
  {
    name: 'Phở Đặc Biệt 1986',
    url: 'https://images.unsplash.com/photo-1631709497146-a239ef373cf1?auto=format&fit=crop&w=800&q=80',
    tag: 'Signature',
    tagIcon: 'leaf',
    portion: 'Tô lớn',
    price: 85000
  },
  {
    name: 'Phở Bò Tái Nạm Giòn',
    url: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=800&q=80',
    tag: 'Đậm Vị!',
    tagIcon: 'flame',
    portion: 'Tô thường',
    price: 70000
  },
  {
    name: 'Phở Bò Sốt Vang',
    url: 'https://images.unsplash.com/photo-1576777647209-e8733d7b851d?auto=format&fit=crop&w=800&q=80',
    tag: 'Gia Truyền',
    tagIcon: 'sparkles',
    portion: 'Tô thường',
    price: 75000
  },
  {
    name: 'Phở Gà Đồi Chặt',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    tag: 'Món Mới',
    tagIcon: 'leaf',
    portion: 'Tô thường',
    price: 65000
  },
  {
    name: 'Phở Đùi Gà Rút Xương',
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    tag: 'Yêu Thích',
    tagIcon: 'star',
    portion: 'Tô lớn',
    price: 75000
  },
  {
    name: 'Quẩy Giòn Gia Truyền',
    url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
    tag: 'Món Ăn Kèm',
    tagIcon: 'coffee',
    portion: 'Đĩa 3 chiếc',
    price: 15000
  },
  {
    name: 'Trà Sen Tây Hồ',
    url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    tag: 'Giải Khát',
    tagIcon: 'coffee',
    portion: 'Cốc',
    price: 25000
  }
];

export const QUICK_TAGS = [
  { label: 'Best Seller', icon: 'star' },
  { label: 'Signature', icon: 'leaf' },
  { label: 'Gia Truyền', icon: 'sparkles' },
  { label: 'Đậm Vị!', icon: 'flame' },
  { label: 'Món Mới', icon: 'leaf' },
  { label: 'Món Ăn Kèm', icon: 'coffee' },
  { label: 'Giải Khát', icon: 'coffee' },
];

export const QUICK_PORTIONS = ['Tô thường', 'Tô lớn', 'Tô đặc biệt', 'Đĩa 3 chiếc', 'Cốc', 'Lon'];
export const QUICK_PRICES = [55000, 60000, 65000, 75000, 85000, 90000, 95000];

export function renderPreviewTagIcon(icon) {
  switch (icon) {
    case 'flame': return <Flame className="w-3 h-3 text-amber-300" />;
    case 'leaf': return <Leaf className="w-3 h-3 text-emerald-300" />;
    case 'sparkles': return <Sparkles className="w-3 h-3 text-amber-300" />;
    case 'coffee': return <Coffee className="w-3 h-3 text-amber-200" />;
    case 'star':
    default:
      return <Star className="w-3 h-3 text-amber-300 fill-amber-300" />;
  }
}

/**
 * Component LazyDishImage - Kiến trúc tối ưu hiệu năng (RAVEN) & Trải nghiệm thị giác di sản (URBAN)
 * - Tự động kích hoạt IntersectionObserver: Chỉ nạp ảnh khi người dùng thực sự cuộn tới vị trí thẻ.
 * - Khung xương giả lập (Heritage Shimmer Skeleton) ấm cúng màu hổ phách/giấy bồi với nhịp thở nhẹ nhàng (animate-pulse).
 * - Hiệu ứng xuất hiện mượt mà (Smooth Fade-in & Scale 500ms) khi ảnh tải xong, ngăn chặn nhảy layout (Zero CLS).
 * - Bộ đệm rootMargin 120px đón đầu hướng cuộn của người dùng, triệt tiêu cảm giác chờ đợi khi lướt nhanh.
 */
export function LazyDishImage({
  src,
  alt = 'Món ăn gia truyền',
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
}) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '120px 0px',
        threshold: 0.01,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const imageSrc = hasError ? fallbackSrc : (src || fallbackSrc);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#f4ead9]/70">
      {(!isInView || !isLoaded) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#f8f1e5] via-[#eee0ca] to-[#f5ebd8] animate-pulse pointer-events-none">
          <div className="flex flex-col items-center gap-1.5 opacity-60">
            <div className="w-9 h-9 rounded-full bg-amber-900/10 flex items-center justify-center border border-amber-900/15 shadow-2xs">
              <UtensilsCrossed className="w-4 h-4 text-amber-900" />
            </div>
            <span className="text-[10px] font-serif font-bold text-amber-950/70 tracking-widest uppercase">
              Phở 1986
            </span>
          </div>
        </div>
      )}

      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`${className} transition-all duration-500 ease-out ${
            isLoaded ? 'opacity-100 scale-100 filter-none' : 'opacity-0 scale-95 blur-[2px]'
          }`}
        />
      )}
    </div>
  );
}

export function formatVND(amount) {
  if (!amount && amount !== 0) return '0đ';
  return `${Number(amount).toLocaleString('vi-VN')}đ`;
}

export function formatOrderTime(dateStr, currentTime = new Date()) {
  if (!dateStr) return { time: '—', ago: 'Vừa xong' };
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { time: '—', ago: 'Vừa xong' };
    const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const diffMin = Math.floor((currentTime - d) / 60000);
    let agoStr = 'Vừa xong';
    if (diffMin >= 1 && diffMin < 60) agoStr = `${diffMin} phút trước`;
    else if (diffMin >= 60 && diffMin < 1440) agoStr = `${Math.floor(diffMin / 60)} giờ trước`;
    else if (diffMin >= 1440) agoStr = d.toLocaleDateString('vi-VN');
    return { time: timeStr, ago: agoStr, diffMin };
  } catch {
    return { time: '—', ago: 'Vừa xong', diffMin: 0 };
  }
}

export function getDishThumbnail(dishName, dishId, dishes = []) {
  if (!dishName && !dishId) return 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=300&q=80';
  const found = dishes?.find(d => 
    (dishId && d.id === dishId) ||
    (dishName && d.name && d.name.toLowerCase().trim() === dishName.toLowerCase().trim())
  );
  if (found?.imageUrl) return found.imageUrl;
  const nameLower = (dishName || '').toLowerCase();
  if (nameLower.includes('gà')) return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80';
  if (nameLower.includes('thố đá') || nameLower.includes('đặc biệt') || nameLower.includes('sốt vang')) return 'https://images.unsplash.com/photo-1631709497146-a239ef373cf1?auto=format&fit=crop&w=300&q=80';
  if (nameLower.includes('quẩy')) return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=300&q=80';
  if (nameLower.includes('trà') || nameLower.includes('sữa') || nameLower.includes('nước')) return 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=300&q=80';
  return 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=300&q=80';
}


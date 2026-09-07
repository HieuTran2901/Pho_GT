import React, { useState, useRef, useEffect } from 'react';
import { Utensils } from 'lucide-react';

/**
 * Component LazyDishImage - Kiến trúc tối ưu hiệu năng (RAVEN) & Trải nghiệm thị giác di sản (URBAN)
 * - Tự động kích hoạt IntersectionObserver: Chỉ nạp ảnh khi người dùng thực sự cuộn tới vị trí thẻ.
 * - Khung xương giả lập (Heritage Shimmer Skeleton) ấm cúng màu hổ phách/giấy bồi với nhịp thở nhẹ nhàng (animate-pulse).
 * - Hiệu ứng xuất hiện mượt mà (Smooth Fade-in & Scale 500ms) khi ảnh tải xong, ngăn chặn nhảy layout (Zero CLS).
 * - Bộ đệm rootMargin 120px đón đầu hướng cuộn của người dùng, triệt tiêu cảm giác chờ đợi khi lướt nhanh.
 */
export default function LazyDishImage({
  src,
  alt = 'Món ăn gia truyền',
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
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
            <div className="w-8 h-8 rounded-full bg-amber-900/10 flex items-center justify-center border border-amber-900/15 shadow-2xs">
              <Utensils className="w-4 h-4 text-amber-900" />
            </div>
            <span className="text-[9px] font-serif font-bold text-amber-950/70 tracking-widest uppercase">
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

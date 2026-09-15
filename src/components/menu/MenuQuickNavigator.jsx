import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Soup,
  Beef,
  Sparkles,
  Utensils,
  Wheat,
  Heart,
  X,
  ChevronRight,
  ChevronUp
} from 'lucide-react';
import { FOOD_GROUPS } from './menuConstants';

const HERITAGE_NAV_ITEMS = [
  {
    id: 'all',
    title: 'Toàn Bộ Thực Đơn Tinh Hoa',
    subtitle: 'Đầy đủ 24 món ngon gia truyền từ năm 1986',
    priceText: 'Toàn cảnh thực đơn',
    badge: 'Đủ 24 món',
    badgeColor: 'bg-amber-400/20 text-amber-200 border-amber-400/40',
    icon: Soup
  },
  {
    id: 'pho-bo',
    title: 'Phở Bò Truyền Thống',
    subtitle: 'Nước ninh tủy 24h quyện gầu giòn & tái lăn',
    priceText: 'Từ 75.000đ',
    badge: 'Bestseller',
    badgeColor: 'bg-rose-500/25 text-rose-300 border-rose-500/40',
    icon: Beef
  },
  {
    id: 'special',
    title: 'Món Đặc Biệt & Sốt Vang',
    subtitle: 'Thố đá núi lửa & rượu vang đỏ độc bản 1986',
    priceText: 'Từ 85.000đ',
    badge: 'Đệ Nhất 1986',
    badgeColor: 'bg-amber-500/25 text-amber-200 border-amber-400/50',
    icon: Sparkles
  },
  {
    id: 'pho-ga',
    title: 'Phở Gà Đồi Ta Thượng Hạng',
    subtitle: 'Thịt chắc ngọt, da vàng giòn lá chanh thái chỉ',
    priceText: 'Từ 70.000đ',
    badge: 'Thanh ngọt',
    badgeColor: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40',
    icon: Utensils
  },
  {
    id: 'sides',
    title: 'Món Ăn Kèm & Trà Thơm',
    subtitle: 'Quẩy giòn rụm, trứng chần béo & trà sen Tây Hồ',
    priceText: 'Từ 10.000đ',
    badge: 'Chuẩn vị',
    badgeColor: 'bg-orange-500/25 text-orange-200 border-orange-500/40',
    icon: Wheat
  },
  {
    id: 'favorites',
    title: 'Món Ruột Của Bạn',
    subtitle: 'Các bát phở bác đã lưu lại theo khẩu vị riêng',
    priceText: 'Món ruột',
    badge: 'Yêu thích',
    badgeColor: 'bg-rose-600/30 text-rose-200 border-rose-400/50',
    icon: Heart
  }
];

const popoverMotion = {
  hidden: { opacity: 0, y: 16, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.035
    }
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.95,
    transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] }
  }
};

const itemMotion = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } }
};

export default function MenuQuickNavigator({
  activeCategory,
  onSelectCategory,
  groupedItems = {},
  favoriteIds = []
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const menuEl = document.getElementById('menu');
      if (!menuEl) return;
      const rect = menuEl.getBoundingClientRect();
      const inMenu = rect.top < window.innerHeight * 0.75 && rect.bottom > 220;
      setIsVisible(inMenu);
      if (!inMenu && isOpen) setIsOpen(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePick = useCallback((catId) => {
    setIsOpen(false);
    if (onSelectCategory) onSelectCategory(catId);
  }, [onSelectCategory]);

  const activeTitle = FOOD_GROUPS.find((g) => g.id === activeCategory)?.name
    || (activeCategory === 'favorites' ? 'Món Yêu Thích' : 'Tất Cả Món');

  if (!isVisible) return null;

  return (
    <div
      ref={popoverRef}
      className="fixed bottom-[74px] sm:bottom-7 left-1/2 -translate-x-1/2 z-35 font-sans select-none flex flex-col items-center"
    >
      {/* Floating Heritage Seal Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Mở Sổ Tay Thực Khách 1986"
        className="flex items-center gap-2.5 px-4 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#0c1f17] via-[#091711] to-[#0c1f17] hover:brightness-110 text-amber-100 border border-[#d4af37]/80 shadow-[0_10px_30px_rgba(0,0,0,0.55),0_0_20px_rgba(212,175,55,0.25)] backdrop-blur-xl transition-all duration-300 active:scale-95 group cursor-pointer"
      >
        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#96281b] to-[#6a150c] flex items-center justify-center text-amber-200 text-xs font-bold font-serif shadow-xs ring-1 ring-[#d4af37]/60 shrink-0 group-hover:scale-105 transition-transform">
          <Soup className="w-3.5 h-3.5" />
        </span>
        <div className="flex items-center gap-1.5 text-left leading-tight">
          <span className="text-xs sm:text-sm font-bold tracking-wide font-serif text-[#fae29c]">
            Thực Đơn Tinh Hoa
          </span>
          <span className="text-[10px] sm:text-xs text-amber-300/80 font-medium truncate max-w-[95px] sm:max-w-[130px]">
            • {activeTitle}
          </span>
          <ChevronUp className={`w-3.5 h-3.5 text-amber-400/90 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Sổ Tay Thực Khách Popover / Sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="heritage-nav-popover"
            variants={popoverMotion}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-x-3 bottom-[132px] sm:inset-auto sm:bottom-full sm:mb-3.5 sm:w-[420px] bg-gradient-to-b from-[#0c1f17]/98 via-[#091711]/98 to-[#050e0a]/98 border border-[#d4af37]/75 rounded-3xl p-3.5 sm:p-4.5 shadow-[0_24px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(212,175,55,0.2)] backdrop-blur-2xl z-40 text-stone-100"
          >
            {/* Desktop Pointer Arrow */}
            <div className="hidden sm:block absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#06100c] border-r border-b border-[#d4af37]/75 rotate-45" />

            {/* Header: Sổ Tay Thực Khách 1986 */}
            <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-[#d4af37]/30">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#96281b] text-[#fae29c] font-serif font-bold text-xs flex items-center justify-center border border-[#d4af37]/50 shadow-xs">
                  1986
                </span>
                <div>
                  <h4 className="font-serif text-sm sm:text-base font-bold text-amber-200 tracking-wide">
                    Sổ Tay Thực Khách 1986
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-stone-300/80 italic font-serif">
                    Chạm chọn phân vị phở bác muốn thưởng thức
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-amber-200 border border-stone-600/40 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Food Categories List */}
            <div className="space-y-1.5 max-h-[56vh] sm:max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
              {HERITAGE_NAV_ITEMS.map((item) => {
                const isCurrent = activeCategory === item.id;
                const IconComponent = item.icon;
                const itemCount = item.id === 'all'
                  ? 24
                  : item.id === 'favorites'
                    ? favoriteIds.length
                    : (groupedItems[item.id] || []).length;

                return (
                  <motion.button
                    key={item.id}
                    variants={itemMotion}
                    type="button"
                    onClick={() => handlePick(item.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all duration-200 group cursor-pointer ${
                      isCurrent
                        ? 'bg-gradient-to-r from-[#96281b]/40 via-[#96281b]/20 to-transparent border border-[#d4af37] ring-1 ring-[#d4af37]/40 shadow-md'
                        : 'bg-white/[0.03] hover:bg-white/[0.08] border border-stone-800/80 hover:border-[#d4af37]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 ${
                        isCurrent
                          ? 'bg-[#96281b] border-[#d4af37] text-amber-200 shadow-xs'
                          : 'bg-[#0e241b] border-[#d4af37]/40 text-amber-300/90'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-serif text-xs sm:text-sm font-bold truncate ${
                            isCurrent ? 'text-amber-200' : 'text-stone-100 group-hover:text-amber-200'
                          }`}>
                            {item.title}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border shrink-0 ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-400 truncate mt-0.5 font-sans">
                          {item.subtitle}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-amber-300/80">
                          <span className="font-semibold text-amber-200">{item.priceText}</span>
                          <span className="text-stone-600">•</span>
                          <span className="text-stone-400">{itemCount} món</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-all ${
                      isCurrent ? 'text-[#fae29c] translate-x-0.5' : 'text-stone-500 group-hover:text-amber-300 group-hover:translate-x-0.5'
                    }`} />
                  </motion.button>
                );
              })}
            </div>

            {/* Footer Note */}
            <div className="pt-2.5 mt-2 border-t border-[#d4af37]/20 flex items-center justify-between text-[10px] text-stone-400">
              <span className="italic font-serif">Phở Gia Truyền 1986 • Nấu bằng cả tấm lòng</span>
              <span className="text-[#d4af37] font-bold">100% Tươi Mới</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

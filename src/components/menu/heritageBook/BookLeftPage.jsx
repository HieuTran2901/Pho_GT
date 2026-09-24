import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Crown,
  Sparkles,
  Volume2,
  VolumeX,
  Search,
  X,
  Plus,
  Heart,
} from 'lucide-react';
import { formatPrice } from '../menuConstants';

const EMPTY_SET = new Set();

const pageFlipVariants = {
  enter: (dir) => ({
    rotateY: dir > 0 ? 35 : -35,
    opacity: 0,
    x: dir > 0 ? 24 : -24,
    scale: 0.98,
    transition: { duration: 0.28, ease: [0.25, 1, 0.5, 1] },
  }),
  center: {
    rotateY: 0,
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.28, ease: [0.25, 1, 0.5, 1] },
  },
  exit: (dir) => ({
    rotateY: dir > 0 ? -35 : 35,
    opacity: 0,
    x: dir > 0 ? -24 : 24,
    scale: 0.98,
    transition: { duration: 0.2, ease: [0.25, 1, 0.5, 1] },
  }),
};

function BookLeftPage({
  categories,
  activeCategory,
  onSelectCategory,
  dishes,
  selectedDish,
  onSelectDish,
  currentPage = 1,
  totalPages = 1,
  direction = 0,
  onPrevPage,
  onNextPage,
  isSoundEnabled = true,
  onToggleSound,
  searchQuery = '',
  onSearchChange,
  onQuickAdd,
  favoriteIdsSet = EMPTY_SET,
  onToggleFavorite,
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [poppingDishId, setPoppingDishId] = useState(null);
  const popTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (popTimerRef.current) clearTimeout(popTimerRef.current);
    };
  }, []);

  const handleRowToggleFavorite = useCallback(
    (dish, e) => {
      e.stopPropagation();
      if (!dish || !onToggleFavorite) return;
      const isDishLiked = favoriteIdsSet ? favoriteIdsSet.has(dish.id) : false;
      const isAdding = !isDishLiked;

      if (isAdding) {
        setPoppingDishId(dish.id);
        if (popTimerRef.current) clearTimeout(popTimerRef.current);
        popTimerRef.current = setTimeout(() => setPoppingDishId(null), 650);
      }

      let coords = null;
      if (e && e.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        coords = {
          startX: rect.left + rect.width / 2,
          startY: rect.top + rect.height / 2,
        };
      }

      onToggleFavorite(dish, coords, isAdding);
    },
    [favoriteIdsSet, onToggleFavorite]
  );

  return (
    <div className="w-full min-w-0 flex flex-col justify-between p-4 sm:p-5 lg:p-6 bg-[#fbf7ee] rounded-l-3xl md:border-r border-[#e8ddce] relative shadow-inner [perspective:1200px]">
      <div>
        {/* Row 1: Header Title & Sound Toggle */}
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#ebdcc7]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#3e1f14] text-[#f7eedf] flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-4.5 h-4.5 text-[#caa876]" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#2c1810] leading-tight">
                Sổ Tay Thực Khách 1986
              </h2>
              <p className="text-stone-500 text-[11px]">
                Khám phá món ngon di sản chuẩn vị
              </p>
            </div>
          </div>

          {/* Header Controls: Quick Search & Sound Toggle */}
          <div className="flex items-center gap-1.5">
            {isSearchOpen ? (
              <div className="flex items-center gap-1 bg-[#efe6d5] px-2 py-0.5 rounded-full border border-[#caa876]/70 shadow-inner">
                <Search className="w-3.5 h-3.5 text-[#96281b] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                  placeholder="Tìm món..."
                  className="w-20 sm:w-28 bg-transparent text-xs text-[#2c1810] placeholder-stone-400 focus:outline-none font-serif"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    if (onSearchChange) onSearchChange('');
                    setIsSearchOpen(false);
                  }}
                  className="text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                title="Tìm món nhanh trong sổ"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#efe6d5] hover:bg-[#e4d8c3] text-[#5e4b3c] transition-colors cursor-pointer border border-[#dfd3bf] shadow-2xs"
              >
                <Search className="w-3.5 h-3.5 text-[#96281b]" />
                <span className="text-[10px] font-mono font-bold hidden xs:inline">Tìm món</span>
              </button>
            )}

            {/* Sound Toggle Button */}
            {onToggleSound && (
              <button
                type="button"
                onClick={onToggleSound}
                title={isSoundEnabled ? 'Tắt âm thanh lật giấy' : 'Bật âm thanh lật giấy'}
                className="inline-flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-full bg-[#efe6d5] hover:bg-[#e4d8c3] text-[#5e4b3c] transition-colors cursor-pointer border border-[#dfd3bf] shadow-2xs"
              >
                {isSoundEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#96281b]" />
                    <span className="text-[10px] font-mono font-bold hidden sm:inline">Âm thanh</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-[10px] font-mono font-medium text-stone-400 hidden sm:inline">Tắt âm</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Category Tabs with Horizontal Touch Scroll & Favorites Badge */}
        <div className="flex items-center gap-1 sm:gap-1.5 mb-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const isFavTab = cat.id === 'favorites';
            return (
              <button
                key={cat.id}
                id={isFavTab ? 'category-tab-favorites' : undefined}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`shrink-0 sm:flex-1 text-center py-1.5 px-2 sm:px-2.5 rounded-lg text-xs font-serif font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 ${
                  isActive
                    ? 'bg-[#3e1f14] text-[#fbf6ee] shadow-xs scale-102 border border-[#3e1f14]'
                    : 'bg-[#efe6d5] text-[#5e4b3c] hover:bg-[#e4d8c3] border border-[#dfd4c0]'
                }`}
              >
                {isFavTab && (
                  <Heart
                    className={`w-3 h-3 shrink-0 ${
                      isActive ? 'fill-[#e05345] text-[#e05345]' : 'fill-[#96281b]/30 text-[#96281b]'
                    }`}
                  />
                )}
                <span>{cat.name}</span>
                {isFavTab && favoriteIdsSet.size > 0 && (
                  <span
                    className={`ml-0.5 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-[#96281b] text-white' : 'bg-[#dfd3bf] text-[#3e1f14]'
                    }`}
                  >
                    {favoriteIdsSet.size}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 3D Animated Dishes List with Drag / Swipe Gesture */}
        <div className="relative overflow-hidden min-h-[260px] sm:min-h-[275px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`page-${currentPage}-${activeCategory}-${searchQuery}`}
              custom={direction}
              variants={pageFlipVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                if (info.offset.x < -35 || info.velocity.x < -150) {
                  if (currentPage < totalPages && onNextPage) onNextPage();
                } else if (info.offset.x > 35 || info.velocity.x > 150) {
                  if (currentPage > 1 && onPrevPage) onPrevPage();
                }
              }}
              className="space-y-2 sm:space-y-2.5 touch-pan-y cursor-grab active:cursor-grabbing select-none"
            >
              {dishes.length === 0 ? (
                <div className="py-12 text-center text-stone-500 font-serif">
                  {activeCategory === 'favorites' ? (
                    <div className="space-y-2 px-4">
                      <div className="w-12 h-12 mx-auto rounded-full bg-[#fcedea] flex items-center justify-center text-[#96281b] shadow-inner">
                        <Heart className="w-6 h-6 text-[#96281b] fill-[#96281b]/20" />
                      </div>
                      <p className="text-xs font-bold text-[#3e1f14]">Chưa có món yêu thích nào</p>
                      <p className="text-[11px] text-stone-500 italic max-w-[220px] mx-auto leading-relaxed">
                        Bác hãy bấm biểu tượng ❤️ trên món ăn để lưu vào danh sách tâm đắc nhé!
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs italic">Không tìm thấy món "{searchQuery}" trong mục này...</p>
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => onSearchChange && onSearchChange('')}
                          className="mt-2 text-xs text-[#96281b] hover:underline cursor-pointer font-bold"
                        >
                          Xóa tìm kiếm
                        </button>
                      )}
                    </>
                  )}
                </div>
              ) : (
                dishes.map((dish) => {
                const isSelected = selectedDish && selectedDish.id === dish.id;
                const isDishLiked = favoriteIdsSet && favoriteIdsSet.has(dish.id);
                return (
                  <div
                    key={dish.id}
                    onClick={() => onSelectDish(dish)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') onSelectDish(dish);
                    }}
                    className={`group flex items-center gap-3 p-2 sm:p-2.5 rounded-xl transition-all duration-200 cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#f4e7d1] border-2 border-[#caa876] shadow-sm scale-[1.01]'
                        : 'bg-[#fcfaf4] hover:bg-[#f6efe1] border border-[#e8decd] hover:border-[#caa876]/60 shadow-2xs'
                    }`}
                  >
                    {/* Thumbnail with crown badge & favorite heart */}
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border border-[#dfd3c0]">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute top-0 left-0 w-4 h-4 bg-[#caa876] rounded-br-lg flex items-center justify-center shadow-xs">
                          <Crown className="w-2.5 h-2.5 text-[#3e1f14] fill-current" />
                        </div>
                      )}
                      {isDishLiked && (
                        <div className="absolute top-0 right-0 w-4 h-4 bg-[#96281b] rounded-bl-lg flex items-center justify-center shadow-xs">
                          <Heart className="w-2.5 h-2.5 text-white fill-white" />
                        </div>
                      )}
                    </div>

                    {/* Dish Text Content */}
                    <div className="flex-1 min-w-0 pointer-events-none">
                      <h3 className="font-serif text-xs sm:text-sm font-bold text-[#2c1810] line-clamp-2 leading-snug">
                        {dish.name}
                      </h3>
                      <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-tight">
                        {dish.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs sm:text-sm font-bold text-[#96281b]">
                          {formatPrice(dish.price)}
                        </span>
                        {dish.tag && (
                          <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-[#96281b]/10 text-[#96281b] font-semibold border border-[#96281b]/20">
                            {dish.tag}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons: Favorite heart toggle + Quick Add [+] on mobile + Arrow indicator */}
                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                      {onToggleFavorite && (
                        <button
                          type="button"
                          onClick={(e) => handleRowToggleFavorite(dish, e)}
                          title={isDishLiked ? 'Bỏ yêu thích' : 'Yêu thích món này'}
                          aria-label={`Yêu thích món ${dish.name}`}
                          className={`relative w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 border overflow-visible ${
                            isDishLiked
                              ? 'bg-[#fcedea] text-[#96281b] border-[#e8c5c0] shadow-xs'
                              : 'bg-white/80 hover:bg-white text-stone-400 hover:text-[#96281b] border-stone-200/80'
                          }`}
                        >
                          {poppingDishId === dish.id && (
                            <span className="absolute inset-0 pointer-events-none flex items-center justify-center">
                              <span className="absolute w-1.5 h-1.5 rounded-full bg-rose-500 -translate-y-3 animate-spark-burst" />
                              <span
                                className="absolute w-1 h-1 rounded-full bg-amber-400 translate-x-3 animate-spark-burst"
                                style={{ animationDelay: '40ms' }}
                              />
                              <span
                                className="absolute w-1.5 h-1.5 rounded-full bg-rose-400 translate-y-3 animate-spark-burst"
                                style={{ animationDelay: '80ms' }}
                              />
                              <span
                                className="absolute w-1 h-1 rounded-full bg-amber-500 -translate-x-3 animate-spark-burst"
                                style={{ animationDelay: '60ms' }}
                              />
                            </span>
                          )}
                          <Heart
                            className={`w-3.5 h-3.5 transition-transform ${
                              poppingDishId === dish.id
                                ? 'animate-heart-pop fill-[#ff2e63] text-[#ff2e63]'
                                : isDishLiked
                                ? 'fill-[#96281b] text-[#96281b]'
                                : ''
                            }`}
                          />
                        </button>
                      )}
                      {onQuickAdd && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickAdd(dish, e);
                          }}
                          title="Thêm nhanh vào bàn"
                          aria-label={`Thêm nhanh ${dish.name} vào bàn`}
                          className="md:hidden w-7 h-7 rounded-full bg-[#96281b] hover:bg-[#7e1f14] text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-90 transition-transform"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div
                        className={`hidden md:flex w-7 h-7 rounded-full items-center justify-center shrink-0 transition-colors pointer-events-none ${
                          isSelected
                            ? 'bg-[#caa876] text-[#3e1f14]'
                            : 'bg-stone-200/70 text-stone-500 group-hover:bg-[#caa876]/40'
                        }`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              }))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Left Page Footer: Elegant Heritage Navigation */}
      <div className="pt-2 sm:pt-2.5 mt-2 border-t border-[#ebdcc7]/80 flex items-center justify-between text-[11px] sm:text-xs text-stone-600 font-serif">
        {/* Left: Responsive gentle swipe hint */}
        <div className="flex items-center gap-1.5 text-stone-500 italic text-[11px] select-none">
          <Sparkles className="w-3 h-3 text-[#caa876] shrink-0 animate-pulse" />
          <span className="hidden sm:inline">Vuốt hoặc dùng phím ← → để lật</span>
          <span className="sm:hidden">Vuốt để lật trang</span>
        </div>

        {/* Right: Heritage Pagination Capsule [ < ] Trang 1 / 7 [ > ] */}
        <div className="inline-flex items-center gap-0.5 sm:gap-1 bg-[#f5ede0]/95 border border-[#dfd2be] rounded-full p-0.5 sm:px-1 shadow-2xs">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            aria-label="Trang trước"
            title="Về trang trước"
            className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full flex items-center justify-center text-[#5c3a21] hover:text-[#3e1f14] hover:bg-[#e4d5c0] disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-90 cursor-pointer"
          >
            <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>

          <span className="px-1.5 sm:px-2 font-serif text-[11px] sm:text-xs font-bold text-[#3e1f14] tracking-wide select-none">
            Trang {currentPage} <span className="text-stone-400 font-normal">/</span> {totalPages}
          </span>

          <button
            type="button"
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            aria-label="Trang tiếp theo"
            title="Sang trang sau"
            className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full flex items-center justify-center text-[#5c3a21] hover:text-[#3e1f14] hover:bg-[#e4d5c0] disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-90 cursor-pointer"
          >
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(BookLeftPage);

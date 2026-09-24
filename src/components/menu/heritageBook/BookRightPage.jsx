import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  CheckCircle2,
  Sparkles,
  Flame,
  ChevronLeft,
  SlidersHorizontal,
} from 'lucide-react';
import { formatPrice } from '../menuConstants';

const DEFAULT_HIGHLIGHTS = [
  'Thịt tuyển chọn tươi mềm',
  'Nước dùng ninh tủy 24h',
  'Bánh phở tráng thủ công',
  'Hành hoa & thảo mộc gia truyền',
];

function BookRightPage({
  dish,
  isLiked,
  onToggleLike,
  onAddToCart,
  onOpenCustomizer,
  isAdded,
  onBackToList,
}) {
  const [quantity, setQuantity] = useState(1);
  const [isPopping, setIsPopping] = useState(false);
  const popTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (popTimerRef.current) clearTimeout(popTimerRef.current);
    };
  }, []);

  const handleDecrease = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  const handleIncrease = useCallback(() => {
    setQuantity((prev) => Math.min(20, prev + 1));
  }, []);

  const handleToggleHeart = useCallback(
    (e) => {
      e.stopPropagation();
      if (!dish || !onToggleLike) return;
      const isAdding = !isLiked;
      if (isAdding) {
        setIsPopping(true);
        if (popTimerRef.current) clearTimeout(popTimerRef.current);
        popTimerRef.current = setTimeout(() => setIsPopping(false), 650);
      }

      let coords = null;
      if (e && e.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        coords = {
          startX: rect.left + rect.width / 2,
          startY: rect.top + rect.height / 2,
        };
      }

      onToggleLike(dish, coords, isAdding);
    },
    [dish, isLiked, onToggleLike]
  );

  const handleAddClick = useCallback(
    (e) => {
      if (dish && onAddToCart) {
        onAddToCart(dish, quantity, e);
      }
    },
    [dish, quantity, onAddToCart]
  );

  if (!dish) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#fbf7ee] rounded-r-3xl text-stone-400">
        <p className="font-serif italic">Vui lòng chọn một món ăn từ trang bên...</p>
      </div>
    );
  }

  // Extract 4 key highlights from highlights or ingredients or default
  const dishHighlights =
    dish.highlights && dish.highlights.length >= 4
      ? dish.highlights.slice(0, 4)
      : dish.ingredients && dish.ingredients.length >= 4
      ? dish.ingredients.slice(0, 4)
      : DEFAULT_HIGHLIGHTS;

  return (
    <div
      id="tour-first-dish-card"
      data-tour="tour-first-dish-card"
      className="w-full min-w-0 flex flex-col justify-between p-3.5 sm:p-5 lg:p-6 bg-[#fbf7ee] rounded-[24px] md:rounded-l-none md:rounded-r-3xl relative shadow-inner"
    >
      <div>
        {/* Calligraphy Header Quote & Mobile Back Button */}
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#ebdcc7]/80">
          {onBackToList ? (
            <button
              type="button"
              onClick={onBackToList}
              className="md:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ebdcc7]/90 hover:bg-[#dfd1bc] text-[#3e1f14] font-serif text-xs font-bold transition-all shadow-2xs cursor-pointer border border-[#caa876]/50 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-[#96281b]" />
              <span>← Trở lại sổ</span>
            </button>
          ) : (
            <span className="font-serif italic text-xs text-stone-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#caa876]" />
              "Mỗi món ăn là một câu chuyện di sản..."
            </span>
          )}

          <div className="flex items-center gap-2">
            {onBackToList && (
              <span className="md:hidden font-serif italic text-xs text-stone-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#caa876]" />
                Chi tiết
              </span>
            )}
            <span className="text-[10px] font-serif uppercase tracking-widest text-[#caa876] bg-[#3e1f14] px-2 py-0.5 rounded font-bold">
              1986
            </span>
          </div>
        </div>

        {/* Deluxe Heritage Dish Image Showcase (Golden 16:10 Ratio) */}
        <div className="relative w-full h-40 xs:h-44 sm:h-56 lg:h-60 rounded-2xl overflow-hidden border border-[#dfd3c0] shadow-md group shrink-0">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500"
          />
          {/* Subtle warm overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent pointer-events-none" />

          {/* Badge top-left */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3e1f14]/90 text-[#caa876] text-xs font-bold shadow-md backdrop-blur-xs border border-[#caa876]/40">
            <Flame className="w-3.5 h-3.5 text-[#e57a44]" />
            <span>{dish.tag || 'Bán chạy'}</span>
          </div>

          {/* Favorite Heart Button top-right with Spark Burst & Pop Animation */}
          <button
            type="button"
            onClick={handleToggleHeart}
            aria-label="Thêm vào món yêu thích"
            title={isLiked ? 'Bỏ thích món' : 'Yêu thích món này'}
            className={`absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 hover:bg-white flex items-center justify-center shadow-md border border-stone-200/80 text-stone-600 transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xs z-10 overflow-visible ${
              isLiked ? 'shadow-[0_4px_14px_rgba(225,29,72,0.25)]' : ''
            }`}
          >
            {isPopping && (
              <span className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <span className="absolute w-2 h-2 rounded-full bg-rose-500 -translate-y-4 animate-spark-burst" />
                <span
                  className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 translate-x-4 animate-spark-burst"
                  style={{ animationDelay: '40ms' }}
                />
                <span
                  className="absolute w-2 h-2 rounded-full bg-rose-400 translate-y-4 animate-spark-burst"
                  style={{ animationDelay: '80ms' }}
                />
                <span
                  className="absolute w-1.5 h-1.5 rounded-full bg-amber-500 -translate-x-4 animate-spark-burst"
                  style={{ animationDelay: '60ms' }}
                />
                <span
                  className="absolute w-1.5 h-1.5 rounded-full bg-rose-600 translate-x-3 -translate-y-3 animate-spark-burst"
                  style={{ animationDelay: '100ms' }}
                />
                <span
                  className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 -translate-x-3 -translate-y-3 animate-spark-burst"
                  style={{ animationDelay: '120ms' }}
                />
              </span>
            )}

            <Heart
              className={`w-5 h-5 transition-all duration-200 ${
                isPopping
                  ? 'animate-heart-pop fill-[#ff2e63] text-[#ff2e63] drop-shadow-[0_2px_6px_rgba(255,46,99,0.6)]'
                  : isLiked
                  ? 'fill-rose-500 text-rose-500 scale-105'
                  : 'text-stone-600 hover:text-rose-500'
              }`}
            />
          </button>
        </div>

        {/* Dish Title & Price */}
        <div className="mt-3 sm:mt-3.5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-[#2c1810] leading-snug">
              {dish.name}
            </h3>
            <span className="font-bold text-[#96281b] text-lg sm:text-xl shrink-0 font-serif">
              {formatPrice(dish.price)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-1">
            {dish.description}
          </p>
        </div>

        {/* Highlights Checklist (2x2 Grid) */}
        <div className="mt-3 pt-2.5 border-t border-[#ebdcc7]/80">
          <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#5e4b3c] mb-1.5 font-serif flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#caa876]" />
            Đặc điểm nổi bật
          </h4>
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            {dishHighlights.map((hl, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-xs text-stone-700"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#caa876] shrink-0" />
                <span className="leading-snug">{hl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer: Stepper & Add to Table Button */}
      <div className="mt-3 pt-2.5 border-t border-[#ebdcc7] flex items-center gap-3">
        {/* Quantity Stepper */}
        <div className="inline-flex items-center rounded-full bg-[#efe5d3] border border-[#d8caa5] p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={quantity <= 1}
            aria-label="Giảm số lượng"
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#3e1f14] hover:bg-[#dfd1bd] disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-bold text-[#2c1810] font-mono">
            {quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrease}
            aria-label="Tăng số lượng"
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#3e1f14] hover:bg-[#dfd1bd] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Customizer Button (Gu Phở 1986) */}
        {onOpenCustomizer && (
          <button
            type="button"
            onClick={(e) => onOpenCustomizer(dish, e)}
            className="inline-flex items-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold font-serif bg-gradient-to-r from-[#8a1e14] to-[#a3271b] hover:from-[#a3271b] hover:to-[#be2e20] text-white border border-[#d4af37]/60 shadow-md active:scale-95 transition-all cursor-pointer"
            title="Tùy biến nước dùng, bánh phở, hành hoa, trứng chần, quẩy giòn..."
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#f6d892]" />
            <span className="hidden sm:inline">Tùy biến gu</span>
            <span className="sm:hidden">Gu 1986</span>
          </button>
        )}

        {/* Add to Table Button */}
        <button
          id="tour-first-dish-add-btn"
          data-tour="dish-add-btn"
          type="button"
          onClick={handleAddClick}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold font-serif shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${
            isAdded
              ? 'bg-emerald-800 text-white'
              : 'bg-gradient-to-r from-[#4d2015] to-[#34140c] hover:from-[#62291b] hover:to-[#451c11] text-[#fcf6ee] border border-[#7a3929]'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-[#caa876]" />
          <span>{isAdded ? 'Đã thêm!' : '+ Thêm vào bàn'}</span>
        </button>
      </div>
    </div>
  );
}

export default React.memo(BookRightPage);

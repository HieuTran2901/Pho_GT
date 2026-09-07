import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Check,
  Sparkles,
  CheckCircle2,
  Heart
} from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';
import LazyDishImage from './LazyDishImage';
import { FeatureIcon, TagBadgeIcon, formatPrice } from './menuConstants';

/* Individual Menu Card with harmonious layout and hero bowl prominence */
const MenuCard = React.memo(function MenuCard({
  item,
  index,
  isAdded,
  onAdd,
  isLiked,
  onToggleLike,
  onOpenDetail,
}) {
  const [cardRef, isVisible] = useScrollReveal({
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });
  const [floatingPlusOne, setFloatingPlusOne] = useState(false);
  const [isPopping, setIsPopping] = useState(false);

  const plusOneTimerRef = useRef(null);
  const popTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (plusOneTimerRef.current) clearTimeout(plusOneTimerRef.current);
      if (popTimerRef.current) clearTimeout(popTimerRef.current);
    };
  }, []);

  // Stagger wave delay for 3 columns: 0ms, 120ms, 240ms
  const staggerDelay = (index % 3) * 120;

  const handleCardClick = (e) => {
    setFloatingPlusOne(true);
    if (plusOneTimerRef.current) clearTimeout(plusOneTimerRef.current);
    plusOneTimerRef.current = setTimeout(() => setFloatingPlusOne(false), 950);
    onAdd(item, e);
  };

  const handleToggleHeart = (e) => {
    const isAdding = !isLiked;
    if (isAdding) {
      setIsPopping(true);
      if (popTimerRef.current) clearTimeout(popTimerRef.current);
      popTimerRef.current = setTimeout(() => setIsPopping(false), 650);
    }

    let coords = null;
    if (isAdding && e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      coords = {
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
      };
    }

    onToggleLike(item, coords, isAdding);
  };

  const isGreenTheme = item.theme === 'green';

  return (
    <div
      ref={cardRef}
      className={`group bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-stone-200/90 shadow-2xs md:shadow-sm hover:shadow-xl md:hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full ${
        isVisible ? 'animate-card-reveal' : 'opacity-0'
      }`}
      style={{
        animationDelay: isVisible ? `${staggerDelay}ms` : '0ms',
      }}
    >
      {/* ================= MOBILE VIEW (< md): COMPACT HORIZONTAL F&B ROW ================= */}
      <div
        className="md:hidden p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer active:bg-stone-50/80 transition-colors select-none relative"
        onClick={() => onOpenDetail && onOpenDetail(item)}
      >
        {/* Left Column: Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
          <div>
            {/* Top row: Tag & Portion */}
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white shadow-2xs ${
                  isGreenTheme ? 'bg-[#1b3425]' : 'bg-[#96281b]'
                }`}
              >
                {item.tagIcon && <TagBadgeIcon icon={item.tagIcon} />}
                <span>{item.tag}</span>
              </span>
              <span className="text-[10px] text-stone-500 font-medium">
                {item.portion || 'Tô thường'}
              </span>
            </div>

            {/* Dish Title */}
            <h3 className="font-serif text-[15px] sm:text-base font-bold text-[#1b3425] leading-snug truncate">
              {item.name}
            </h3>

            {/* Concise Description */}
            <p className="text-stone-500 text-[11px] sm:text-xs leading-tight line-clamp-2 mt-0.5">
              {item.description}
            </p>
          </div>

          {/* Bottom row: Price & Quick View prompt */}
          <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-stone-100">
            <div className="font-serif font-bold text-sm sm:text-[15px] text-[#96281b] tracking-tight">
              {formatPrice(item.price)}
            </div>
            <span className="text-[10px] text-stone-400 font-medium flex items-center gap-0.5">
              <span>Chi tiết</span>
              <span>→</span>
            </span>
          </div>
        </div>

        {/* Right Column: Square Image + Quick Actions */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 bg-stone-100 shadow-inner">
          <LazyDishImage
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Mini Floating Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleHeart(e);
            }}
            aria-label={isLiked ? "Bỏ yêu thích" : "Yêu thích món này"}
            className={`absolute top-1.5 right-1.5 w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 active:scale-90 shadow-sm ${
              isLiked
                ? 'bg-white/95 border border-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.18)]'
                : 'bg-black/35 hover:bg-black/55 text-white/90'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isLiked
                  ? 'fill-[#ff2e63] text-[#ff2e63] drop-shadow-[0_1px_4px_rgba(255,46,99,0.5)]'
                  : 'text-white'
              }`}
            />
          </button>

          {/* Floating +1 Indicator on Mobile */}
          {floatingPlusOne && (
            <span className="absolute top-1 left-1 z-30 bg-[#96281b] text-amber-200 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg border border-amber-300 animate-float-up whitespace-nowrap pointer-events-none">
              +1
            </span>
          )}

          {/* Mini Fast Add Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick(e);
            }}
            aria-label={`Thêm ${item.name} vào bàn`}
            className={`absolute bottom-1.5 right-1.5 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 active:scale-90 ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : isGreenTheme
                ? 'bg-[#1b3425] text-white hover:bg-[#14281c]'
                : 'bg-[#96281b] text-white hover:bg-[#802216]'
            }`}
          >
            {isAdded ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Plus className="w-4 h-4 text-amber-300" />
            )}
          </button>
        </div>
      </div>

      {/* ================= DESKTOP VIEW (>= md): ORIGINAL 3D HERO CARD ================= */}
      <div className="hidden md:flex flex-col justify-between h-full">
        {/* Item Image with 4:3 Hero Aspect Ratio, Tag Badge & Slide-Up Glassmorphism Feature Pills */}
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          <LazyDishImage
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />

          {/* Top-left Tag Badge */}
          <div className="absolute top-3.5 left-3.5 z-10">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white shadow-md backdrop-blur-xs ${
                isGreenTheme ? 'bg-[#1b3425]/95' : 'bg-[#96281b]/95'
              }`}
            >
              {item.tagIcon && <TagBadgeIcon icon={item.tagIcon} />}
              <span>{item.tag}</span>
            </span>
          </div>

          {/* Top-right Floating Glass Heart Badge with Pop & Confetti Sparks */}
          <div className="absolute top-3.5 right-3.5 z-30">
            <button
              type="button"
              onClick={handleToggleHeart}
              aria-label={isLiked ? "Bỏ yêu thích" : "Yêu thích món này"}
              title={isLiked ? "Bỏ yêu thích" : "Lưu vào món yêu thích"}
              className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full backdrop-blur-md transition-all duration-300 flex items-center justify-center shadow-md active:scale-90 overflow-visible ${
                isLiked
                  ? 'bg-white/95 border border-white/90 shadow-[0_4px_14px_rgba(0,0,0,0.18)]'
                  : 'bg-black/35 hover:bg-black/60 border border-white/30 text-white/90 hover:text-rose-400 hover:border-rose-400/50'
              }`}
            >
              {isPopping && (
                <span className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <span className="absolute w-2 h-2 rounded-full bg-rose-500 -translate-y-4 animate-spark-burst" />
                  <span className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 translate-x-4 animate-spark-burst" style={{ animationDelay: '40ms' }} />
                  <span className="absolute w-2 h-2 rounded-full bg-rose-400 translate-y-4 animate-spark-burst" style={{ animationDelay: '80ms' }} />
                  <span className="absolute w-1.5 h-1.5 rounded-full bg-amber-500 -translate-x-4 animate-spark-burst" style={{ animationDelay: '60ms' }} />
                  <span className="absolute w-1.5 h-1.5 rounded-full bg-rose-600 translate-x-3 -translate-y-3 animate-spark-burst" style={{ animationDelay: '100ms' }} />
                  <span className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 -translate-x-3 -translate-y-3 animate-spark-burst" style={{ animationDelay: '120ms' }} />
                </span>
              )}

              <Heart
                className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-all duration-200 ${
                  isPopping
                    ? 'animate-heart-pop fill-[#ff2e63] text-[#ff2e63] drop-shadow-[0_2px_6px_rgba(255,46,99,0.6)]'
                    : isLiked
                    ? 'fill-[#ff2e63] text-[#ff2e63] drop-shadow-[0_2px_6px_rgba(255,46,99,0.5)] scale-110'
                    : ''
                }`}
              />
            </button>
          </div>

          {/* Ingredient Pills Sheet (Slides up from bowl image bottom on hover) */}
          {item.featurePills && item.featurePills.length > 0 && (
            <div
              className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/95 via-black/80 to-black/40 backdrop-blur-md border-t border-white/20 transition-all duration-300 ease-out z-20 translate-y-full opacity-0 pointer-events-none sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto"
            >
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-amber-300 tracking-wider mb-2 px-0.5">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Nguyên Liệu Tinh Tuyển
                </span>
                <span className="text-[9.5px] text-stone-300 font-normal lowercase tracking-normal">
                  gia truyền 1986
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {item.featurePills.map((pill, pIdx) => (
                  <div
                    key={pIdx}
                    title={`${pill.label} — ${pill.sub}`}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-2 px-1 text-center flex flex-col items-center justify-center transition-all duration-200 backdrop-blur-xs shadow-xs"
                  >
                    <div className="mb-1 text-amber-300">
                      <FeatureIcon type={pill.type} />
                    </div>
                    <span className="text-[10px] sm:text-[10.5px] font-bold text-white leading-tight w-full truncate">
                      {pill.label}
                    </span>
                    <span className="text-[9px] sm:text-[9.5px] text-amber-100/90 leading-tight w-full truncate mt-0.5 font-medium">
                      {pill.sub}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
          <div>
            {/* Title & Price Block */}
            <div className="flex items-start justify-between gap-2.5 mb-2">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1b3425] group-hover:text-[#96281b] transition-colors leading-snug">
                {item.name}
              </h3>
              <div className="text-right shrink-0">
                <div className="font-serif font-bold text-lg sm:text-xl text-[#96281b] tracking-tight">
                  {formatPrice(item.price)}
                </div>
                <div className="mt-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-200/80">
                    {item.portion || 'Tô thường'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-stone-600 text-xs sm:text-[13px] leading-relaxed mb-4 min-h-[44px]">
              {item.description}
            </p>

            {/* Highlights */}
            {item.highlights && item.highlights.length > 0 && (
              <div className="pt-3 pb-1 border-t border-stone-200/70 mb-4">
                <div className="text-xs font-bold text-stone-900 mb-2.5">
                  Đặc điểm nổi bật
                </div>
                <div className="grid grid-cols-2 gap-x-2.5 gap-y-2 text-stone-600">
                  {item.highlights.map((highlight, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-1.5 min-w-0">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          isGreenTheme ? 'text-[#1b3425]' : 'text-[#96281b]'
                        }`}
                      />
                      <span className="text-[11px] sm:text-[11.5px] leading-tight text-stone-600 font-normal">
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="relative mt-auto pt-2">
            {floatingPlusOne && (
              <span className="absolute -top-4 right-8 z-30 bg-[#96281b] text-amber-200 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xl border border-amber-300 pointer-events-none animate-float-up whitespace-nowrap">
                +1 Bát Phở
              </span>
            )}

            <button
              onClick={handleCardClick}
              className={`relative overflow-hidden w-full py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-sm active:scale-[0.98] ${
                isAdded
                  ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                  : isGreenTheme
                  ? 'bg-[#1b3425] text-white hover:bg-[#14281c] hover:shadow-[0_4px_18px_rgba(27,52,37,0.35)]'
                  : 'bg-[#96281b] text-white hover:bg-[#802216] hover:shadow-[0_4px_18px_rgba(150,40,27,0.35)]'
              }`}
            >
              <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-[300%] transition-transform duration-700 ease-in-out pointer-events-none" />

              {isAdded ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Đã Thêm Vào Bàn!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-amber-300 group-hover/btn:rotate-90 transition-transform duration-300" />
                  <span>Thêm vào bàn</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default MenuCard;

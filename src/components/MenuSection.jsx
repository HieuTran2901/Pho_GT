import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  Check,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Heart,
  Beef,
  Soup,
  Wheat,
  Utensils,
  Leaf,
  Flame,
  Star,
  Coffee,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { MENU_CATEGORIES, MENU_ITEMS } from '../data/menuData';
import useScrollReveal from '../hooks/useScrollReveal';
import FlyingHeart from './FlyingHeart';

/* Mini icon selector for the 4 feature pills */
function FeatureIcon({ type }) {
  switch (type) {
    case 'meat':
      return <Beef className="w-3.5 h-3.5" />;
    case 'noodle':
      return <Wheat className="w-3.5 h-3.5" />;
    case 'broth':
      return <Soup className="w-3.5 h-3.5" />;
    case 'herb':
    case 'leaf':
      return <Leaf className="w-3.5 h-3.5" />;
    case 'special':
      return <Sparkles className="w-3.5 h-3.5" />;
    case 'spice':
    case 'flame':
      return <Flame className="w-3.5 h-3.5" />;
    case 'chicken':
      return <Utensils className="w-3.5 h-3.5" />;
    case 'egg':
      return <Soup className="w-3.5 h-3.5" />;
    case 'bread':
      return <Utensils className="w-3.5 h-3.5" />;
    case 'tea':
    case 'flower':
      return <Coffee className="w-3.5 h-3.5" />;
    default:
      return <Sparkles className="w-3.5 h-3.5" />;
  }
}

/* Mini tag badge icon */
function TagBadgeIcon({ icon }) {
  switch (icon) {
    case 'star':
      return <Star className="w-3 h-3 fill-current" />;
    case 'leaf':
      return <Leaf className="w-3 h-3 fill-current" />;
    case 'flame':
      return <Flame className="w-3 h-3 fill-current" />;
    case 'sparkles':
      return <Sparkles className="w-3 h-3 fill-current" />;
    default:
      return null;
  }
}

const formatPrice = (price) => `${price.toLocaleString('vi-VN')}đ`;

/* Mobile Category Short Labels & Representative Emojis for thumb-friendly horizontal swiper */
const CATEGORY_MOBILE_CONFIG = {
  all: { shortName: 'Tất Cả', icon: '🍲' },
  'pho-bo': { shortName: 'Phở Bò', icon: '🥩' },
  'pho-ga': { shortName: 'Phở Gà', icon: '🍗' },
  special: { shortName: 'Đặc Biệt', icon: '⭐' },
  sides: { shortName: 'Kèm & Nước', icon: '🥢' },
  favorites: { shortName: 'Yêu Thích', icon: null },
};

/* Heritage Sub-Header Configuration for ScrollSpy Section Grouping */
const GROUP_HEADER_CONFIG = {
  'pho-bo': {
    badge: 'Bò Tơ Tuyển Chọn',
    title: 'Phở Bò Truyền Thống',
    icon: '🥩',
    subtitle: 'Nước dùng ninh tủy xương 24h quyện cùng thớ thịt bò tơ tươi mềm ngọt',
  },
  'special': {
    badge: 'Đặc Sản Hà Thành',
    title: 'Món Đặc Biệt & Sốt Vang',
    icon: '⭐',
    subtitle: 'Công thức thố đá núi lửa & rượu vang đỏ độc bản gia truyền 1986',
  },
  'pho-ga': {
    badge: 'Gà Đồi Thả Vườn',
    title: 'Phở Gà Đồi Ta',
    icon: '🍗',
    subtitle: 'Thịt chắc ngọt, da vàng giòn sần sật đượm hương lá chanh thái chỉ',
  },
  'sides': {
    badge: 'Kèm Vị Trọn Vẹn',
    title: 'Món Ăn Kèm & Thức Uống',
    icon: '🥢',
    subtitle: 'Quẩy giòn chiên phồng, trứng gà chần béo & trà sen Tây Hồ thanh tao',
  },
};

const FOOD_GROUPS = [
  { id: 'pho-bo', name: 'Phở Bò Truyền Thống' },
  { id: 'special', name: 'Món Đặc Biệt' },
  { id: 'pho-ga', name: 'Phở Gà Đồi Ta' },
  { id: 'sides', name: 'Món Ăn Kèm & Nước' },
];

const INITIAL_GROUP_LIMIT = 3;

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
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>

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
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          {/* Subtle warm glow overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none"></div>

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
              {/* Confetti Sparks Burst on Like */}
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

          {/* HƯỚNG 1: Glassmorphism Ingredient Pills Sheet (Slides up from bowl image bottom on hover) */}
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

            {/* Description with aligned baseline */}
            <p className="text-stone-600 text-xs sm:text-[13px] leading-relaxed mb-4 min-h-[44px]">
              {item.description}
            </p>

            {/* Đặc điểm nổi bật (Natural wrap, no truncate '...') */}
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

          {/* Action Row: Full-width Primary Add Button */}
          <div className="relative mt-auto pt-2">
            {/* Floating +1 Indicator */}
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
              {/* Subtle Diagonal Shimmer Sweep Light on Hover */}
              <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-[300%] transition-transform duration-700 ease-in-out pointer-events-none"></span>

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

function MenuSection({ onAddToCart }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItemIds, setAddedItemIds] = useState([]);
  
  // Persistent favorite dishes state (defaults with Item 1 & 2 for quick discovery)
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const saved = localStorage.getItem('pho_favorites');
      return saved !== null ? JSON.parse(saved) : [1, 2];
    } catch {
      return [1, 2];
    }
  });

  const [flyingHearts, setFlyingHearts] = useState([]);
  const [favTabJiggle, setFavTabJiggle] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const favTabTimerRef = useRef(null);
  const addTimersRef = useRef({});
  const mobileSearchInputRef = useRef(null);
  const isManualScrollingRef = useRef(false);
  const scrollLockTimerRef = useRef(null);
  const activeCategoryRef = useRef('all');
  const searchQueryRef = useRef(searchQuery);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  // O(1) fast lookup Set references for liked & added items to eliminate repeated O(N) scans
  const favoriteIdsSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const addedItemIdsSet = useMemo(() => new Set(addedItemIds), [addedItemIds]);

  // Memoized static food grouping (zero array filtering reallocation per render)
  const groupedItems = useMemo(() => {
    const map = {};
    FOOD_GROUPS.forEach((grp) => {
      map[grp.id] = MENU_ITEMS.filter((i) => i.category === grp.id);
    });
    return map;
  }, []);

  const toggleGroupExpand = useCallback((catId) => {
    const isCurrentlyExpanded = !!expandedGroups[catId];
    const sectionEl = document.getElementById(`category-section-${catId}`);

    // Lock ScrollSpy to prevent accidental tab hopping during height collapse/expansion
    isManualScrollingRef.current = true;
    if (scrollLockTimerRef.current) clearTimeout(scrollLockTimerRef.current);

    if (isCurrentlyExpanded) {
      // === COLLAPSE FLOW: Smoothly return to category header before height shrinks ===
      if (sectionEl) {
        const yOffset = window.innerWidth >= 1024 ? -165 : -135;
        const targetY = sectionEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }

      setExpandedGroups((prev) => ({
        ...prev,
        [catId]: false,
      }));

      scrollLockTimerRef.current = setTimeout(() => {
        isManualScrollingRef.current = false;
      }, 650);
    } else {
      // === EXPAND FLOW: Expand state then gently nudge down to reveal new items ===
      setExpandedGroups((prev) => ({
        ...prev,
        [catId]: true,
      }));

      requestAnimationFrame(() => {
        setTimeout(() => {
          const gridEl = document.getElementById(`food-grid-${catId}`);
          if (gridEl && gridEl.children.length > INITIAL_GROUP_LIMIT) {
            const firstNewCard = gridEl.children[INITIAL_GROUP_LIMIT];
            if (firstNewCard) {
              firstNewCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }
        }, 80);
      });

      scrollLockTimerRef.current = setTimeout(() => {
        isManualScrollingRef.current = false;
      }, 650);
    }
  }, [expandedGroups]);

  useEffect(() => {
    return () => {
      if (favTabTimerRef.current) clearTimeout(favTabTimerRef.current);
      Object.values(addTimersRef.current).forEach(clearTimeout);
      if (scrollLockTimerRef.current) clearTimeout(scrollLockTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (mobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  useEffect(() => {
    if (!selectedDetailItem) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedDetailItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedDetailItem]);

  const toggleFavorite = useCallback((item, coords, isAdding) => {
    // 1. Update persistent favorites state
    setFavoriteIds((prev) => {
      const next = prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id];
      try {
        localStorage.setItem('pho_favorites', JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });

    // 2. Launch parabolic flying heart if adding to favorites
    if (isAdding && coords) {
      const target = document.getElementById('category-tab-favorites');
      let endX = window.innerWidth / 2;
      let endY = 180;
      if (target) {
        const tRect = target.getBoundingClientRect();
        endX = tRect.left + tRect.width / 2;
        endY = tRect.top + tRect.height / 2;
      }

      const newFly = {
        id: Date.now() + Math.random(),
        startX: coords.startX,
        startY: coords.startY,
        endX,
        endY,
      };
      setFlyingHearts((prev) => [...prev, newFly]);
    }
  }, []);

  const handleFlyHeartComplete = useCallback((id) => {
    setFlyingHearts((prev) => prev.filter((f) => f.id !== id));
    setFavTabJiggle(true);
    if (favTabTimerRef.current) clearTimeout(favTabTimerRef.current);
    favTabTimerRef.current = setTimeout(() => setFavTabJiggle(false), 650);
  }, []);

  const [headerRef, isHeaderVisible] = useScrollReveal({ threshold: 0.1 });
  const [controlsRef, isControlsVisible] = useScrollReveal({ threshold: 0.1 });

  // Category horizontal scroll container & drag physics via ref (zero re-renders while dragging)
  const scrollContainerRef = useRef(null);
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    hasDragged: false,
  });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Categories list with dynamic "Món Yêu Thích" tab (stable reference)
  const allCategories = useMemo(() => [
    ...MENU_CATEGORIES,
    { id: 'favorites', name: 'Món Yêu Thích', isFavoriteTab: true },
  ], []);

  const checkScrollLimits = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  useEffect(() => {
    checkScrollLimits();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollLimits);
      window.addEventListener('resize', checkScrollLimits);
      const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => checkScrollLimits()) : null;
      if (ro) ro.observe(el);

      return () => {
        el.removeEventListener('scroll', checkScrollLimits);
        window.removeEventListener('resize', checkScrollLimits);
        if (ro) ro.disconnect();
      };
    }
  }, [allCategories.length, checkScrollLimits]);

  const scrollCategories = useCallback((direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = 240;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  const handleMouseDown = (e) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    dragRef.current = {
      isDragging: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      hasDragged: false,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current.isDragging) return;
    e.preventDefault();
    const el = scrollContainerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragRef.current.startX) * 1.3;
    if (Math.abs(walk) > 4) {
      dragRef.current.hasDragged = true;
    }
    el.scrollLeft = dragRef.current.scrollLeft - walk;
  };

  const handleMouseUp = () => {
    dragRef.current.isDragging = false;
  };

  const centerCategoryTab = useCallback((catId) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const tabEl = document.getElementById(`category-tab-${catId}`);
    if (!tabEl) return;
    const tabLeft = tabEl.offsetLeft;
    const tabWidth = tabEl.offsetWidth;
    const containerWidth = container.clientWidth;
    const targetScrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);
    container.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: 'smooth' });
  }, []);

  const scrollToCategorySection = useCallback((catId) => {
    const sectionEl = document.getElementById(`category-section-${catId}`);
    if (!sectionEl) return;
    const yOffset = window.innerWidth >= 1024 ? -165 : -135;
    const y = sectionEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, []);

  const handleCategoryClick = useCallback((catId) => {
    if (dragRef.current.hasDragged) {
      dragRef.current.hasDragged = false;
      return;
    }

    centerCategoryTab(catId);

    if (catId === 'favorites') {
      activeCategoryRef.current = 'favorites';
      setActiveCategory('favorites');
      return;
    }

    setSearchQuery((prev) => (prev ? '' : prev));

    isManualScrollingRef.current = true;
    activeCategoryRef.current = catId;
    setActiveCategory(catId);

    if (catId === 'all') {
      const menuEl = document.getElementById('menu');
      if (menuEl) {
        const yOffset = -75;
        const y = menuEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      scrollToCategorySection(catId);
    }

    if (scrollLockTimerRef.current) clearTimeout(scrollLockTimerRef.current);
    scrollLockTimerRef.current = setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 850);
  }, [scrollToCategorySection, centerCategoryTab]);

  // Bidirectional ScrollSpy Listener: Highlights active category tab when scrolling through sections
  // Attached once with zero listener tear-down churn during scrolling
  useEffect(() => {
    const sectionIds = ['pho-bo', 'special', 'pho-ga', 'sides'];

    const handleScroll = () => {
      if (isManualScrollingRef.current) return;
      if (activeCategoryRef.current === 'favorites' || searchQueryRef.current) return;

      const triggerOffset = window.innerWidth >= 1024 ? 180 : 155;
      let currentActive = 'all';

      const firstEl = document.getElementById(`category-section-${sectionIds[0]}`);
      if (firstEl) {
        const top = firstEl.getBoundingClientRect().top;
        if (top > triggerOffset + 60) {
          currentActive = 'all';
        } else {
          for (const catId of sectionIds) {
            const el = document.getElementById(`category-section-${catId}`);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= triggerOffset && rect.bottom > triggerOffset - 80) {
                currentActive = catId;
              }
            }
          }
        }
      }

      if (
        activeCategoryRef.current !== currentActive &&
        activeCategoryRef.current !== 'favorites' &&
        !searchQueryRef.current
      ) {
        activeCategoryRef.current = currentActive;
        setActiveCategory(currentActive);
        centerCategoryTab(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [centerCategoryTab]);

  // Memoized filter logic with O(1) set lookup
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return MENU_ITEMS.filter((item) => {
      let matchesCategory = false;
      if (activeCategory === 'all') {
        matchesCategory = true;
      } else if (activeCategory === 'favorites') {
        matchesCategory = favoriteIdsSet.has(item.id);
      } else {
        matchesCategory = item.category === activeCategory;
      }

      if (!matchesCategory) return false;
      if (!query) return true;

      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.ingredients.some((i) => i.toLowerCase().includes(query))
      );
    });
  }, [activeCategory, favoriteIdsSet, searchQuery]);

  const handleAdd = useCallback((item, e) => {
    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2;

    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    }

    onAddToCart(item, { startX, startY });
    setAddedItemIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));

    if (addTimersRef.current[item.id]) {
      clearTimeout(addTimersRef.current[item.id]);
    }
    addTimersRef.current[item.id] = setTimeout(() => {
      setAddedItemIds((prev) => prev.filter((id) => id !== item.id));
      delete addTimersRef.current[item.id];
    }, 1200);
  }, [onAddToCart]);

  return (
    <section id="menu" className="py-8 sm:py-16 lg:py-24 bg-[#faf6ef] relative border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div ref={headerRef} className={`text-center max-w-3xl mx-auto mb-6 sm:mb-10 lg:mb-14 transition-all duration-700 ${isHeaderVisible ? 'reveal-fade-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-[#96281b]/10 text-[#96281b] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3 border border-[#96281b]/20">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Thực Đơn Tinh Hoa
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-[#1b3425] mb-2 sm:mb-4 leading-tight">
            Bát Phở Chuẩn Vị — Ấm Lòng Thực Khách
          </h2>
          {/* Mobile concise sentence (< sm) vs Full paragraph (>= sm) */}
          <p className="text-stone-600 text-xs leading-relaxed sm:hidden px-2">
            Phục vụ nóng bỏng tay, giữ trọn vị ngọt tủy xương & bánh phở tráng tươi mỗi sớm mai.
          </p>
          <p className="hidden sm:block text-stone-600 text-sm sm:text-base leading-relaxed">
            Mỗi bát phở được phục vụ nóng bỏng tay, giữ trọn vẹn vị ngọt đậm đà từ tủy xương, thịt bò mềm mại cùng bánh phở dai mướt tráng thủ công mỗi sớm mai.
          </p>
        </div>

        {/* Filter Controls: Category Navigation with Left/Right Arrows & Search (Option 1 Sticky Touch Swiper) */}
        <div
          ref={controlsRef}
          className={`sticky top-[78px] sm:top-[104px] lg:top-[112px] z-30 bg-[#faf6ef]/95 backdrop-blur-md py-2.5 sm:py-3.5 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 sm:mb-12 border-b border-stone-300/60 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-2.5 lg:gap-5 transition-all duration-700 ${
            isControlsVisible ? 'reveal-fade-up' : 'opacity-0'
          }`}
        >
          {/* Category Carousel Container: flex-1 stretches close to search bar */}
          <div className="relative flex items-center flex-1 w-full min-w-0 gap-1.5 sm:gap-2">
            
            {/* Left Scroll Arrow (Desktop only) */}
            <button
              type="button"
              onClick={() => scrollCategories('left')}
              disabled={!canScrollLeft}
              aria-label="Cuộn danh mục sang trái"
              className="hidden lg:flex w-9 h-9 rounded-full bg-white border border-stone-200 shadow-sm items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-50 hover:shadow transition-all duration-200 shrink-0 active:scale-95 disabled:opacity-20 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scrollable Categories List (Supports Mouse Drag, Native Touch Swipe & Wheel) */}
            <div
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1 px-0.5 scroll-smooth select-none cursor-grab active:cursor-grabbing min-w-0 flex-1 touch-pan-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {allCategories.map((cat) => {
                const mobileConfig = CATEGORY_MOBILE_CONFIG[cat.id];
                const isFav = cat.id === 'favorites';
                const isActive = activeCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    id={`category-tab-${cat.id}`}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`whitespace-nowrap px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 flex items-center shrink-0 active:scale-95 ${
                      isFav && favTabJiggle
                        ? 'animate-heart-tab-jiggle ring-2 ring-rose-400/80 shadow-[0_0_16px_rgba(225,29,72,0.4)]'
                        : ''
                    } ${
                      isActive
                        ? 'bg-[#96281b] text-white shadow-md shadow-red-950/25'
                        : 'bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 border border-stone-300/80 shadow-2xs'
                    }`}
                  >
                    {isFav && (
                      <Heart
                        className={`w-3.5 h-3.5 mr-1 sm:mr-1.5 transition-colors ${
                          isActive
                            ? 'fill-white text-white'
                            : 'fill-[#ff2e63] text-[#ff2e63]'
                        }`}
                      />
                    )}
                    {/* Mobile concise label with icon */}
                    <span className="sm:hidden flex items-center gap-1">
                      {mobileConfig?.icon && <span>{mobileConfig.icon}</span>}
                      <span>{mobileConfig?.shortName || cat.name}</span>
                    </span>
                    {/* Desktop full name */}
                    <span className="hidden sm:inline">{cat.name}</span>

                    {isFav && favoriteIds.length > 0 && (
                      <span
                        className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-rose-100 text-[#96281b]'
                        }`}
                      >
                        {favoriteIds.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Scroll Arrow (Desktop only) */}
            <button
              type="button"
              onClick={() => scrollCategories('right')}
              disabled={!canScrollRight}
              aria-label="Cuộn danh mục sang phải"
              className="hidden lg:flex w-9 h-9 rounded-full bg-white border border-stone-200 shadow-sm items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-50 hover:shadow transition-all duration-200 shrink-0 active:scale-95 disabled:opacity-20 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Mobile Inline Search Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              aria-label={mobileSearchOpen ? 'Đóng ô tìm kiếm' : 'Mở ô tìm kiếm'}
              className={`lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 active:scale-90 ${
                mobileSearchOpen || searchQuery
                  ? 'bg-[#96281b] text-white shadow-md'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-300/80 shadow-2xs'
              }`}
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Collapsible Mobile Search Input */}
          {(mobileSearchOpen || searchQuery) && (
            <div className="lg:hidden w-full pt-1 sm:pt-2">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  placeholder="Tìm món phở, nguyên liệu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-14 py-2 text-xs bg-white rounded-full border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#96281b]/30 focus:border-[#96281b] transition-all shadow-inner"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#96281b] hover:text-[#781f15]"
                  >
                    Xóa
                  </button>
                ) : (
                  <button
                    onClick={() => setMobileSearchOpen(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-stone-400 hover:text-stone-600 font-medium"
                  >
                    Đóng
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Desktop Search Input Bar */}
          <div className="hidden lg:block relative w-72 shrink-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm món phở, nguyên liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white rounded-full border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#96281b]/30 focus:border-[#96281b] transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 font-semibold"
              >
                Xóa
              </button>
            )}
          </div>

        </div>

        {/* Main Food Catalog / Search / Favorites Views */}
        {searchQuery ? (
          /* Search Results View */
          filteredItems.length > 0 ? (
            <div className="animate-fadeIn">
              <div className="mb-5 sm:mb-7 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#96281b]" />
                  <h3 className="font-serif text-base sm:text-xl font-bold text-[#1b3425]">
                    Kết quả tìm kiếm cho "{searchQuery}"
                  </h3>
                </div>
                <span className="text-xs font-bold text-[#96281b] bg-[#96281b]/10 px-2.5 py-1 rounded-full border border-[#96281b]/20">
                  {filteredItems.length} món
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8">
                {filteredItems.map((item, index) => (
                  <MenuCard
                    key={`search-${item.id}`}
                    item={item}
                    index={index}
                    isAdded={addedItemIdsSet.has(item.id)}
                    onAdd={handleAdd}
                    isLiked={favoriteIdsSet.has(item.id)}
                    onToggleLike={toggleFavorite}
                    onOpenDetail={setSelectedDetailItem}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-stone-300 max-w-lg mx-auto animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-800 mb-2">
                Không tìm thấy món phù hợp
              </h3>
              <p className="text-stone-500 text-sm mb-6">
                Rất tiếc không có món nào khớp với từ khóa "{searchQuery}". Bạn có thể thử tìm theo tên khác hoặc đặt lại bộ lọc.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-2.5 rounded-full bg-[#96281b] text-white text-sm font-semibold shadow-md hover:bg-[#7e1f14] transition-colors"
              >
                Xem Toàn Bộ Thực Đơn
              </button>
            </div>
          )
        ) : activeCategory === 'favorites' ? (
          /* Favorites View */
          filteredItems.length > 0 ? (
            <div className="animate-fadeIn">
              <div className="mb-5 sm:mb-7 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                  <h3 className="font-serif text-base sm:text-xl font-bold text-[#1b3425]">
                    Món Ăn Yêu Thích Của Bạn
                  </h3>
                </div>
                <span className="text-xs font-bold text-[#96281b] bg-[#96281b]/10 px-2.5 py-1 rounded-full border border-[#96281b]/20">
                  {filteredItems.length} món
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8">
                {filteredItems.map((item, index) => (
                  <MenuCard
                    key={`fav-${item.id}`}
                    item={item}
                    index={index}
                    isAdded={addedItemIdsSet.has(item.id)}
                    onAdd={handleAdd}
                    isLiked={favoriteIdsSet.has(item.id)}
                    onToggleLike={toggleFavorite}
                    onOpenDetail={setSelectedDetailItem}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-rose-200 max-w-lg mx-auto shadow-sm animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-[#96281b] flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-xs">
                <Heart className="w-8 h-8 fill-[#96281b]" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
                Chưa có món ăn yêu thích nào
              </h3>
              <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                Hãy nhấn vào biểu tượng trái tim ở góc mỗi thẻ món để lưu lại các bát phở hợp khẩu vị của bạn nhé!
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="px-6 py-2.5 rounded-full bg-[#96281b] text-white text-sm font-semibold shadow-md hover:bg-[#7e1f14] transition-colors inline-flex items-center gap-2"
              >
                <span>Khám Phá Toàn Bộ Thực Đơn</span>
              </button>
            </div>
          )
        ) : (
          /* Normal Continuous Catalog View: Grouped by Category with ScrollSpy & Progressive Load More */
          <div className="space-y-12 sm:space-y-16">
            {FOOD_GROUPS.map((grp) => {
              const headerConfig = GROUP_HEADER_CONFIG[grp.id];
              const groupItems = groupedItems[grp.id] || [];
              const isExpanded = !!expandedGroups[grp.id];
              const visibleItems = isExpanded ? groupItems : groupItems.slice(0, INITIAL_GROUP_LIMIT);

              return (
                <div
                  key={grp.id}
                  id={`category-section-${grp.id}`}
                  className="scroll-mt-36 transition-all duration-300"
                >
                  {/* Heritage Section Header */}
                  <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 pb-2.5 sm:pb-3 border-b border-stone-300/70">
                    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#96281b]/10 to-[#96281b]/5 border border-[#96281b]/20 flex items-center justify-center text-lg sm:text-xl shadow-2xs shrink-0">
                        {headerConfig.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-base sm:text-2xl font-bold text-[#1b3425] leading-snug truncate">
                            {headerConfig.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-[#96281b]/10 text-[#96281b] border border-[#96281b]/20 shrink-0">
                            {groupItems.length} món
                          </span>
                        </div>
                        <p className="text-stone-500 text-xs sm:text-sm truncate hidden sm:block mt-0.5">
                          {headerConfig.subtitle}
                        </p>
                      </div>
                    </div>

                    <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100/70 border border-amber-300/60 px-3 py-1 rounded-full uppercase tracking-wider">
                      <span>✨</span>
                      <span>{headerConfig.badge}</span>
                    </span>
                  </div>

                  {/* Dishes Grid */}
                  <div
                    id={`food-grid-${grp.id}`}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8"
                  >
                    {visibleItems.map((item, index) => (
                      <MenuCard
                        key={`${grp.id}-${item.id}`}
                        item={item}
                        index={index}
                        isAdded={addedItemIdsSet.has(item.id)}
                        onAdd={handleAdd}
                        isLiked={favoriteIdsSet.has(item.id)}
                        onToggleLike={toggleFavorite}
                        onOpenDetail={setSelectedDetailItem}
                      />
                    ))}
                  </div>

                  {/* Progressive Load More / Expand Button */}
                  {groupItems.length > INITIAL_GROUP_LIMIT && (
                    <div className="mt-4 sm:mt-6 text-center">
                      <button
                        type="button"
                        onClick={() => toggleGroupExpand(grp.id)}
                        className="inline-flex items-center gap-2 px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold bg-white hover:bg-stone-50 text-stone-700 border border-stone-300/80 shadow-2xs hover:shadow transition-all duration-200 active:scale-95"
                      >
                        {isExpanded ? (
                          <>
                            <span>Thu gọn bớt {headerConfig.title}</span>
                            <span className="text-[#96281b] font-bold">↑</span>
                          </>
                        ) : (
                          <>
                            <span>Xem thêm {groupItems.length - INITIAL_GROUP_LIMIT} món {headerConfig.title} khác</span>
                            <span className="text-[#96281b] font-bold">↓</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* View Full Menu CTA Button Matching Mockup */}
            <div className="pt-6 sm:pt-10 text-center">
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                  const el = document.getElementById('menu');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#fbf6ee] hover:bg-[#f3e9dc] text-stone-800 font-bold text-sm border border-[#e8ddce] transition-all shadow-sm hover:shadow-md active:scale-95 group"
              >
                <Soup className="w-4 h-4 text-[#96281b] group-hover:scale-110 transition-transform" />
                <span>Xem lại từ đầu thực đơn</span>
                <span className="text-[#96281b] font-bold group-hover:translate-x-1 transition-transform">↑</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Mobile Dish Detail Bottom Sheet */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setSelectedDetailItem(null)}
          />

          {/* Bottom Sheet Container */}
          <div className="relative w-full max-w-lg mx-auto bg-[#faf6ef] text-[#2c1810] rounded-t-3xl border-t-2 border-amber-500/40 shadow-2xl max-h-[88vh] flex flex-col overflow-hidden animate-bottom-sheet-up z-10">
            {/* Sheet Handle Bar */}
            <div
              className="pt-3 pb-1 flex justify-center cursor-pointer"
              onClick={() => setSelectedDetailItem(null)}
            >
              <div className="w-12 h-1.5 rounded-full bg-stone-300" />
            </div>

            {/* Header with Title & Close */}
            <div className="px-5 py-2.5 flex items-center justify-between border-b border-stone-200/80">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#96281b] shrink-0" />
                <span className="font-serif font-bold text-sm tracking-wide text-[#1b3425] truncate">
                  CHI TIẾT VỊ PHỞ 1986
                </span>
              </div>
              <button
                onClick={() => setSelectedDetailItem(null)}
                className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-600 flex items-center justify-center transition-colors"
                aria-label="Đóng chi tiết món"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 pb-6">
              {/* Banner Image with 16:9 Aspect Ratio */}
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-md bg-stone-100">
                <img
                  src={selectedDetailItem.image}
                  alt={selectedDetailItem.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Top-left tag badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white shadow-md backdrop-blur-xs ${
                      selectedDetailItem.theme === 'green' ? 'bg-[#1b3425]/95' : 'bg-[#96281b]/95'
                    }`}
                  >
                    {selectedDetailItem.tagIcon && <TagBadgeIcon icon={selectedDetailItem.tagIcon} />}
                    <span>{selectedDetailItem.tag}</span>
                  </span>
                </div>

                {/* Top-right Heart */}
                <div className="absolute top-3 right-3 z-10">
                  <button
                    type="button"
                    onClick={() => toggleFavorite(selectedDetailItem, null, !favoriteIdsSet.has(selectedDetailItem.id))}
                    className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center shadow-md active:scale-90 transition-all ${
                      favoriteIdsSet.has(selectedDetailItem.id)
                        ? 'bg-white/95 border border-white/90 shadow-[0_3px_10px_rgba(0,0,0,0.18)]'
                        : 'bg-black/40 text-white'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 transition-all ${
                        favoriteIdsSet.has(selectedDetailItem.id)
                          ? 'fill-[#ff2e63] text-[#ff2e63] drop-shadow-[0_2px_6px_rgba(255,46,99,0.5)]'
                          : 'text-white'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Title, Price & Portion */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1b3425] leading-snug">
                    {selectedDetailItem.name}
                  </h3>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200 mt-1">
                    {selectedDetailItem.portion || 'Tô thường'}
                  </span>
                </div>
                <div className="font-serif font-bold text-xl text-[#96281b] tracking-tight shrink-0">
                  {formatPrice(selectedDetailItem.price)}
                </div>
              </div>

              {/* Full Description */}
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-900/10">
                {selectedDetailItem.description}
              </p>

              {/* Nguyên Liệu Tinh Tuyển (Feature Pills) */}
              {selectedDetailItem.featurePills && selectedDetailItem.featurePills.length > 0 && (
                <div className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-serif font-bold text-[#1b3425] mb-2.5">
                    <span className="flex items-center gap-1.5 text-[#96281b]">
                      <Sparkles className="w-3.5 h-3.5" />
                      Nguyên Liệu Tinh Tuyển Gia Truyền 1986
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedDetailItem.featurePills.map((pill, pIdx) => (
                      <div
                        key={pIdx}
                        className="bg-stone-50 border border-stone-200/80 rounded-xl p-2 flex items-center gap-2.5"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#96281b]/10 text-[#96281b] flex items-center justify-center shrink-0">
                          <FeatureIcon type={pill.type} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-stone-900 truncate">
                            {pill.label}
                          </div>
                          <div className="text-[10px] text-stone-500 truncate">
                            {pill.sub}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Đặc điểm nổi bật (Highlights) */}
              {selectedDetailItem.highlights && selectedDetailItem.highlights.length > 0 && (
                <div className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs">
                  <div className="text-xs font-serif font-bold text-[#1b3425] mb-2">
                    Đặc Điểm Hương Vị Nổi Bật
                  </div>
                  <div className="space-y-1.5">
                    {selectedDetailItem.highlights.map((hl, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2 text-xs text-stone-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#96281b] shrink-0" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Action Button */}
              <div className="pt-2">
                <button
                  onClick={(e) => {
                    handleAdd(selectedDetailItem, e);
                    setSelectedDetailItem(null);
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#96281b] hover:bg-[#802216] text-white font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-950/25 active:scale-[0.98] transition-all"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>Thêm Vào Bàn — {formatPrice(selectedDetailItem.price)}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Proposal 2: Parabolic Flying Hearts to Category Tab */}
      {flyingHearts.map((fly) => (
        <FlyingHeart
          key={fly.id}
          fly={fly}
          onComplete={handleFlyHeartComplete}
        />
      ))}
    </section>
  );
}

export default React.memo(MenuSection);

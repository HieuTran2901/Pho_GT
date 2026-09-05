import React, { useState, useMemo, useEffect } from 'react';
import { Star, Quote, BadgeCheck, PenLine, BookOpen, ChevronDown, ChevronUp, X, Search } from 'lucide-react';
import { TESTIMONIALS } from '../data/menuData';
import useScrollReveal from '../hooks/useScrollReveal';

const CATEGORIES = [
  { id: 'all', label: 'Tất cả (15k+)' },
  { id: 'heritage', label: 'Tri Kỷ Lâu Năm' },
  { id: 'broth', label: 'Nước Dùng Ninh Than Hoa' },
  { id: 'sotvang', label: 'Phở Sốt Vang' }
];

const INITIAL_PC_COUNT = 6;

// Memoized Mobile Bottom Sheet component to colocate search and pagination states
const ReviewsBottomSheet = React.memo(function ReviewsBottomSheet({
  isOpen,
  onClose,
  onSubmitFeedback
}) {
  const [sheetSearch, setSheetSearch] = useState('');
  const [sheetCategory, setSheetCategory] = useState('all');
  const [sheetVisibleCount, setSheetVisibleCount] = useState(6);

  // Lock body scroll only while sheet is mounted/open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Bottom Sheet filtered reviews isolated to sheet
  const sheetFilteredReviews = useMemo(() => {
    return TESTIMONIALS.filter((review) => {
      const matchCat = sheetCategory === 'all' || review.category === sheetCategory;
      const q = sheetSearch.trim().toLowerCase();
      const matchQuery =
        !q ||
        review.name.toLowerCase().includes(q) ||
        review.content.toLowerCase().includes(q) ||
        (review.favoriteDish && review.favoriteDish.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [sheetCategory, sheetSearch]);

  const sheetDisplayedReviews = useMemo(() => {
    return sheetFilteredReviews.slice(0, sheetVisibleCount);
  }, [sheetFilteredReviews, sheetVisibleCount]);

  const hasMoreSheet = sheetVisibleCount < sheetFilteredReviews.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] sm:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs animate-backdrop-fade-in"
        onClick={onClose}
      />

      {/* Bottom Sheet Drawer */}
      <div className="relative w-full max-h-[88vh] bg-[#faf6f0] rounded-t-[32px] shadow-2xl flex flex-col border-t-2 border-amber-500/50 animate-bottom-sheet-up z-10">
        {/* Top Drag Handle & Header */}
        <div className="pt-3 px-5 pb-3 border-b border-stone-200/80 bg-white/80 rounded-t-[32px] backdrop-blur-md">
          <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#2c1810] text-amber-300 flex items-center justify-center text-xs">
                <BookOpen className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base leading-tight">
                  Sổ Lưu Bút Tri Kỷ
                </h3>
                <p className="text-[11px] text-stone-500">15.200+ đánh giá 5 sao từ 1986</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 text-xs font-bold"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input inside Bottom Sheet */}
          <div className="relative mt-3">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={sheetSearch}
              onChange={(e) => setSheetSearch(e.target.value)}
              placeholder="Tìm món (sốt vang, bắp bò), tên thực khách..."
              className="w-full pl-9 pr-8 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />
            {sheetSearch && (
              <button
                type="button"
                onClick={() => setSheetSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Topic Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-1 scrollbar-none text-[11px]">
            {CATEGORIES.map((cat) => {
              const isActive = sheetCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSheetCategory(cat.id);
                    setSheetVisibleCount(6);
                  }}
                  className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                    isActive
                      ? 'bg-[#2c1810] text-amber-300 font-bold shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Reviews List */}
        <div className="overflow-y-auto p-4 space-y-3.5 flex-1 overscroll-contain">
          {sheetDisplayedReviews.length === 0 ? (
            <div className="py-12 text-center text-stone-500">
              <p className="text-sm font-medium">Không tìm thấy cảm nhận phù hợp.</p>
              <button
                type="button"
                onClick={() => {
                  setSheetSearch('');
                  setSheetCategory('all');
                }}
                className="text-xs text-brand-red font-bold underline mt-2"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            sheetDisplayedReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {review.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80">
                      {review.badge}
                    </span>
                  )}
                </div>

                <p className="text-stone-700 text-xs italic leading-relaxed mb-3">
                  "{review.content}"
                </p>

                {review.favoriteDish && (
                  <div className="inline-flex items-center gap-1.5 bg-stone-50 border border-stone-200/60 text-stone-700 text-[10px] px-2 py-0.5 rounded-md mb-3 font-medium">
                    <span className="text-brand-red">🍜</span>
                    <span>Bát ruột: <strong className="text-stone-900 font-semibold">{review.favoriteDish}</strong></span>
                  </div>
                )}

                <div className="flex items-center gap-2.5 pt-2.5 border-t border-stone-100">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-8 h-8 rounded-full object-cover border border-brand-red/20"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <h4 className="font-serif font-bold text-stone-900 text-xs truncate">
                      {review.name}
                    </h4>
                    <span className="text-[10px] text-stone-500 block truncate">
                      {review.role}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Load More Inside Sheet */}
          {hasMoreSheet && (
            <div className="text-center pt-2 pb-1">
              <button
                type="button"
                onClick={() => setSheetVisibleCount((prev) => prev + 4)}
                className="w-full py-2.5 rounded-xl bg-white border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 shadow-2xs cursor-pointer"
              >
                Tải thêm {Math.min(4, sheetFilteredReviews.length - sheetVisibleCount)} cảm nhận khác ↓
              </button>
            </div>
          )}
        </div>

        {/* Sticky Footer CTA */}
        <div className="p-3 bg-white/95 border-t border-stone-200/80 backdrop-blur-md flex items-center justify-between gap-3">
          <span className="text-[11px] text-stone-500 pl-1">
            Đã xem {sheetDisplayedReviews.length}/{sheetFilteredReviews.length}
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onSubmitFeedback();
            }}
            className="px-4 py-2 rounded-full bg-[#2c1810] text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-98 cursor-pointer"
          >
            <PenLine className="w-3.5 h-3.5 text-amber-300" />
            <span>Viết Cảm Nhận</span>
          </button>
        </div>
      </div>
    </div>
  );
});

function Testimonials() {
  const [sectionRef, isVisible] = useScrollReveal({ threshold: 0.12 });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // PC Pagination State
  const [pcVisibleCount, setPcVisibleCount] = useState(INITIAL_PC_COUNT);

  // Mobile Bottom Sheet Open State only (isolated from internal sheet state)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Reset PC pagination count when category changes
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setPcVisibleCount(INITIAL_PC_COUNT);
  };

  // Main filtered reviews
  const filteredReviews = useMemo(() => {
    if (selectedCategory === 'all') return TESTIMONIALS;
    return TESTIMONIALS.filter((review) => review.category === selectedCategory);
  }, [selectedCategory]);

  // PC displayed reviews
  const pcDisplayedReviews = useMemo(() => {
    return filteredReviews.slice(0, pcVisibleCount);
  }, [filteredReviews, pcVisibleCount]);

  const hasMorePc = pcVisibleCount < filteredReviews.length;
  const remainingCount = Math.max(0, filteredReviews.length - pcVisibleCount);
  const progressPercentage = Math.min(100, Math.round((pcDisplayedReviews.length / filteredReviews.length) * 100));

  const handleLoadMorePc = () => {
    setPcVisibleCount((prev) => Math.min(filteredReviews.length, prev + 3));
  };

  const handleCollapsePc = () => {
    setPcVisibleCount(INITIAL_PC_COUNT);
  };

  // Render individual review card
  const renderCard = (review, idx, isCarousel = false) => (
    <div
      key={review.id}
      className={`bg-white rounded-3xl p-6 sm:p-7 shadow-md border transition-all duration-300 relative flex flex-col justify-between ${
        isCarousel ? 'min-w-[285px] max-w-[285px] snap-start' : 'hover:shadow-2xl hover:-translate-y-1'
      } ${
        !isCarousel && idx === 1
          ? 'border-amber-400/60 shadow-lg ring-1 ring-amber-400/20'
          : 'border-stone-200/70 hover:border-amber-400/40'
      }`}
    >
      <div>
        {/* Top Row: Stars + Customer Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-0.5 text-amber-500">
            {[...Array(review.rating)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          {review.badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 shrink-0">
              {review.badge}
            </span>
          )}
        </div>

        {/* Quote Content */}
        <p className="text-stone-700 text-xs sm:text-sm italic leading-relaxed mb-4">
          "{review.content}"
        </p>

        {/* Favorite Dish Chip */}
        {review.favoriteDish && (
          <div className="inline-flex items-center gap-1.5 bg-stone-50 border border-stone-200/60 text-stone-700 text-[11px] px-2.5 py-1 rounded-lg mb-4 font-medium">
            <span className="text-brand-red">🍜</span>
            <span>Bát ruột: <strong className="text-stone-900 font-semibold">{review.favoriteDish}</strong></span>
          </div>
        )}
      </div>

      {/* Reviewer Info */}
      <div className="flex items-center gap-3 pt-3.5 border-t border-stone-100 mt-2">
        <img
          src={review.avatar}
          alt={review.name}
          className="w-11 h-11 rounded-full object-cover border-2 border-brand-red/20 shadow-xs"
          loading="lazy"
        />
        <div className="min-w-0">
          <h4 className="font-serif font-bold text-stone-900 text-xs sm:text-sm truncate">
            {review.name}
          </h4>
          <span className="text-[11px] text-stone-500 block truncate">
            {review.role}
          </span>
        </div>
      </div>

      {/* Watermark Quote Icon */}
      <Quote className="w-10 h-10 text-stone-100/90 absolute top-5 right-5 -z-0 pointer-events-none" />
    </div>
  );

  return (
    <section id="reviews" ref={sectionRef} className="py-16 sm:py-20 bg-[#faf6f0] border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Trust Barometer */}
        <div className={`text-center max-w-3xl mx-auto mb-8 transition-all duration-700 ${isVisible ? 'reveal-fade-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-bold uppercase tracking-wider mb-3">
            <span>★ THỰC KHÁCH NÓI VỀ CHÚNG TÔI</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 mb-3 leading-tight">
            Tri Kỷ Qua Từng Muỗng Nước Dùng
          </h2>

          <p className="text-stone-600 text-xs sm:text-base max-w-xl mx-auto mb-6">
            Hơn 15.000 lượt đánh giá 5 sao từ thực khách địa phương, văn nghệ sĩ và bạn bè quốc tế.
          </p>

          {/* Trust Barometer Capsule */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl border border-amber-200/80 shadow-sm">
            <div className="flex items-center gap-2 pr-3.5 border-r border-stone-200">
              <span className="text-xl sm:text-2xl font-serif font-black text-amber-600">4.9</span>
              <div className="text-left">
                <div className="flex text-amber-400 text-xs">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium">15.200+ đánh giá</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] sm:text-[11px] font-bold">
                <BadgeCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>TripAdvisor 2025</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-brand-red text-[10px] sm:text-[11px] font-bold">
                <BadgeCheck className="w-3.5 h-3.5 text-brand-red" />
                <span>Di Sản Phở 1986</span>
              </span>
            </div>
          </div>
        </div>

        {/* Topic Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none justify-start sm:justify-center mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#2c1810] text-amber-300 shadow-md scale-102'
                    : 'bg-white text-stone-700 border border-stone-200/80 hover:border-amber-400/50 hover:bg-amber-50/40'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* MOBILE VIEW (< sm): CAROUSEL 5 CARDS + 1 ACTION CARD     */}
        {/* ========================================================= */}
        <div className="sm:hidden">
          <div className="flex gap-3.5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory -mx-4 px-4">
            {/* Display up to first 5 cards */}
            {filteredReviews.slice(0, 5).map((review, idx) => renderCard(review, idx, true))}

            {/* Action Card: Open Bottom Sheet */}
            <div
              onClick={() => setIsBottomSheetOpen(true)}
              className="min-w-[270px] max-w-[270px] snap-start bg-gradient-to-br from-[#2c1810] to-[#1a0f0a] rounded-3xl p-6 border-2 border-amber-500/50 shadow-xl flex flex-col justify-between text-white cursor-pointer active:scale-98 transition-transform"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-1">
                  ✦ Kho Tàng Tri Kỷ
                </span>
                <h3 className="font-serif text-lg font-bold text-amber-100 mb-2 leading-snug">
                  15.200+ Cảm Nhận Thực Khách
                </h3>
                <p className="text-stone-300 text-xs leading-relaxed">
                  Mở sổ lưu bút để đọc toàn bộ nhật ký, tìm kiếm theo món ăn và xem cảm nhận từ bạn bè quốc tế.
                </p>
              </div>

              <div className="pt-4 border-t border-white/15 mt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300">Mở Sổ Lưu Bút</span>
                <span className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-sm shadow-md">
                  →
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Swipe Indicators & CTA */}
          <div className="flex flex-col items-center gap-3 pt-2 text-center">
            <div className="text-[11px] text-stone-400 font-medium">
              ← Vuốt ngón tay để xem thêm • Chạm thẻ cuối để mở toàn bộ →
            </div>
            <button
              type="button"
              onClick={() => setIsBottomSheetOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/40 text-stone-900 text-xs font-bold active:bg-amber-500/25 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-800" />
              <span>Xem Tất Cả 15.200+ Đánh Giá (Mở Sổ Lưu Bút) ↗</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PC / TABLET VIEW (>= sm): PROGRESSIVE MASONRY GRID        */}
        {/* ========================================================= */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pcDisplayedReviews.map((review, idx) => renderCard(review, idx, false))}
        </div>

        {/* PC Pagination & Progress Bar (>= sm) */}
        <div className="hidden sm:flex flex-col items-center justify-center mt-10 pt-4 border-t border-stone-200/60 max-w-xl mx-auto">
          <div className="w-full flex items-center justify-between text-xs text-stone-500 mb-2 font-medium">
            <span>
              Đang hiển thị <strong className="text-stone-900 font-bold">{pcDisplayedReviews.length}</strong> / {filteredReviews.length} cảm nhận tri kỷ
            </span>
            <span className="text-amber-700 font-semibold">{progressPercentage}%</span>
          </div>

          {/* Progress Track */}
          <div className="w-full h-1.5 bg-stone-200/80 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {hasMorePc ? (
              <button
                type="button"
                onClick={handleLoadMorePc}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2c1810] text-amber-300 text-xs font-bold hover:bg-stone-950 transition-all duration-200 shadow-md cursor-pointer hover:shadow-lg hover:scale-102"
              >
                <ChevronDown className="w-4 h-4 text-amber-300" />
                <span>Khám phá thêm {Math.min(3, remainingCount)} cảm nhận khác ↓</span>
              </button>
            ) : filteredReviews.length > INITIAL_PC_COUNT ? (
              <button
                type="button"
                onClick={handleCollapsePc}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-300 transition-all duration-200 cursor-pointer"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Đã hiển thị trọn vẹn • Thu gọn bớt ↑</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setFeedbackSubmitted((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-stone-700 border border-stone-300 text-xs font-bold hover:bg-stone-50 transition-all duration-200 shadow-xs cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5 text-brand-red" />
              <span>Viết Cảm Nhận</span>
            </button>
          </div>

          {feedbackSubmitted && (
            <p className="text-xs text-amber-800 font-medium mt-3 animate-fade-in">
              ✨ Cảm ơn bạn! Quán luôn trân quý từng lời góp ý chân tình của tri kỷ.
            </p>
          )}
        </div>

      </div>

      {/* ========================================================= */}
      {/* MOBILE HERITAGE REVIEWS BOTTOM SHEET (ISOLATED STATE)    */}
      {/* ========================================================= */}
      <ReviewsBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        onSubmitFeedback={() => setFeedbackSubmitted(true)}
      />

    </section>
  );
}

export default React.memo(Testimonials);

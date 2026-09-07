import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Star, BookOpen, X, Search, PenLine } from 'lucide-react';
import { TESTIMONIALS } from '../../data/menuData';
import { CATEGORIES } from './testimonialsConstants';

const ReviewsBottomSheet = React.memo(function ReviewsBottomSheet({
  isOpen,
  onClose,
  onSubmitFeedback
}) {
  const [sheetSearch, setSheetSearch] = useState('');
  const [sheetCategory, setSheetCategory] = useState('all');
  const [sheetVisibleCount, setSheetVisibleCount] = useState(6);
  const sheetScrollRef = useRef(null);

  const handleLoadMoreSheet = useCallback(() => {
    setSheetVisibleCount((prev) => prev + 4);
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (sheetScrollRef.current) {
          sheetScrollRef.current.scrollBy({ top: 160, behavior: 'smooth' });
        }
      }, 80);
    });
  }, []);

  // Lock body scroll only while sheet is mounted/open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

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
              className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 text-xs font-bold cursor-pointer"
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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
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
                  className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all cursor-pointer ${
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
        <div ref={sheetScrollRef} className="overflow-y-auto p-4 space-y-3.5 flex-1 overscroll-contain">
          {sheetDisplayedReviews.length === 0 ? (
            <div className="py-12 text-center text-stone-500">
              <p className="text-sm font-medium">Không tìm thấy cảm nhận phù hợp.</p>
              <button
                type="button"
                onClick={() => {
                  setSheetSearch('');
                  setSheetCategory('all');
                }}
                className="text-xs text-brand-red font-bold underline mt-2 cursor-pointer"
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
                onClick={handleLoadMoreSheet}
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

export default ReviewsBottomSheet;

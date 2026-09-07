import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { BookOpen, ChevronDown, ChevronUp, PenLine } from 'lucide-react';
import { TESTIMONIALS } from '../data/menuData';
import useScrollReveal from '../hooks/useScrollReveal';
import { CATEGORIES, INITIAL_PC_COUNT } from './testimonials/testimonialsConstants';
import TestimonialCard from './testimonials/TestimonialCard';
import ReviewsBottomSheet from './testimonials/ReviewsBottomSheet';
import TestimonialsTrustBarometer from './testimonials/TestimonialsTrustBarometer';

function Testimonials() {
  const [sectionRef, isVisible] = useScrollReveal({ threshold: 0.12 });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // PC Pagination State
  const [pcVisibleCount, setPcVisibleCount] = useState(INITIAL_PC_COUNT);

  // Mobile Bottom Sheet Open State
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const collapseTimerRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  // Dynamic Animated Counter for 4.9 and 15.200+ reviews
  const [counts, setCounts] = useState({ rating: '0.0', reviews: '0' });
  const hasAnimatedCounterRef = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimatedCounterRef.current) return;
    hasAnimatedCounterRef.current = true;

    const duration = 1300;
    const startTime = performance.now();
    let animId = null;

    const easeOutExpo = (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutExpo(progress);

      const curRating = (eased * 4.9).toFixed(1);
      const curReviews = Math.floor(eased * 15200);

      setCounts({
        rating: progress >= 1 ? '4.9' : curRating,
        reviews: progress >= 1 ? '15.200' : curReviews.toLocaleString('vi-VN'),
      });

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const handleToggleFeedback = useCallback(() => {
    setFeedbackSubmitted((prev) => {
      const next = !prev;
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (next) {
        feedbackTimerRef.current = setTimeout(() => {
          setFeedbackSubmitted(false);
        }, 4000);
      }
      return next;
    });
  }, []);

  const handleSubmitFeedbackFromSheet = useCallback(() => {
    setFeedbackSubmitted(true);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setFeedbackSubmitted(false);
    }, 4000);
  }, []);

  const handleCategoryChange = useCallback((catId) => {
    setSelectedCategory(catId);
    setPcVisibleCount(INITIAL_PC_COUNT);
  }, []);

  const filteredReviews = useMemo(() => {
    if (selectedCategory === 'all') return TESTIMONIALS;
    return TESTIMONIALS.filter((review) => review.category === selectedCategory);
  }, [selectedCategory]);

  const pcDisplayedReviews = useMemo(() => {
    return filteredReviews.slice(0, pcVisibleCount);
  }, [filteredReviews, pcVisibleCount]);

  const hasMorePc = pcVisibleCount < filteredReviews.length;
  const remainingCount = Math.max(0, filteredReviews.length - pcVisibleCount);
  const progressPercentage = Math.min(100, Math.round((pcDisplayedReviews.length / filteredReviews.length) * 100));

  const handleLoadMorePc = useCallback(() => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);

    const currentCount = pcVisibleCount;
    setPcVisibleCount((prev) => Math.min(filteredReviews.length, prev + 3));

    requestAnimationFrame(() => {
      setTimeout(() => {
        const gridEl = document.getElementById('testimonials-grid');
        if (gridEl && gridEl.children.length > currentCount) {
          const firstNewCard = gridEl.children[currentCount];
          if (firstNewCard) {
            firstNewCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }, 80);
    });
  }, [pcVisibleCount, filteredReviews.length]);

  const handleCollapsePc = useCallback(() => {
    const headerEl = document.getElementById('testimonials-header') || document.getElementById('reviews');

    if (headerEl) {
      const yOffset = window.innerWidth >= 1024 ? -120 : -90;
      const targetY = headerEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }

    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    collapseTimerRef.current = setTimeout(() => {
      setPcVisibleCount(INITIAL_PC_COUNT);
    }, 280);
  }, []);

  return (
    <section id="reviews" ref={sectionRef} className="py-16 sm:py-20 bg-[#faf6f0] border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Trust Barometer */}
        <div
          id="testimonials-header"
          className={`text-center max-w-3xl mx-auto mb-8 transition-all duration-700 ${isVisible ? 'reveal-fade-up' : 'opacity-0'}`}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-bold uppercase tracking-wider mb-3">
            <span>★ THỰC KHÁCH NÓI VỀ CHÚNG TÔI</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 mb-3 leading-tight">
            Tri Kỷ Qua Từng Muỗng Nước Dùng
          </h2>

          <p className="text-stone-600 text-xs sm:text-base max-w-xl mx-auto mb-6">
            Hơn 15.000 lượt đánh giá 5 sao từ thực khách địa phương, văn nghệ sĩ và bạn bè quốc tế.
          </p>

          <TestimonialsTrustBarometer counts={counts} />
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

        {/* Mobile View: Carousel + Action Card */}
        <div className="sm:hidden">
          <div className="flex gap-3.5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory -mx-4 px-4">
            {filteredReviews.slice(0, 5).map((review, idx) => (
              <TestimonialCard key={review.id} review={review} idx={idx} isCarousel={true} />
            ))}

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

          <div className="flex flex-col items-center gap-3 pt-2 text-center">
            <div className="text-[11px] text-stone-400 font-medium">
              ← Vuốt ngón tay để xem thêm • Chạm thẻ cuối để mở toàn bộ →
            </div>
            <button
              type="button"
              onClick={() => setIsBottomSheetOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/40 text-stone-900 text-xs font-bold active:bg-amber-500/25 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-800" />
              <span>Xem Tất Cả 15.200+ Đánh Giá (Mở Sổ Lưu Bút) ↗</span>
            </button>
          </div>
        </div>

        {/* Desktop View: Grid */}
        <div
          id="testimonials-grid"
          className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {pcDisplayedReviews.map((review, idx) => (
            <TestimonialCard key={review.id} review={review} idx={idx} isCarousel={false} />
          ))}
        </div>

        {/* PC Pagination & Progress Bar */}
        <div className="hidden sm:flex flex-col items-center justify-center mt-10 pt-4 border-t border-stone-200/60 max-w-xl mx-auto">
          <div className="w-full flex items-center justify-between text-xs text-stone-500 mb-2 font-medium">
            <span>
              Đang hiển thị <strong className="text-stone-900 font-bold">{pcDisplayedReviews.length}</strong> / {filteredReviews.length} cảm nhận tri kỷ
            </span>
            <span className="text-amber-700 font-semibold">{progressPercentage}%</span>
          </div>

          <div className="w-full h-1.5 bg-stone-200/80 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

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
              onClick={handleToggleFeedback}
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

      {/* Mobile Reviews Bottom Sheet */}
      <ReviewsBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        onSubmitFeedback={handleSubmitFeedbackFromSheet}
      />
    </section>
  );
}

export default React.memo(Testimonials);

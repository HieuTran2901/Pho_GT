import React, { useState, useMemo } from 'react';
import { Star, Quote, BadgeCheck, PenLine } from 'lucide-react';
import { TESTIMONIALS } from '../data/menuData';
import useScrollReveal from '../hooks/useScrollReveal';

const CATEGORIES = [
  { id: 'all', label: 'Tất cả (15k+)' },
  { id: 'heritage', label: 'Tri Kỷ Lâu Năm' },
  { id: 'broth', label: 'Nước Dùng Ninh Than Hoa' },
  { id: 'sotvang', label: 'Phở Sốt Vang' }
];

function Testimonials() {
  const [sectionRef, isVisible] = useScrollReveal({ threshold: 0.12 });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const filteredReviews = useMemo(() => {
    if (selectedCategory === 'all') return TESTIMONIALS;
    return TESTIMONIALS.filter((review) => review.category === selectedCategory);
  }, [selectedCategory]);

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
                onClick={() => setSelectedCategory(cat.id)}
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

        {/* Mobile Horizontal Snap Carousel (< sm) */}
        <div className="sm:hidden">
          <div className="flex gap-3.5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory -mx-4 px-4">
            {filteredReviews.map((review, idx) => renderCard(review, idx, true))}
          </div>
          <div className="text-center pt-1 text-[11px] text-stone-400 font-medium">
            ← Vuốt ngón tay để xem thêm cảm nhận →
          </div>
        </div>

        {/* Tablet & Desktop Grid (>= sm) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review, idx) => renderCard(review, idx, false))}
        </div>

        {/* Write Feedback CTA */}
        <div className="text-center mt-10">
          <button
            type="button"
            onClick={() => setFeedbackSubmitted((prev) => !prev)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2c1810] text-amber-300 text-xs font-bold hover:bg-stone-950 transition-all duration-200 shadow-md cursor-pointer hover:shadow-lg hover:scale-102"
          >
            <PenLine className="w-3.5 h-3.5 text-amber-300" />
            <span>Viết Cảm Nhận Của Bạn</span>
          </button>
          {feedbackSubmitted && (
            <p className="text-xs text-amber-800 font-medium mt-2 animate-fade-in">
              ✨ Cảm ơn bạn! Quán luôn trân quý từng lời góp ý chân tình của tri kỷ.
            </p>
          )}
        </div>

      </div>
    </section>
  );
}

export default React.memo(Testimonials);

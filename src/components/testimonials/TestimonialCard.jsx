import React from 'react';
import { Star, Quote } from 'lucide-react';

const TestimonialCard = React.memo(function TestimonialCard({ review, idx, isCarousel = false }) {
  return (
    <div
      id={isCarousel ? undefined : `testimonial-card-${review.id}`}
      className={`bg-white rounded-3xl p-6 sm:p-7 shadow-md border transition-all duration-300 relative flex flex-col justify-between overflow-hidden ${
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
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 shrink-0 shadow-2xs">
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
      <div className="flex items-center gap-3 pt-3.5 border-t border-stone-100 mt-2 relative z-10">
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
      <Quote className="w-14 h-14 text-stone-200/60 absolute bottom-3 right-4 pointer-events-none -z-0" />
    </div>
  );
});

export default TestimonialCard;

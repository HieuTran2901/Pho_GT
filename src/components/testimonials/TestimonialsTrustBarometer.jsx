import React from 'react';
import { Star, BadgeCheck } from 'lucide-react';

export default function TestimonialsTrustBarometer({ counts }) {
  return (
    <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl border border-amber-200/80 shadow-sm">
      <div className="flex items-center gap-2 pr-3.5 border-r border-stone-200">
        <span className="text-xl sm:text-2xl font-serif font-black text-amber-600 min-w-[2.2rem] text-center inline-block tabular-nums">
          {counts.rating}
        </span>
        <div className="text-left">
          <div className="flex text-amber-400 text-xs">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium tabular-nums">
            {counts.reviews}+ đánh giá
          </div>
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
  );
}

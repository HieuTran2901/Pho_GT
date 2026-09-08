import React from 'react';

/**
 * [RAVEN & URBAN] GiftFilterChips
 * Phở Gia Truyền 1986
 *
 * Hàng chip lọc nhanh danh mục voucher:
 * [ Tất cả (8) ] [ 🎁 Món 0đ (3) ] [ 🏷️ Giảm tiền (3) ]
 * Giúp thu gọn danh sách khi có nhiều voucher, triệt tiêu cảm giác cuộn dài.
 */
export default function GiftFilterChips({ activeFilter = 'ALL', onSelectFilter, categories = [] }) {
  if (!categories || categories.length <= 1) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-0.5">
      {categories.map((cat) => {
        const isActive = activeFilter === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectFilter(cat.id)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-serif font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1 shrink-0 ${
              isActive
                ? 'bg-gradient-to-r from-[#8a1f18] to-[#6a150c] text-amber-200 border border-amber-400/60 shadow-sm'
                : 'bg-black/40 text-stone-400 hover:text-stone-200 border border-amber-900/40 hover:border-amber-700/60'
            }`}
          >
            {cat.icon && <span className="text-[10px] leading-none">{cat.icon}</span>}
            <span>{cat.label}</span>
            <span
              className={`px-1.5 py-0.1 rounded-full text-[8.5px] font-mono font-bold leading-tight ${
                isActive
                  ? 'bg-amber-400 text-stone-950 shadow-2xs'
                  : 'bg-white/10 text-stone-400'
              }`}
            >
              {cat.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

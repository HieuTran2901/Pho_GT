import React from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const formatPrice = (price) => currencyFormatter.format(price);

/**
 * [RAVEN & URBAN] CompactHeroBanner
 * Phở Gia Truyền 1986
 *
 * Dải lụa tâm điểm mini siêu tinh gọn (~62px) dành riêng cho Mobile.
 * Thay thế thẻ Hero 280px khổng lồ, giúp tiết kiệm hơn 200px chiều cao cho màn hình điện thoại.
 */
export default function CompactHeroBanner({ gift, isInCart = false, onApply }) {
  if (!gift) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#3d140e] via-[#240a06] to-[#3d140e] border border-amber-500/60 p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.7)] flex items-center justify-between gap-2.5">
      {/* Họa tiết hoa văn chìm */}
      <div className="absolute inset-0 bg-[radial-gradient(#c88d2b_1px,transparent_1px)] [background-size:12px_12px] opacity-10 pointer-events-none" />

      {/* Cụm hình ảnh và tiêu đề */}
      <div className="flex items-center gap-2.5 min-w-0 relative z-10">
        {/* Ảnh tròn viền vàng đính tag 0đ */}
        <div className="relative w-11 h-11 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md shrink-0 bg-stone-900">
          <img
            src={gift.image || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=150&q=80'}
            alt={gift.title}
            className="w-full h-full object-cover"
          />
          <span className="absolute -bottom-0.5 -right-0.5 px-1 py-0.2 rounded-full bg-gradient-to-br from-red-600 to-amber-600 border border-amber-300 text-[8px] font-bold text-white flex items-center justify-center shadow-xs">
            0đ
          </span>
        </div>

        {/* Thông tin súc tích */}
        <div className="min-w-0 pr-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-1.5 py-0.2 rounded text-[8px] font-serif font-black uppercase tracking-wider bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-2xs border border-amber-300/40">
              ★ TÂM ĐIỂM
            </span>
            {gift.minOrderAmount > 0 && (
              <span className="text-[9px] font-sans text-amber-300/80">
                (Đơn từ {formatPrice(gift.minOrderAmount)})
              </span>
            )}
          </div>
          <div className="text-xs font-serif font-black text-amber-100 truncate max-w-[155px] leading-tight mt-0.5">
            {gift.title}
          </div>
        </div>
      </div>

      {/* Nút thao tác nhanh 1 chạm */}
      <div className="shrink-0 relative z-10">
        {isInCart ? (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 text-[11px] font-serif font-bold flex items-center gap-1 shadow-inner">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Đã dùng</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              if (!onApply) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const coords = {
                startX: rect.left + rect.width / 2,
                startY: rect.top + rect.height / 2
              };
              onApply(gift, coords);
            }}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#9b2a1f] to-[#7a1811] hover:from-[#b83327] hover:to-[#911d15] text-amber-100 text-xs font-serif font-black border border-amber-300/60 shadow-[0_0_12px_rgba(212,175,55,0.4)] flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Dùng ngay</span>
            <ArrowRight className="w-3 h-3 text-amber-300" />
          </button>
        )}
      </div>
    </div>
  );
}

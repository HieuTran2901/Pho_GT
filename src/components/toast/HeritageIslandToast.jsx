import React from 'react';
import { X } from 'lucide-react';

/**
 * [RAVEN & URBAN] HeritageIslandToast
 * Phở Gia Truyền 1986
 *
 * Thanh thông báo dạng viên nang (Island Capsule Toast) phong cách Sơn Mài Thượng Khách
 * dành cho:
 * 1. Quà tặng Tri Kỷ ('gift_applied')
 * 2. Món ăn phở ('dish')
 * 3. Thông báo hệ thống chung (generic)
 */
export default function HeritageIslandToast({
  toastData,
  toastClosing,
  onClose,
  onOpenCart
}) {
  if (!toastData || toastData.type === 'member_welcome') return null;

  const isGift = toastData.type === 'gift_applied';
  const isDish = toastData.type === 'dish';

  return (
    <div
      className={`fixed top-[calc(env(safe-area-inset-top,0px)+98px)] sm:top-[104px] lg:top-[112px] left-1/2 z-[60] -translate-x-1/2 max-w-[95vw] sm:max-w-lg w-auto pointer-events-auto transition-all ${
        toastClosing ? 'animate-toast-island-out' : 'animate-toast-island-in'
      }`}
    >
      <div
        className={`rounded-full pl-2 pr-2 sm:pr-2.5 py-1.5 backdrop-blur-md flex items-center justify-between gap-2 sm:gap-3.5 ring-1 ${
          isGift
            ? 'bg-gradient-to-r from-[#2c0e09] via-[#1a0805] to-[#2c0e09] text-amber-100 border border-[#d49e58] shadow-[0_15px_45px_rgba(200,141,43,0.45)] ring-amber-400/40'
            : 'bg-[#181311]/95 text-stone-100 border border-amber-400/40 shadow-[0_12px_36px_rgba(0,0,0,0.55)] ring-white/10'
        }`}
      >
        {isGift ? (
          <>
            {/* Gift Thumbnail with Golden Rim & 0đ Stamp */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)] shrink-0 bg-stone-900">
                <img
                  src={toastData.image}
                  alt={toastData.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-red-600 to-amber-600 border border-amber-300 text-[7px] sm:text-[8px] font-bold text-white flex items-center justify-center shadow-xs">
                  0đ
                </span>
              </div>
              <div className="min-w-0 pr-1">
                <div className="flex items-center gap-1.5 flex-nowrap">
                  <span className="text-[9px] sm:text-[10px] text-amber-300 font-serif font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <span>🎁</span>
                    <span>ĐÃ ÁP DỤNG QUÀ</span>
                  </span>
                  <span className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-mono font-bold shrink-0">
                    {toastData.savings ? `-${toastData.savings.toLocaleString('vi-VN')}đ` : '0đ'}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-serif font-bold text-white truncate max-w-[130px] sm:max-w-[220px] leading-tight mt-0.5">
                  {toastData.name}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (onOpenCart) onOpenCart();
                  onClose();
                }}
                className="bg-gradient-to-r from-[#8a1f18] to-[#6a150c] hover:from-[#a0241c] hover:to-[#7f1910] text-amber-100 text-xs font-serif font-bold px-2.5 sm:px-3 py-1.5 rounded-full shadow-md transition-all active:scale-95 flex items-center gap-1 border border-amber-400/50 group cursor-pointer shrink-0"
              >
                <span>Bàn phở</span>
                <span className="text-amber-300 font-black group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng thông báo"
                className="w-6 h-6 rounded-full text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : isDish ? (
          <>
            {/* Dish Thumbnail with Gold Rim */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-amber-400/70 shadow-xs shrink-0 bg-stone-800">
                <img
                  src={toastData.image}
                  alt={toastData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider truncate">
                    Đã thêm vào bàn
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">
                  {toastData.name}
                </div>
              </div>
            </div>

            {/* Quick Action Pill Button: Open Cart Drawer */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (onOpenCart) onOpenCart();
                  onClose();
                }}
                className="bg-[#96281b] hover:bg-[#7e1f14] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md transition-all active:scale-95 flex items-center gap-1 border border-red-400/30 group cursor-pointer"
              >
                <span>Xem giỏ</span>
                <span className="text-amber-300 font-black group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng thông báo"
                className="w-6 h-6 rounded-full text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : (
          /* Generic system notification */
          <>
            <div className="flex items-center gap-2 pl-2 pr-1 py-1 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-stone-100 truncate max-w-[260px] sm:max-w-[320px]">
                {toastData.message}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng thông báo"
              className="w-6 h-6 rounded-full text-stone-400 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

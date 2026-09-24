import { memo } from 'react';
import { X } from 'lucide-react';

function GiftVaultHeader({ availablePoints, onClose }) {
  return (
    <div className="relative p-4 sm:p-5 bg-gradient-to-r from-[#441710] via-[#2a0f09] to-[#1a0805] border-b border-amber-900/60 flex items-center justify-between overflow-hidden shrink-0">
      <div className="absolute right-0 top-0 bottom-0 w-2/3 pointer-events-none opacity-20 overflow-hidden">
        <svg viewBox="0 0 350 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
          <path d="M10 110 L45 75 L80 110 L120 65 L165 110 L205 55 L250 110 L290 70 L335 110" stroke="#d49e58" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M35 80 L35 140 M55 80 L55 140 M110 70 L110 140 M130 70 L130 140" stroke="#d49e58" strokeWidth="1" opacity="0.6" />
        </svg>
      </div>

      <div className="flex items-center gap-3.5 relative z-10 min-w-0">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#ffd97a] via-[#c88d2b] to-[#6a3c0a] p-0.5 shadow-xl shrink-0">
          <div className="w-full h-full rounded-2xl bg-[#1a0805] flex items-center justify-center text-2xl sm:text-3xl shadow-inner border border-amber-900/60">
            🎁
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-black text-lg sm:text-2xl text-[#fbf4eb] leading-tight truncate drop-shadow-sm">
              Kho Quà Tri Kỷ 1986
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[#8a1f18] text-amber-200 font-serif text-[10px] font-bold border border-red-500/50 shadow-xs hidden sm:inline-block">
              Đặc quyền hội quán
            </span>
          </div>
          <p className="text-xs text-amber-300/90 font-serif mt-0.5 truncate">
            Phiếu thưởng ẩm thực phố cổ dành riêng cho thực khách thân thiết
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 relative z-10 shrink-0">
        <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-amber-500/40 text-right shadow-inner hidden sm:block">
          <div className="text-[9px] font-serif text-amber-400 uppercase font-bold tracking-wider">Điểm Tri Kỷ</div>
          <div className="text-base font-mono font-black text-amber-300">
            {availablePoints} <span className="text-[10px] font-serif font-normal text-stone-400">điểm</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:rotate-90 cursor-pointer shadow-md"
          aria-label="Đóng hòm quà"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}

export default memo(GiftVaultHeader);

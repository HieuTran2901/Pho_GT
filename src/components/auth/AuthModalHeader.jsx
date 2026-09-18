import React, { memo } from 'react';
import { Utensils } from 'lucide-react';

function AuthModalHeader() {
  return (
    <div className="bg-gradient-to-b from-[#f2e7d5] via-[#f7f0e3] to-[#fbf9f4] pt-7 pb-4 px-6 text-center border-b border-[#e2d5be] relative overflow-hidden shrink-0">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none flex justify-center w-24 h-10 overflow-visible z-10">
        <span className="w-1.5 h-6 bg-gradient-to-t from-[#8a1e14]/20 via-[#d4af37]/25 to-transparent rounded-full blur-[1px] animate-seal-steam-1 inline-block mr-1.5" />
        <span className="w-2 h-7 bg-gradient-to-t from-[#8a1e14]/25 via-[#f59e0b]/20 to-transparent rounded-full blur-[1px] animate-seal-steam-2 inline-block ml-1.5" />
      </div>
      <div className="mx-auto w-14 h-14 rounded-full border-2 border-[#8a1e14] p-0.5 flex items-center justify-center bg-white shadow-md mb-2.5 animate-seal-stamp origin-center relative z-20">
        <div className="w-full h-full rounded-full border border-dashed border-[#8a1e14] flex flex-col items-center justify-center text-[#8a1e14]">
          <span className="text-[7px] font-bold uppercase tracking-tighter">TRI KỶ</span>
          <Utensils className="w-4 h-4 text-[#8a1e14] my-0.5" />
          <span className="text-[8px] font-serif font-bold">1986</span>
        </div>
      </div>
      <h2 id="auth-modal-title" className="font-serif text-2xl sm:text-3xl font-bold text-[#2b1810] tracking-tight relative z-20">
        PHỞ GIA TRUYỀN 1986
      </h2>
      <p className="text-xs text-[#8a1e14] font-serif font-medium tracking-wide uppercase mt-1 flex items-center justify-center gap-2">
        <span className="w-6 h-px bg-[#8a1e14]/40" />
        <span>Bát Phở Tri Kỷ • Khẩu Vị Thân Quen</span>
        <span className="w-6 h-px bg-[#8a1e14]/40" />
      </p>
    </div>
  );
}

export default memo(AuthModalHeader);

import React from 'react';
import { ChefHat, Phone, CheckCircle2 } from 'lucide-react';

export default function OrderPrivilegesPanel({ isVisible }) {
  return (
    <>
      {/* ========================================================= */}
      {/* MOBILE VIEW (< lg): COMPACT MICRO-RIBBON & 1-TAP CALL    */}
      {/* ========================================================= */}
      <div className={`lg:hidden space-y-2.5 transition-all duration-700 ${isVisible ? 'reveal-slide-left' : 'opacity-0'}`}>
        {/* Compact Header with 1-Tap Hotline Pill */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-red/20 text-brand-red text-[10px] font-bold uppercase tracking-wider border border-brand-red/30 mb-1">
              <ChefHat className="w-3 h-3 text-amber-400" />
              <span>Đặt Trước Giữ Chỗ</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-amber-50 leading-tight truncate">
              Bát Phở Nóng Chờ Bạn
            </h2>
          </div>

          {/* Instant 1-Tap Quick Dial Hotline Pill */}
          <a
            href="tel:19008686"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#8b2316] to-[#5e170e] border border-red-400/40 shadow-md active:scale-95 transition-transform shrink-0"
            title="Gọi tổng đài miễn phí 1900 8686"
          >
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
              <Phone className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            </div>
            <div className="text-left">
              <div className="text-[9px] text-red-200 font-mono leading-none">Miễn cước</div>
              <div className="font-serif text-xs font-bold text-white tracking-wide leading-none mt-0.5">
                1900 8686
              </div>
            </div>
          </a>
        </div>

        {/* 3 Bento Micro-Promises Ribbon (1 Compact Row ~38px) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/5 border border-amber-500/20 text-center shadow-xs">
          <div className="flex items-center justify-center gap-1.5 py-1">
            <span className="text-sm">⏳</span>
            <div className="text-left">
              <div className="font-bold text-amber-200 text-[11px] leading-tight">30 Phút</div>
              <div className="text-[9px] text-stone-400 leading-none">Giữ miễn phí</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 py-1 border-x border-white/10">
            <span className="text-sm">🥢</span>
            <div className="text-left">
              <div className="font-bold text-amber-200 text-[11px] leading-tight">Tặng Quẩy</div>
              <div className="text-[9px] text-stone-400 leading-none">& Trà sen</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 py-1">
            <span className="text-sm">♨️</span>
            <div className="text-left">
              <div className="font-bold text-amber-200 text-[11px] leading-tight">Nóng 90°C</div>
              <div className="text-[9px] text-stone-400 leading-none">Tận bàn/nơi</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* DESKTOP VIEW (>= lg): ORIGINAL SPACIOUS 2-COLUMN LAYOUT   */}
      {/* ========================================================= */}
      <div className={`hidden lg:block lg:col-span-5 space-y-6 transition-all duration-700 ${isVisible ? 'reveal-slide-left' : 'opacity-0'}`}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-red/20 text-brand-red text-xs font-bold uppercase tracking-wider border border-brand-red/30">
          <ChefHat className="w-3.5 h-3.5 text-amber-400" />
          Phục Vụ Chu Đáo
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-50">
          Đặt Bàn Trước — Không Cần Chờ Đợi
        </h2>

        <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
          Vào các khung giờ cao điểm (sáng sớm và trưa), lượng thực khách rất đông. Hãy đặt bàn trước để chúng tôi chuẩn bị chỗ ngồi thoáng đãng và phục vụ bát phở nóng hổi ngay khi bạn vừa bước vào quán.
        </p>

        {/* Benefit bullet points */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-stone-200 text-sm">Giữ bàn miễn phí lên đến 30 phút</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-stone-200 text-sm">Tặng kèm đĩa quẩy giòn & trà sen khai vị</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-stone-200 text-sm">Giao tận nơi giữ nhiệt nước dùng 90°C</span>
          </div>
        </div>

        {/* Direct hotline reminder */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-red flex items-center justify-center text-white shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-stone-400">Hỗ trợ đặt bàn nhanh qua tổng đài:</div>
            <a href="tel:19008686" className="font-serif text-xl font-bold text-amber-300 hover:underline">
              1900 8686 (Miễn phí cước)
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

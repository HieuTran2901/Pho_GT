import React from 'react';
import { ChefHat, Phone, CheckCircle2 } from 'lucide-react';

export default function OrderPrivilegesPanel({ isVisible }) {
  return (
    <>
      {/* ========================================================= */}
      {/* MOBILE VIEW (< lg): COMPACT BENTO PRIVILEGES & 1-TAP CALL */}
      {/* ========================================================= */}
      <div className={`lg:hidden space-y-4 transition-all duration-700 ${isVisible ? 'reveal-slide-left' : 'opacity-0'}`}>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-red/20 text-brand-red text-xs font-bold uppercase tracking-wider border border-brand-red/30 mb-2.5">
            <ChefHat className="w-3.5 h-3.5 text-amber-400" />
            <span>Đặt Trước Giữ Chỗ</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-50 leading-tight">
            Bát Phở Nóng Chờ Bạn, Không Chờ Đợi
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Giờ cao điểm quán rất đông. Đặt trước để có bàn thoáng và phở lên ngay khi bạn bước vào quán.
          </p>
        </div>

        {/* 3 Bento Privilege Micro-Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
          <div className="bg-white/5 border border-amber-500/30 rounded-2xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-between shadow-xs">
            <span className="text-xl sm:text-2xl mb-1">⏳</span>
            <span className="font-bold text-amber-300 text-xs sm:text-sm">30 Phút</span>
            <span className="text-[10px] text-stone-400 leading-tight mt-0.5">Giữ bàn miễn phí</span>
          </div>

          <div className="bg-white/5 border border-amber-500/30 rounded-2xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-between shadow-xs">
            <span className="text-xl sm:text-2xl mb-1">🥢</span>
            <span className="font-bold text-amber-300 text-xs sm:text-sm">Tặng Quẩy</span>
            <span className="text-[10px] text-stone-400 leading-tight mt-0.5">& Trà sen khai vị</span>
          </div>

          <div className="bg-white/5 border border-amber-500/30 rounded-2xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-between shadow-xs">
            <span className="text-xl sm:text-2xl mb-1">♨️</span>
            <span className="font-bold text-amber-300 text-xs sm:text-sm">Nóng 90°C</span>
            <span className="text-[10px] text-stone-400 leading-tight mt-0.5">Giữ nhiệt tận nơi</span>
          </div>
        </div>

        {/* Instant 1-Tap Quick Dial Hotline Bar */}
        <a
          href="tel:19008686"
          className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#8b2316] to-[#5e170e] border border-red-400/40 shadow-lg active:scale-98 transition-transform group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Phone className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-[11px] text-red-200 font-medium">Tổng đài đặt bàn nhanh:</div>
              <div className="font-serif text-base sm:text-lg font-bold text-white tracking-wide">
                1900 8686
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[9px] sm:text-[10px] bg-amber-400 text-stone-950 font-bold px-2 py-0.5 rounded-full block mb-0.5 shadow-xs">
              MIỄN PHÍ CƯỚC
            </span>
            <span className="text-[11px] text-amber-200 font-bold underline group-hover:text-amber-100 transition-colors">
              Chạm gọi ngay →
            </span>
          </div>
        </a>
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

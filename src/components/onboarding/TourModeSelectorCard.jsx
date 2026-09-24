import React, { useEffect, memo } from 'react';
import { Sparkles, UtensilsCrossed, ArrowRight, X, Clock } from 'lucide-react';
import HeritageMascotFigure from './HeritageMascotFigure';
import { TOUR_MODES } from './tourSteps';

const TourModeSelectorCard = memo(function TourModeSelectorCard({ onSelectMode, onClose }) {
  // Lắng nghe phím Escape để đóng nhanh
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-300">
      {/* Backdrop mờ nền sơn then 75% */}
      <div
        className="absolute inset-0 bg-[#050c08]/75 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-label="Đóng bảng chọn hành trình"
      />

      {/* Thẻ chính phong cách hoàng gia ngọc bích sẫm viền vàng kim */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-gradient-to-br from-[#152e23] via-[#0d2219] to-[#07150f] border-2 border-[#d4af37] shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.35)] text-stone-100 p-6 sm:p-8 font-serif">
        
        {/* Nút đóng góc phải */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-amber-200 p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          title="Để sau (ESC)"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header: Mascot Avatar & Lời chào kinh kỳ */}
        <div className="flex items-center gap-4 border-b border-[#d4af37]/25 pb-5 mb-5">
          <HeritageMascotFigure
            expression="pointing"
            size="md"
            showSteam={true}
            className="shrink-0"
          />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#fae29c] bg-[#1a382b] px-2.5 py-0.5 rounded-full border border-[#d4af37]/40">
                TIỂU NHỊ 1986 KÍNH CHÀO
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#fae29c] mt-1 leading-tight">
              Bác Muốn Trải Nghiệm Điều Gì?
            </h3>
          </div>
        </div>

        {/* Lời dẫn dắt ấm áp */}
        <p className="text-xs sm:text-sm text-stone-200 font-sans leading-relaxed mb-6 opacity-90">
          Dạ thưa Bác! Con là <strong className="text-amber-300 font-serif">Tiểu Nhị 1986</strong>, rất vinh hạnh được đồng hành cùng Bác. Mời Bác chọn hành trình hướng dẫn phù hợp nhất:
        </p>

        {/* 2 Lựa chọn hành trình dạng bento */}
        <div className="space-y-3.5 mb-6 font-sans">
          
          {/* Lựa chọn 1: Dạo Quanh Quán Phở (1 phút) */}
          <button
            type="button"
            onClick={() => onSelectMode(TOUR_MODES.HERITAGE.id)}
            className="w-full p-4 rounded-2xl bg-[#13281f]/80 hover:bg-[#193529] border border-[#d4af37]/40 hover:border-amber-400 text-left transition-all duration-200 group cursor-pointer shadow-md hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/10 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-serif font-bold text-sm sm:text-base text-amber-100 group-hover:text-amber-200">
                    {TOUR_MODES.HERITAGE.title}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-300/80 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    <Clock className="w-2.5 h-2.5" />
                    {TOUR_MODES.HERITAGE.estTime}
                  </span>
                </div>
                <p className="text-xs text-stone-300/90 leading-tight">
                  {TOUR_MODES.HERITAGE.subtitle}
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-amber-400 group-hover:text-stone-900 flex items-center justify-center shrink-0 text-amber-300 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Lựa chọn 2: Hướng Dẫn Đặt Món & Thanh Toán (1.5 phút) */}
          <button
            type="button"
            onClick={() => onSelectMode(TOUR_MODES.ORDERING.id)}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#2a130f]/80 to-[#1f1614]/80 hover:from-[#381a14] hover:to-[#2b1e1b] border border-red-500/40 hover:border-red-400 text-left transition-all duration-200 group cursor-pointer shadow-md hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between gap-3 relative overflow-hidden"
          >
            {/* Nhãn khuyên dùng */}
            <span className="absolute top-0 right-7 bg-red-600 text-amber-100 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-b-md shadow-xs">
              Thực hành nhanh
            </span>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-amber-500/10 border border-red-400/40 flex items-center justify-center text-amber-300 shrink-0 group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-serif font-bold text-sm sm:text-base text-amber-100 group-hover:text-amber-200">
                    {TOUR_MODES.ORDERING.title}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-300/80 bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20">
                    <Clock className="w-2.5 h-2.5" />
                    {TOUR_MODES.ORDERING.estTime}
                  </span>
                </div>
                <p className="text-xs text-stone-300/90 leading-tight">
                  {TOUR_MODES.ORDERING.subtitle}
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#96281b] group-hover:text-amber-100 flex items-center justify-center shrink-0 text-amber-300 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

        </div>

        {/* Footer: Bỏ qua / Để sau */}
        <div className="flex items-center justify-between pt-4 border-t border-[#d4af37]/20 text-xs font-sans">
          <span className="text-stone-400">
            Bác có thể mở lại bất cứ lúc nào qua nút la bàn trên menu
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-amber-300/80 hover:text-amber-200 underline font-semibold transition-colors cursor-pointer"
          >
            Để sau
          </button>
        </div>

      </div>
    </div>
  );
});

export default TourModeSelectorCard;

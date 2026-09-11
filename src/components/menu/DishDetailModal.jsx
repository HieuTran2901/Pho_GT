import React, { useEffect } from 'react';
import {
  X,
  Heart,
  Sparkles,
  CheckCircle2,
  Plus,
  Clock
} from 'lucide-react';
import { FeatureIcon, TagBadgeIcon, formatPrice } from './menuConstants';

export default function DishDetailModal({
  selectedDetailItem,
  onClose,
  isLiked,
  onToggleLike,
  onAdd
}) {
  useEffect(() => {
    if (!selectedDetailItem) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedDetailItem, onClose]);

  if (!selectedDetailItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Bottom Sheet Container */}
      <div className="relative w-full max-w-lg mx-auto bg-[#faf6ef] text-[#2c1810] rounded-t-3xl border-t-2 border-amber-500/40 shadow-2xl max-h-[88vh] flex flex-col overflow-hidden animate-bottom-sheet-up z-10">
        {/* Sheet Handle Bar */}
        <div
          className="pt-3 pb-1 flex justify-center cursor-pointer"
          onClick={onClose}
        >
          <div className="w-12 h-1.5 rounded-full bg-stone-300" />
        </div>

        {/* Header with Title & Close */}
        <div className="px-5 py-2.5 flex items-center justify-between border-b border-stone-200/80">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#96281b] shrink-0" />
            <span className="font-serif font-bold text-sm tracking-wide text-[#1b3425] truncate">
              CHI TIẾT VỊ PHỞ 1986
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Đóng chi tiết món"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 pb-6">
          {/* Banner Image with 16:9 Aspect Ratio */}
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-md bg-stone-100">
            <img
              src={selectedDetailItem.image}
              alt={selectedDetailItem.name}
              className={`w-full h-full object-cover ${
                selectedDetailItem.isAvailable === false ? 'grayscale-[35%] opacity-85' : ''
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Top-left tag badge */}
            <div className="absolute top-3 left-3 z-10">
              {selectedDetailItem.isAvailable === false ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#26160d]/95 text-amber-300 border border-amber-400/40 shadow-md backdrop-blur-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>Bếp Tạm Hết Món</span>
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white shadow-md backdrop-blur-xs ${
                    selectedDetailItem.theme === 'green' ? 'bg-[#1b3425]/95' : 'bg-[#96281b]/95'
                  }`}
                >
                  {selectedDetailItem.tagIcon && <TagBadgeIcon icon={selectedDetailItem.tagIcon} />}
                  <span>{selectedDetailItem.tag}</span>
                </span>
              )}
            </div>

            {/* Top-right Heart */}
            <div className="absolute top-3 right-3 z-10">
              <button
                type="button"
                onClick={() => onToggleLike(selectedDetailItem, null, !isLiked)}
                className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer ${
                  isLiked
                    ? 'bg-white/95 border border-white/90 shadow-[0_3px_10px_rgba(0,0,0,0.18)]'
                    : 'bg-black/40 text-white'
                }`}
              >
                <Heart
                  className={`w-4 h-4 transition-all ${
                    isLiked
                      ? 'fill-[#ff2e63] text-[#ff2e63] drop-shadow-[0_2px_6px_rgba(255,46,99,0.5)]'
                      : 'text-white'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Title, Price & Portion */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1b3425] leading-snug">
                {selectedDetailItem.name}
              </h3>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200 mt-1">
                {selectedDetailItem.portion || 'Tô thường'}
              </span>
            </div>
            <div className="font-serif font-bold text-xl text-[#96281b] tracking-tight shrink-0">
              {formatPrice(selectedDetailItem.price)}
            </div>
          </div>

          {/* Full Description */}
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-900/10">
            {selectedDetailItem.description}
          </p>

          {/* Nguyên Liệu Tinh Tuyển (Feature Pills) */}
          {selectedDetailItem.featurePills && selectedDetailItem.featurePills.length > 0 && (
            <div className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-serif font-bold text-[#1b3425] mb-2.5">
                <span className="flex items-center gap-1.5 text-[#96281b]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Nguyên Liệu Tinh Tuyển Gia Truyền 1986
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {selectedDetailItem.featurePills.map((pill, pIdx) => (
                  <div
                    key={pIdx}
                    className="bg-stone-50 border border-stone-200/80 rounded-xl p-2 flex items-center gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#96281b]/10 text-[#96281b] flex items-center justify-center shrink-0">
                      <FeatureIcon type={pill.type} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-stone-900 truncate">
                        {pill.label}
                      </div>
                      <div className="text-[10px] text-stone-500 truncate">
                        {pill.sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Đặc điểm nổi bật (Highlights) */}
          {selectedDetailItem.highlights && selectedDetailItem.highlights.length > 0 && (
            <div className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs">
              <div className="text-xs font-serif font-bold text-[#1b3425] mb-2">
                Đặc Điểm Hương Vị Nổi Bật
              </div>
              <div className="space-y-1.5">
                {selectedDetailItem.highlights.map((hl, hIdx) => (
                  <div key={hIdx} className="flex items-center gap-2 text-xs text-stone-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#96281b] shrink-0" />
                    <span>{typeof hl === 'string' ? hl.replace(/^Nguyên liệu tuyển chọn:\s*/i, '') : hl}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Action Button */}
          <div className="pt-2">
            {selectedDetailItem.isAvailable === false ? (
              <button
                type="button"
                disabled
                className="w-full py-3.5 px-4 rounded-2xl bg-stone-200 text-stone-500 font-serif font-bold text-sm flex items-center justify-center gap-2 border border-stone-300 cursor-not-allowed select-none shadow-xs"
              >
                <Clock className="w-4 h-4 text-stone-400" />
                <span>Bếp Tạm Hết Món — Hẹn Thực Khách Bữa Sau</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  onAdd(selectedDetailItem, e);
                  onClose();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#96281b] hover:bg-[#802216] text-white font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-950/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Thêm Vào Bàn — {formatPrice(selectedDetailItem.price)}</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

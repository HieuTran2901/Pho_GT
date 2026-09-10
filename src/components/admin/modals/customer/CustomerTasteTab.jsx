import { Flame, Soup, Sparkles, UtensilsCrossed } from 'lucide-react';

const BROTH_MAP = {
  THANH: 'Thanh tao ninh xương',
  DAM_DA: 'Đậm đà quế hồi',
  BEO_NGAY: 'Béo ngậy mỡ gầu'
};

const ONION_MAP = {
  NHIEU_HANH: 'Nhiều hành hoa',
  IT_HANH: 'Ít hành hoa',
  HANH_TRAN: 'Hành củ trần tái',
  DAU_HANH: 'Đầu hành chẻ sợi'
};

const CRULLER_MAP = {
  QUAY_GION: 'Quẩy giòn rụm',
  QUAY_MEM: 'Quẩy mềm',
  KHONG_QUAY: 'Không quẩy'
};

export default function CustomerTasteTab({ taste }) {
  const spicyLevel = taste?.spicyLevel ?? 1;

  return (
    <div className="space-y-3 animate-fadeIn">
      {/* HERO CARD: BÁT PHỞ RUỘT */}
      <div className="rounded-xl bg-gradient-to-r from-[#2a170e] via-[#3a1d12] to-[#1f0f08] p-3.5 sm:p-4 border border-[#d4af37]/40 shadow-sm text-white flex items-center justify-between transition-all duration-200 hover:border-[#d4af37]/70">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-serif uppercase tracking-widest text-[#d4af37] font-bold">
            <Sparkles className="w-3 h-3 text-amber-400" /> Bát Phở Ruột Thân Quen
          </div>
          <h4 className="text-sm sm:text-base font-serif font-bold text-amber-100">
            {taste?.favoriteDishName || 'Chọn ngẫu nhiên theo thực đơn'}
          </h4>
        </div>
        <div className="w-10 h-10 rounded-lg bg-[#8a1e14]/80 border border-[#d4af37]/50 flex items-center justify-center text-amber-300 shadow-inner shrink-0 transition-transform duration-200 hover:scale-105">
          <Soup className="w-5 h-5" />
        </div>
      </div>

      {/* 4 THẺ KHẨU VỊ CỐT LÕI - COMPACT & CLEAN */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Nước Dùng */}
        <div className="p-2.5 rounded-lg bg-white border border-[#d4af37]/20 shadow-2xs hover:border-[#d4af37]/50 hover:-translate-y-0.5 transition-all duration-150">
          <span className="text-[#8c7a6b] text-[11px] font-medium flex items-center gap-1">
            <UtensilsCrossed className="w-3 h-3 text-[#8a1e14]" /> Nước dùng
          </span>
          <span className="font-bold text-[#22130b] mt-0.5 block font-serif truncate">
            {BROTH_MAP[taste?.brothType] || 'Đậm đà quế hồi'}
          </span>
        </div>

        {/* Hành Hoa */}
        <div className="p-2.5 rounded-lg bg-white border border-[#d4af37]/20 shadow-2xs hover:border-[#d4af37]/50 hover:-translate-y-0.5 transition-all duration-150">
          <span className="text-[#8c7a6b] text-[11px] font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" /> Hành hoa
          </span>
          <span className="font-bold text-[#22130b] mt-0.5 block font-serif truncate">
            {ONION_MAP[taste?.onionStyle] || 'Nhiều hành hoa'}
          </span>
        </div>

        {/* Quẩy */}
        <div className="p-2.5 rounded-lg bg-white border border-[#d4af37]/20 shadow-2xs hover:border-[#d4af37]/50 hover:-translate-y-0.5 transition-all duration-150">
          <span className="text-[#8c7a6b] text-[11px] font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> Quẩy kèm
          </span>
          <span className="font-bold text-[#22130b] mt-0.5 block font-serif truncate">
            {CRULLER_MAP[taste?.crullerPref] || 'Quẩy giòn rụm'}
          </span>
        </div>

        {/* Độ Cay */}
        <div className="p-2.5 rounded-lg bg-white border border-[#d4af37]/20 shadow-2xs hover:border-[#d4af37]/50 hover:-translate-y-0.5 transition-all duration-150">
          <span className="text-[#8c7a6b] text-[11px] font-medium flex items-center gap-1">
            <Flame className="w-3 h-3 text-rose-600" /> Mức ớt cay
          </span>
          <div className="mt-0.5 flex items-center gap-1.5">
            <div className="flex items-center text-rose-600">
              {Array.from({ length: Math.max(1, spicyLevel) }).map((_, i) => (
                <Flame key={i} className="w-3.5 h-3.5 fill-current text-rose-600" />
              ))}
            </div>
            <span className="font-bold text-[#8a1e14] font-serif text-[11px]">
              {spicyLevel === 0 ? 'Không cay' : `Cấp ${spicyLevel}`}
            </span>
          </div>
        </div>
      </div>

      {/* LỜI DẶN RIÊNG GỬI ĐẦU BẾP - COMPACT */}
      {taste?.customNote && (
        <div className="p-2.5 rounded-lg bg-[#faf2dd] border border-[#d4af37]/35 text-xs text-[#4a3525] shadow-2xs flex items-start gap-2">
          <span className="font-bold text-[#8a1e14] font-serif shrink-0 text-[11px]">📝 Lời dặn:</span>
          <p className="italic text-[#22130b] font-serif text-[12px] leading-snug">
            "{taste.customNote}"
          </p>
        </div>
      )}
    </div>
  );
}

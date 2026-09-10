import React from 'react';
import { Wrench } from 'lucide-react';

/**
 * [URBAN & RAVEN] PaymentPrimaryOptionCard
 * Thẻ hiển thị phương thức thanh toán chính (VietQR, Tiền mặt tại quán, COD)
 */
function PaymentPrimaryOptionCard({
  title,
  description,
  maintDescription,
  tagText,
  tagType = 'emerald',
  icon: Icon,
  iconColor = 'text-amber-400',
  methodKey,
  isSelected,
  isMaintenance,
  onClick,
  popoverNode
}) {
  return (
    <div>
      <div
        onClick={onClick}
        className={`flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border cursor-pointer transition-all ${
          isMaintenance
            ? 'border-2 border-dashed border-amber-400/90 bg-gradient-to-r from-amber-950/70 via-[#26140b] to-black/70 shadow-[0_0_18px_rgba(245,158,11,0.25)]'
            : isSelected
            ? 'bg-amber-950/40 border-amber-400 shadow-md ring-1 ring-amber-400/30'
            : 'bg-white/5 border-white/10 hover:border-amber-400/50'
        }`}
      >
        <input
          type="radio"
          name="payment_method"
          value={methodKey}
          checked={isSelected}
          onChange={() => {}}
          className="mt-1 accent-amber-500 pointer-events-none"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-black text-[#fff8ed] flex items-center gap-1.5 truncate">
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${iconColor} shrink-0`} />
              <span className="truncate">{title}</span>
            </span>

            {isMaintenance ? (
              <span className="text-[10px] bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 px-2.5 py-0.5 rounded-full font-black border border-amber-200 shadow-sm flex items-center gap-1 uppercase tracking-tight shrink-0">
                <Wrench className="w-2.5 h-2.5" />
                Tạm Bảo Trì
              </span>
            ) : tagText ? (
              <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-extrabold shadow-xs shrink-0 ${
                tagType === 'gold'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {tagText}
              </span>
            ) : null}
          </div>

          <p className={`text-[11px] sm:text-xs mt-0.5 leading-snug ${isMaintenance ? 'text-amber-200 font-medium' : 'text-stone-400'}`}>
            {isMaintenance ? (maintDescription || 'Cổng thanh toán đang bảo trì nâng cấp đường truyền. Chạm để xem chi tiết.') : description}
          </p>
        </div>
      </div>

      {popoverNode}
    </div>
  );
}

export default React.memo(PaymentPrimaryOptionCard);

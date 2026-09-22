import React, { useState, useMemo } from 'react';
import { Minus, Plus, Trash2, ChevronDown, ChevronUp, Sparkles, ChefHat } from 'lucide-react';

export default function CartDrawerItem({
  item,
  isPrimaryBowl,
  freeGift,
  justApplied,
  isGliding,
  comboChildRef,
  sparkleBurst,
  onUpdateQuantity,
  onRemoveItem,
  formatPrice,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const itemId = item.cartItemId || item.id;
  const customizations = item.customizations;
  const hasCustomizations = Boolean(customizations);

  // 1. Phân loại tùy biến đã thay đổi so với mặc định (Delta-Only Logic)
  const { deltaPreferences, isAllStandardTaste, toppings, toppingsTotal, notes } = useMemo(() => {
    if (!customizations) {
      return { deltaPreferences: [], isAllStandardTaste: true, toppings: [], toppingsTotal: 0, notes: '' };
    }

    const isBrothStandard = customizations.brothId ? customizations.brothId === 'trong' : customizations.broth?.includes('Trong Thanh');
    const isNoodleStandard = customizations.noodleId ? customizations.noodleId === 'vua' : customizations.noodle?.includes('Vừa Độ');
    const isHerbStandard = customizations.herbId ? customizations.herbId === 'day_du' : customizations.herb?.includes('Đầy Đủ');
    const isSpiceStandard = customizations.spiceId ? customizations.spiceId === 'vua' : customizations.spice?.includes('Cay Vừa');

    const deltas = [];
    if (!isBrothStandard && customizations.broth) deltas.push(customizations.broth);
    if (!isNoodleStandard && customizations.noodle) deltas.push(customizations.noodle);
    if (!isHerbStandard && customizations.herb) deltas.push(customizations.herb);
    if (!isSpiceStandard && customizations.spice) deltas.push(customizations.spice);

    const tops = Array.isArray(customizations.toppings) ? customizations.toppings : [];
    const topTotal = tops.reduce((sum, t) => sum + (Number(t.price) || 0), 0);

    return {
      deltaPreferences: deltas,
      isAllStandardTaste: deltas.length === 0,
      toppings: tops,
      toppingsTotal: topTotal,
      notes: customizations.notes || '',
    };
  }, [customizations]);

  return (
    <div className="space-y-1.5">
      {/* Thẻ món ăn chính */}
      <div
        className={`relative flex items-start gap-3.5 sm:gap-4 p-3 rounded-2xl transition-all duration-300 shadow-xs ${
          justApplied && isPrimaryBowl
            ? 'bg-amber-50/80 border-2 border-amber-400/90 shadow-[0_0_20px_rgba(245,158,11,0.45)]'
            : 'bg-stone-50 border border-stone-200/90 hover:border-amber-400/60'
        }`}
      >
        {/* Ruy băng nơ lụa hút vào ảnh bát phở khi có quà */}
        {isPrimaryBowl && !isGliding && freeGift && (
          <div className="absolute -top-2.5 left-3 z-10 animate-ribbon-snap pointer-events-none">
            <div className="bg-gradient-to-r from-[#9b2a1f] via-[#7d1d14] to-[#591008] border border-amber-300 text-amber-100 text-[10px] font-serif font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1.5 ring-1 ring-amber-400/40">
              <span>🎀</span>
              <span className="truncate max-w-[140px]">+ {freeGift.name}</span>
            </div>
          </div>
        )}

        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-stone-200 mt-0.5">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <h4 className="font-serif font-bold text-sm text-stone-900 truncate">
              {item.name}
            </h4>
          </div>

          <div className="text-xs font-bold text-brand-red mt-0.5">
            {formatPrice(item.price || item.unitPrice)}
          </div>

          {/* DÒNG TÓM TẮT GU PHỞ SIÊU GỌN GÀNG (Phương án 1 + 2) */}
          {hasCustomizations && (
            <div className="mt-1.5 space-y-1">
              {/* Dòng 1: Khẩu vị cốt lõi đã lọc bớt mặc định */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] leading-tight text-stone-600">
                <span className="text-amber-800 font-serif font-medium text-[10.5px]">
                  {isAllStandardTaste ? '🍜 Chuẩn vị 1986' : `🍜 ${deltaPreferences.join(' · ')}`}
                </span>

                {/* Badge món kèm tính phí (nếu có) */}
                {toppings.length > 0 && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-amber-100/90 text-[#8a1e14] font-bold text-[10px] border border-amber-300/60">
                    <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                    <span>+{toppings.length} món kèm (+{formatPrice(toppingsTotal)})</span>
                  </span>
                )}

                {/* Nút toggle mở rộng chi tiết */}
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-[#8a1e14] hover:text-[#b52a1c] hover:underline cursor-pointer ml-auto"
                  aria-label={isExpanded ? 'Thu gọn chi tiết gu' : 'Xem chi tiết gu'}
                >
                  <span>{isExpanded ? 'Thu gọn' : 'Chi tiết'}</span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Dòng tóm tắt lời dặn nếu chưa bấm mở rộng */}
              {!isExpanded && notes && (
                <p className="text-[10px] italic text-stone-500 truncate max-w-[200px] sm:max-w-xs">
                  "Dặn bếp: {notes}"
                </p>
              )}

              {/* BẢNG ACCORDION XỔ CHI TIẾT (Mở rộng khi bấm Chi tiết) */}
              {isExpanded && (
                <div className="mt-1 p-2 rounded-xl bg-[#fcf9f2] border border-[#d4af37]/40 text-[10.5px] text-stone-700 space-y-1 animate-fadeIn shadow-2xs">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
                    <div><span className="text-stone-400 font-serif">Nước dùng:</span> <span className="font-semibold text-stone-800">{customizations.broth || 'Trong thanh'}</span></div>
                    <div><span className="text-stone-400 font-serif">Bánh phở:</span> <span className="font-semibold text-stone-800">{customizations.noodle || 'Vừa độ'}</span></div>
                    <div><span className="text-stone-400 font-serif">Hành hoa:</span> <span className="font-semibold text-stone-800">{customizations.herb || 'Đầy đủ'}</span></div>
                    <div><span className="text-stone-400 font-serif">Khẩu vị cay:</span> <span className="font-semibold text-stone-800">{customizations.spice || 'Cay vừa'}</span></div>
                  </div>

                  {toppings.length > 0 && (
                    <div className="pt-1 border-t border-[#ebdcc7]/60">
                      <span className="text-stone-400 font-serif text-[10px]">Món ăn kèm:</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {toppings.map((t, idx) => (
                          <span key={idx} className="inline-block px-1.5 py-0.2 rounded bg-white text-stone-800 border border-stone-200 text-[9.5px]">
                            {t.name} <strong className="text-[#8a1e14]">+{formatPrice(t.price)}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {notes && (
                    <div className="pt-1 border-t border-[#ebdcc7]/60 text-[10px] text-stone-600 italic">
                      <span className="text-stone-400 not-italic font-serif">Dặn bếp:</span> "{notes}"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quantity controls */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => onUpdateQuantity(itemId, item.quantity - 1)}
              className="w-6 h-6 rounded bg-white border border-stone-300 flex items-center justify-center text-stone-700 hover:bg-stone-200 cursor-pointer active:scale-95"
              aria-label="Giảm số lượng"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-bold text-stone-800 px-1 font-mono">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(itemId, item.quantity + 1)}
              className="w-6 h-6 rounded bg-white border border-stone-300 flex items-center justify-center text-stone-700 hover:bg-stone-200 cursor-pointer active:scale-95"
              aria-label="Tăng số lượng"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        <button
          onClick={() => onRemoveItem(itemId)}
          className="p-2 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
          title="Xóa món"
          aria-label="Xóa món"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Móc nối gấm combo đi kèm phía dưới bát phở nếu có quà tặng */}
      {isPrimaryBowl && freeGift && (
        <div className="relative ml-5 sm:ml-7 pl-3.5 sm:pl-4 border-l-2 border-dashed border-amber-500/60 pb-1 animate-fadeIn">
          <div className="absolute -left-[2px] top-5 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500/60 rounded-bl-lg pointer-events-none" />

          <div
            ref={comboChildRef}
            className={`relative flex items-center gap-2.5 p-2 rounded-xl transition-all duration-500 ${
              isGliding
                ? 'border-2 border-dashed border-amber-400/90 bg-amber-50/60 scale-[0.98] opacity-70 shadow-inner'
                : justApplied
                ? 'bg-gradient-to-r from-[#fff9ee] via-[#fff3db] to-[#fdedcd] border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.55)] ring-2 ring-amber-400/60 scale-[1.005]'
                : 'bg-gradient-to-r from-[#fffdf8] via-[#fcf5e8] to-[#f4e7d0] border border-[#c88d2b]/60 shadow-xs hover:border-[#c88d2b]'
            }`}
          >
            {sparkleBurst && (
              <div className="absolute inset-0 rounded-xl pointer-events-none border-2 border-amber-400 animate-docking-burst z-20" />
            )}

            <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-[#c88d2b]/80 shrink-0 bg-stone-900 shadow-xs">
              <img
                src={freeGift.image}
                alt={freeGift.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#9b2a1f] font-serif bg-amber-200/80 px-1 py-0.2 rounded border border-amber-300">
                  Quà Tặng
                </span>
                <span className="text-[10px] text-stone-500 font-serif italic truncate">
                  {freeGift.voucherCode ? `Mã: ${freeGift.voucherCode}` : 'Đi kèm bát đầu tiên'}
                </span>
              </div>
              <h5 className="font-serif font-bold text-xs text-stone-900 truncate">
                {freeGift.name}
              </h5>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="font-bold text-emerald-700">0đ</span>
                {freeGift.originalPrice && (
                  <span className="text-stone-400 line-through text-[10px]">
                    {formatPrice(freeGift.originalPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

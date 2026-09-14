import React, { useState } from 'react';
import { Check, ChevronDown, Sparkles, Clock, ArrowRight } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const formatPrice = (price) => currencyFormatter.format(price);

const formatExactDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getProjectedExpiry = (days = 30) => {
  const target = new Date();
  target.setDate(target.getDate() + (days || 30));
  return target.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * [RAVEN & URBAN] GiftWalletStack
 * Phở Gia Truyền 1986
 *
 * Giao diện "Ví Gấm Tri Kỷ Xếp Lớp" dành riêng cho Mobile (Apple Wallet style).
 * Các tấm vé quà tặng xếp tầng lên nhau, chạm vào vé nào thì vé đó bung mở chi tiết.
 */
function GiftWalletStack({
  gifts = [],
  mode = 'USE', // 'USE' | 'REDEEM'
  isGiftInCart = () => false,
  onApply,
  onRedeem,
  userPoints = 0,
  redeemingId = null,
  newlyRedeemedId = null
}) {
  const [expandedId, setExpandedId] = useState(null);

  if (!gifts || gifts.length === 0) return null;

  const handleToggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full relative pb-4">
      {/* Gợi ý tương tác vuốt/chạm */}
      <div className="text-[11px] font-serif text-amber-300/80 mb-2 flex items-center justify-between px-1">
        <span>Ví Gấm Tri Kỷ ({gifts.length} phiếu)</span>
        <span className="text-[10px] text-stone-400 font-sans italic">Chạm vào phiếu để xem chi tiết</span>
      </div>

      {/* STACK CONTAINER */}
      <div className="flex flex-col space-y-2">
        {gifts.map((gift) => {
          const isExpanded = expandedId === gift.id;
          const isInCart = isGiftInCart(gift);
          const isUsed = gift.status === 'USED';
          const isExpired = gift.status === 'EXPIRED';
          const isFreeItem = gift.rewardType === 'FREE_ITEM';
          const isCashDiscount = gift.rewardType === 'DISCOUNT_CASH' || gift.rewardType === 'DISCOUNT_PERCENT';
          const isRedeemable = userPoints >= (gift.pointsRequired || 0);
          const isRedeemingThis = redeemingId === gift.id;

          // Theme màu sắc gấm truyền thống
          const theme = isFreeItem
            ? {
                cardBg: 'bg-gradient-to-br from-[#fffdf8] via-[#fcf5e8] to-[#f4e7d0]',
                border: 'border-[#c88d2b]',
                title: 'text-[#2a1209]',
                desc: 'text-[#543422]',
                badgeBg: 'bg-[#8a1f18] text-amber-100',
                headerBorder: 'border-b border-[#c88d2b]/30',
                shadow: 'shadow-[0_4px_16px_rgba(0,0,0,0.5)]',
                accentText: 'text-[#8a1f18]'
              }
            : isCashDiscount
            ? {
                cardBg: 'bg-gradient-to-br from-[#7a1811] via-[#5c1009] to-[#3a0804]',
                border: 'border-amber-500/70',
                title: 'text-amber-100',
                desc: 'text-amber-200/85',
                badgeBg: 'bg-amber-400 text-stone-950 font-bold',
                headerBorder: 'border-b border-amber-500/30',
                shadow: 'shadow-[0_4px_16px_rgba(0,0,0,0.6)]',
                accentText: 'text-amber-300'
              }
            : {
                cardBg: 'bg-gradient-to-br from-[#2a170d] via-[#1f1008] to-[#140804]',
                border: 'border-amber-800/80',
                title: 'text-amber-100',
                desc: 'text-stone-300',
                badgeBg: 'bg-amber-950 text-amber-200 border border-amber-600/50',
                headerBorder: 'border-b border-amber-900/60',
                shadow: 'shadow-[0_4px_16px_rgba(0,0,0,0.7)]',
                accentText: 'text-amber-400'
              };

          const isNewlyRedeemed = newlyRedeemedId === gift.id;

          return (
            <div
              key={gift.id}
              className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden relative ${theme.cardBg} ${theme.border} ${theme.shadow} ${
                isNewlyRedeemed
                  ? 'ring-4 ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.85)] animate-pulse'
                  : isInCart
                  ? 'ring-2 ring-emerald-500'
                  : ''
              } ${isUsed || isExpired ? 'opacity-85' : ''} ${isExpanded ? 'scale-[1.01] shadow-2xl' : 'hover:brightness-105'}`}
            >
              {/* GÁY VÉ (HEADER STRIP) - LUÔN HIỂN THỊ */}
              <button
                type="button"
                onClick={() => handleToggle(gift.id)}
                className={`w-full p-3 flex items-center justify-between text-left cursor-pointer transition-colors ${
                  isExpanded ? theme.headerBorder : ''
                }`}
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  {/* Thumbnail nhỏ ở gáy vé */}
                  <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#c88d2b]/60 shadow-xs shrink-0 bg-stone-900">
                    <img
                      src={gift.image || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=150&q=80'}
                      alt={gift.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-serif font-bold uppercase shadow-2xs ${theme.badgeBg}`}>
                        {isFreeItem ? 'Miễn phí 0đ' : formatPrice(gift.discountValue || 20000)}
                      </span>
                      {gift.minOrderAmount > 0 && (
                        <span className="text-[10px] text-stone-500 font-sans">
                          (Đơn từ {formatPrice(gift.minOrderAmount)})
                        </span>
                      )}
                    </div>
                    <div className={`text-xs font-serif font-black truncate max-w-[190px] leading-tight mt-0.5 ${theme.title}`}>
                      {gift.title}
                    </div>
                  </div>
                </div>

                {/* Trạng thái mở & Chevron */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isUsed ? (
                    <span className="text-[9px] font-serif font-bold text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded-full border border-red-800/80">
                      Đã dùng
                    </span>
                  ) : isExpired ? (
                    <span className="text-[9px] font-serif font-bold text-stone-400 bg-stone-900/80 px-1.5 py-0.5 rounded-full border border-stone-700/80">
                      Hết hạn
                    </span>
                  ) : isInCart ? (
                    <span className="text-[9px] font-serif font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-300">
                      Trong giỏ
                    </span>
                  ) : null}
                  <div className={`w-6 h-6 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-300 ${
                    isExpanded ? 'rotate-180 bg-black/20' : ''
                  }`}>
                    <ChevronDown className={`w-3.5 h-3.5 ${theme.accentText}`} />
                  </div>
                </div>
              </button>

              {/* THÂN VÉ (ACCORDION BODY) - BUNG MỞ KHI ĐƯỢC CHỌN */}
              {isExpanded && (
                <div className="p-3.5 pt-2 animate-fadeIn space-y-3">
                  {/* CON DẤU MỘC ĐỎ SON 1986 "ĐÃ SỬ DỤNG" / "HẾT HẠN" */}
                  {isUsed && (
                    <div className="flex items-center justify-center py-1">
                      <div className="transform -rotate-6 border-2 border-dashed border-red-600/90 bg-red-950/60 px-3 py-1 rounded-xl shadow-md text-center">
                        <span className="text-[11px] font-serif font-black tracking-widest text-red-400 uppercase">
                          ★ ĐÃ SỬ DỤNG ★
                        </span>
                        {gift.usedAt && (
                          <span className="block text-[8px] font-mono font-bold text-red-300/80 mt-0.5">
                            {new Date(gift.usedAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {isExpired && (
                    <div className="flex items-center justify-center py-1">
                      <div className="transform rotate-6 border-2 border-dashed border-stone-500/80 bg-stone-900/80 px-3 py-1 rounded-xl shadow-md text-center">
                        <span className="text-[11px] font-serif font-black tracking-widest text-stone-400 uppercase">
                          HẾT HẠN
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Mô tả quà tặng */}
                  <p className={`text-xs font-sans leading-relaxed ${theme.desc}`}>
                    {gift.description || 'Ưu đãi ẩm thực truyền thống dành riêng cho hội viên Tri Kỷ 1986.'}
                  </p>

                  {/* Giá trị phần thưởng & Hạn dùng */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-black/10">
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-sans flex-wrap">
                      <Clock className="w-3.5 h-3.5 opacity-80" />
                      <span>
                        {mode === 'REDEEM'
                          ? `Hạn dùng đến: ${getProjectedExpiry(gift.validityDays || 30)}`
                          : (gift.expiryDate ? `Hạn dùng: ${formatExactDate(gift.expiryDate)}` : (gift.expiryText || 'Áp dụng cho mọi hình thức đặt phở'))}
                      </span>
                      {gift.isExpiringSoon && !isUsed && !isExpired && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {gift.expiryDate ? `Hạn chót: ${formatExactDate(gift.expiryDate)}` : (gift.daysRemaining === 0 ? 'Hôm nay' : 'Sắp hết hạn')}
                        </span>
                      )}
                      {gift.orderId && (
                        <span className="text-[9px] text-amber-500 font-mono font-bold bg-black/30 px-1 py-0.5 rounded border border-amber-900/40">
                          #{gift.orderId}
                        </span>
                      )}
                    </div>

                    {gift.code && (
                      <span className="font-mono text-[10px] font-bold text-stone-600 bg-black/5 px-2 py-0.5 rounded border border-black/10">
                        {gift.code}
                      </span>
                    )}
                  </div>

                  {/* NÚT HÀNH ĐỘNG CHUẨN NGÓN CÁI */}
                  <div className="pt-1">
                    {mode === 'USE' ? (
                      isUsed ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-2.5 px-4 rounded-xl font-serif text-xs font-bold bg-stone-900/90 text-stone-500 border border-stone-800 cursor-not-allowed flex items-center justify-center gap-2 shadow-xs"
                        >
                          <Check className="w-4 h-4 text-red-500/70" />
                          <span>ĐÃ SỬ DỤNG</span>
                        </button>
                      ) : isExpired ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-2.5 px-4 rounded-xl font-serif text-xs font-bold bg-stone-900/90 text-stone-500 border border-stone-800 cursor-not-allowed flex items-center justify-center gap-2 shadow-xs"
                        >
                          <span>HẾT HẠN SỬ DỤNG</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isInCart}
                          onClick={(e) => {
                            if (!onApply) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const coords = {
                              startX: rect.left + rect.width / 2,
                              startY: rect.top + rect.height / 2
                            };
                            onApply(gift, coords);
                          }}
                          className={`w-full py-2.5 px-4 rounded-xl font-serif text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
                            isInCart
                              ? 'bg-emerald-700 text-white border border-emerald-500 cursor-default'
                              : 'bg-gradient-to-r from-[#8a1f18] to-[#6a150c] hover:from-[#a0241c] hover:to-[#7f1910] text-amber-100 border border-amber-500/50 shadow-[0_4px_12px_rgba(138,31,24,0.4)]'
                          }`}
                        >
                          {isInCart ? (
                            <>
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>ĐÃ ÁP DỤNG TRONG GIỎ HÀNG</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-amber-300" />
                              <span>DÙNG NGAY BÁT NÀY</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )
                    ) : (
                      /* Mode REDEEM */
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-serif text-xs font-bold text-amber-300 bg-black/40 px-2.5 py-1.5 rounded-lg border border-amber-500/30">
                          {gift.pointsRequired} điểm
                        </span>
                        <button
                          type="button"
                          disabled={!isRedeemable || isRedeemingThis}
                          onClick={(e) => {
                            if (!onRedeem) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            onRedeem(gift, {
                              startX: rect.left + rect.width / 2,
                              startY: rect.top + rect.height / 2
                            });
                          }}
                          className={`flex-1 py-2 px-3 rounded-xl font-serif text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                            isRedeemable
                              ? 'bg-gradient-to-r from-[#d4af37] to-[#aa831b] text-stone-950 font-black shadow-md cursor-pointer'
                              : 'bg-stone-900/80 text-stone-500 border border-stone-800 cursor-not-allowed'
                          }`}
                        >
                          {isRedeemingThis ? (
                            <span>Đang đổi quà...</span>
                          ) : isRedeemable ? (
                            <>
                              <span>Đổi quà ngay</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <span>Chưa đủ điểm Tri Kỷ</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(GiftWalletStack);

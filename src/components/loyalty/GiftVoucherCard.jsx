import React from 'react';
import { Check, ArrowRight, Sparkles, Clock } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const formatPrice = (price) => currencyFormatter.format(price);

function GiftVoucherCard({
  gift,
  mode = 'USE', // 'USE' (Quà của tôi) | 'REDEEM' (Đổi bằng điểm)
  isHero = false, // Hero spotlight banner
  isInCart = false,
  userPoints = 0,
  isRedeeming = false,
  onApply,
  onRedeem
}) {
  const isFreeItem = gift.rewardType === 'FREE_ITEM';
  const isCashDiscount = gift.rewardType === 'DISCOUNT_CASH' || gift.rewardType === 'DISCOUNT_PERCENT';
  const isRedeemable = userPoints >= (gift.pointsRequired || 0);

  // 1. Theme màu sắc tương phản cao theo bản chất phần quà
  const themeClasses = isFreeItem
    ? {
        card: 'bg-gradient-to-br from-[#fffdf8] via-[#fcf5e8] to-[#f4e7d0] text-stone-900 border-[#c88d2b] shadow-[0_10px_30px_rgba(0,0,0,0.6)]',
        stub: 'bg-[#f0e4cb] border-[#c88d2b]/50 text-stone-800',
        title: 'text-[#2a1209]',
        desc: 'text-[#543422]',
        code: 'text-[#8a1f18]',
        meta: 'text-stone-600',
        seal: 'border-red-700/70 bg-red-600/10 text-red-800',
        badge: 'bg-[#8a1f18] text-white border-red-800',
        notch: 'bg-[#1a0e0a] border-[#c88d2b]/60'
      }
    : isCashDiscount
    ? {
        card: 'bg-gradient-to-br from-[#7a1811] via-[#5c1009] to-[#3a0804] text-amber-50 border-amber-500/70 shadow-[0_10px_30px_rgba(0,0,0,0.7)]',
        stub: 'bg-black/30 border-amber-500/40 text-amber-200',
        title: 'text-[#fff7ed]',
        desc: 'text-amber-100/85',
        code: 'text-amber-300',
        meta: 'text-amber-200/70',
        seal: 'border-amber-400/60 bg-amber-400/10 text-amber-300',
        badge: 'bg-amber-400 text-stone-950 border-amber-300',
        notch: 'bg-[#1a0e0a] border-amber-600/60'
      }
    : {
        card: 'bg-gradient-to-br from-[#2a170d] via-[#1f1008] to-[#140804] text-stone-200 border-amber-800/80 shadow-[0_10px_30px_rgba(0,0,0,0.8)]',
        stub: 'bg-black/40 border-amber-900/60 text-stone-300',
        title: 'text-amber-100',
        desc: 'text-stone-300',
        code: 'text-amber-400',
        meta: 'text-stone-400',
        seal: 'border-red-500/50 bg-red-950/40 text-red-300',
        badge: 'bg-amber-950 text-amber-200 border-amber-600/50',
        notch: 'bg-[#1a0e0a] border-amber-900/80'
      };

  return (
    <div
      className={`relative flex flex-col ${isHero ? 'sm:flex-row' : 'sm:flex-row'} rounded-2xl overflow-hidden border-2 transition-all duration-300 group ${themeClasses.card} ${
        isInCart ? 'ring-2 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(0,0,0,0.7)]'
      }`}
    >
      {/* VẾT CẮT KHUYẾT VÉ CỔ ĐIỂN (CIRCULAR TICKET NOTCHES) */}
      <div className={`hidden sm:block absolute -top-2.5 left-28 sm:left-32 w-5 h-5 rounded-full z-20 border ${themeClasses.notch}`} />
      <div className={`hidden sm:block absolute -bottom-2.5 left-28 sm:left-32 w-5 h-5 rounded-full z-20 border ${themeClasses.notch}`} />

      {/* RUY BĂNG GÓC CHO MÓN TÂM ĐIỂM (HERO SPOTLIGHT) - CHỈ HIỆN TRÊN DESKTOP/TABLET (SM+) */}
      {isHero && (
        <div className="hidden sm:block absolute top-0 right-0 z-20 overflow-hidden w-36 h-36 pointer-events-none">
          <div className="absolute transform rotate-45 bg-gradient-to-r from-[#9b2a1f] to-[#e53e3e] text-white font-serif font-black text-[9px] uppercase py-1 right-[-42px] top-[26px] w-[150px] text-center shadow-md border-b border-amber-300/40 tracking-wider">
            ★ Tâm Điểm
          </div>
        </div>
      )}

      {/* CUỐNG VÉ VOUCHER (TICKET STUB) */}
      <div className={`sm:w-32 p-3 sm:p-3.5 flex flex-row sm:flex-col items-center justify-between sm:justify-center border-b sm:border-b-0 sm:border-r-2 border-dashed relative shrink-0 gap-2 ${themeClasses.stub}`}>
        <div className={`relative ${isHero ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-14 h-14 sm:w-16 sm:h-16'} rounded-2xl overflow-hidden border-2 border-[#c88d2b]/60 shadow-md shrink-0 bg-stone-900`}>
          <img
            src={gift.image || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=300&q=80'}
            alt={gift.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {isInCart && (
            <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-2xs flex flex-col items-center justify-center text-emerald-300">
              <Check className="w-6 h-6 stroke-[3]" />
              <span className="text-[9px] font-serif font-bold uppercase mt-0.5">Trong giỏ</span>
            </div>
          )}
        </div>

        <div className="text-right sm:text-center min-w-0 flex flex-col items-end sm:items-center gap-1">
          <div className="flex items-center gap-1 flex-wrap justify-end sm:justify-center">
            {isHero && (
              <span className="sm:hidden px-1.5 py-0.5 rounded-full text-[8px] font-serif font-black uppercase tracking-wider bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-xs border border-amber-300/40">
                ★ Tâm Điểm
              </span>
            )}
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-serif font-bold uppercase tracking-wider inline-block shadow-xs ${themeClasses.badge}`}>
              {gift.category || (isFreeItem ? 'Quà Tặng 0đ' : 'Phiếu Ưu Đãi')}
            </span>
          </div>
          {gift.code && (
            <div className={`text-[10px] font-mono font-bold truncate max-w-[110px] ${themeClasses.code}`}>
              {gift.code}
            </div>
          )}
        </div>
      </div>

      {/* THÂN VÉ VOUCHER (TICKET BODY) */}
      <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between min-w-0 relative">
        <div>
          <div className="flex items-start justify-between gap-2 pr-2">
            <h4 className={`font-serif font-black ${isHero ? 'text-base sm:text-lg' : 'text-sm sm:text-base'} leading-snug ${themeClasses.title}`}>
              {gift.title}
            </h4>

            {/* CON DẤU MỘC ĐỎ SON 1986 */}
            <div className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-serif font-black tracking-widest uppercase shadow-xs ${themeClasses.seal}`}>
              <span>⟡</span>
              <span>1986</span>
            </div>
          </div>

          <p className={`text-xs mt-1.5 line-clamp-2 leading-relaxed font-sans ${themeClasses.desc}`}>
            {gift.description}
          </p>

          {/* GIÁ TRỊ PHẦN THƯỞNG RỰC RỠ */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {isFreeItem ? (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-red-100 border border-red-300 text-red-900 font-serif font-bold text-xs">
                <span className="line-through text-stone-500 font-normal text-[11px]">{formatPrice(gift.discountValue || 15000)}</span>
                <span className="text-red-700 font-black">MIỄN PHÍ (0đ)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-200 font-serif font-bold text-xs">
                <span>Giảm trực tiếp:</span>
                <span className="text-amber-300 font-black font-mono">{formatPrice(gift.discountValue || 20000)}</span>
              </div>
            )}

            {gift.minOrderAmount > 0 && (
              <span className={`text-[10px] font-sans ${themeClasses.meta}`}>
                (Đơn từ {formatPrice(gift.minOrderAmount)})
              </span>
            )}
          </div>
        </div>

        {/* HÀNG CUỐI: THỜI HẠN & NÚT HÀNH ĐỘNG */}
        <div className="mt-3.5 pt-2.5 border-t border-black/10 sm:border-black/5 flex flex-wrap items-center justify-between gap-2.5">
          <div className={`text-[11px] flex items-center gap-1.5 font-sans ${themeClasses.meta}`}>
            <Clock className="w-3.5 h-3.5 opacity-80 shrink-0" />
            <span>{gift.expiryText || 'Áp dụng cho mọi hình thức đặt phở'}</span>
          </div>

          {/* NÚT HÀNH ĐỘNG DỰA THEO CHẾ ĐỘ */}
          {mode === 'USE' ? (
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
              className={`px-4 py-2 rounded-xl font-serif text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer shrink-0 ${
                isInCart
                  ? 'bg-emerald-700 text-white border border-emerald-500 cursor-default'
                  : isHero
                  ? 'bg-gradient-to-r from-[#9b2a1f] to-[#7a1811] hover:from-[#b83327] hover:to-[#911d15] text-amber-100 border border-amber-300/60 shadow-[0_0_15px_rgba(212,175,55,0.5)] font-black text-sm'
                  : 'bg-gradient-to-r from-[#8a1f18] to-[#6a150c] hover:from-[#a0241c] hover:to-[#7f1910] text-amber-100 border border-amber-500/40 hover:shadow-[0_0_12px_rgba(212,175,55,0.4)]'
              }`}
            >
              {isInCart ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã trong bát phở</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isHero ? 'DÙNG NGAY BÁT NÀY' : 'Dùng ngay'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <span className="font-serif text-xs font-bold text-amber-300 bg-black/40 px-2 py-1 rounded-lg border border-amber-500/30">
                {gift.pointsRequired} điểm
              </span>
              <button
                type="button"
                disabled={!isRedeemable || isRedeeming}
                onClick={() => onRedeem && onRedeem(gift)}
                className={`px-3.5 py-1.5 rounded-xl font-serif text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 ${
                  isRedeemable
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#aa831b] hover:from-[#eac654] hover:to-[#c49a26] text-stone-950 font-black shadow-md cursor-pointer'
                    : 'bg-stone-900/80 text-stone-500 border border-stone-800 cursor-not-allowed'
                }`}
              >
                {isRedeeming ? (
                  <span>Đang đổi...</span>
                ) : isRedeemable ? (
                  <>
                    <span>Đổi quà</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                ) : (
                  <span>Chưa đủ điểm</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(GiftVoucherCard);

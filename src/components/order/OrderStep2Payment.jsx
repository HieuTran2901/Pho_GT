import React from 'react';
import {
  ShieldCheck,
  QrCode,
  Banknote,
  CreditCard,
  Check,
  Sparkles,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import {
  BRANCH_LABELS,
  EXTENDED_PAYMENT_METHODS,
  PAYMENT_GUIDANCE,
  PAYMENT_CTA_LABELS
} from './orderConstants';

const BRAND_STYLES = {
  MOMO: {
    activeBorder: 'border-[#d82d8b]',
    activeBg: 'bg-[#d82d8b]/15',
    activeGlow: 'shadow-[0_0_14px_rgba(216,45,139,0.4)] ring-1 ring-[#d82d8b]',
    activeText: 'text-[#ff66b2]',
    badgeBg: 'bg-[#a50064]/35 border-[#a50064]/60 text-pink-200',
    bannerStyle: 'bg-[#a50064]/15 border-[#a50064]/30 text-pink-200'
  },
  VNPAY: {
    activeBorder: 'border-[#005baa]',
    activeBg: 'bg-[#005baa]/15',
    activeGlow: 'shadow-[0_0_14px_rgba(0,91,170,0.4)] ring-1 ring-[#005baa]',
    activeText: 'text-[#4ea8de]',
    badgeBg: 'bg-[#005baa]/35 border-[#005baa]/60 text-blue-200',
    bannerStyle: 'bg-[#005baa]/15 border-[#005baa]/30 text-blue-200'
  },
  ZALOPAY: {
    activeBorder: 'border-[#008fe5]',
    activeBg: 'bg-[#008fe5]/15',
    activeGlow: 'shadow-[0_0_14px_rgba(0,143,229,0.4)] ring-1 ring-[#008fe5]',
    activeText: 'text-[#38bdf8]',
    badgeBg: 'bg-[#0068ff]/35 border-[#0068ff]/60 text-cyan-200',
    bannerStyle: 'bg-[#0068ff]/15 border-[#0068ff]/30 text-cyan-200'
  },
  CREDIT_CARD: {
    activeBorder: 'border-amber-400',
    activeBg: 'bg-amber-500/15',
    activeGlow: 'shadow-[0_0_14px_rgba(251,191,36,0.4)] ring-1 ring-amber-400',
    activeText: 'text-amber-300',
    badgeBg: 'bg-amber-500/30 border-amber-500/60 text-amber-200',
    bannerStyle: 'bg-amber-500/15 border-amber-500/30 text-amber-200'
  },
  SEPAY: {
    activeBorder: 'border-sky-400',
    activeBg: 'bg-sky-500/15',
    activeGlow: 'shadow-[0_0_14px_rgba(56,189,248,0.4)] ring-1 ring-sky-400',
    activeText: 'text-sky-300',
    badgeBg: 'bg-[#003c71]/40 border-sky-400/50 text-sky-200',
    bannerStyle: 'bg-sky-500/15 border-sky-500/30 text-sky-200'
  }
};

function OrderStep2Payment({
  formData,
  selectedTable,
  handleBackToStep1,
  paymentNotice,
  paymentError,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  isMoreMethodsOpen,
  setIsMoreMethodsOpen,
  handleConfirmOrder,
  isProcessingPayment,
  calculatedAmount,
  direction
}) {
  const isExtendedSelected = EXTENDED_PAYMENT_METHODS.some(
    (method) => method.id === selectedPaymentMethod
  );

  return (
    <div className={`space-y-2.5 sm:space-y-3.5 pb-20 sm:pb-0 ${direction === 'forward' ? 'animate-step-forward' : 'animate-step-backward'}`}>
      {/* Quick Summary Bar */}
      <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-black/40 border border-amber-900/30 flex items-start justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-300">{formData.customerName || 'Quý khách'}</span>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-stone-300">{formData.phone}</span>
          </div>
          <p className="text-[11px] sm:text-xs text-stone-300 leading-snug">
            {formData.orderType === 'dine-in' ? (
              <>
                Đặt bàn {formData.guestCount} người • {formData.time || '19:00'} ngày {formData.date || 'Hôm nay'} • {BRANCH_LABELS[formData.branch] || 'Hàng Bạc'}
                {selectedTable ? ` • Bàn: ${selectedTable.name} (${selectedTable.zoneName})` : ''}
              </>
            ) : (
              <>
                Giao phở tận nơi • {formData.address || 'Địa chỉ quý khách'}
              </>
            )}
          </p>
          {formData.note && (
            <div className="text-[10px] sm:text-[11px] text-amber-400/90 italic">
              Khẩu vị riêng: {formData.note}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleBackToStep1}
          className="text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold shrink-0 cursor-pointer pt-0.5 ml-2"
        >
          Sửa lại
        </button>
      </div>

      {/* Payment Notice / Cancel / Error Banner */}
      {paymentNotice && (
        <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-fadeIn ${
          paymentNotice.type === 'cancel'
            ? 'bg-amber-500/15 border-amber-500/35 text-amber-200'
            : paymentNotice.type === 'error'
            ? 'bg-red-500/15 border-red-500/35 text-red-200'
            : 'bg-emerald-500/15 border-emerald-500/35 text-emerald-200'
        }`}>
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div className="flex-1">
            <p className="font-semibold leading-relaxed">{paymentNotice.message}</p>
          </div>
        </div>
      )}

      {paymentError && (
        <div className="p-3 rounded-xl border border-red-500/35 bg-red-500/15 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <p className="font-semibold leading-relaxed">{paymentError}</p>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="block text-xs font-bold text-stone-200">
            Chọn phương thức thanh toán & xác nhận:
          </label>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bảo mật 256-bit SSL</span>
          </span>
        </div>

        {/* 2 Main Recommended Payment Options */}
        {formData.orderType === 'dine-in' ? (
          <div className="space-y-2">
            {/* Option 1: VietQR (Recommended) */}
            <label className={`flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border cursor-pointer transition-all ${
              selectedPaymentMethod === 'VIETQR'
                ? 'bg-amber-950/40 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                : 'bg-white/5 border-white/10 hover:border-amber-400/50'
            }`}>
              <input
                type="radio"
                name="payment_method"
                value="VIETQR"
                checked={selectedPaymentMethod === 'VIETQR'}
                onChange={() => setSelectedPaymentMethod('VIETQR')}
                className="mt-1 accent-amber-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                    Quét mã VietQR Napas 247
                  </span>
                  <span className="text-[9px] sm:text-[10px] bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 px-2 py-0.5 rounded-full font-extrabold shadow-xs">
                    Khuyên Dùng • Tặng Quẩy
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5 leading-snug">
                  Quét mã qua app ngân hàng bất kỳ. Quán chuẩn bị sẵn bàn đẹp kèm ưu tiên tặng quẩy nóng giòn & trà sen.
                </p>
              </div>
            </label>

            {/* Option 2: Post Paid */}
            <label className={`flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border cursor-pointer transition-all ${
              selectedPaymentMethod === 'POST_PAID_AT_STORE'
                ? 'bg-amber-950/40 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                : 'bg-white/5 border-white/10 hover:border-amber-400/50'
            }`}>
              <input
                type="radio"
                name="payment_method"
                value="POST_PAID_AT_STORE"
                checked={selectedPaymentMethod === 'POST_PAID_AT_STORE'}
                onChange={() => setSelectedPaymentMethod('POST_PAID_AT_STORE')}
                className="mt-1 accent-amber-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                    Thanh toán sau tại quán
                  </span>
                  <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                    Giữ bàn 30 phút
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5 leading-snug">
                  Bàn được giữ miễn phí. Quý khách tới quán đọc số điện thoại để nhận bàn và thanh toán tại quầy sau bữa ăn.
                </p>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Delivery Option 1: COD */}
            <label className={`flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border cursor-pointer transition-all ${
              selectedPaymentMethod === 'COD'
                ? 'bg-amber-950/40 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                : 'bg-white/5 border-white/10 hover:border-amber-400/50'
            }`}>
              <input
                type="radio"
                name="payment_method"
                value="COD"
                checked={selectedPaymentMethod === 'COD'}
                onChange={() => setSelectedPaymentMethod('COD')}
                className="mt-1 accent-amber-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                    Tiền mặt khi nhận phở (COD)
                  </span>
                  <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                    An tâm 100%
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5 leading-snug">
                  Nhân viên giao bát phở nóng 90°C tới tận nơi. Quý khách kiểm tra bát phở và thanh toán tiền mặt trực tiếp.
                </p>
              </div>
            </label>

            {/* Delivery Option 2: VietQR */}
            <label className={`flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border cursor-pointer transition-all ${
              selectedPaymentMethod === 'VIETQR'
                ? 'bg-amber-950/40 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                : 'bg-white/5 border-white/10 hover:border-amber-400/50'
            }`}>
              <input
                type="radio"
                name="payment_method"
                value="VIETQR"
                checked={selectedPaymentMethod === 'VIETQR'}
                onChange={() => setSelectedPaymentMethod('VIETQR')}
                className="mt-1 accent-amber-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                    Chuyển khoản VietQR tiện lợi
                  </span>
                  <span className="text-[9px] sm:text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/30">
                    Không cần tiền lẻ
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5 leading-snug">
                  Quét mã thanh toán trước nhanh gọn, tài xế có thể treo phở trước cửa nếu bạn bận họp.
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Extended Payment Methods: Mini-Pills with Brand Accent Glow (Proposal #3) */}
        <div className="pt-2 sm:pt-2.5">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Ví điện tử & Thẻ quốc tế
            </span>
            {isExtendedSelected ? (
              <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 animate-fadeIn">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Đã kích hoạt</span>
              </span>
            ) : (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-stone-300 font-normal">
                Chạm để chọn
              </span>
            )}
          </div>

          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {EXTENDED_PAYMENT_METHODS.map((method) => {
              const isSelected = selectedPaymentMethod === method.id;
              const brandStyle = BRAND_STYLES[method.id] || {
                activeBorder: 'border-amber-400',
                activeBg: 'bg-amber-500/15',
                activeGlow: 'shadow-[0_0_14px_rgba(251,191,36,0.4)] ring-1 ring-amber-400',
                activeText: 'text-amber-300',
                badgeBg: 'bg-white/10 text-stone-200 border-white/20'
              };

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  aria-pressed={isSelected}
                  className={`relative py-1.5 px-1 sm:py-2.5 sm:px-2 rounded-xl border text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1 active:scale-95 group ${
                    isSelected
                      ? `${brandStyle.activeBorder} ${brandStyle.activeBg} ${brandStyle.activeGlow}`
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                  }`}
                >
                  {/* Brand Badge Icon */}
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      isSelected ? brandStyle.badgeBg : method.badgeBg
                    }`}
                  >
                    {method.isCard ? (
                      <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
                    ) : (
                      <span className="text-[9px] sm:text-[10px] font-black tracking-tight">{method.badge}</span>
                    )}
                  </div>

                  {/* Short Name */}
                  <span
                    className={`text-[10px] sm:text-xs font-bold leading-tight truncate w-full transition-colors ${
                      isSelected ? brandStyle.activeText : 'text-stone-300 group-hover:text-white'
                    }`}
                  >
                    {method.shortName || method.badge || method.name}
                  </span>

                  {/* Active Indicator Pip */}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Dynamic Micro-Guidance Banner */}
          {isExtendedSelected && (
            <div className={`mt-1.5 p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs flex items-center gap-2 animate-fadeIn ${
              BRAND_STYLES[selectedPaymentMethod]?.bannerStyle || 'bg-amber-500/10 border-amber-500/20 text-amber-200'
            }`}>
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span className="leading-snug">
                {PAYMENT_GUIDANCE[selectedPaymentMethod]}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons for Step 2 (Unified Responsive Inline with Mobile Safe-Zone Clearance) */}
      <div className="pt-2 pb-20 sm:pb-0 flex items-center gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={handleBackToStep1}
          className="py-3 sm:py-3.5 px-3.5 sm:px-5 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 text-stone-300 font-semibold text-xs sm:text-sm transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay Lại</span>
        </button>
        <button
          type="button"
          onClick={handleConfirmOrder}
          disabled={isProcessingPayment}
          className="flex-1 min-w-0 py-3 sm:py-3.5 px-3 rounded-xl bg-gradient-to-r from-brand-red to-amber-600 hover:from-brand-redhover hover:to-amber-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isProcessingPayment ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Đang Xác Nhận...</span>
            </span>
          ) : (
            <span className="truncate">
              {PAYMENT_CTA_LABELS[selectedPaymentMethod] || 'Xác Nhận Giữ Chỗ Ngay →'}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export default React.memo(OrderStep2Payment);


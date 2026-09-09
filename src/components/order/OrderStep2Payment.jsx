import React from 'react';
import {
  ShieldCheck,
  QrCode,
  Banknote,
  ChevronDown,
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
  return (
    <div className={`space-y-4 pb-28 sm:pb-0 ${direction === 'forward' ? 'animate-step-forward' : 'animate-step-backward'}`}>
      {/* Quick Summary Bar */}
      <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-900/30 flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-300">{formData.customerName || 'Quý khách'}</span>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-stone-300">{formData.phone}</span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
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
            <div className="text-[11px] text-amber-400/90 italic">
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
          <div className="space-y-2.5">
            {/* Option 1: VietQR (Recommended) */}
            <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
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
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-amber-400" />
                    Quét mã VietQR Napas 247
                  </span>
                  <span className="text-[10px] bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 px-2 py-0.5 rounded-full font-extrabold shadow-xs">
                    Khuyên Dùng • Tặng Quẩy
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Quét mã qua app ngân hàng bất kỳ. Quán chuẩn bị sẵn bàn đẹp kèm ưu tiên tặng quẩy nóng giòn & trà sen.
                </p>
              </div>
            </label>

            {/* Option 2: Post Paid */}
            <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
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
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    Thanh toán sau tại quán
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                    Giữ bàn 30 phút
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Bàn được giữ miễn phí. Quý khách tới quán đọc số điện thoại để nhận bàn và thanh toán tại quầy sau bữa ăn.
                </p>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Delivery Option 1: COD */}
            <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
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
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    Tiền mặt khi nhận phở (COD)
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                    An tâm 100%
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Nhân viên giao bát phở nóng 90°C tới tận nơi. Quý khách kiểm tra bát phở và thanh toán tiền mặt trực tiếp.
                </p>
              </div>
            </label>

            {/* Delivery Option 2: VietQR */}
            <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
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
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-amber-400" />
                    Chuyển khoản VietQR tiện lợi
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/30">
                    Không cần tiền lẻ
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Quét mã thanh toán trước nhanh gọn, tài xế có thể treo phở trước cửa nếu bạn bận họp.
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Collapsible toggle trigger */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsMoreMethodsOpen(!isMoreMethodsOpen)}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>
              {isMoreMethodsOpen
                ? 'Thu gọn phương thức thanh toán khác'
                : '+ Xem thêm phương thức thanh toán khác (MoMo, VNPAY, Thẻ Quốc Tế...)'}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMoreMethodsOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Extended payment methods grid */}
        {isMoreMethodsOpen && (
          <div className="pt-2.5 space-y-2.5 animate-accordion">
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {EXTENDED_PAYMENT_METHODS.map((method) => {
                const isSelected = selectedPaymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 relative group ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/40 ring-1 ring-amber-400/40 shadow-xs'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${method.badgeBg}`}>
                      {method.isCard ? (
                        <CreditCard className="w-4 h-4 text-amber-300" />
                      ) : (
                        <span className="text-[10px] font-black">{method.badge}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-stone-200 truncate group-hover:text-white">
                        {method.name}
                      </div>
                      <div className="text-[10px] text-stone-400 truncate">
                        {method.subname}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Micro-Guidance Box */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-200 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="leading-snug">
                {PAYMENT_GUIDANCE[selectedPaymentMethod] || 'Phương thức thanh toán bảo mật và tiện lợi.'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons for Step 2 (Desktop & Tablet inline) */}
      <div className="pt-2 hidden sm:flex items-center gap-3">
        <button
          type="button"
          onClick={handleBackToStep1}
          className="w-1/3 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 font-semibold text-xs sm:text-sm transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay Lại</span>
        </button>
        <button
          type="button"
          onClick={handleConfirmOrder}
          disabled={isProcessingPayment}
          className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-brand-red to-amber-600 hover:from-brand-redhover hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          {isProcessingPayment ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Đang Xác Nhận...</span>
            </span>
          ) : (
            <span>
              {PAYMENT_CTA_LABELS[selectedPaymentMethod] || 'Xác Nhận Giữ Chỗ Ngay →'}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Sticky Bottom Checkout Bar */}
      <div
        className="sm:hidden fixed bottom-0 inset-x-0 bg-stone-950/95 backdrop-blur-md border-t border-amber-500/30 px-4 py-3 z-40 shadow-2xl flex items-center justify-between gap-3"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          onClick={handleBackToStep1}
          className="p-2.5 rounded-xl bg-white/10 text-stone-300 hover:bg-white/15 active:bg-white/20 transition-colors shrink-0 cursor-pointer"
          title="Quay lại bước 1"
          aria-label="Quay lại bước 1"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-stone-400 truncate">
            {formData.orderType === 'dine-in' ? `Đặt cọc (${formData.guestCount} khách)` : 'Tổng thanh toán'}
          </div>
          <div className="text-sm font-bold text-amber-300 font-mono">
            {calculatedAmount.toLocaleString('vi-VN')} đ
          </div>
        </div>
        <button
          type="button"
          onClick={handleConfirmOrder}
          disabled={isProcessingPayment}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-red to-amber-600 active:scale-98 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isProcessingPayment ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Đang Xử Lý...</span>
            </span>
          ) : (
            <>
              <span>
                {selectedPaymentMethod === 'POST_PAID_AT_STORE' || selectedPaymentMethod === 'COD'
                  ? 'Xác Nhận Đặt Chỗ'
                  : 'Tiếp Tục'}
              </span>
              <span className="text-[11px] font-bold">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default React.memo(OrderStep2Payment);


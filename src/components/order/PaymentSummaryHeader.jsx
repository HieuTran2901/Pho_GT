import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { BRANCH_LABELS } from './orderConstants';

/**
 * [URBAN & RAVEN] PaymentSummaryHeader
 * Khung tóm tắt đơn hàng & thông báo lỗi/hủy thanh toán tại Bước 2
 */
function PaymentSummaryHeader({
  formData,
  selectedTable,
  handleBackToStep1,
  paymentNotice,
  paymentError
}) {
  return (
    <>
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
    </>
  );
}

export default React.memo(PaymentSummaryHeader);

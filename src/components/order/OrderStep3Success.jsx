import React from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Clock,
  Armchair,
  MapPin,
  ExternalLink
} from 'lucide-react';

function OrderStep3Success({
  formData,
  bookingCode,
  isCopied,
  handleCopyCode,
  selectedPaymentMethod,
  selectedTable,
  handleReset,
  branchLabels
}) {
  return (
    <div className="text-center py-2 space-y-4">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-xl animate-pop-spring relative">
        <div className="absolute inset-0 rounded-full bg-emerald-400/25 animate-ping opacity-30" />
        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
      </div>

      <div>
        <h3 className="font-serif text-2xl font-bold text-amber-100">
          {formData.orderType === 'dine-in' ? 'Đặt Bàn Thành Công!' : 'Giao Phở Đã Xác Nhận!'}
        </h3>
        <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-sm mx-auto leading-relaxed">
          {formData.orderType === 'dine-in'
            ? `Cảm ơn ${formData.customerName || 'quý khách'}! Bàn của bạn đã được giữ chỗ ưu tiên trong 30 phút tại quán.`
            : `Bếp Phở Gia Truyền 1986 đang chuẩn bị nước dùng và sẽ giao tận nơi tới ${formData.customerName || 'bạn'}.`}
        </p>
      </div>

      {/* Heritage Pass Card with Gold Shimmer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-amber-500/40 text-left space-y-3 relative overflow-hidden shadow-2xl animate-pass-card">
        {/* Metallic Gold Shimmer Sweep Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-amber-300/15 to-transparent absolute top-0 left-0 animate-gold-shimmer" />
        </div>
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div>
            <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">
              {formData.orderType === 'dine-in' ? 'Thẻ Bàn Di Sản' : 'Phiếu Giao Phở Nóng'}
            </span>
            <div className="font-mono text-base font-bold text-white tracking-wider flex items-center gap-1.5">
              <span>#{bookingCode}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(bookingCode)}
                className="text-stone-400 hover:text-amber-300 p-0.5 cursor-pointer"
                title="Sao chép mã"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-stone-400">Trạng thái:</span>
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{formData.orderType === 'dine-in' ? 'Giữ bàn 30 phút' : 'Nóng 90°C'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-stone-400 text-[10px]">Khách hàng:</span>
            <div className="font-semibold text-stone-200">{formData.customerName || 'Quý khách'}</div>
          </div>
          <div>
            <span className="text-stone-400 text-[10px]">Số điện thoại:</span>
            <div className="font-semibold text-stone-200">{formData.phone}</div>
          </div>
          <div>
            <span className="text-stone-400 text-[10px]">
              {formData.orderType === 'dine-in' ? 'Thời gian & Bàn:' : 'Thời gian giao:'}
            </span>
            <div className="font-semibold text-stone-200">
              {formData.orderType === 'dine-in'
                ? `${formData.time || '19:00'} • ${formData.guestCount} khách${selectedTable ? ` • Bàn ${selectedTable.name}` : ''}`
                : 'Giao ngay (25-35 phút)'}
            </div>
          </div>
          <div>
            <span className="text-stone-400 text-[10px]">Thanh toán:</span>
            <div className="font-semibold text-emerald-400">
              {selectedPaymentMethod === 'POST_PAID_AT_STORE'
                ? 'Tại quầy sau khi ăn'
                : selectedPaymentMethod === 'COD'
                ? 'Tiền mặt khi nhận phở'
                : selectedPaymentMethod === 'MOMO'
                ? 'Ví điện tử MoMo ✓'
                : selectedPaymentMethod === 'SEPAY'
                ? 'Cổng SePay Tự Động ✓'
                : selectedPaymentMethod === 'VNPAY'
                ? 'Cổng VNPAY-QR'
                : selectedPaymentMethod === 'ZALOPAY'
                ? 'Ví điện tử ZaloPay'
                : selectedPaymentMethod === 'CREDIT_CARD'
                ? 'Thẻ Quốc Tế (Visa/Master)'
                : 'Đã thanh toán VietQR ✓'}
            </div>
          </div>
        </div>

        {selectedTable && formData.orderType === 'dine-in' && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Armchair className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Vị trí giữ trước: <strong className="text-white font-bold">{selectedTable.name}</strong> ({selectedTable.zoneName})</span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/30">
              Ưu tiên xếp bàn
            </span>
          </div>
        )}

        {/* 1-Tap Google Maps Directions Button for Mobile / Desktop */}
        {formData.orderType === 'dine-in' && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Phở Gia Truyền 1986 ${branchLabels[formData.branch] || 'Hà Nội'}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/30 border border-amber-500/35 text-amber-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
          >
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Mở Google Maps Chỉ Đường Đến Quán</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400/80 shrink-0 ml-0.5" />
          </a>
        )}

        {formData.note && (
          <div className="border-t border-white/10 pt-2 text-[11px] text-amber-300/90 italic">
            Khẩu vị riêng: {formData.note}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 pt-2">
        <button
          type="button"
          onClick={handleReset}
          className="w-full sm:flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 text-stone-300 font-semibold text-xs transition-colors cursor-pointer text-center"
        >
          Tạo Yêu Cầu Mới
        </button>
        <button
          type="button"
          onClick={() => handleCopyCode(`PHO1986 - Mã giữ bàn: #${bookingCode} (${formData.customerName} - ${formData.phone})`)}
          className="w-full sm:flex-1 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redhover active:bg-red-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Đã Sao Chép Mã ✓</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-white" />
              <span>Lưu Mã Giữ Bàn</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default React.memo(OrderStep3Success);

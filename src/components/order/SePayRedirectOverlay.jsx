import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, QrCode, X, Clock, AlertCircle } from 'lucide-react';

/**
 * [URBAN & RAVEN] SePay Redirect Overlay Component
 * Provides a reassuring, heritage-styled fullscreen loading transition
 * while waiting for SePay Gateway origin server to initialize the session.
 */
export default function SePayRedirectOverlay({
  isOpen: propsIsOpen,
  onClose: propsOnClose,
  bookingCode: propsBookingCode,
  amount: propsAmount
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Listen to global 'sepay:redirect_start' event
  useEffect(() => {
    const handleRedirectStart = (e) => {
      setEventData(e.detail || {});
      setInternalOpen(true);
      setSecondsElapsed(0);
    };

    const handleRedirectStop = () => {
      setInternalOpen(false);
    };

    window.addEventListener('sepay:redirect_start', handleRedirectStart);
    window.addEventListener('sepay:redirect_stop', handleRedirectStop);

    return () => {
      window.removeEventListener('sepay:redirect_start', handleRedirectStart);
      window.removeEventListener('sepay:redirect_stop', handleRedirectStop);
    };
  }, []);

  const isVisible = propsIsOpen ?? internalOpen;

  // Seconds counter and progress tracker
  useEffect(() => {
    if (!isVisible) {
      setSecondsElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleClose = useCallback(() => {
    if (propsOnClose) propsOnClose();
    setInternalOpen(false);
  }, [propsOnClose]);

  if (!isVisible) return null;

  const currentBookingCode = propsBookingCode || eventData?.invoiceNumber || eventData?.checkoutFields?.order_invoice_number || 'PHỞ 1986';
  const currentAmount = propsAmount || eventData?.amount || eventData?.checkoutFields?.order_amount;

  // Calculate dynamic progress bar percentage (approaching 92% over 10s)
  const progressPercent = Math.min(92, Math.round(15 + (secondsElapsed * 8)));

  // Dynamic status text based on elapsed time
  const getStatusText = () => {
    if (secondsElapsed < 3) return 'Đã ký số bảo mật HMAC-SHA256 & gửi yêu cầu...';
    if (secondsElapsed < 7) return 'Đang kết nối máy chủ SePay Gateway tạo phiên thanh toán...';
    if (secondsElapsed < 12) return 'Cổng SePay đang hoàn thiện mã QR, chuẩn bị chuyển hướng...';
    return 'Hệ thống SePay phản hồi hơi chậm, đang tiếp tục chuyển tiếp...';
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sepay-overlay-title"
    >
      <div className="relative w-full max-w-md bg-[#1b261d] text-amber-50 rounded-2xl border-2 border-amber-600/40 shadow-2xl overflow-hidden p-6 sm:p-8 animate-scaleUp">
        {/* Top vintage pattern accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

        {/* Close / Cancel Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Đóng cửa sổ chờ"
          aria-label="Đóng cửa sổ chờ chuyển hướng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badges */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-900/60 border border-amber-500/30 text-[10px] sm:text-xs font-serif font-bold text-amber-300 tracking-wider uppercase flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Phở 1986 ⇄ SePay Gateway</span>
          </span>
        </div>

        {/* Animated Brand Pulse Wheel */}
        <div className="relative w-20 h-20 mx-auto mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 animate-ping opacity-30" />
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/60 animate-spin" style={{ animationDuration: '6s' }} />
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#9b2a1f] to-[#731911] border border-amber-400/50 flex flex-col items-center justify-center shadow-lg">
            <ShieldCheck className="w-7 h-7 text-amber-300 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h3 id="sepay-overlay-title" className="text-base sm:text-lg font-serif font-bold text-center text-amber-100 mb-2">
          Đang Chuyển Hướng Tới Cổng SePay
        </h3>

        {/* Informative Subtitle */}
        <p className="text-xs sm:text-sm text-stone-300 text-center leading-relaxed mb-4">
          Hệ thống đang thiết lập cổng thanh toán <strong className="text-amber-300">Napas 247 an toàn</strong> cho đơn hàng{' '}
          <span className="font-mono text-amber-200 font-bold">{currentBookingCode}</span>.
        </p>

        {/* Progress Bar & Counter */}
        <div className="bg-stone-900/90 rounded-xl p-3.5 border border-amber-900/40 mb-4">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-stone-300 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Thời gian xử lý:</span>
            </span>
            <span className="font-mono font-bold text-amber-300">
              {secondsElapsed}s <span className="text-[10px] font-normal text-stone-400">(thông thường 5-10s)</span>
            </span>
          </div>

          <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-500 transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-amber-300/90 text-center italic truncate">
            {getStatusText()}
          </p>
        </div>

        {/* Latency Explanation Alert */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-[11px] leading-relaxed mb-5 flex items-start gap-2 text-left">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Máy chủ SePay đang xử lý tạo mã hoá đơn độc quyền. Quý khách vui lòng <strong>không tắt trình duyệt</strong> hoặc tải lại trang.
          </span>
        </div>

        {/* Alternative Action: Scan VietQR Directly */}
        <div className="pt-2 border-t border-amber-900/40 space-y-2">
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-amber-500/40 text-amber-200 font-serif font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Chờ lâu? Quét mã VietQR trực tiếp tại website (Khớp đơn 1s)</span>
          </button>
          <p className="text-[10px] text-stone-400 text-center">
            (Bấm nút trên để đóng màn hình chờ và quét mã QR Napas 247 đã chuẩn bị sẵn)
          </p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import {
  QrCode,
  Copy,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

function OrderStep3QrPayment({
  selectedPaymentMethod,
  paymentData,
  bookingCode,
  isCopied,
  handleCopyCode,
  handleBackToStep2,
  setIsVietQrConfirmed,
  submitSePayCheckout
}) {
  if (selectedPaymentMethod === 'MOMO') {
    return (
      <div className="space-y-3.5">
        <div className="text-center">
          <span className="text-[10px] bg-[#a50064]/20 text-pink-300 px-2.5 py-0.5 rounded-full font-bold border border-[#a50064]/40 inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
            <span className="font-extrabold text-pink-300">MoMo Official API v2</span>
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mt-1">
            Thanh Toán Qua Ví MoMo
          </h3>
          <p className="text-xs text-stone-400">
            Số tiền: <span className="text-amber-300 font-bold font-mono">{(paymentData?.amount || 150000).toLocaleString('vi-VN')} đ</span> • Mã đơn: <span className="text-amber-300 font-mono font-bold">#{bookingCode}</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-pink-500/40 flex flex-col items-center justify-center text-center">
          <div className="w-44 h-44 bg-white rounded-xl p-2 shadow-md flex items-center justify-center">
            <img
              src={paymentData?.qrCodeUrl || `https://img.vietqr.io/image/970422-0986198686-compact2.png?amount=${paymentData?.amount || 150000}&addInfo=MOMO%20${bookingCode}&accountName=PHO%20GIA%20TRUYEN%201986`}
              alt="MoMo QR Phở Gia Truyền 1986"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="mt-3 w-full bg-black/40 rounded-xl p-3 text-xs text-left space-y-1.5 border border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Cổng thanh toán:</span>
              <span className="font-bold text-pink-300">Ví MoMo (captureWallet)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Người thụ hưởng:</span>
              <span className="font-bold text-white">PHO GIA TRUYEN 1986</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Trạng thái:</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Đang chờ quét mã thanh toán...
              </span>
            </div>
          </div>
        </div>

        {paymentData?.payUrl ? (
          <div className="space-y-2">
            <a
              href={paymentData.payUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#a50064] to-[#d82d8b] hover:from-[#8b0054] hover:to-[#c22079] text-white font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all text-center cursor-pointer ring-2 ring-pink-400/50 animate-pulse"
            >
              <span>👉 Bấm Vào Đây Để Đến Trang Thanh Toán MoMo Ngay</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <p className="text-[11px] text-pink-300/80 text-center">
              (Nếu trình duyệt chưa tự chuyển hướng, quý khách vui lòng bấm nút trên)
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 text-left">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">Không thể chuyển hướng trực tiếp (Thiếu Gateway URL):</p>
              <p className="mt-0.5 text-stone-300 leading-relaxed text-[11px]">
                Máy chủ chưa kích hoạt MoMo Merchant API Key (MOMO_ACCESSKEY / MOMO_SECRETKEY) nên MoMo chưa cấp URL phiên thanh toán. Quý khách vui lòng quét mã QR MoMo hiển thị ở trên hoặc chuyển khoản theo cú pháp.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackToStep2}
            className="w-1/3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 font-semibold text-xs text-center cursor-pointer"
          >
            ← Đổi Cách Khác
          </button>
          <button
            type="button"
            onClick={() => setIsVietQrConfirmed(true)}
            className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#a50064] to-pink-600 hover:from-[#8b0054] hover:to-pink-700 text-white font-bold text-xs shadow-md cursor-pointer"
          >
            Tôi Đã Thanh Toán MoMo Xong ✓
          </button>
        </div>
      </div>
    );
  }

  // VietQR / SePay Screen
  return (
    <div className="space-y-3.5">
      <div className="text-center">
        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30 inline-flex items-center gap-1">
          <QrCode className="w-3 h-3 text-amber-400" />
          <span>{selectedPaymentMethod === 'SEPAY' ? 'Cổng SePay Tự Động' : 'VietQR Napas 247 MBBank'}</span>
        </span>
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mt-1">
          Quét Mã Chuyển Khoản Tự Động
        </h3>
        <p className="text-xs text-stone-400">
          Số tiền: <span className="text-amber-300 font-bold font-mono">{(paymentData?.amount || 150000).toLocaleString('vi-VN')} đ</span> • Hiệu lực <span className="text-amber-300 font-bold">15 phút</span>
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white/5 border border-amber-500/40 flex flex-col items-center justify-center text-center">
        <div className="w-44 h-44 bg-white rounded-xl p-2 shadow-md flex items-center justify-center">
          <img
            src={paymentData?.qrCodeUrl || `https://img.vietqr.io/image/970422-0986198686-compact2.png?amount=${paymentData?.amount || 150000}&addInfo=PHO1986%20${bookingCode}&accountName=PHO%20GIA%20TRUYEN%201986`}
            alt="VietQR Phở Gia Truyền 1986"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="mt-3 w-full bg-black/40 rounded-xl p-3 text-xs text-left space-y-1.5 border border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-stone-400">Ngân hàng:</span>
            <span className="font-bold text-white">{paymentData?.bankName || 'MBBank (Quân Đội)'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-400">Số tài khoản:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-amber-300 font-mono">{paymentData?.bankAccountNo || '0986 1986 86'}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(paymentData?.bankAccountNo || '0986198686')}
                className="text-[10px] text-stone-400 hover:text-white p-0.5 cursor-pointer"
                title="Sao chép số tài khoản"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-400">Chủ tài khoản:</span>
            <span className="font-bold text-stone-200">{paymentData?.bankAccountName || 'PHO GIA TRUYEN 1986'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-400">Nội dung CK:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-amber-300 font-mono">{paymentData?.transferContent || `PHO1986 ${bookingCode}`}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(paymentData?.transferContent || `PHO1986 ${bookingCode}`)}
                className="text-[10px] text-stone-400 hover:text-white p-0.5 cursor-pointer"
                title="Sao chép nội dung chuyển khoản"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-white/10">
            <span className="text-stone-400">Trạng thái SePay:</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Đang chờ nhận biến động số dư...
            </span>
          </div>
        </div>
      </div>

      {isCopied && (
        <div className="text-center text-xs text-emerald-400 font-medium">
          ✓ Đã sao chép vào bộ nhớ tạm!
        </div>
      )}

      {paymentData?.checkoutUrl && paymentData?.checkoutFields ? (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => submitSePayCheckout({
              checkoutUrl: paymentData.checkoutUrl,
              checkoutFields: paymentData.checkoutFields
            })}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#003c71] via-sky-600 to-amber-600 hover:from-[#002f5a] text-white font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all text-center cursor-pointer ring-2 ring-sky-400/50 animate-pulse"
          >
            <span>👉 Bấm Vào Đây Để Đến Cổng Thanh Toán SePay Ngay</span>
            <ExternalLink className="w-4 h-4" />
          </button>
          <p className="text-[11px] text-sky-300/80 text-center">
            (Nếu trình duyệt chưa tự chuyển hướng, quý khách vui lòng bấm nút trên)
          </p>
        </div>
      ) : paymentData?.payUrl ? (
        <div className="space-y-2">
          <a
            href={paymentData.payUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#003c71] via-sky-600 to-amber-600 hover:from-[#002f5a] text-white font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all text-center cursor-pointer ring-2 ring-sky-400/50 animate-pulse"
          >
            <span>👉 Bấm Vào Đây Để Đến Cổng Thanh Toán SePay Ngay</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <p className="text-[11px] text-sky-300/80 text-center">
            (Nếu trình duyệt chưa tự chuyển hướng, quý khách vui lòng bấm nút trên)
          </p>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 text-left">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-300">Không thể chuyển hướng trực tiếp (Thiếu Gateway URL):</p>
            <p className="mt-0.5 text-stone-300 leading-relaxed text-[11px]">
              Máy chủ chưa kích hoạt SePay Merchant Credentials (MERCHANTID / SEPAY_SECRETKEY) nên chưa có link cổng thanh toán trực tuyến SePay. Quý khách vui lòng quét mã VietQR MBBank hiển thị ở trên hoặc chuyển khoản theo cú pháp.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleBackToStep2}
          className="w-1/3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 font-semibold text-xs text-center cursor-pointer"
        >
          ← Đổi Cách Khác
        </button>
        <button
          type="button"
          onClick={() => setIsVietQrConfirmed(true)}
          className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md cursor-pointer"
        >
          Tôi Đã Chuyển Khoản Xong ✓
        </button>
      </div>
    </div>
  );
}

export default React.memo(OrderStep3QrPayment);

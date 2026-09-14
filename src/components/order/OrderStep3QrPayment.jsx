import React, { useState, useRef, useEffect } from 'react';
import {
  QrCode,
  Copy,
  AlertTriangle,
  RefreshCw,
  Clock
} from 'lucide-react';

function OrderStep3QrPayment({
  selectedPaymentMethod,
  paymentData,
  bookingCode,
  isCopied,
  handleCopyCode,
  handleBackToStep2,
  handleVerifyPayment
}) {
  const [isVerifying, setIsVerifying] = useState(false);
  const isVerifyingRef = useRef(false);
  const [verificationNotice, setVerificationNotice] = useState('');
  const noticeTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, []);

  const onCheckTransaction = async () => {
    if (isVerifyingRef.current || isVerifying) return;
    isVerifyingRef.current = true;
    setIsVerifying(true);
    setVerificationNotice('');

    try {
      const res = await handleVerifyPayment?.();
      if (!res || !res.success) {
        if (res?.status === 'ERROR') {
          setVerificationNotice(
            'Không thể kết nối đến máy chủ đối soát lúc này. Quý khách vui lòng thử lại sau vài giây hoặc kiểm tra kết nối mạng.'
          );
        } else if (res?.status === 'EXPIRED') {
          setVerificationNotice(
            'Phiên quét mã QR đã hết hạn hiệu lực (15 phút). Quý khách vui lòng quay lại bước trước để tạo phiên mới.'
          );
        } else if (res?.status === 'NOT_FOUND') {
          setVerificationNotice(
            'Không tìm thấy thông tin phiên thanh toán. Quý khách vui lòng quay lại bước trước để thử lại.'
          );
        } else {
          setVerificationNotice(
            'Hệ thống đang tự động kiểm tra giao dịch với ngân hàng. Quý khách vui lòng đợi từ 5–10 giây hoặc kiểm tra lại việc hoàn tất chuyển khoản trên app ngân hàng.'
          );
        }
        if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
        noticeTimerRef.current = setTimeout(() => {
          setVerificationNotice('');
        }, 8000);
      }
    } catch (e) {
      setVerificationNotice(
        'Không thể kết nối đến máy chủ đối soát lúc này. Quý khách vui lòng thử lại sau vài giây.'
      );
    } finally {
      isVerifyingRef.current = false;
      setIsVerifying(false);
    }
  };

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
              src={paymentData?.qrCodeUrl || `https://img.vietqr.io/image/970422-0384090045-compact2.png?amount=${paymentData?.amount || 150000}&addInfo=MOMO%20${bookingCode}&accountName=PHO%20GIA%20TRUYEN%201986`}
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
              <span className="text-stone-400">Số tài khoản / Ví:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-pink-300 font-mono">{paymentData?.bankAccountNo || '0384 090 045'}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(paymentData?.bankAccountNo || '0384090045')}
                  className="text-[10px] text-stone-400 hover:text-white p-0.5 cursor-pointer"
                  title="Sao chép số tài khoản"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Nội dung CK:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-pink-300 font-mono">{paymentData?.transferContent || `MOMO ${bookingCode}`}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(paymentData?.transferContent || `MOMO ${bookingCode}`)}
                  className="text-[10px] text-stone-400 hover:text-white p-0.5 cursor-pointer"
                  title="Sao chép nội dung chuyển khoản"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-white/10">
              <span className="text-stone-400">Trạng thái:</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Đang chờ quét mã thanh toán...
              </span>
            </div>
          </div>
        </div>

        {isCopied && (
          <div className="text-center text-xs text-pink-400 font-medium">
            ✓ Đã sao chép vào bộ nhớ tạm!
          </div>
        )}

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

        {/* Visual Instruction Line for MoMo (R3) */}
        <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-200/90 text-xs text-center leading-relaxed">
          💡 Quý khách chỉ cần hoàn tất thanh toán trên app MoMo, hệ thống sẽ tự động xác nhận đơn trong 1–3 giây mà không cần thao tác thêm.
        </div>

        {/* Verification Notice if pending */}
        {verificationNotice && (
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs flex items-start gap-2.5 text-left animate-fadeIn">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <p className="leading-relaxed">{verificationNotice}</p>
          </div>
        )}

        {/* Expired QR Warning Banner for MoMo */}
        {paymentData?.status === 'EXPIRED' && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 text-left">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Phiên quét mã QR MoMo đã hết hạn hiệu lực (15 phút). Quý khách vui lòng bấm nút <span className="font-bold text-white">"← Đổi Cách Khác"</span> bên dưới để tạo phiên thanh toán mới.
            </p>
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
            onClick={onCheckTransaction}
            disabled={isVerifying}
            className={`w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#a50064] to-pink-600 hover:from-[#8b0054] hover:to-pink-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all ${isVerifying ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Đang đối soát...' : 'Kiểm tra giao dịch 🔄'}</span>
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
            src={paymentData?.qrCodeUrl || `https://img.vietqr.io/image/970422-0384090045-compact2.png?amount=${paymentData?.amount || 150000}&addInfo=PHO1986%20${bookingCode}&accountName=PHO%20GIA%20TRUYEN%201986`}
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
              <span className="font-bold text-amber-300 font-mono">{paymentData?.bankAccountNo || '0384 090 045'}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(paymentData?.bankAccountNo || '0384090045')}
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


      {/* Visual Instruction Line (R3) */}
      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs text-center leading-relaxed">
        💡 Quý khách chỉ cần hoàn tất chuyển khoản trên app ngân hàng, hệ thống sẽ tự động xác nhận đơn trong 1–3 giây mà không cần thao tác thêm.
      </div>

      {/* Verification Notice if pending */}
      {verificationNotice && (
        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs flex items-start gap-2.5 text-left animate-fadeIn">
          <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <p className="leading-relaxed">{verificationNotice}</p>
        </div>
      )}

      {/* Expired QR Warning Banner */}
      {paymentData?.status === 'EXPIRED' && (
        <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 text-left">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Phiên quét mã QR đã hết hạn hiệu lực (15 phút). Quý khách vui lòng bấm nút <span className="font-bold text-white">"← Đổi Cách Khác"</span> bên dưới để tạo phiên thanh toán mới.
          </p>
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
          onClick={onCheckTransaction}
          disabled={isVerifying}
          className={`w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all ${isVerifying ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
          <span>{isVerifying ? 'Đang đối soát...' : 'Kiểm tra giao dịch 🔄'}</span>
        </button>
      </div>
    </div>
  );
}

export default React.memo(OrderStep3QrPayment);

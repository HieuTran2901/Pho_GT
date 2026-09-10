import React from 'react';
import { ShieldAlert, RotateCcw, PhoneCall, Utensils, Lock } from 'lucide-react';

/**
 * [URBAN & RAVEN] OrderLockoutBanner — Banner Niêm Phong Đặt Bàn Di Sản 1986
 * Hiển thị thân tình, ấm áp khi phát hiện số điện thoại hoặc tài khoản bị khóa trong luồng đặt bàn
 */
function OrderLockoutBanner({
  reason,
  onChangePhone,
  hotline = '0986 1986 86',
  className = ''
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 border-[#8a1e14]/50 bg-gradient-to-br from-[#2b1810] via-[#3a2217] to-[#1e100a] p-4 sm:p-5 text-amber-100 shadow-xl my-4 animate-scale-up ${className}`}>
      {/* Đường chỉ vàng hoàng gia & vân góc truyền thống */}
      <div className="absolute inset-1.5 border border-[#d4af37]/35 rounded-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-3.5 sm:gap-4 text-center sm:text-left">
        {/* Mascot Bát Phở Niêm Phong thu gọn 56px */}
        <div className="relative shrink-0 mt-0.5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#8a1e14] to-[#55100a] border-2 border-[#d4af37]/60 flex items-center justify-center shadow-lg relative overflow-visible">
            {/* Làn khói nghi ngút */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
              <span className="w-1 h-3 bg-gradient-to-t from-amber-400/40 to-transparent rounded-full animate-steam-1" />
              <span className="w-1 h-4 bg-gradient-to-t from-amber-300/50 to-transparent rounded-full animate-steam-2" />
            </div>
            {/* Bát phở & Ổ khóa đồng */}
            <div className="flex flex-col items-center justify-center text-amber-200">
              <Utensils className="w-5 h-5 text-amber-300 mb-0.5" />
              <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-400/50">
                <Lock className="w-2.5 h-2.5 text-amber-300" />
              </div>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-600 border border-amber-300 flex items-center justify-center text-white shadow-xs">
            <ShieldAlert className="w-3 h-3" />
          </div>
        </div>

        {/* Nội dung thông báo */}
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/70 border border-red-500/40 text-[10px] font-mono font-bold uppercase tracking-wider text-red-300 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span>TẠM GIÁN ĐOẠN ĐẶT BÀN • PHỞ 1986</span>
          </div>

          <h4 className="text-sm sm:text-base font-serif font-bold text-amber-200 tracking-tight leading-snug">
            Dạ, Số Điện Thoại Này Đang Tạm Dừng Giao Dịch
          </h4>

          <p className="text-xs text-amber-100/80 font-serif leading-relaxed mt-1">
            Để đảm bảo an toàn và quyền lợi hội viên, hệ thống tạm dừng nhận đặt bàn và thanh toán trực tuyến cho số điện thoại này theo quyết định của Quản trị viên.
          </p>

          {reason && (
            <div className="mt-2 p-2 rounded-lg bg-black/40 border border-amber-500/30 text-[11px] font-sans text-amber-300/90 italic leading-snug">
              <span className="font-semibold not-italic text-amber-400">Ghi chú từ quán:</span> "{reason}"
            </div>
          )}

          {/* Hàng nút hành động phục hồi nhanh */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            {onChangePhone && (
              <button
                type="button"
                onClick={onChangePhone}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f5ecd8] hover:bg-white text-[#8a1e14] font-serif font-bold text-xs shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer border border-[#d4af37]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đổi số điện thoại khác</span>
              </button>
            )}

            <a
              href={`tel:${hotline.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-700 to-[#8a1e14] hover:brightness-110 text-white font-serif font-bold text-xs shadow-md transition-all active:scale-95 border border-red-400/40"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
              <span>Hotline giữ bàn: {hotline}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(OrderLockoutBanner);

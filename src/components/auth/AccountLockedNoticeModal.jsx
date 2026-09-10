import React from 'react';
import { ShieldAlert, Phone, X, AlertCircle } from 'lucide-react';
import PhoMascotExpression from './PhoMascotExpression';

/**
 * [SENTINEL, URBAN & RAVEN] AccountLockedNoticeModal
 * Modal thông báo khóa tài khoản văn minh, trang nhã theo phong cách Di Sản Phở 1986.
 * Kích hoạt ngay lập tức khi phát hiện tài khoản bị khóa trong thời gian thực.
 */
export default function AccountLockedNoticeModal({ isOpen, onClose, reason, hotline = '0986 1986 86' }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="locked-modal-title"
    >
      <div 
        className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#2a0e08] via-[#1c0805] to-[#120402] border-2 border-amber-600/50 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(239,68,68,0.2)] text-[#fff8ed] p-6 sm:p-7 overflow-hidden animate-scaleUp"
      >
        {/* Nút đóng góc phải */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Đóng thông báo"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Nội dung chính */}
        <div className="flex flex-col items-center text-center">
          {/* Mascot Bé Tô Phở 1986 biểu cảm niêm phong */}
          <div className="relative mb-3">
            <PhoMascotExpression mood="locked" className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]" />
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-red-600 text-white shadow-lg border-2 border-[#2a0e08]">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-serif font-bold uppercase tracking-wider mb-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Thông Báo Quản Trị</span>
          </div>

          <h3 id="locked-modal-title" className="text-xl sm:text-2xl font-serif font-black text-amber-200 tracking-tight">
            Tài Khoản Đang Bị Tạm Khóa
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-stone-300 font-serif leading-relaxed px-2">
            Dạ, tài khoản hội viên của quý khách hiện đang trong trạng thái tạm khóa theo quyết định của Quản trị viên Phở 1986.
          </p>

          {/* Khung hiển thị lý do */}
          {reason && (
            <div className="w-full mt-3.5 p-3 rounded-xl bg-black/40 border border-amber-500/25 text-left">
              <span className="text-[11px] font-serif font-bold text-amber-400/90 block uppercase tracking-wide">
                Lý do ghi nhận:
              </span>
              <p className="text-xs text-stone-200 font-serif italic mt-0.5 break-words">
                "{reason}"
              </p>
            </div>
          )}

          <p className="mt-3 text-[11px] sm:text-xs text-stone-400 font-serif">
            Phiên đăng nhập đã tự động kết thúc để bảo đảm an toàn. Quý khách vẫn có thể xem thực đơn và thưởng thức phở dưới dạng Khách vãng lai.
          </p>

          {/* Các nút hành động */}
          <div className="w-full mt-6 flex flex-col sm:flex-row items-center gap-2.5">
            <a
              href={`tel:${hotline.replace(/\s+/g, '')}`}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-serif font-bold text-xs sm:text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Hotline: {hotline}</span>
            </a>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-amber-200 font-serif font-bold text-xs sm:text-sm border border-amber-400/20 active:scale-95 transition-all"
            >
              Tôi đã hiểu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import AnimatedPhoMascot from './AnimatedPhoMascot';

/**
 * [URBAN & RAVEN] PaymentMaintenancePopover
 * Khung thông báo nhỏ phong cách "Bong bóng suy nghĩ" (Thought Bubble):
 * - Linh vật Chibi Phở hoạt họa SVG sống động (Khói bốc, chớp mắt, xoay bánh răng, cờ lê)
 * - Bong bóng suy nghĩ thông minh với các chấm tròn nối (thought dots) định vị chuẩn xác
 * - Giữ trọn vẹn 100% nội dung thông điệp từ Admin
 * - Thiết kế tối giản, di sản 1986, không che khuất hay làm lệch bố cục
 */
function PaymentMaintenancePopover({ popoverData, onClose }) {
  useEffect(() => {
    if (!popoverData) return;
    const timer = setTimeout(() => {
      onClose();
    }, 8500);
    return () => clearTimeout(timer);
  }, [popoverData, onClose]);

  if (!popoverData) return null;

  return (
    <AnimatePresence>
      <div className="relative my-2.5 z-30">
        {/* --- CÁC ĐỐM TRÒN BONG BÓNG SUY NGHĨ (THOUGHT BUBBLE TRAIL) --- */}
        <div
          className={`absolute -top-3 flex flex-col items-center gap-0.5 pointer-events-none transition-all duration-300 ${
            popoverData.arrowPosition || 'left-8 sm:left-12'
          }`}
        >
          {/* Đốm nhỏ nhất phía trên */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="w-1.5 h-1.5 rounded-full bg-[#d4af37] border border-[#fef08a] shadow-[0_0_6px_rgba(212,175,55,0.8)]"
          />
          {/* Đốm vừa nối vào thân bóng */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="w-2.5 h-2.5 rounded-full bg-[#201007] border border-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.5)]"
          />
        </div>

        {/* --- THÂN BONG BÓNG SUY NGHĨ (MAIN THOUGHT BUBBLE CARD) --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -4 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="relative p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#241208] via-[#1a0c05] to-[#120703] border border-[#d4af37]/80 shadow-[0_12px_32px_rgba(0,0,0,0.85),0_0_16px_rgba(212,175,55,0.25)] text-[#fff8ed]"
        >
          <div className="flex items-center gap-3 sm:gap-3.5">
            {/* Linh vật Chibi Phở Vector Hoạt Họa */}
            <div className="shrink-0 p-1 rounded-2xl bg-black/35 border border-[#d4af37]/40 shadow-inner">
              <AnimatedPhoMascot size={50} />
            </div>

            {/* Nội dung thông điệp từ Admin */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span>💭 Bếp 1986 Nhắn Bạn</span>
                </span>
                <span className="font-serif font-bold text-amber-200 text-xs sm:text-[13px] tracking-wide truncate">
                  • Cổng {popoverData.name}
                </span>
              </div>

              {/* Lời nhắn bảo trì chuẩn xác do Admin thiết lập */}
              <p className="text-xs sm:text-[12.5px] text-[#fcf9f2] font-serif mt-1 leading-snug">
                {popoverData.message || 'Cổng thanh toán này đang được Bếp nâng cấp đường truyền. Quý khách an tâm chọn phương thức khác nhé!'}
              </p>

              {/* Ghi chú phụ xoa dịu trải nghiệm */}
              <div className="text-[9.5px] sm:text-[10px] text-amber-200/70 italic mt-1 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                <span>Lựa chọn của quý khách vẫn được lưu giữ an toàn</span>
              </div>
            </div>

            {/* Cụm tương tác đóng nhanh */}
            <div className="flex flex-col items-end gap-1.5 shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-amber-200/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Đóng bong bóng"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#d4af37] to-amber-400 text-stone-950 font-serif font-bold text-[10px] sm:text-[11px] hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer whitespace-nowrap"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default React.memo(PaymentMaintenancePopover);

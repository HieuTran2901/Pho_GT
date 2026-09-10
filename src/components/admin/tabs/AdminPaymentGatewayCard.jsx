import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  QrCode,
  Banknote,
  Wallet,
  Wrench,
  PowerOff,
  CheckCircle2,
  AlertTriangle,
  Save,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const GATEWAY_ICONS = {
  SEPAY: QrCode,
  MOMO: Wallet,
  VNPAY: QrCode,
  ZALOPAY: Wallet,
  CREDIT_CARD: CreditCard,
  CASH: Banknote
};

function AdminPaymentGatewayCard({
  gw,
  status = 'ACTIVE',
  maintenanceMessage = '',
  isModified,
  isSaving,
  onStatusChange,
  onMessageChange,
  onSave
}) {
  // Quản lý trạng thái mở rộng thủ công của Admin (null: tự động theo isModified, true: ép mở, false: ép đóng)
  const [manualExpand, setManualExpand] = useState(null);
  const IconComponent = GATEWAY_ICONS[gw.id] || CreditCard;

  const isMaintenance = status === 'MAINTENANCE';
  const isDisabled = status === 'DISABLED';
  const isActive = status === 'ACTIVE';

  // Tự động reset trạng thái thủ công khi đổi trạng thái khác DISABLED
  useEffect(() => {
    if (!isDisabled) {
      setManualExpand(null);
    }
  }, [isDisabled]);

  // Khi lưu thành công (isModified trở về false), tự động reset manualExpand để kích hoạt co rút êm ái
  useEffect(() => {
    if (!isModified && isDisabled) {
      setManualExpand(null);
    }
  }, [isModified, isDisabled]);

  // [URBAN & RAVEN - Phương án 1]:
  // Khi TẮT:
  // - Nếu Admin chủ động bấm mũi tên (manualExpand !== null): tôn trọng thao tác thủ công
  // - Mặc định khi còn thay đổi chưa lưu (isModified === true): GIỮ MỞ để thấy nút "Lưu thay đổi"
  // - Mặc định khi đã lưu xong vào hệ thống (isModified === false): TỰ ĐỘNG THU GỌN thành thẻ mini
  const isCollapsed = isDisabled && (manualExpand !== null ? !manualExpand : !isModified);

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 350, damping: 32 }}
      className={`relative flex flex-col justify-between rounded-2xl border-2 transition-colors duration-200 overflow-hidden p-4 sm:p-5 ${
        isMaintenance
          ? 'border-amber-400 bg-gradient-to-b from-[#2a1307] via-[#1e0d04] to-[#140702] ring-2 ring-amber-400/40 shadow-[0_0_35px_rgba(245,158,11,0.3)]'
          : isDisabled
          ? 'border-zinc-700/80 bg-gradient-to-b from-[#18181b] to-[#0f0f11] opacity-95 shadow-md'
          : 'border-[#d4af37]/40 bg-gradient-to-b from-[#24130a] via-[#1b0d06] to-[#120803] hover:border-[#d4af37]/80 hover:shadow-[0_10px_35px_rgba(212,175,55,0.18)]'
      }`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER CARD CỐ ĐỊNH (ALWAYS RENDERED, ZERO LAYOUT POP)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2.5">
        {/* Left: Icon & Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-md transition-colors duration-200 ${
              isMaintenance
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 border-amber-300 ring-2 ring-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : isDisabled
                ? 'bg-zinc-800 border-zinc-700 text-zinc-400'
                : 'bg-gradient-to-br from-[#8a1e14] to-[#450d08] border-[#d4af37]/50 text-[#fcf9f2] shadow-[#8a1e14]/40'
            }`}
          >
            <IconComponent className="w-5 h-5" />
            {isMaintenance && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-300 border border-stone-950 flex items-center justify-center text-[10px] text-stone-950 shadow-xs">
                <Wrench className="w-2.5 h-2.5" />
              </span>
            )}
            {isDisabled && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-zinc-700 border border-zinc-900 flex items-center justify-center text-[10px] text-zinc-300 shadow-xs">
                <Lock className="w-2.5 h-2.5" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-black font-serif text-[#fcf9f2] leading-snug truncate">
                {gw.name}
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#d4af37]/80 tracking-wider">
              MÃ: {gw.id}
            </span>
          </div>
        </div>

        {/* Right: Badge & Nút Hành Động Nhanh Khi Tắt */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Khi Tắt: Nút 1-Chạm Bật Lại */}
          {isDisabled && isCollapsed && (
            <button
              type="button"
              onClick={() => onStatusChange(gw.id, 'ACTIVE')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-serif font-bold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Kích hoạt bật lại cổng này"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">Bật lại</span>
            </button>
          )}

          {/* Badge Trạng Thái Pill */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-serif font-black border shadow-md uppercase tracking-tight ${
              isActive
                ? 'bg-emerald-400 text-stone-950 border-emerald-300 shadow-emerald-950/40'
                : isMaintenance
                ? 'bg-amber-400 text-stone-950 border-amber-200 shadow-amber-950/40 animate-pulse'
                : 'bg-zinc-800 text-stone-300 border-zinc-600'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive
                  ? 'bg-emerald-950'
                  : isMaintenance
                  ? 'bg-stone-950 animate-ping'
                  : 'bg-zinc-400'
              }`}
            />
            {isActive ? 'Hoạt động' : isMaintenance ? 'Bảo trì 🛠️' : 'Đã tắt'}
          </span>

          {/* Khi Tắt: Nút Mở rộng/Thu gọn */}
          {isDisabled && (
            <button
              type="button"
              onClick={() => setManualExpand(isCollapsed ? true : false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-amber-200 hover:bg-white/10 transition-all cursor-pointer"
              title={isCollapsed ? 'Mở rộng tùy chỉnh' : 'Thu gọn lại'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. THÂN CARD MỞ RỘNG (ANIMATEPRESENCE 120FPS HEIGHT DRAWER)
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            key="card-expandable-body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {/* 2.1 Hoạt Ảnh Ổ Khóa Đồng Hoàng Kim 3D (Khi Bảo Trì) */}
            {isMaintenance && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="relative mt-3.5 mb-3 p-3.5 rounded-xl bg-gradient-to-r from-[#381a09] via-[#4d230b] to-[#381a09] border-2 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.25)] flex items-center gap-3.5 overflow-hidden"
              >
                {/* Vệt sáng lướt qua */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/15 to-transparent animate-shimmer pointer-events-none" />

                {/* Khối Ổ Khóa Đồng 3D */}
                <div className="relative flex flex-col items-center justify-center shrink-0">
                  <div className="w-8 h-6 rounded-t-full border-4 border-amber-200 border-b-0 -mb-1 z-0 shadow-md" />
                  <div className="w-12 h-10 rounded-xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 border-2 border-amber-200 shadow-xl flex items-center justify-center relative z-10">
                    <div className="w-5 h-5 rounded-full bg-[#8a1e14] border border-amber-200 flex items-center justify-center shadow-inner">
                      <Wrench className="w-3 h-3 text-amber-200" />
                    </div>
                  </div>
                </div>

                {/* Nội dung thông báo niêm phong */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black font-serif text-amber-100 tracking-wide uppercase">
                      Khóa Then Bảo Trì
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-black bg-amber-400 text-stone-950 shadow-xs">
                      HTTP 503
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 font-serif leading-tight mt-0.5">
                    Đã niêm phong cổng này. Khách hàng tại Bước 2 sẽ thấy banner giải thích.
                  </p>
                </div>
              </motion.div>
            )}

            {/* 2.2 Bộ 3 Nút Chuyển Đổi Trạng Thái Xúc Giác */}
            <div className={`grid grid-cols-3 gap-1.5 p-1.5 rounded-xl bg-black/60 border border-white/15 mb-3 ${isMaintenance ? 'mt-1' : 'mt-3.5'}`}>
              <button
                type="button"
                onClick={() => onStatusChange(gw.id, 'ACTIVE')}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-serif font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-400 text-stone-950 shadow-md shadow-emerald-400/30 ring-1 ring-emerald-300 scale-[1.02]'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 mb-0.5" />
                <span>Bật</span>
              </button>

              <button
                type="button"
                onClick={() => onStatusChange(gw.id, 'MAINTENANCE')}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-serif font-black transition-all cursor-pointer ${
                  isMaintenance
                    ? 'bg-amber-400 text-stone-950 shadow-lg shadow-amber-400/40 ring-2 ring-amber-300 scale-[1.02]'
                    : 'text-stone-300 hover:text-amber-300 hover:bg-white/10'
                }`}
              >
                <Wrench className="w-4 h-4 mb-0.5" />
                <span>Bảo trì</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onStatusChange(gw.id, 'DISABLED');
                  setManualExpand(null);
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-serif font-black transition-all cursor-pointer ${
                  isDisabled
                    ? 'bg-zinc-700 text-stone-100 shadow-md border border-zinc-500 scale-[1.02]'
                    : 'text-stone-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <PowerOff className="w-4 h-4 mb-0.5" />
                <span>Tắt</span>
              </button>
            </div>

            {/* 2.3 Ngăn Kéo Nhập Thông Điệp Bảo Trì */}
            <div className="space-y-1.5 mb-3.5">
              <label
                className={`text-xs font-serif font-bold flex items-center gap-1.5 ${
                  isMaintenance ? 'text-amber-300' : 'text-[#d4af37]/90'
                }`}
              >
                <AlertTriangle
                  className={`w-3.5 h-3.5 ${
                    isMaintenance ? 'text-amber-400' : 'text-[#d4af37]'
                  }`}
                />
                <span>
                  {isMaintenance
                    ? 'Thông điệp bảo trì (Thực khách thấy ngay):'
                    : 'Lời nhắn cho thực khách (Tùy chọn):'}
                </span>
              </label>

              <input
                type="text"
                value={maintenanceMessage || ''}
                onChange={(e) => onMessageChange(gw.id, e.target.value)}
                placeholder={
                  isMaintenance
                    ? 'Ví dụ: Đang nâng cấp kết nối ngân hàng, vui lòng chọn MoMo/Tiền mặt...'
                    : 'Tùy chọn lời nhắn giải thích khi cần...'
                }
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-serif transition-all focus:outline-none ${
                  isMaintenance
                    ? 'bg-black/85 border-2 border-amber-400 text-amber-200 placeholder-amber-400/40 shadow-inner ring-1 ring-amber-400/30'
                    : 'bg-black/50 border-white/15 text-[#fcf9f2] placeholder-zinc-500 focus:border-[#d4af37]/60'
                }`}
              />
            </div>

            {/* 2.4 Footer: Thời Gian & Nút Lưu Ấn Triện */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-zinc-400 font-mono">
                  {gw.updatedAt
                    ? `Cập nhật: ${new Date(gw.updatedAt).toLocaleTimeString('vi-VN')}`
                    : 'Mặc định'}
                </span>
                {isDisabled && isModified && (
                  <span className="text-[9.5px] text-amber-300/90 font-serif italic animate-pulse truncate">
                    Thẻ sẽ tự thu gọn sau khi Lưu
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => onSave(gw)}
                disabled={isSaving || !isModified}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-serif font-black transition-all cursor-pointer ${
                  isModified
                    ? 'bg-gradient-to-r from-[#8a1e14] via-[#b32b1e] to-[#8a1e14] text-[#fff8ed] border-2 border-[#d4af37] shadow-lg shadow-[#8a1e14]/60 hover:brightness-125 active:scale-95 animate-pulse'
                    : 'bg-white/5 text-zinc-500 border border-white/5 cursor-not-allowed'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Đang lưu...' : isModified ? 'Lưu thay đổi' : 'Đã lưu'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default React.memo(AdminPaymentGatewayCard);

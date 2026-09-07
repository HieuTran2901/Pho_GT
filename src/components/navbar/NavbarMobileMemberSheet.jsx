import React from 'react';
import {
  X,
  Sparkles,
  Zap,
  Utensils,
  LogOut
} from 'lucide-react';

export default function NavbarMobileMemberSheet({
  mobileMemberSheetOpen,
  setMobileMemberSheetOpen,
  isAuthenticated,
  user,
  tierInfo,
  cardNumber,
  totalPoints,
  availablePoints,
  pointsToNext,
  progressPercent,
  favoriteDish,
  tasteSummary,
  handleQuickReorder,
  setActiveTab,
  logout,
  onToast
}) {
  if (!mobileMemberSheetOpen || !isAuthenticated || !user) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-fadeIn"
        onClick={() => setMobileMemberSheetOpen(false)}
      />

      {/* Bottom Sheet Container */}
      <div className="relative w-full max-w-lg mx-auto bg-[#160d0a] text-[#fbf6ee] rounded-t-3xl border-t-2 border-amber-500/40 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-bottom-sheet-up">
        {/* Sheet Handle Bar */}
        <div className="pt-3 pb-1 flex justify-center cursor-pointer" onClick={() => setMobileMemberSheetOpen(false)}>
          <div className="w-12 h-1.5 rounded-full bg-stone-600/70" />
        </div>

        {/* Header with Close */}
        <div className="px-5 py-2 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-base">{tierInfo.icon}</span>
            <span className="font-serif font-bold text-sm tracking-wide text-amber-200">
              THẺ HỘI VIÊN TRI KỶ 1986
            </span>
          </div>
          <button
            onClick={() => setMobileMemberSheetOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-stone-400 hover:text-white cursor-pointer"
            aria-label="Đóng thẻ hội viên"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-3 pb-6">
          {/* Member Card */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-[#4a1812] via-[#2f100c] to-[#1e0a07] border border-[#a63a2b]/70 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#9b2a1f] to-[#d68a35] p-0.5 shadow shrink-0">
                  <div className="w-full h-full rounded-full bg-[#1e0a07] flex items-center justify-center font-serif font-bold text-amber-300 text-base">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                <div>
                  <div className="font-serif font-bold text-base text-[#fbe5cb] leading-tight">{user.fullName}</div>
                  <div className="text-[11px] font-mono text-amber-400/90">{cardNumber}</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#c88d2b]/30 border border-[#c88d2b]/60 text-amber-200 flex items-center gap-1">
                <span>{tierInfo.icon}</span>
                <span>{tierInfo.badge || tierInfo.name}</span>
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-3.5 pt-3 border-t border-white/10">
              <div className="flex justify-between text-[11px] text-stone-300 mb-1">
                <span>Tiến độ thăng hạng {tierInfo.nextTier}:</span>
                <span className="font-bold text-amber-300">{totalPoints} / {tierInfo.target} điểm</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden p-0.5 border border-amber-500/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-amber-200/80 mt-1 flex items-center justify-between">
                <span>Còn {pointsToNext} điểm lên hạng {tierInfo.nextTier}</span>
                <span>{availablePoints} điểm Tri Kỷ</span>
              </div>
            </div>
          </div>

          {/* Gu Phở Của Tôi & Bát Ruột Bento Card */}
          <div className="rounded-2xl p-3.5 bg-[#251713] border border-amber-900/40 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-serif font-bold text-amber-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                BÁT QUEN & KHẨU VỊ CỦA BẠN
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-sans font-medium">
                Đã lưu
              </span>
            </div>

            <div className="flex items-center gap-3 bg-[#1b100d] rounded-xl p-2.5 border border-white/5">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-500/40 shrink-0 bg-stone-900">
                <img
                  src={favoriteDish.image}
                  alt={favoriteDish.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-serif font-bold text-sm text-white truncate">
                  {favoriteDish.name}
                </div>
                <div className="text-amber-400 font-mono font-bold text-xs mt-0.5">
                  {favoriteDish.price ? favoriteDish.price.toLocaleString('vi-VN') : '85.000'}đ
                </div>
                <div className="text-[10px] text-stone-400 truncate mt-0.5">
                  {tasteSummary}
                </div>
              </div>
            </div>

            {/* 1-Click Quick Reorder Button */}
            <button
              onClick={handleQuickReorder}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#9b2a1f] to-[#7f1d14] hover:from-[#b33324] hover:to-[#96281b] text-amber-100 font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>1-Click Đặt Lại Bát Ruột</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href="#menu"
              onClick={() => {
                setActiveTab('menu');
                setMobileMemberSheetOpen(false);
              }}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-medium text-center border border-white/10 flex items-center justify-center gap-1.5"
            >
              <Utensils className="w-3.5 h-3.5 text-amber-400" />
              <span>Khám phá món</span>
            </a>
            <button
              onClick={() => {
                logout();
                setMobileMemberSheetOpen(false);
                if (onToast) onToast('Bạn đã đăng xuất tài khoản thành công!');
              }}
              className="py-2.5 px-3 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-300 text-xs font-medium border border-red-900/50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

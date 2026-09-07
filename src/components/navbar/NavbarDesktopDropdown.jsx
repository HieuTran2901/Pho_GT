import React from 'react';
import {
  Sparkles,
  ArrowRight,
  FileText,
  Gift,
  User,
  LogOut
} from 'lucide-react';
import { BROTH_LABELS } from './navbarConstants';

export default function NavbarDesktopDropdown({
  user,
  tierInfo,
  cardNumber,
  availablePoints,
  pointsToNext,
  progressPercent,
  tasteSummary,
  handleQuickReorder,
  setUserDropdownOpen,
  logout,
  onToast
}) {
  return (
    <div className="absolute right-0 mt-2.5 w-[560px] max-w-[calc(100vw-24px)] rounded-2xl bg-gradient-to-b from-[#1c100c] via-[#160b08] to-[#0f0604] border border-[#c88d2b]/60 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(200,141,43,0.2)] overflow-hidden z-50 animate-dropdown-heritage text-xs">
      {/* HÀNG 1: HEADER DANH KHÁCH VỚI BỨC HỌA PHỐ CỔ 1986 */}
      <div className="relative p-4 bg-gradient-to-r from-[#38140e] via-[#260e09] to-[#180805] border-b border-amber-900/50 overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-3/5 pointer-events-none opacity-20 overflow-hidden">
          <svg viewBox="0 0 350 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
            <path d="M10 110 L45 75 L80 110 L120 65 L165 110 L205 55 L250 110 L290 70 L335 110 L350 85" stroke="#d49e58" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M35 80 L35 140 M55 80 L55 140 M110 70 L110 140 M130 70 L130 140 M195 60 L195 140 M215 60 L215 140 M280 75 L280 140 M300 75 L300 140" stroke="#d49e58" strokeWidth="1" opacity="0.6" />
            <path d="M0 135 H350 M0 140 H350" stroke="#d49e58" strokeWidth="1.2" opacity="0.5" />
            <rect x="65" y="90" width="12" height="18" rx="6" stroke="#d49e58" strokeWidth="1" opacity="0.7" />
            <rect x="145" y="80" width="14" height="22" rx="7" stroke="#d49e58" strokeWidth="1" opacity="0.7" />
            <rect x="235" y="75" width="14" height="22" rx="7" stroke="#d49e58" strokeWidth="1" opacity="0.7" />
          </svg>
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ffd97a] via-[#c88d2b] to-[#6a3c0a] p-0.5 shadow-lg shrink-0">
              <div className="w-full h-full rounded-full bg-[#180704] text-amber-300 flex items-center justify-center font-serif font-black text-xl shadow-inner border border-amber-900/60">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'H'}
              </div>
            </div>

            <div className="min-w-0">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-[#f7ede2] leading-tight truncate">
                {user.fullName || 'Hiếu Trần'}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#6a150c]/90 border border-red-500/60 text-red-200 font-serif text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <span>🌸</span>
                  <span>TRI KỶ 1986</span>
                </span>
                <span className="text-xs font-serif font-semibold text-amber-300/90 flex items-center gap-1">
                  <span>{tierInfo.icon}</span>
                  <span>{tierInfo.title || 'Bạn Khởi Vị'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0 flex flex-col items-end">
            <span className="text-[11px] font-serif font-medium text-amber-400/80 flex items-center gap-1">
              <span>⚜️</span>
              <span>Thành viên 1986</span>
            </span>
            <span className="text-[9px] font-mono text-stone-400 mt-0.5">
              {cardNumber}
            </span>
          </div>
        </div>
      </div>

      {/* NỘI DUNG BENTO GRID */}
      <div className="p-3.5 space-y-3">
        {/* ROW 1: Điểm Tri Kỷ & Thước đo */}
        <div className="rounded-xl p-3 bg-black/40 border border-amber-900/40 flex items-center gap-4">
          <div className="text-center shrink-0 min-w-[90px] pr-3 border-r border-amber-900/40">
            <div className="text-[9px] text-amber-400/90 font-serif font-bold uppercase tracking-wider flex items-center justify-center gap-1">
              <span>⟡</span> <span>ĐIỂM TRI KỶ</span> <span>⟡</span>
            </div>
            <div className="text-3xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 leading-none mt-1">
              {availablePoints}
            </div>
            <div className="text-[10px] text-stone-400 font-serif mt-0.5">điểm</div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs font-serif font-bold mb-1.5">
              <span className="text-[#f7ede2]">{tierInfo.name || 'Bạn Khởi Vị'}</span>
              <span className="text-amber-300 flex items-center gap-1">
                <span>🍜</span>
                <span>{tierInfo.nextTier || 'Bạn Đũa'}</span>
              </span>
            </div>

            <div className="relative w-full h-2 bg-stone-900 rounded-full my-2 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-[#c88d2b] to-[#ffd700] rounded-full shadow-[0_0_8px_rgba(200,141,43,0.7)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#180f0b] border-2 border-amber-300 shadow-[0_0_8px_rgba(255,215,0,0.9)] flex items-center justify-center -ml-2"
                style={{ left: `${progressPercent}%` }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>
            </div>

            <div className="text-[11px] text-stone-400 mt-1">
              {pointsToNext > 0 ? (
                <span>Còn <strong className="text-amber-300 font-mono font-bold">{pointsToNext}</strong> điểm để lên hạng <strong className="text-amber-300 font-semibold">{tierInfo.nextTier}</strong></span>
              ) : (
                <span className="text-amber-300 font-semibold">Đã đạt danh hiệu Thượng Khách Đỉnh Cao</span>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2: Quà tiếp theo & Bát quen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl p-3 bg-black/40 border border-amber-900/40 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-serif font-bold text-amber-400 uppercase tracking-wider">
              <span>🎁</span>
              <span>QUÀ TIẾP THEO</span>
            </div>

            <div className="flex items-center gap-3 mt-2.5">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-amber-500/40 shadow-md shrink-0 bg-stone-900">
                <img
                  src="https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=150&q=80"
                  alt="Quà tặng"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <div className="font-serif font-bold text-xs text-white leading-snug truncate">
                  {tierInfo.nextGift || 'Đĩa Quẩy Giòn Hoa Mai'}
                </div>
                <div className="mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-stone-900/80 border border-amber-500/30 text-amber-300 font-mono text-[10px] inline-block font-bold">
                    {availablePoints} / {tierInfo.giftPoints || 200} điểm
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-3 bg-black/40 border border-amber-900/40 flex items-center justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[11px] font-serif font-bold text-amber-400 uppercase tracking-wider mb-1.5">
                <span>🍲</span>
                <span>BÁT QUEN CỦA BẠN</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-amber-500/40 shadow shrink-0 bg-stone-900">
                  <img
                    src="https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=150&q=80"
                    alt="Bát quen"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <div className="font-serif font-bold text-xs text-white truncate max-w-[130px]" title={user.tasteProfile?.favoriteDishName || 'Phở Bò Tái Nạm Gầu Giòn'}>
                    {user.tasteProfile?.favoriteDishName || 'Phở Bò Tái Nạm Gầu Giòn'}
                  </div>
                  <div className="text-amber-400 font-mono font-bold text-[11px] mt-0.5">85.000đ</div>
                  <div className="inline-flex items-center gap-1 text-[9px] text-stone-300 bg-black/50 px-1.5 py-0.2 rounded border border-white/5 mt-0.5">
                    <span>🍲</span>
                    <span className="truncate max-w-[80px]">
                      {user.tasteProfile?.brothType ? (BROTH_LABELS[user.tasteProfile.brothType] || user.tasteProfile.brothType) : 'Nước đậm'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleQuickReorder}
              className="px-2.5 py-2.5 rounded-xl bg-gradient-to-b from-[#8a1f18] to-[#68140e] hover:from-[#a3251e] hover:to-[#7f1912] border border-amber-500/40 text-amber-100 flex flex-col items-center justify-center shrink-0 min-w-[72px] shadow-md transition-all active:scale-95 group/btn cursor-pointer"
              title="Gọi lại bát phở ruột ngay lập tức"
            >
              <span className="text-sm leading-none group-hover/btn:scale-110 transition-transform">🍲</span>
              <span className="text-[11px] font-serif font-bold leading-tight mt-1 text-center">Gọi lại</span>
              <span className="text-[9px] text-amber-200/80 font-normal leading-tight">bát quen</span>
            </button>
          </div>
        </div>

        {/* ROW 3: Gu phở của tôi */}
        <div className="rounded-xl px-3.5 py-2.5 bg-black/40 border border-amber-900/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-base text-amber-400 shrink-0">🍜</span>
            <div className="min-w-0">
              <div className="font-serif font-bold text-xs text-amber-400 uppercase tracking-wider">
                GU PHỞ CỦA TÔI
              </div>
              <div className="text-[11px] text-stone-300 mt-0.5 truncate">
                {tasteSummary}
              </div>
            </div>
          </div>

          <a
            href="#menu"
            onClick={() => setUserDropdownOpen(false)}
            className="text-amber-400 hover:text-amber-300 text-xs font-serif font-semibold flex items-center gap-1 shrink-0 transition-colors"
          >
            <span>Chỉnh gu phở</span>
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* ROW 4: Footer tiện ích */}
      <div className="grid grid-cols-4 border-t border-amber-900/40 bg-[#0c0503] text-stone-300 text-[11px] py-2.5 divide-x divide-white/5 text-center">
        <a
          href="#order-form-card"
          onClick={() => setUserDropdownOpen(false)}
          className="px-1 hover:text-amber-200 transition-colors flex flex-col items-center justify-center group"
        >
          <FileText className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform mb-0.5" />
          <span className="font-bold text-xs text-white">Đơn hàng</span>
          <span className="text-[9px] text-stone-400">Xem lịch sử đơn</span>
        </a>

        <a
          href="#menu"
          onClick={() => setUserDropdownOpen(false)}
          className="px-1 hover:text-amber-200 transition-colors flex flex-col items-center justify-center group"
        >
          <Gift className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform mb-0.5" />
          <span className="font-bold text-xs text-white">Kho quà</span>
          <span className="text-[9px] text-stone-400">Ưu đãi của bạn</span>
        </a>

        <a
          href="#order-form-card"
          onClick={() => setUserDropdownOpen(false)}
          className="px-1 hover:text-amber-200 transition-colors flex flex-col items-center justify-center group"
        >
          <User className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform mb-0.5" />
          <span className="font-bold text-xs text-white">Hồ sơ</span>
          <span className="text-[9px] text-stone-400">Thông tin tài khoản</span>
        </a>

        <button
          type="button"
          onClick={() => {
            logout();
            setUserDropdownOpen(false);
            if (onToast) onToast('Bạn đã đăng xuất tài khoản thành công!');
          }}
          className="px-1 hover:text-red-300 transition-colors flex flex-col items-center justify-center group text-red-400 cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform mb-0.5" />
          <span className="font-bold text-xs">Đăng xuất</span>
          <span className="text-[9px] text-red-400/70">Thoát tài khoản</span>
        </button>
      </div>
    </div>
  );
}

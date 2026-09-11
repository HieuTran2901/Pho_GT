import React from 'react';
import {
  User,
  Zap,
  LogOut,
  ArrowRight,
  ScrollText,
  Gift
} from 'lucide-react';

function NavbarMobileDrawer({
  navItems,
  setActiveTab,
  setMobileMenuOpen,
  isAuthenticated,
  user,
  cardNumber,
  tierInfo,
  availablePoints,
  setMobileMemberSheetOpen,
  handleQuickReorder,
  onOpenOrderHistory,
  onOpenGiftVault,
  logout,
  openAuthModal,
  onToast
}) {
  return (
    <div className="xl:hidden bg-[#f7f4ed] border-b border-stone-300 px-4 py-4 space-y-2 animate-fadeIn">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.id}
            href={item.href}
            onClick={() => {
              setActiveTab(item.id);
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-stone-800 hover:bg-stone-200 font-bold text-sm"
          >
            <Icon className="w-4 h-4 text-[#9b2a1f]" />
            <span>{item.label}</span>
          </a>
        );
      })}

      <div className="pt-2 border-t border-stone-300/80">
        {isAuthenticated && user ? (
          <div className="rounded-2xl bg-[#241712] border border-[#a63a2b]/70 overflow-hidden shadow-lg text-xs">
            <div 
              onClick={() => {
                setMobileMenuOpen(false);
                setMobileMemberSheetOpen(true);
              }}
              className="p-3.5 bg-gradient-to-br from-[#4a1812] via-[#2f100c] to-[#1e0a07] text-[#fef3e2] cursor-pointer hover:opacity-95 transition-opacity"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#9b2a1f] to-[#d68a35] p-0.5 shadow shrink-0">
                    <div className="w-full h-full rounded-full bg-[#1e0a07] flex items-center justify-center font-serif font-bold text-amber-300 text-xs">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </div>
                  <div>
                    <div className="font-serif font-bold text-sm text-[#fbe5cb] leading-tight">{user.fullName}</div>
                    <div className="text-[10px] font-mono text-amber-400/90">{cardNumber}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c88d2b]/30 border border-[#c88d2b]/60 text-amber-200 flex items-center gap-1">
                  <span>{tierInfo.icon}</span> <span>{tierInfo.badge || tierInfo.name}</span>
                </span>
              </div>

              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-stone-300">Điểm Tri Kỷ đổi quà:</span>
                <span className="font-serif font-bold text-amber-300 text-xs">{availablePoints} điểm</span>
              </div>
              <div className="text-[10px] text-amber-300/80 mt-1 flex items-center gap-1 font-serif">
                <span>Chạm để mở thẻ Tri Kỷ chi tiết</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* Mobile Quick Reorder & Order History Buttons */}
            <div className="p-2.5 bg-[#2c1b14] space-y-2">
              <button
                onClick={handleQuickReorder}
                className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[#9b2a1f] to-[#7f1d14] text-amber-100 font-serif font-bold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer active:scale-98 transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>1-Click Đặt Lại Bát Ruột</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenOrderHistory) onOpenOrderHistory();
                }}
                className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-stone-200 font-serif font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-white/10 active:scale-98 transition-all"
              >
                <ScrollText className="w-3.5 h-3.5 text-amber-300" />
                <span>Xem Sổ Lịch Sử Đơn Hàng</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenGiftVault) onOpenGiftVault();
                }}
                className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[#6a150c] to-[#450d08] hover:from-[#851b10] hover:to-[#57100a] text-amber-200 font-serif font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-amber-500/40 active:scale-98 transition-all"
              >
                <Gift className="w-3.5 h-3.5 text-amber-300" />
                <span>Kho Quà Tri Kỷ 1986</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  if (onToast) onToast('Bạn đã đăng xuất tài khoản thành công!');
                }}
                className="w-full py-1.5 text-xs text-red-400 hover:text-red-300 font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất tài khoản</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#8a1e14] text-white font-serif font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow active:scale-98 transition-all"
            >
              <User className="w-4 h-4" />
              <span>ĐĂNG NHẬP / ĐĂNG KÝ THÀNH VIÊN</span>
            </button>
            <button
              type="button"
              id="drawer-gift-vault-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenGiftVault) onOpenGiftVault();
              }}
              className="w-full py-1.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-[#8a1e14] font-serif font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-amber-500/20 active:scale-98 transition-all"
            >
              <Gift className="w-3.5 h-3.5 text-[#8a1e14]" />
              <span>Khám phá Kho Quà Tri Kỷ 1986</span>
            </button>
            <button
              type="button"
              id="drawer-order-history-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenOrderHistory) onOpenOrderHistory();
              }}
              className="w-full py-1 text-xs text-[#8a1e14] font-serif font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:underline"
            >
              <ScrollText className="w-3.5 h-3.5" />
              <span>Tra cứu lịch sử đơn hàng gần đây</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(NavbarMobileDrawer);

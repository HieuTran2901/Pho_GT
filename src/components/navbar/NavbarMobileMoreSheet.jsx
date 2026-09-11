import React, { useEffect } from 'react';
import {
  X,
  Compass,
  Bike,
  Sparkles,
  MessageSquareQuote,
  Gift,
  ScrollText,
  Phone,
  MapPin,
  User,
  LogOut,
  ChevronRight
} from 'lucide-react';

function NavbarMobileMoreSheet({
  isOpen,
  onClose,
  setActiveTab,
  onOpenOrder,
  onOpenGiftVault,
  onOpenOrderHistory,
  isAuthenticated,
  user,
  tierInfo,
  openAuthModal,
  logout,
  onToast
}) {
  // Lock body scroll when sheet is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNavClick = (tabId, href) => {
    setActiveTab(tabId);
    onClose();
    if (href) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end animate-fadeIn">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
        aria-label="Đóng bảng tiện ích"
      />

      {/* Bottom Sheet Container */}
      <div className="relative w-full max-w-lg mx-auto bg-[#fbf7f0] text-stone-800 rounded-t-3xl border-t-2 border-[#9b2a1f]/30 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-bottom-sheet-up">
        {/* Drag Handle Bar */}
        <div className="pt-3 pb-1 flex justify-center cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-stone-300" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-stone-200/80 bg-stone-100/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#9b2a1f]/10 text-[#9b2a1f] flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm tracking-wide text-[#9b2a1f]">
                KHÁM PHÁ & TIỆN ÍCH 1986
              </div>
              <div className="text-[10px] text-stone-500 font-sans">
                Dịch vụ & văn hóa phở truyền thống
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-600 flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sheet Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 pb-8">
          {/* 1. Primary CTA: Đặt bàn & Giao tận nơi */}
          <div 
            onClick={() => {
              handleNavClick('order', '#order-form-card');
              if (onOpenOrder) onOpenOrder();
            }}
            className="p-4 rounded-2xl bg-gradient-to-r from-[#92241a] via-[#851e15] to-[#6d170f] text-amber-100 shadow-md cursor-pointer hover:shadow-lg transition-all active:scale-98 border border-amber-500/30 relative overflow-hidden group"
          >
            {/* Subtle vintage glow & watermark */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none text-white">
              <Bike className="w-24 h-24" />
            </div>

            <div className="flex items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
                  <Bike className="w-5 h-5 text-amber-200" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-[10px] font-bold text-amber-300 tracking-wide font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Giao nhanh 15 phút
                    </span>
                  </div>
                  <div className="font-serif font-bold text-[15px] text-white tracking-wide">
                    Đặt Bàn & Giao Tận Nơi
                  </div>
                  <div className="text-[11px] text-amber-100/80 mt-0.5 leading-tight">
                    Giữ chỗ bàn tiệc hoặc giao phở nóng tận cửa
                  </div>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center shrink-0 border border-white/15 text-amber-200 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 2. Brand Discovery Section */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-1">
              Câu chuyện & Cảm nhận
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Bí quyết 1986 */}
              <div
                onClick={() => handleNavClick('story', '#story')}
                className="p-3 rounded-xl bg-white border border-stone-200/80 shadow-xs hover:border-[#9b2a1f]/40 cursor-pointer transition-all active:scale-98"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-[#9b2a1f] flex items-center justify-center mb-1.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="font-serif font-bold text-xs text-stone-800">
                  Bí Quyết 1986
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5 leading-tight">
                  Nước dùng 24h & công thức gia truyền
                </div>
              </div>

              {/* Thực khách nói gì */}
              <div
                onClick={() => handleNavClick('reviews', '#reviews')}
                className="p-3 rounded-xl bg-white border border-stone-200/80 shadow-xs hover:border-[#9b2a1f]/40 cursor-pointer transition-all active:scale-98"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-[#9b2a1f] flex items-center justify-center mb-1.5">
                  <MessageSquareQuote className="w-4 h-4" />
                </div>
                <div className="font-serif font-bold text-xs text-stone-800">
                  Khách Hàng Nói Gì
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5 leading-tight">
                  Đánh giá từ người sành ăn Hà Thành
                </div>
              </div>
            </div>
          </div>

          {/* 3. Loyalty & Utilities Section */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-1">
              Tiện ích & Quyền lợi
            </div>
            <div className="bg-white rounded-2xl border border-stone-200/80 divide-y divide-stone-100 shadow-xs overflow-hidden">
              {/* Kho quà */}
              <div
                id="more-sheet-gift-vault-btn"
                onClick={() => {
                  onClose();
                  if (onOpenGiftVault) onOpenGiftVault();
                }}
                className="p-3 flex items-center justify-between hover:bg-stone-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#8a1e14] flex items-center justify-center shrink-0">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-serif font-bold text-xs text-stone-800">
                      Kho Quà Tri Kỷ 1986
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Đổi điểm lấy quẩy giòn, trứng chần, bát phở
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
              </div>

              {/* Lịch sử đơn */}
              <div
                onClick={() => {
                  onClose();
                  if (onOpenOrderHistory) onOpenOrderHistory();
                }}
                className="p-3 flex items-center justify-between hover:bg-stone-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 text-[#8a1e14] flex items-center justify-center shrink-0">
                    <ScrollText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-serif font-bold text-xs text-stone-800">
                      Sổ Lịch Sử Đơn Hàng
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Tra cứu tình trạng đơn phở đã đặt
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
              </div>
            </div>
          </div>

          {/* 4. Support & Contacts */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-1">
              Hỗ trợ & Chi nhánh
            </div>
            <div className="bg-white rounded-2xl border border-stone-200/80 p-3 space-y-2.5 shadow-xs">
              <a
                href="tel:19008686"
                className="flex items-center justify-between text-stone-800 hover:text-[#9b2a1f] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-serif font-bold text-xs">Hotline: 1900 8686</div>
                    <div className="text-[10px] text-stone-500">Hỗ trợ 06:00 – 22:30 mỗi ngày</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Gọi ngay
                </span>
              </a>

              <div className="pt-2 border-t border-stone-100 flex items-center gap-2.5 text-stone-600 text-xs">
                <MapPin className="w-4 h-4 text-[#9b2a1f] shrink-0" />
                <span className="text-[11px] leading-tight">
                  10 Chi nhánh gia truyền tại Hà Nội & TP. Hồ Chí Minh
                </span>
              </div>
            </div>
          </div>

          {/* 5. Authentication Status / Action */}
          <div className="pt-1">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-200/60 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#9b2a1f] text-amber-200 font-bold flex items-center justify-center font-serif text-[10px]">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="font-serif font-bold text-stone-800">{user.fullName}</span>
                  {tierInfo?.icon && <span>{tierInfo.icon}</span>}
                </div>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                    if (onToast) onToast('Bạn đã đăng xuất tài khoản thành công!');
                  }}
                  className="text-red-700 hover:text-red-900 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  openAuthModal('login');
                }}
                className="w-full py-2.5 rounded-xl bg-white border border-[#9b2a1f]/40 hover:bg-stone-50 text-[#9b2a1f] font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
              >
                <User className="w-4 h-4" />
                <span>ĐĂNG NHẬP / ĐĂNG KÝ HỘI VIÊN TRI KỶ</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(NavbarMobileMoreSheet);

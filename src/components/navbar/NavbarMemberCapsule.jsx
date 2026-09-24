import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { ChevronDown, Sparkles, User, FileText } from 'lucide-react';
import NavbarDesktopDropdown from './NavbarDesktopDropdown';

function NavbarMemberCapsule({
  isAuthenticated,
  isInitialized,
  user,
  tierInfo,
  cardNumber,
  availablePoints,
  pointsToNext,
  progressPercent,
  tasteSummary,
  handleQuickReorder,
  onOpenOrderHistory,
  onOpenGiftVault,
  logout,
  onToast,
  onOpenLogin
}) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleUserDropdown = useCallback(() => {
    setUserDropdownOpen((prev) => !prev);
  }, []);

  // Close dropdown on click outside only when open
  useEffect(() => {
    if (!userDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  if (isAuthenticated && user) {
    return (
      <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            id="navbar-user-btn"
            onClick={toggleUserDropdown}
            className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-[#d49e58]/50 bg-gradient-to-r from-amber-50/90 via-orange-50/80 to-amber-100/90 hover:border-[#c88d2b] text-[#2b1810] text-xs font-serif font-bold transition-all shadow-xs group cursor-pointer"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#9b2a1f] to-[#6a150c] text-amber-200 flex items-center justify-center text-[10px] sm:text-xs font-bold font-serif shadow-xs ring-1 ring-[#e4aa65]/60 shrink-0">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left leading-tight hidden lg:block">
              <div className="text-xs font-bold truncate max-w-[110px] text-[#2b1810] flex items-center gap-1">
                <span>{user.fullName}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200/80 text-[#8a1e14] font-sans font-bold">
                  {tierInfo?.badge || tierInfo?.name}
                </span>
              </div>
              <div className="text-[10px] text-[#8a1e14] font-sans font-semibold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                <span>{availablePoints}đ Tri Kỷ</span>
              </div>
            </div>
            {/* Compact name on tablet (md to lg) */}
            <div className="text-left leading-tight lg:hidden">
              <span className="text-xs font-bold truncate max-w-[80px] inline-block">{user.fullName}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180 text-[#8a1e14]' : ''}`} />
          </button>

          {/* Desktop Dropdown */}
          {userDropdownOpen && (
            <NavbarDesktopDropdown
              user={user}
              tierInfo={tierInfo}
              cardNumber={cardNumber}
              availablePoints={availablePoints}
              pointsToNext={pointsToNext}
              progressPercent={progressPercent}
              tasteSummary={tasteSummary}
              handleQuickReorder={handleQuickReorder}
              setUserDropdownOpen={setUserDropdownOpen}
              onOpenOrderHistory={onOpenOrderHistory}
              onOpenGiftVault={onOpenGiftVault}
              logout={logout}
              onToast={onToast}
            />
          )}
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-amber-900/10 bg-amber-50/40 animate-pulse w-32 h-8.5">
        <div className="w-4 h-4 rounded-full bg-stone-300/60 shrink-0" />
        <div className="w-16 h-3 rounded bg-stone-300/60" />
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
      <button
        onClick={onOpenOrderHistory}
        id="navbar-order-history-btn"
        className="flex items-center gap-1.5 px-2 2xl:px-3 py-2 rounded-full border border-stone-300 hover:border-[#8a1e14]/50 bg-white/90 hover:bg-amber-50/50 text-stone-700 hover:text-[#8a1e14] text-xs font-serif font-bold tracking-wider transition-all shadow-xs cursor-pointer group whitespace-nowrap"
        title="Tra cứu lịch sử đơn hàng"
      >
        <FileText className="w-3.5 h-3.5 text-[#8a1e14] group-hover:scale-110 transition-transform" />
        <span className="hidden lg:inline">LỊCH SỬ ĐƠN</span>
      </button>
      <button
        onClick={onOpenLogin}
        className="flex items-center gap-1.5 sm:gap-2 px-3 2xl:px-4 py-2 rounded-full border border-[#8a1e14]/40 bg-white hover:bg-amber-50/60 text-[#8a1e14] text-xs font-serif font-bold tracking-wider uppercase transition-all shadow-xs group cursor-pointer whitespace-nowrap"
      >
        <User className="w-3.5 h-3.5 text-[#8a1e14]" />
        <span>ĐĂNG NHẬP</span>
      </button>
    </div>
  );
}

export default memo(NavbarMemberCapsule);

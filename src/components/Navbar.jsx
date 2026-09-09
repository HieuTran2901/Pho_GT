import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Clock, 
  Gift, 
  MapPin, 
  Utensils, 
  ChevronDown, 
  Sparkles, 
  User, 
  Phone, 
  ShoppingBag, 
  Menu, 
  X,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  NAV_ITEMS,
  TIER_CONFIG,
  BROTH_LABELS,
  ONION_LABELS,
  HERB_LABELS,
  CRULLER_LABELS
} from './navbar/navbarConstants';
import NavbarDesktopDropdown from './navbar/NavbarDesktopDropdown';
import NavbarMobileDrawer from './navbar/NavbarMobileDrawer';
import NavbarMobileBottomNav from './navbar/NavbarMobileBottomNav';
import NavbarMobileMemberSheet from './navbar/NavbarMobileMemberSheet';
import NavbarMobileMoreSheet from './navbar/NavbarMobileMoreSheet';

function Navbar({ cartCount, onOpenCart, onOpenOrder, onAddToCart, onOpenOrderHistory, onOpenGiftVault, isCartJiggling, onToast }) {
  const [activeTab, setActiveTab] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMemberSheetOpen, setMobileMemberSheetOpen] = useState(false);
  const [mobileMoreSheetOpen, setMobileMoreSheetOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, isAuthenticated, isInitialized, openAuthModal, logout } = useAuth();
  const navItems = NAV_ITEMS;

  // Memoized membership calculations
  const { tierInfo, totalPoints, availablePoints, pointsToNext, progressPercent, cardNumber } = useMemo(() => {
    const tierKey = user?.loyaltyAccount?.membershipTier || 'DONG';
    const info = TIER_CONFIG[tierKey] || TIER_CONFIG.DONG;
    const total = user?.loyaltyAccount?.totalPoints || 50;
    const available = user?.loyaltyAccount?.availablePoints || 50;
    const toNext = Math.max(0, info.target - total);
    const progress = Math.min(100, Math.round((total / info.target) * 100));
    const cardNum = user?.phone ? `#VIP-1986-${user.phone.replace(/\D/g, '').slice(-4) || '8888'}` : '#VIP-1986-8888';
    return {
      tierInfo: info,
      totalPoints: total,
      availablePoints: available,
      pointsToNext: toNext,
      progressPercent: progress,
      cardNumber: cardNum
    };
  }, [user]);

  // Dynamic taste summary for "GU PHỞ CỦA TÔI"
  const tasteSummary = useMemo(() => [
    user?.tasteProfile?.brothType ? (BROTH_LABELS[user.tasteProfile.brothType] || user.tasteProfile.brothType) : 'Nước đậm',
    user?.tasteProfile?.onionStyle ? (ONION_LABELS[user.tasteProfile.onionStyle] || user.tasteProfile.onionStyle) : 'Nhiều hành',
    user?.tasteProfile?.herbStyle ? (HERB_LABELS[user.tasteProfile.herbStyle] || user.tasteProfile.herbStyle) : 'Không rau mùi',
    user?.tasteProfile?.crullerPref ? (CRULLER_LABELS[user.tasteProfile.crullerPref] || user.tasteProfile.crullerPref) : 'Thêm quẩy'
  ].join(' • '), [user?.tasteProfile]);

  // Memoized favorite dish reference for 1-Click Quick Reorder
  const favoriteDish = useMemo(() => ({
    id: 'fav_pho_' + (user?.tasteProfile?.favoriteDishId || '1986'),
    name: user?.tasteProfile?.favoriteDishName || 'Phở Bò Tái Nạm Gầu Giòn 1986',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80',
    customNote: user?.tasteProfile?.customNote || 'Chuẩn vị truyền thống 1986 (Đã lưu)'
  }), [user?.tasteProfile?.favoriteDishId, user?.tasteProfile?.favoriteDishName, user?.tasteProfile?.customNote]);

  // 1-Click Quick Reorder handler
  const handleQuickReorder = useCallback(() => {
    if (onAddToCart) {
      onAddToCart(favoriteDish);
      setUserDropdownOpen(false);
      setMobileMenuOpen(false);
      setMobileMemberSheetOpen(false);
      if (onToast) onToast(`Đã thêm bát phở ruột vào giỏ hàng thành công!`);
    } else if (onOpenCart) {
      onOpenCart();
    }
  }, [favoriteDish, onAddToCart, onOpenCart, onToast]);

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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 font-sans shadow-md">
        {/* 1. Top vintage announcement bar */}
        <div className="bg-[#1b261d] text-amber-100/90 text-xs py-1.5 sm:py-2 px-3 sm:px-8 border-b border-amber-900/30 overflow-hidden w-full max-w-full">
          <div className="max-w-[1700px] mx-auto flex justify-between items-center gap-2">
            {/* Mobile view */}
            <div className="sm:hidden flex items-center justify-between w-full text-[10px]">
              <span className="flex items-center gap-1 font-medium truncate">
                <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                <span>06:00 – 22:30</span>
              </span>
              <span className="text-amber-300 font-medium truncate flex items-center gap-1">
                <Gift className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Tặng 1 đĩa quẩy giòn</span>
              </span>
            </div>

            {/* Desktop/Tablet view */}
            <div className="hidden sm:flex items-center space-x-6">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                06:00 – 22:30 mỗi ngày
              </span>
              <span className="flex items-center gap-1.5 text-stone-300">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                10 Chi nhánh tại Hà Nội & TP. Hồ Chí Minh
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-amber-300 text-xs font-medium">
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span>Ưu đãi hôm nay: Tặng 1 đĩa quẩy giòn khi đặt qua website</span>
            </div>
          </div>
        </div>

        {/* 2. Main Navigation Bar */}
        <div className="bg-[#f7f4ed]/95 backdrop-blur-md border-b border-stone-300/80 px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3 w-full max-w-full">
          <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-1.5 sm:gap-4 w-full">
            
            {/* Logo Section */}
            <a href="#hero" className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 min-w-0 group">
              <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border border-[#9b2a1f] sm:border-2 p-0.5 flex items-center justify-center bg-white shadow-sm group-hover:scale-105 transition-transform shrink-0">
                <div className="w-full h-full rounded-full border border-dashed border-[#9b2a1f] flex flex-col items-center justify-center text-[#9b2a1f] leading-none py-0.5 sm:py-1">
                  <span className="text-[6px] sm:text-[7px] md:text-[8px] font-bold uppercase tracking-tighter">SINCE</span>
                  <Utensils className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 my-0.5" />
                  <span className="text-[6px] sm:text-[7px] md:text-[8px] font-bold">1986</span>
                </div>
              </div>

              <div className="text-left min-w-0">
                <div className="font-serif text-base sm:text-2xl md:text-3xl font-black tracking-tight text-[#223326] leading-none whitespace-nowrap truncate">
                  PHỞ GIA TRUYỀN
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[10px] md:text-[11px] font-serif text-[#9b2a1f] tracking-wide uppercase font-semibold mt-0.5 sm:mt-1 whitespace-nowrap">
                  <span className="hidden sm:inline-block w-2.5 md:w-4 h-px bg-[#9b2a1f]/60" />
                  <span className="sm:hidden">TINH HOA TỪ 1986</span>
                  <span className="hidden sm:inline">TINH HOA PHỞ VIỆT TỪ NĂM 1986</span>
                  <span className="hidden sm:inline-block w-2.5 md:w-4 h-px bg-[#9b2a1f]/60" />
                </div>
              </div>
            </a>

            {/* Navigation Links (Desktop) */}
            <nav className="hidden xl:flex items-center">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <div key={item.id} className="flex items-center">
                    <a
                      href={item.href}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-white shadow-sm border border-stone-200 text-[#9b2a1f]'
                          : 'text-stone-700 hover:text-[#9b2a1f] hover:bg-stone-200/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-[#9b2a1f]' : 'text-stone-500'}`} />
                      <span className="text-xs font-bold whitespace-nowrap tracking-wide">
                        {item.label}
                      </span>
                      {isActive && (
                        <span className="w-6 h-0.5 bg-[#9b2a1f] rounded-full mt-0.5" />
                      )}
                    </a>
                    {idx < navItems.length - 1 && (
                      <span className="w-px h-6 bg-stone-300/80 mx-1" />
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Right Actions: Login + Hotline + Cart */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">
              {/* Login / Member Profile Section */}
              {isAuthenticated && user ? (
                <div className="relative hidden md:block" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-[#d49e58]/50 bg-gradient-to-r from-amber-50/90 via-orange-50/80 to-amber-100/90 hover:border-[#c88d2b] text-[#2b1810] text-xs font-serif font-bold transition-all shadow-xs group cursor-pointer"
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#9b2a1f] to-[#6a150c] text-amber-200 flex items-center justify-center text-[10px] sm:text-xs font-bold font-serif shadow-xs ring-1 ring-[#e4aa65]/60 shrink-0">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="text-left leading-tight hidden lg:block">
                      <div className="text-xs font-bold truncate max-w-[110px] text-[#2b1810] flex items-center gap-1">
                        <span>{user.fullName}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200/80 text-[#8a1e14] font-sans font-bold">
                          {tierInfo.badge || tierInfo.name}
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
              ) : !isInitialized ? (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-amber-900/10 bg-amber-50/40 animate-pulse w-32 h-8.5">
                  <div className="w-4 h-4 rounded-full bg-stone-300/60 shrink-0" />
                  <div className="w-16 h-3 rounded bg-stone-300/60" />
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={onOpenGiftVault}
                    id="navbar-gift-vault-btn"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-amber-500/50 hover:border-[#8a1e14] bg-gradient-to-r from-amber-50 to-orange-50/80 hover:bg-amber-100 text-[#8a1e14] text-xs font-serif font-bold tracking-wider transition-all shadow-xs cursor-pointer group"
                    title="Khám phá kho quà tri ân"
                  >
                    <div className="relative">
                      <Gift className="w-3.5 h-3.5 text-[#8a1e14] group-hover:scale-110 transition-transform" />
                      <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    </div>
                    <span>KHO QUÀ</span>
                  </button>
                  <button
                    onClick={onOpenOrderHistory}
                    id="navbar-order-history-btn"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-stone-300 hover:border-[#8a1e14]/50 bg-white/90 hover:bg-amber-50/50 text-stone-700 hover:text-[#8a1e14] text-xs font-serif font-bold tracking-wider transition-all shadow-xs cursor-pointer group"
                    title="Tra cứu lịch sử đơn hàng"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#8a1e14] group-hover:scale-110 transition-transform" />
                    <span>LỊCH SỬ ĐƠN</span>
                  </button>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#8a1e14]/40 bg-white hover:bg-amber-50/60 text-[#8a1e14] text-xs font-serif font-bold tracking-wider uppercase transition-all shadow-xs group cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-[#8a1e14]" />
                    <span>ĐĂNG NHẬP</span>
                  </button>
                </div>
              )}

              {/* Hotline button */}
              <a
                href="tel:19008686"
                title="Hotline đặt hàng: 1900 8686"
                aria-label="Gọi hotline 1900 8686"
                className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#96281b] hover:bg-[#7e2015] text-white flex items-center justify-center shadow-md transition-all shrink-0 active:scale-95"
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200 animate-pulse" />
              </a>
              <a
                href="tel:19008686"
                className="hidden lg:flex items-center gap-2 px-3.5 sm:px-5 py-2 rounded-full bg-[#96281b] hover:bg-[#7e2015] text-white shadow-md transition-all group shrink-0"
              >
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs sm:text-sm leading-tight tracking-wide font-serif">1900 8686</div>
                  <div className="text-[9px] text-amber-200/90 uppercase tracking-tight leading-none">Hotline đặt hàng</div>
                </div>
              </a>

              {/* Cart Trigger (Hidden on mobile < md because Bottom Nav has floating center Cart FAB) */}
              <button
                id="navbar-cart-btn"
                onClick={onOpenCart}
                aria-label="Giỏ hàng phở"
                className={`hidden md:flex relative p-1.5 sm:p-2 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-800 transition-all duration-200 border border-stone-300 hover:scale-105 active:scale-90 hover:shadow-md shrink-0 group cursor-pointer ${
                  isCartJiggling ? 'animate-cart-jiggle ring-2 ring-amber-400/80' : ''
                }`}
              >
                <ShoppingBag className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 ${
                  isCartJiggling ? 'text-[#96281b] scale-110' : 'group-hover:text-[#96281b] group-hover:-rotate-12'
                }`} />
                {cartCount > 0 && (
                  <span className={`absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#96281b] text-white text-[9px] sm:text-xs font-bold flex items-center justify-center shadow-md ${
                    isCartJiggling ? 'animate-gold-ripple scale-125' : 'animate-pulse'
                  } transition-transform`}>
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button (< md): Opens Khám Phá & Tiện Ích 1986 Bottom Sheet */}
              <button
                type="button"
                id="mobile-more-menu-btn"
                onClick={() => setMobileMoreSheetOpen(!mobileMoreSheetOpen)}
                className="md:hidden p-1.5 rounded-lg text-stone-800 hover:bg-stone-200/80 active:scale-95 shrink-0 cursor-pointer border border-stone-300/70"
                aria-label="Khám phá và tiện ích"
                title="Khám phá & Tiện ích 1986"
              >
                {mobileMoreSheetOpen ? (
                  <X className="w-5 h-5 text-[#9b2a1f]" />
                ) : (
                  <Menu className="w-5 h-5 text-stone-800" />
                )}
              </button>

              {/* Tablet Menu Button (md to xl): Toggles Drawer Menu */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="hidden md:flex xl:hidden p-1.5 sm:p-2 rounded-lg text-stone-800 hover:bg-stone-200 shrink-0 cursor-pointer border border-stone-300/70"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#9b2a1f]" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <NavbarMobileDrawer
            navItems={navItems}
            setActiveTab={setActiveTab}
            setMobileMenuOpen={setMobileMenuOpen}
            isAuthenticated={isAuthenticated}
            user={user}
            cardNumber={cardNumber}
            tierInfo={tierInfo}
            availablePoints={availablePoints}
            setMobileMemberSheetOpen={setMobileMemberSheetOpen}
            handleQuickReorder={handleQuickReorder}
            onOpenOrderHistory={onOpenOrderHistory}
            onOpenGiftVault={onOpenGiftVault}
            logout={logout}
            openAuthModal={openAuthModal}
            onToast={onToast}
          />
        )}
      </header>

      {/* 3. Mobile Bottom Navigation Bar */}
      <NavbarMobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCart={onOpenCart}
        cartCount={cartCount}
        isCartJiggling={isCartJiggling}
        isInitialized={isInitialized}
        isAuthenticated={isAuthenticated}
        user={user}
        tierInfo={tierInfo}
        setMobileMemberSheetOpen={setMobileMemberSheetOpen}
        openAuthModal={openAuthModal}
        mobileMoreSheetOpen={mobileMoreSheetOpen}
        setMobileMoreSheetOpen={setMobileMoreSheetOpen}
      />

      {/* 4. Mobile Member Bottom Sheet */}
      <NavbarMobileMemberSheet
        mobileMemberSheetOpen={mobileMemberSheetOpen}
        setMobileMemberSheetOpen={setMobileMemberSheetOpen}
        isAuthenticated={isAuthenticated}
        user={user}
        tierInfo={tierInfo}
        cardNumber={cardNumber}
        totalPoints={totalPoints}
        availablePoints={availablePoints}
        pointsToNext={pointsToNext}
        progressPercent={progressPercent}
        favoriteDish={favoriteDish}
        tasteSummary={tasteSummary}
        handleQuickReorder={handleQuickReorder}
        onOpenOrderHistory={onOpenOrderHistory}
        onOpenGiftVault={onOpenGiftVault}
        setActiveTab={setActiveTab}
        logout={logout}
        onToast={onToast}
      />

      {/* 5. Mobile More / Explore Bottom Sheet */}
      <NavbarMobileMoreSheet
        isOpen={mobileMoreSheetOpen}
        onClose={() => setMobileMoreSheetOpen(false)}
        setActiveTab={setActiveTab}
        onOpenOrder={onOpenOrder}
        onOpenGiftVault={onOpenGiftVault}
        onOpenOrderHistory={onOpenOrderHistory}
        isAuthenticated={isAuthenticated}
        user={user}
        tierInfo={tierInfo}
        openAuthModal={openAuthModal}
        logout={logout}
        onToast={onToast}
      />
    </>
  );
}

export default React.memo(Navbar);

import React from 'react';
import {
  Home,
  Utensils,
  ShoppingBag,
  User,
  Compass
} from 'lucide-react';

export default function NavbarMobileBottomNav({
  activeTab,
  setActiveTab,
  onOpenCart,
  cartCount,
  isCartJiggling,
  isInitialized,
  isAuthenticated,
  user,
  tierInfo,
  setMobileMemberSheetOpen,
  openAuthModal,
  mobileMoreSheetOpen,
  setMobileMoreSheetOpen
}) {
  return (
    <nav 
      aria-label="Thanh điều hướng di động"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#f7f4ed]/95 backdrop-blur-md border-t border-stone-300/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1.5 pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* Tab 1: Trang chủ */}
        <a
          href="#hero"
          onClick={() => setActiveTab('hero')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'hero' ? 'text-[#9b2a1f]' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className={`text-[10px] ${activeTab === 'hero' ? 'font-bold' : 'font-medium'}`}>Trang chủ</span>
        </a>

        {/* Tab 2: Thực đơn */}
        <a
          href="#menu"
          onClick={() => setActiveTab('menu')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'menu' ? 'text-[#9b2a1f]' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Utensils className="w-5 h-5 mb-0.5" />
          <span className={`text-[10px] ${activeTab === 'menu' ? 'font-bold' : 'font-medium'}`}>Thực đơn</span>
        </a>

        {/* Tab 3: Giỏ hàng (Floating Center Elevated Button) */}
        <div className="flex flex-col items-center -mt-5">
          <button
            onClick={onOpenCart}
            aria-label="Xem giỏ hàng"
            className={`relative w-12 h-12 rounded-full bg-gradient-to-tr from-[#9b2a1f] to-[#b33324] text-amber-100 flex items-center justify-center shadow-lg border-2 border-[#f7f4ed] hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              isCartJiggling ? 'animate-cart-jiggle ring-2 ring-amber-400' : ''
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-[#7a1c12] text-[10px] font-black flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </button>
          <span className="text-[10px] font-bold text-[#9b2a1f] mt-0.5">Giỏ hàng</span>
        </div>

        {/* Tab 4: Hội viên / Bát quen */}
        <button
          onClick={() => {
            if (!isInitialized) return;
            if (isAuthenticated && user) {
              setMobileMemberSheetOpen(true);
            } else {
              openAuthModal('login');
            }
          }}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-stone-600 hover:text-stone-900 transition-all relative cursor-pointer"
        >
          {isAuthenticated && user ? (
            <div className="relative">
              <div className="w-5 h-5 rounded-full bg-[#9b2a1f] text-amber-200 text-[10px] font-bold flex items-center justify-center font-serif">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="absolute -bottom-1 -right-1 text-[8px] leading-none">
                {tierInfo.icon}
              </span>
            </div>
          ) : !isInitialized ? (
            <div className="w-5 h-5 rounded-full bg-stone-300/60 animate-pulse mb-0.5" />
          ) : (
            <User className="w-5 h-5 mb-0.5" />
          )}
          <span className="text-[10px] font-medium mt-0.5">
            {isAuthenticated && user ? 'Bát quen' : !isInitialized ? '...' : 'Hội viên'}
          </span>
        </button>

        {/* Tab 5: Khám phá / Tiện ích */}
        <button
          type="button"
          onClick={() => setMobileMoreSheetOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            mobileMoreSheetOpen ? 'text-[#9b2a1f]' : 'text-stone-600 hover:text-stone-900'
          }`}
          aria-label="Khám phá và tiện ích"
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className={`text-[10px] ${mobileMoreSheetOpen ? 'font-bold' : 'font-medium'}`}>Khám phá</span>
        </button>
      </div>
    </nav>
  );
}

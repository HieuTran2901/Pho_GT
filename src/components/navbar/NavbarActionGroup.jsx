import { memo } from 'react';
import { Gift, ShoppingBag, Menu, X, Compass, Phone } from 'lucide-react';

function NavbarActionGroup({
  user,
  cartCount,
  isCartJiggling,
  onOpenCart,
  onOpenGiftVault,
  onStartTour,
  mobileMoreSheetOpen,
  toggleMobileMoreSheet,
  mobileMenuOpen,
  toggleMobileMenu
}) {
  return (
    <>
      {/* Nút Khám Phá Tour Tiểu Nhị 1986 */}
      <button
        type="button"
        onClick={onStartTour}
        id="navbar-tour-guide-btn"
        title="Hướng dẫn khám phá quán (Tiểu Nhị 1986)"
        aria-label="Hướng dẫn khám phá quán"
        className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/50 bg-amber-50/80 hover:bg-amber-100/90 text-[#8a1e14] hover:border-[#8a1e14] text-xs font-serif font-bold tracking-wide transition-all shadow-xs hover:shadow-md active:scale-95 group cursor-pointer whitespace-nowrap"
      >
        <Compass className="w-3.5 h-3.5 text-[#8a1e14] group-hover:rotate-45 transition-transform duration-300" />
        <span className="text-[11px]">Khám phá quán</span>
      </button>

      {/* Kho quà button */}
      <button
        type="button"
        onClick={onOpenGiftVault}
        id="navbar-gift-vault-btn"
        title="Khám phá kho quà tri ân"
        aria-label="Khám phá kho quà tri ân"
        className="hidden md:flex relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-r from-amber-50 to-orange-50/90 hover:from-amber-100 hover:to-orange-100 border border-amber-500/60 hover:border-[#8a1e14] text-[#8a1e14] items-center justify-center shadow-xs hover:shadow-md transition-all shrink-0 active:scale-95 group cursor-pointer"
      >
        <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8a1e14] group-hover:scale-110 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 border border-white animate-pulse" />
      </button>

      {/* Hotline button */}
      <a
        href="tel:19008686"
        title="Hotline đặt hàng: 1900 8686"
        aria-label="Gọi hotline 1900 8686"
        className={`${user ? 'min-[1320px]:hidden ' : ''}w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#96281b] hover:bg-[#7e2015] text-white flex items-center justify-center shadow-md transition-all shrink-0 active:scale-95 group`}
      >
        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200 animate-pulse group-hover:rotate-12 transition-transform" />
      </a>
      {user && (
        <a
          href="tel:19008686"
          className="hidden min-[1320px]:flex items-center gap-2 px-3.5 2xl:px-5 py-2 rounded-full bg-[#96281b] hover:bg-[#7e2015] text-white shadow-md transition-all group shrink-0"
        >
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
            <Phone className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
          </div>
          <div className="text-left">
            <div className="font-bold text-xs sm:text-sm leading-tight tracking-wide font-serif">1900 8686</div>
            <div className="text-[9px] text-amber-200/90 uppercase tracking-tight leading-none">Hotline đặt hàng</div>
          </div>
        </a>
      )}

      {/* Cart Trigger */}
      <button
        id="navbar-cart-btn"
        onClick={onOpenCart}
        aria-label="Giỏ hàng phở"
        title="Xem giỏ hàng"
        className={`hidden md:flex relative p-1.5 sm:p-2 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-800 transition-all duration-200 border border-stone-300 hover:scale-105 active:scale-90 hover:shadow-md shrink-0 group cursor-pointer mr-2 sm:mr-3 xl:mr-5 2xl:mr-7 ${
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

      {/* Mobile Menu Button (< md) */}
      <button
        type="button"
        id="mobile-more-menu-btn"
        onClick={toggleMobileMoreSheet}
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

      {/* Tablet Menu Button (md to xl) */}
      <button
        type="button"
        onClick={toggleMobileMenu}
        className="hidden md:flex xl:hidden p-1.5 sm:p-2 rounded-lg text-stone-800 hover:bg-stone-200 shrink-0 cursor-pointer border border-stone-300/70 mr-1 sm:mr-2"
        aria-label="Menu"
      >
        {mobileMenuOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#9b2a1f]" />
        ) : (
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </button>
    </>
  );
}

export default memo(NavbarActionGroup);

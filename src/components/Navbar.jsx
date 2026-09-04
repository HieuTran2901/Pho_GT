import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  Utensils, 
  Star, 
  MessageSquareQuote, 
  Bike, 
  User, 
  Phone, 
  ShoppingBag, 
  Menu, 
  X, 
  Clock, 
  MapPin, 
  Gift,
  Sparkles,
  LogOut,
  ChevronDown,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: 'hero', label: 'TRANG CHỦ', icon: Home, href: '#hero' },
  { id: 'menu', label: 'THỰC ĐƠN', icon: Utensils, href: '#menu' },
  { id: 'story', label: 'BÍ QUYẾT 1986', icon: Star, href: '#story' },
  { id: 'reviews', label: 'THỰC KHÁCH NÓI GÌ', icon: MessageSquareQuote, href: '#reviews' },
  { id: 'order', label: 'ĐẶT BÀN & GIAO TẬN NƠI', icon: Bike, href: '#order' },
];

function Navbar({ cartCount, onOpenCart, onOpenOrder, isCartJiggling, onToast }) {
  const [activeTab, setActiveTab] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const navItems = NAV_ITEMS;

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
    <header className="fixed top-0 left-0 right-0 z-50 font-sans shadow-md">
      {/* 1. Top vintage announcement bar */}
      <div className="bg-[#1b261d] text-amber-100/90 text-xs py-2 px-4 sm:px-8 border-b border-amber-900/30">
        <div className="max-w-[1700px] mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              06:00 – 22:30 mỗi ngày
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-stone-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              10 Chi nhánh tại Hà Nội & TP. Hồ Chí Minh
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-300 text-xs font-medium">
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span>Ưu đãi hôm nay: Tặng 1 đĩa quẩy giòn khi đặt qua website</span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar (Creamy vintage parchment background) */}
      <div className="bg-[#f7f4ed]/95 backdrop-blur-md border-b border-stone-300/80 px-4 sm:px-8 py-3">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
          
          {/* Logo Section */}
          <a href="#hero" className="flex items-center gap-3 shrink-0 group">
            {/* Vintage Round Seal */}
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border-2 border-[#9b2a1f] p-0.5 flex items-center justify-center bg-white shadow-sm group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full border border-dashed border-[#9b2a1f] flex flex-col items-center justify-center text-[#9b2a1f] leading-none py-1">
                <span className="text-[8px] font-bold uppercase tracking-tighter">SINCE</span>
                <Utensils className="w-4 h-4 my-0.5" />
                <span className="text-[8px] font-bold">1986</span>
              </div>
            </div>

            <div className="text-left">
              <div className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#223326] leading-none">
                PHỞ GIA TRUYỀN
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-serif text-[#9b2a1f] tracking-wider uppercase font-semibold mt-1">
                <span className="w-4 h-px bg-[#9b2a1f]/60"></span>
                <span>TINH HOA PHỞ VIỆT TỪ NĂM 1986</span>
                <span className="w-4 h-px bg-[#9b2a1f]/60"></span>
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
                      <span className="w-6 h-0.5 bg-[#9b2a1f] rounded-full mt-0.5"></span>
                    )}
                  </a>
                  {idx < navItems.length - 1 && (
                    <span className="w-px h-6 bg-stone-300/80 mx-1"></span>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Actions: Login + Hotline + Cart */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Login / Member Profile Section */}
            {isAuthenticated && user ? (
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 hover:to-amber-100 text-[#2b1810] text-xs font-serif font-bold transition-all shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-[#8a1e14] text-white flex items-center justify-center text-[10px] font-sans">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left leading-tight">
                    <div className="text-xs font-bold truncate max-w-[110px]">{user.fullName}</div>
                    <div className="text-[10px] text-[#8a1e14] font-sans font-semibold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                      <span>{user.loyaltyAccount?.availablePoints || 50}đ Tri Kỷ</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Member Dropdown Popup */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#fbf9f4] border-2 border-[#8a1e14]/40 shadow-xl py-2 z-50 animate-fadeIn text-xs">
                    <div className="px-4 py-2 border-b border-[#e2d5be] bg-[#f2e7d5]/60">
                      <div className="font-serif font-bold text-[#2b1810] text-sm">{user.fullName}</div>
                      <div className="text-stone-600 text-[11px]">{user.phone}</div>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-[#8a1e14] text-[10px] font-bold">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>Hạng {user.loyaltyAccount?.membershipTier || 'ĐỒNG'} • {user.loyaltyAccount?.availablePoints || 50} Điểm</span>
                      </div>
                    </div>

                    {user.tasteProfile && (
                      <div className="px-4 py-2.5 border-b border-[#e2d5be] text-[11px] text-stone-700 space-y-1">
                        <div className="font-serif font-bold text-[#8a1e14] flex items-center gap-1">
                          <Bookmark className="w-3 h-3" />
                          <span>Gu Ăn Phở Đã Lưu:</span>
                        </div>
                        <div className="text-stone-600 italic">
                          {user.tasteProfile.customNote || "Chuẩn vị truyền thống 1986"}
                        </div>
                      </div>
                    )}

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          if (onToast) onToast('Bạn đã đăng xuất tài khoản thành công!');
                        }}
                        className="w-full text-left px-4 py-2 text-red-700 hover:bg-red-50 flex items-center gap-2 font-serif font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Đăng xuất tài khoản</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-[#8a1e14]/40 bg-white hover:bg-amber-50/60 text-[#8a1e14] text-xs font-serif font-bold tracking-wider uppercase transition-all shadow-xs group"
              >
                <User className="w-3.5 h-3.5 text-[#8a1e14]" />
                <span>ĐĂNG NHẬP</span>
              </button>
            )}

            {/* Hotline button */}
            <a
              href="tel:19008686"
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-[#96281b] hover:bg-[#7e2015] text-white shadow-md transition-all group"
            >
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
              </div>
              <div className="text-left">
                <div className="font-bold text-xs sm:text-sm leading-tight tracking-wide font-serif">1900 8686</div>
                <div className="text-[9px] text-amber-200/90 uppercase tracking-tight leading-none">Hotline đặt hàng</div>
              </div>
            </a>

            {/* Cart Trigger with Smooth Click & Jiggle Micro-Interaction */}
            <button
              id="navbar-cart-btn"
              onClick={onOpenCart}
              aria-label="Giỏ hàng phở"
              className={`relative p-2 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-800 transition-all duration-200 border border-stone-300 hover:scale-105 active:scale-90 hover:shadow-md group ${
                isCartJiggling ? 'animate-cart-jiggle ring-2 ring-amber-400/80' : ''
              }`}
            >
              <ShoppingBag className={`w-5 h-5 transition-all duration-200 ${
                isCartJiggling ? 'text-[#96281b] scale-110' : 'group-hover:text-[#96281b] group-hover:-rotate-12'
              }`} />
              {cartCount > 0 && (
                <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#96281b] text-white text-xs font-bold flex items-center justify-center shadow-md ${
                  isCartJiggling ? 'animate-gold-ripple scale-125' : 'animate-pulse'
                } transition-transform`}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-stone-800 hover:bg-stone-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
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
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-300">
                <div className="font-serif font-bold text-[#8a1e14]">{user.fullName}</div>
                <div className="text-xs text-stone-600">{user.phone} • {user.loyaltyAccount?.availablePoints || 50}đ Tri Kỷ</div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    if (onToast) onToast('Bạn đã đăng xuất tài khoản thành công!');
                  }}
                  className="mt-2 text-xs text-red-700 font-bold flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#8a1e14] text-white font-serif font-bold text-sm flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>ĐĂNG NHẬP / ĐĂNG KÝ THÀNH VIÊN</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default React.memo(Navbar);

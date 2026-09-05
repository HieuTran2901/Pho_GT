import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Zap,
  ArrowRight,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: 'hero', label: 'TRANG CHỦ', icon: Home, href: '#hero' },
  { id: 'menu', label: 'THỰC ĐƠN', icon: Utensils, href: '#menu' },
  { id: 'story', label: 'BÍ QUYẾT 1986', icon: Star, href: '#story' },
  { id: 'reviews', label: 'THỰC KHÁCH NÓI GÌ', icon: MessageSquareQuote, href: '#reviews' },
  { id: 'order', label: 'ĐẶT BÀN & GIAO TẬN NƠI', icon: Bike, href: '#order' },
];

const TIER_CONFIG = {
  DONG: {
    name: 'Khởi Vị',
    title: 'BẠN KHỞI VỊ',
    badge: 'Khởi Vị',
    icon: '🌱',
    target: 500,
    nextTier: 'Bạn Đũa',
    nextGift: 'Dĩa Quẩy Giòn Hoa Mai',
    giftPoints: 200,
    perk: 'Ghi nhớ khẩu vị ruột & Tặng 50đ Tri Kỷ',
  },
  BAC: {
    name: 'Bạn Đũa',
    title: 'BẠN ĐŨA QUEN QUÁN',
    badge: 'Bạn Đũa',
    icon: '🥢',
    target: 1000,
    nextTier: 'Tri Kỷ',
    nextGift: 'Trứng Chần Nước Béo & Trà Lài',
    giftPoints: 750,
    perk: 'Tặng quẩy giòn mỗi bát & Miễn phí trà thơm',
  },
  VANG: {
    name: 'Tri Kỷ',
    title: 'BẠN TRI KỶ HÀ THÀNH',
    badge: 'Tri Kỷ',
    icon: '⚜️',
    target: 2000,
    nextTier: 'Nghệ Nhân',
    nextGift: 'Phở Thố Đá Bào Ngư Thượng Hạng',
    giftPoints: 1500,
    perk: 'Ưu tiên xếp bàn góc phố & Tùy biến nước dùng',
  },
  KIM_CUONG: {
    name: 'Nghệ Nhân',
    title: 'NGHỆ NHÂN THƯỞNG VỊ 1986',
    badge: 'Thượng Khách',
    icon: '👑',
    target: 2000,
    nextTier: 'Nghệ Nhân',
    nextGift: 'Bảo Lưu Đặc Quyền Thượng Hạng',
    giftPoints: 2000,
    perk: 'Bàn danh dự bảo lưu & Thưởng phở Đệ Nhất',
  },
};

const BROTH_LABELS = {
  BEO_NGAY: 'Nước béo ngậy',
  DAM_DA: 'Nước đậm đà',
  THANH: 'Nước thanh trong'
};

function Navbar({ cartCount, onOpenCart, onOpenOrder, onAddToCart, isCartJiggling, onToast }) {
  const [activeTab, setActiveTab] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const navItems = NAV_ITEMS;

  // Membership calculations
  const tierKey = user?.loyaltyAccount?.membershipTier || 'DONG';
  const tierInfo = TIER_CONFIG[tierKey] || TIER_CONFIG.DONG;
  const totalPoints = user?.loyaltyAccount?.totalPoints || 50;
  const availablePoints = user?.loyaltyAccount?.availablePoints || 50;
  const pointsToNext = Math.max(0, tierInfo.target - totalPoints);
  const progressPercent = Math.min(100, Math.round((totalPoints / tierInfo.target) * 100));
  const cardNumber = user?.phone ? `#VIP-1986-${user.phone.replace(/\D/g, '').slice(-4) || '8888'}` : '#VIP-1986-8888';

  // 1-Click Quick Reorder handler
  const handleQuickReorder = useCallback(() => {
    if (onAddToCart) {
      const favoriteDish = {
        id: 'fav_pho_' + (user?.tasteProfile?.favoriteDishId || Date.now()),
        name: user?.tasteProfile?.favoriteDishName || 'Phở Bò Tái Nạm Gầu Giòn 1986',
        price: 85000,
        image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80',
        customNote: user?.tasteProfile?.customNote || 'Chuẩn vị truyền thống 1986 (Đã lưu)'
      };
      onAddToCart(favoriteDish);
      setUserDropdownOpen(false);
      setMobileMenuOpen(false);
      if (onToast) onToast(`Đã thêm bát phở ruột vào giỏ hàng thành công!`);
    } else if (onOpenCart) {
      onOpenCart();
    }
  }, [user, onAddToCart, onOpenCart, onToast]);

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
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#d49e58]/50 bg-gradient-to-r from-amber-50/90 via-orange-50/80 to-amber-100/90 hover:border-[#c88d2b] text-[#2b1810] text-xs font-serif font-bold transition-all shadow-xs group"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#9b2a1f] to-[#6a150c] text-amber-200 flex items-center justify-center text-xs font-bold font-serif shadow-xs ring-1 ring-[#e4aa65]/60">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left leading-tight">
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
                  <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180 text-[#8a1e14]' : ''}`} />
                </button>

                {/* Member Dropdown Popup: Khánh Vàng Hoàng Phái (Phương Án 1: 380px × 330px) */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-[380px] rounded-2xl bg-gradient-to-b from-[#240e0a] via-[#1a0906] to-[#120504] border border-[#d49e58]/60 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_25px_rgba(212,158,88,0.2)] overflow-hidden z-50 animate-dropdown-heritage text-xs">
                    
                    {/* HÀNG 1: KIM BÀI DANH DỰ (HEADER LUXURY) */}
                    <div className="p-3.5 bg-gradient-to-r from-[#42130c] via-[#2d0d08] to-[#1a0704] border-b border-amber-500/30 relative overflow-hidden">
                      {/* Vệt ánh sáng hoàng gia chìm */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/10 to-transparent pointer-events-none"></div>

                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar với vương miện mạ vàng */}
                          <div className="relative shrink-0">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#ffd97a] via-[#c88d2b] to-[#6a3c0a] p-0.5 shadow-md">
                              <div className="w-full h-full rounded-full bg-[#1e0a07] text-amber-300 flex items-center justify-center font-serif font-black text-sm shadow-inner">
                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                              </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 border border-[#1e0a07] flex items-center justify-center text-[10px] shadow" title={tierInfo.name}>
                              {tierInfo.icon}
                            </div>
                          </div>

                          {/* Tên & Danh hiệu */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-sm text-white truncate max-w-[140px]">
                                {user.fullName || 'Quý Khách'}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-red-900/90 border border-red-500/60 text-red-200 font-serif text-[9px] font-bold uppercase tracking-wider shadow-sm shrink-0">
                                TRI KỶ 1986
                              </span>
                            </div>
                            <div className="text-[11px] font-serif font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ffe8b3] via-[#e2b364] to-[#ffcf66] mt-0.5 flex items-center gap-1">
                              <span>⚜️</span>
                              <span className="truncate">{tierInfo.title}</span>
                            </div>
                          </div>
                        </div>

                        {/* Thẻ số VIP định dạng kim bài */}
                        <div className="text-right shrink-0">
                          <span className="px-2 py-1 rounded-md bg-black/50 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold tracking-wider shadow-inner block text-center">
                            {cardNumber}
                          </span>
                          <span className="text-[8px] text-amber-400/70 font-serif italic mt-0.5 block text-center">
                            Thành viên 1986
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* HÀNG 2: THƯỚC ĐO HÀNH TRÌNH TRI KỶ (MICRO MILESTONE BAR) */}
                    <div className="px-4 py-2.5 bg-black/40 border-b border-amber-900/40">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                          <span className="text-stone-300">Điểm ngự:</span>
                          <span className="text-amber-300 font-mono font-bold text-xs">{availablePoints} Điểm</span>
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {pointsToNext > 0 ? (
                            <span>Thăng hạng <strong className="text-amber-300">"{tierInfo.nextTier}"</strong>: còn <strong className="text-amber-300 font-mono">{pointsToNext}đ</strong></span>
                          ) : (
                            <span className="text-amber-300 font-semibold">Đỉnh Thượng Khách</span>
                          )}
                        </div>
                      </div>

                      {/* Thanh tiến độ dày dặn, khảm ánh kim */}
                      <div className="w-full h-2 bg-stone-900/90 rounded-full overflow-hidden p-0.5 border border-amber-500/20 shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-[#9b2a1f] via-[#d49e58] to-[#ffd700] rounded-full shadow-[0_0_8px_rgba(212,158,88,0.6)] transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>

                      {/* Mốc quà tặng sắp tới */}
                      <div className="flex items-center justify-between mt-2 text-[10px]">
                        <span className="text-stone-300 flex items-center gap-1.5 truncate max-w-[240px]">
                          <span>🎁</span>
                          <span>Mốc {tierInfo.giftPoints}đ: <strong className="text-amber-200 font-normal">{tierInfo.nextGift}</strong></span>
                        </span>
                        <a
                          href="#menu"
                          onClick={() => setUserDropdownOpen(false)}
                          className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors shrink-0"
                        >
                          <span>Đổi quà</span>
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* HÀNG 3: BÁT PHỞ RUỘT KHẨU VỊ (ĐẦY ĐỦ KHÔNG BỊ CẮT CHỮ) */}
                    <div className="p-3 bg-gradient-to-b from-[#2a100a] to-[#190704]">
                      <div className="rounded-xl p-2.5 bg-gradient-to-r from-[#38150d] via-[#240c07] to-[#1c0805] border border-amber-500/35 shadow-md hover:border-amber-400/60 transition-all group">
                        <div className="flex items-center gap-3">
                          {/* Ảnh bát phở 52px rộng rãi có viền vàng & bốc khói */}
                          <div className="relative shrink-0 w-[52px] h-[52px] rounded-xl overflow-hidden border border-amber-400/50 shadow-md">
                            <img
                              src="https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=200&q=80"
                              alt="Bát phở ruột"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                            <span className="absolute bottom-0.5 right-1 text-[9px]">♨️</span>
                          </div>

                          {/* Tên trọn vẹn 100% & Giá & Gu vị */}
                          <div className="min-w-0 flex-1">
                            <div className="font-serif font-bold text-[13px] text-white group-hover:text-amber-200 transition-colors leading-snug truncate">
                              {user.tasteProfile?.favoriteDishName || 'Phở Bò Tái Nạm Gầu Giòn 1986'}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-amber-400 font-mono font-bold text-xs">85.000đ</span>
                              <span className="w-1 h-1 rounded-full bg-stone-600"></span>
                              <span className="text-[10px] text-stone-300 bg-black/40 px-1.5 py-0.5 rounded border border-white/5 truncate max-w-[130px]">
                                🍲 {user.tasteProfile?.brothType ? (BROTH_LABELS[user.tasteProfile.brothType] || user.tasteProfile.brothType) : 'Nước đậm đà'}
                              </span>
                            </div>
                          </div>

                          {/* Nút 1-Click Đặt Ngay Nổi Bật */}
                          <button
                            onClick={handleQuickReorder}
                            className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#9b2a1f] via-[#b53225] to-[#7f1d14] hover:from-[#b53225] hover:to-[#912217] text-[#fff6e8] font-serif font-bold text-xs shadow-lg shadow-red-950/80 border border-amber-400/40 flex items-center gap-1.5 shrink-0 active:scale-95 transition-all group-hover:shadow-[0_0_15px_rgba(155,42,31,0.6)]"
                            title="Đặt lại bát phở ruột vào giỏ hàng ngay lập tức"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition-transform" />
                            <span className="tracking-wide">Đặt lại</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* HÀNG 4: FOOTER TIỆN ÍCH LƯỚI NGANG 3 CỘT */}
                    <div className="grid grid-cols-3 border-t border-amber-900/40 bg-[#0d0403] text-[11px] divide-x divide-white/5 text-center">
                      <a
                        href="#order"
                        onClick={() => setUserDropdownOpen(false)}
                        className="py-2.5 px-2 hover:bg-white/5 text-stone-300 hover:text-amber-200 transition-colors flex items-center justify-center gap-1.5 font-medium"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>{user.loyaltyAccount?.totalOrdersCount || 0} đơn hàng</span>
                      </a>

                      <a
                        href="#menu"
                        onClick={() => setUserDropdownOpen(false)}
                        className="py-2.5 px-2 hover:bg-white/5 text-stone-300 hover:text-amber-200 transition-colors flex items-center justify-center gap-1.5 font-medium"
                      >
                        <Gift className="w-3.5 h-3.5 text-amber-400" />
                        <span>Kho quà</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          if (onToast) onToast('Bạn đã đăng xuất tài khoản thành công!');
                        }}
                        className="py-2.5 px-2 hover:bg-red-950/40 text-red-400 hover:text-red-300 font-medium transition-colors flex items-center justify-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Đăng xuất</span>
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
              <div className="rounded-2xl bg-[#241712] border border-[#a63a2b]/70 overflow-hidden shadow-lg text-xs">
                <div className="p-3.5 bg-gradient-to-br from-[#4a1812] via-[#2f100c] to-[#1e0a07] text-[#fef3e2]">
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
                </div>

                {/* Mobile Quick Reorder Button */}
                <div className="p-2.5 bg-[#2c1b14] space-y-2">
                  <button
                    onClick={handleQuickReorder}
                    className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[#9b2a1f] to-[#7f1d14] text-amber-100 font-serif font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>1-Click Đặt Lại Bát Ruột</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      if (onToast) onToast('Bạn đã đăng xuất tài khoản thành công!');
                    }}
                    className="w-full py-1.5 text-xs text-red-400 hover:text-red-300 font-bold flex items-center justify-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng xuất tài khoản</span>
                  </button>
                </div>
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

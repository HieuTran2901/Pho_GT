import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  DAM_DA: 'Nước đậm',
  THANH: 'Nước thanh'
};

const ONION_LABELS = {
  HANH_TRAN: 'Hành trần',
  NHIEU_HANH: 'Nhiều hành',
  IT_HANH: 'Ít hành',
  DAU_HANH: 'Đầu hành giòn'
};

const HERB_LABELS = {
  DU_RAU: 'Đủ rau thơm',
  KHONG_RAU_MUI: 'Không rau mùi',
  KHONG_HANH_TAY: 'Không hành tây'
};

const CRULLER_LABELS = {
  QUAY_GION: 'Thêm quẩy',
  QUAY_MEM: 'Quẩy mềm',
  KHONG_QUAY: 'Không quẩy'
};

function Navbar({ cartCount, onOpenCart, onOpenOrder, onAddToCart, isCartJiggling, onToast }) {
  const [activeTab, setActiveTab] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMemberSheetOpen, setMobileMemberSheetOpen] = useState(false);
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

  // Dynamic taste summary for "GU PHỞ CỦA TÔI"
  const tasteSummary = [
    user?.tasteProfile?.brothType ? (BROTH_LABELS[user.tasteProfile.brothType] || user.tasteProfile.brothType) : 'Nước đậm',
    user?.tasteProfile?.onionStyle ? (ONION_LABELS[user.tasteProfile.onionStyle] || user.tasteProfile.onionStyle) : 'Nhiều hành',
    user?.tasteProfile?.herbStyle ? (HERB_LABELS[user.tasteProfile.herbStyle] || user.tasteProfile.herbStyle) : 'Không rau mùi',
    user?.tasteProfile?.crullerPref ? (CRULLER_LABELS[user.tasteProfile.crullerPref] || user.tasteProfile.crullerPref) : 'Thêm quẩy'
  ].join(' • ');

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
          {/* Mobile view: single clean non-overflow line */}
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

      {/* 2. Main Navigation Bar (Creamy vintage parchment background) */}
      <div className="bg-[#f7f4ed]/95 backdrop-blur-md border-b border-stone-300/80 px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3 w-full max-w-full">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-1.5 sm:gap-4 w-full">
          
          {/* Logo Section */}
          <a href="#hero" className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 min-w-0 group">
            {/* Vintage Round Seal */}
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
                <span className="hidden sm:inline-block w-2.5 md:w-4 h-px bg-[#9b2a1f]/60"></span>
                <span className="sm:hidden">TINH HOA TỪ 1986</span>
                <span className="hidden sm:inline">TINH HOA PHỞ VIỆT TỪ NĂM 1986</span>
                <span className="hidden sm:inline-block w-2.5 md:w-4 h-px bg-[#9b2a1f]/60"></span>
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
          <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">
            {/* Login / Member Profile Section */}
            {isAuthenticated && user ? (
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-[#d49e58]/50 bg-gradient-to-r from-amber-50/90 via-orange-50/80 to-amber-100/90 hover:border-[#c88d2b] text-[#2b1810] text-xs font-serif font-bold transition-all shadow-xs group"
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

                {/* Member Dropdown Popup: Bàn Tiệc Di Sản Bento-Grid (Thiết Kế Đỉnh Cao Phở 1986) */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-[560px] max-w-[calc(100vw-24px)] rounded-2xl bg-gradient-to-b from-[#1c100c] via-[#160b08] to-[#0f0604] border border-[#c88d2b]/60 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(200,141,43,0.2)] overflow-hidden z-50 animate-dropdown-heritage text-xs">
                    
                    {/* HÀNG 1: HEADER DANH KHÁCH VỚI BỨC HỌA PHỐ CỔ 1986 */}
                    <div className="relative p-4 bg-gradient-to-r from-[#38140e] via-[#260e09] to-[#180805] border-b border-amber-900/50 overflow-hidden">
                      {/* Bức họa kiến trúc Phố Cổ Hà Nội nét chì chìm phía sau */}
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
                          {/* Avatar vòng khuyên vàng hoàng gia */}
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ffd97a] via-[#c88d2b] to-[#6a3c0a] p-0.5 shadow-lg shrink-0">
                            <div className="w-full h-full rounded-full bg-[#180704] text-amber-300 flex items-center justify-center font-serif font-black text-xl shadow-inner border border-amber-900/60">
                              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'H'}
                            </div>
                          </div>

                          {/* Tên + Dấu chiện đỏ + Danh vị */}
                          <div className="min-w-0">
                            <h3 className="font-serif font-bold text-lg sm:text-xl text-[#f7ede2] leading-tight truncate">
                              {user.fullName || 'Hiếu Trần'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {/* Dấu Chiện Son */}
                              <span className="px-2.5 py-0.5 rounded-full bg-[#6a150c]/90 border border-red-500/60 text-red-200 font-serif text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                                <span>🌸</span>
                                <span>TRI KỶ 1986</span>
                              </span>
                              {/* Cấp bậc */}
                              <span className="text-xs font-serif font-semibold text-amber-300/90 flex items-center gap-1">
                                <span>{tierInfo.icon}</span>
                                <span>{tierInfo.title || 'Bạn Khởi Vị'}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Huy hiệu thành viên 1986 */}
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

                    {/* NỘI DUNG BENTO GRID (KHỐI THÂN) */}
                    <div className="p-3.5 space-y-3">
                      
                      {/* BENTO ROW 1: ĐIỂM TRI KỶ & THƯỚC ĐO THĂNG HẠNG */}
                      <div className="rounded-xl p-3 bg-black/40 border border-amber-900/40 flex items-center gap-4">
                        {/* Cột Điểm Tri Kỷ */}
                        <div className="text-center shrink-0 min-w-[90px] pr-3 border-r border-amber-900/40">
                          <div className="text-[9px] text-amber-400/90 font-serif font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                            <span>⟡</span> <span>ĐIỂM TRI KỶ</span> <span>⟡</span>
                          </div>
                          <div className="text-3xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 leading-none mt-1">
                            {availablePoints}
                          </div>
                          <div className="text-[10px] text-stone-400 font-serif mt-0.5">điểm</div>
                        </div>

                        {/* Cột Slider Thăng Hạng */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-xs font-serif font-bold mb-1.5">
                            <span className="text-[#f7ede2]">{tierInfo.name || 'Bạn Khởi Vị'}</span>
                            <span className="text-amber-300 flex items-center gap-1">
                              <span>🍜</span>
                              <span>{tierInfo.nextTier || 'Bạn Đũa'}</span>
                            </span>
                          </div>

                          {/* Slider Track với Nút Ngọc Khảm Kim Cương */}
                          <div className="relative w-full h-2 bg-stone-900 rounded-full my-2 border border-white/5">
                            <div
                              className="h-full bg-gradient-to-r from-[#c88d2b] to-[#ffd700] rounded-full shadow-[0_0_8px_rgba(200,141,43,0.7)] transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                            {/* Nút chỉ vị trí ngọc tròn có kim cương */}
                            <div
                              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#180f0b] border-2 border-amber-300 shadow-[0_0_8px_rgba(255,215,0,0.9)] flex items-center justify-center -ml-2"
                              style={{ left: `${progressPercent}%` }}
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
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

                      {/* BENTO ROW 2: CẶP CARD ĐÔI (QUÀ TIẾP THEO & BÁT QUEN CỦA BẠN) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        
                        {/* Card 1: Quà Tiếp Theo */}
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

                        {/* Card 2: Bát Quen Của Bạn (Bát Phở Ruột) */}
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

                          {/* Nút Gọi lại bát quen */}
                          <button
                            onClick={handleQuickReorder}
                            className="px-2.5 py-2.5 rounded-xl bg-gradient-to-b from-[#8a1f18] to-[#68140e] hover:from-[#a3251e] hover:to-[#7f1912] border border-amber-500/40 text-amber-100 flex flex-col items-center justify-center shrink-0 min-w-[72px] shadow-md transition-all active:scale-95 group/btn"
                            title="Gọi lại bát phở ruột ngay lập tức"
                          >
                            <span className="text-sm leading-none group-hover/btn:scale-110 transition-transform">🍲</span>
                            <span className="text-[11px] font-serif font-bold leading-tight mt-1 text-center">Gọi lại</span>
                            <span className="text-[9px] text-amber-200/80 font-normal leading-tight">bát quen</span>
                          </button>
                        </div>

                      </div>

                      {/* BENTO ROW 3: GU PHỞ CỦA TÔI */}
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

                    {/* HÀNG 4: FOOTER TIỆN ÍCH 4 CỘT */}
                    <div className="grid grid-cols-4 border-t border-amber-900/40 bg-[#0c0503] text-stone-300 text-[11px] py-2.5 divide-x divide-white/5 text-center">
                      <a
                        href="#order"
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
                        href="#order"
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
                        className="px-1 hover:text-red-300 transition-colors flex flex-col items-center justify-center group text-red-400"
                      >
                        <LogOut className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform mb-0.5" />
                        <span className="font-bold text-xs">Đăng xuất</span>
                        <span className="text-[9px] text-red-400/70">Thoát tài khoản</span>
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

            {/* Hotline button - Compact circular on mobile & tablet, full on desktop */}
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

            {/* Cart Trigger with Smooth Click & Jiggle Micro-Interaction */}
            <button
              id="navbar-cart-btn"
              onClick={onOpenCart}
              aria-label="Giỏ hàng phở"
              className={`relative p-1.5 sm:p-2 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-800 transition-all duration-200 border border-stone-300 hover:scale-105 active:scale-90 hover:shadow-md shrink-0 group ${
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 sm:p-2 rounded-lg text-stone-800 hover:bg-stone-200 shrink-0"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
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

    {/* 3. Mobile Bottom Navigation Bar (Fixed bottom on md:hidden) */}
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
            className={`relative w-12 h-12 rounded-full bg-gradient-to-tr from-[#9b2a1f] to-[#b33324] text-amber-100 flex items-center justify-center shadow-lg border-2 border-[#f7f4ed] hover:scale-105 active:scale-95 transition-all ${
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
            if (isAuthenticated && user) {
              setMobileMemberSheetOpen(true);
            } else {
              openAuthModal('login');
            }
          }}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-stone-600 hover:text-stone-900 transition-all relative"
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
          ) : (
            <User className="w-5 h-5 mb-0.5" />
          )}
          <span className="text-[10px] font-medium mt-0.5">
            {isAuthenticated && user ? 'Bát quen' : 'Hội viên'}
          </span>
        </button>

        {/* Tab 5: Đặt bàn */}
        <a
          href="#order"
          onClick={() => {
            setActiveTab('order');
            if (onOpenOrder) onOpenOrder();
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'order' ? 'text-[#9b2a1f]' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Bike className="w-5 h-5 mb-0.5" />
          <span className={`text-[10px] ${activeTab === 'order' ? 'font-bold' : 'font-medium'}`}>Đặt bàn</span>
        </a>
      </div>
    </nav>

    {/* 4. Mobile Member Bottom Sheet (Heritage Bento Pass) */}
    {mobileMemberSheetOpen && isAuthenticated && user && (
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
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-stone-400 hover:text-white"
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
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#9b2a1f] to-[#7f1d14] hover:from-[#b33324] hover:to-[#96281b] text-amber-100 font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
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
                className="py-2.5 px-3 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-300 text-xs font-medium border border-red-900/50 flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
}

export default React.memo(Navbar);

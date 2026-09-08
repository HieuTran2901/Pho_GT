import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import StorySection from './components/StorySection';
import Testimonials from './components/Testimonials';
import OrderSection from './components/OrderSection';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import FlyingPhoBowl from './components/FlyingPhoBowl';
import AuthModal from './components/AuthModal';
import CustomerOrderHistoryModal from './components/order/CustomerOrderHistoryModal';
import { useAuth } from './context/AuthContext';
import AdminPortal from './components/admin/AdminPortal';
import AdminLoginView from './components/admin/AdminLoginView';
import MemberWelcome3DCard from './components/auth/MemberWelcome3DCard';
import { TIER_CONFIG } from './components/navbar/navbarConstants';

const getCartStorageKey = (currentUser) => {
  if (currentUser?.id) return `pho1986_cart_usr_${currentUser.id}`;
  if (currentUser?.phone) return `pho1986_cart_phone_${String(currentUser.phone).replace(/\s+/g, '')}`;
  return 'pho1986_cart_guest';
};

const loadCartFromStorage = (key) => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    if (key === 'pho1986_cart_guest') {
      const legacy = localStorage.getItem('pho1986_cart_items');
      if (legacy) return JSON.parse(legacy);
    }
  } catch {
    return [];
  }
  return [];
};

export default function App() {
  const { user } = useAuth();
  const [isAdminRoute, setIsAdminRoute] = useState(() => 
    typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin')
  );

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(window.location.pathname.startsWith('/admin') || window.location.hash === '#admin');
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateToHome = useCallback(() => {
    window.history.pushState(null, '', '/');
    setIsAdminRoute(false);
  }, []);

  // [RAVEN & BLADE] Phương án 1: User-Scoped Cart Partitioning
  // Mỗi tài khoản (hoặc khách vãng lai) sở hữu một giỏ hàng riêng biệt
  const currentCartKey = useMemo(() => getCartStorageKey(user), [user]);
  const activeCartKeyRef = useRef(currentCartKey);
  const isSwitchingUserRef = useRef(false);

  const [cartItems, setCartItems] = useState(() => {
    return loadCartFromStorage(currentCartKey);
  });

  // Tự động chuyển đổi và nạp giỏ hàng tương ứng khi chuyển tài khoản hoặc đăng xuất/đăng nhập
  useEffect(() => {
    if (activeCartKeyRef.current !== currentCartKey) {
      const oldKey = activeCartKeyRef.current;
      const newKey = currentCartKey;

      // 1. Cất giỏ hàng hiện tại vào đúng partition của user cũ
      if (oldKey && typeof window !== 'undefined') {
        try {
          localStorage.setItem(oldKey, JSON.stringify(cartItems));
        } catch {}
      }

      // 2. Kích hoạt cờ đang chuyển tài khoản để chặn ghi đè cartItems cũ vào user mới
      isSwitchingUserRef.current = true;
      activeCartKeyRef.current = newKey;

      // 3. Nạp giỏ hàng độc lập của user mới (hoặc giỏ trống nếu chưa có)
      const newCart = loadCartFromStorage(newKey);
      setCartItems(newCart);
    }
  }, [currentCartKey, cartItems]);

  // Đồng bộ giỏ hàng vào partition của user đang hoạt động khi thêm/xóa/sửa món
  useEffect(() => {
    if (isSwitchingUserRef.current) {
      isSwitchingUserRef.current = false;
      return;
    }
    if (typeof window !== 'undefined' && activeCartKeyRef.current) {
      try {
        localStorage.setItem(activeCartKeyRef.current, JSON.stringify(cartItems));
      } catch {
        // quiet fail
      }
    }
  }, [cartItems]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  const [toastData, setToastData] = useState(null);
  const [toastClosing, setToastClosing] = useState(false);
  const [flyingBowls, setFlyingBowls] = useState([]);
  const [isCartJiggling, setIsCartJiggling] = useState(false);

  const toastTimerRef = useRef(null);
  const toastExitTimerRef = useRef(null);
  const cartJiggleTimerRef = useRef(null);

  const closeToast = useCallback(() => {
    setToastClosing(true);
    if (toastExitTimerRef.current) clearTimeout(toastExitTimerRef.current);
    toastExitTimerRef.current = setTimeout(() => {
      setToastData(null);
      setToastClosing(false);
    }, 280);
  }, []);

  const showToast = useCallback((payload) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (toastExitTimerRef.current) clearTimeout(toastExitTimerRef.current);
    setToastClosing(false);
    let data = typeof payload === 'string' ? { message: payload } : payload;
    if (data?.type === 'member_welcome') {
      const tierKey = data.user?.loyaltyAccount?.membershipTier || 'DONG';
      data.tierInfo = TIER_CONFIG[tierKey] || TIER_CONFIG.DONG;
    }
    setToastData(data);

    const duration = data?.type === 'member_welcome' ? 4500 : 3200;
    toastTimerRef.current = setTimeout(() => {
      closeToast();
    }, duration);
  }, [closeToast]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (toastExitTimerRef.current) clearTimeout(toastExitTimerRef.current);
      if (cartJiggleTimerRef.current) clearTimeout(cartJiggleTimerRef.current);
    };
  }, []);

  const handleAddToCart = useCallback((item, coords) => {
    // 1. Add item to cart state
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    // 2. Spawn parabolic flying bowl if coordinates exist
    if (coords && typeof window !== 'undefined') {
      const cartBtn = document.getElementById('navbar-cart-btn');
      const targetRect = cartBtn ? cartBtn.getBoundingClientRect() : {
        left: window.innerWidth - 65,
        top: 38,
        width: 40,
        height: 40
      };

      const endX = targetRect.left + targetRect.width / 2;
      const endY = targetRect.top + targetRect.height / 2;

      const newFly = {
        id: Date.now() + Math.random(),
        image: item.image,
        name: item.name,
        startX: coords.startX,
        startY: coords.startY,
        endX,
        endY
      };

      setFlyingBowls((prev) => [...prev, newFly]);
    }

    // 3. Trigger Option 1 Dynamic Heritage Island Capsule Toast
    showToast({
      type: 'dish',
      name: item.name,
      image: item.image,
      price: item.price,
    });
  }, [showToast]);

  const handleFlightComplete = useCallback((flyId) => {
    setFlyingBowls((prev) => prev.filter((f) => f.id !== flyId));

    // Trigger cart jiggle and golden ripple on navbar
    setIsCartJiggling(true);
    if (cartJiggleTimerRef.current) clearTimeout(cartJiggleTimerRef.current);
    cartJiggleTimerRef.current = setTimeout(() => {
      setIsCartJiggling(false);
    }, 650);
  }, []);

  const handleUpdateQuantity = useCallback((id, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: newQuantity } : i))
    );
  }, []);

  const handleRemoveItem = useCallback((id) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
    const key = activeCartKeyRef.current || getCartStorageKey(user);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
        if (key === 'pho1986_cart_guest') {
          localStorage.removeItem('pho1986_cart_items');
        }
      }
    } catch {
      // quiet fail
    }
  }, [user]);

  const handleQuickReorderFromToast = useCallback((userObj) => {
    const dish = {
      id: 'fav_pho_' + (userObj?.tasteProfile?.favoriteDishId || '1986'),
      name: userObj?.tasteProfile?.favoriteDishName || 'Phở Bò Tái Nạm Gầu Giòn 1986',
      price: 85000,
      image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80',
      customNote: userObj?.tasteProfile?.customNote || 'Chuẩn vị truyền thống 1986 (Đã lưu)'
    };
    handleAddToCart(dish);
    setCartOpen(true);
    closeToast();
  }, [handleAddToCart, closeToast]);

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      const navbarOffset = typeof window !== 'undefined' && window.innerWidth < 640 ? 70 : (window.innerWidth < 1024 ? 84 : 110);
      const rect = el.getBoundingClientRect();
      const targetY = rect.top + window.scrollY - navbarOffset;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }
  }, []);

  const handleCheckout = useCallback(() => {
    setCartOpen(false);
    scrollToSection('order');
    showToast('Vui lòng hoàn tất thông tin giao hàng hoặc đặt bàn!');
  }, [scrollToSection, showToast]);

  const handleOpenCart = useCallback(() => setCartOpen(true), []);
  const handleCloseCart = useCallback(() => setCartOpen(false), []);
  const handleOpenOrder = useCallback(() => {
    const cardEl = document.getElementById('order-form-card');
    const orderEl = document.getElementById('order');
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    let targetY;
    if (isMobile && cardEl) {
      const rect = cardEl.getBoundingClientRect();
      targetY = rect.top + window.scrollY - 68;
    } else if (orderEl) {
      const rect = orderEl.getBoundingClientRect();
      targetY = rect.top + window.scrollY + 2;
    }
    if (targetY !== undefined) {
      window.scrollTo({ top: Math.max(0, Math.round(targetY)), behavior: 'smooth' });
    } else {
      scrollToSection('order');
    }
  }, [scrollToSection]);
  const handleExploreMenu = useCallback(() => scrollToSection('menu'), [scrollToSection]);

  const cartCount = useMemo(
    () => cartItems.reduce((acc, curr) => acc + curr.quantity, 0),
    [cartItems]
  );

  if (isAdminRoute) {
    if (user?.role === 'ADMIN') {
      return <AdminPortal onBackToHome={navigateToHome} />;
    }
    return <AdminLoginView onBackToHome={navigateToHome} />;
  }

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col font-sans pb-16 md:pb-0 overflow-x-hidden w-full max-w-full">
        {/* 3D Imperial Heritage Pass & Steam Aura Welcome Card */}
        {toastData && toastData.type === 'member_welcome' && (
          <MemberWelcome3DCard
            data={toastData}
            isClosing={toastClosing}
            onClose={closeToast}
            onQuickReorder={handleQuickReorderFromToast}
          />
        )}

        {/* Dynamic Heritage Island Capsule Toast (Dishes & System Messages) */}
        {toastData && toastData.type !== 'member_welcome' && (
          <div
            className={`fixed top-[82px] sm:top-[104px] lg:top-[112px] left-1/2 z-[60] -translate-x-1/2 max-w-[92vw] sm:max-w-md w-auto pointer-events-auto transition-all ${
              toastClosing ? 'animate-toast-island-out' : 'animate-toast-island-in'
            }`}
          >
            <div className="bg-[#181311]/95 text-stone-100 rounded-full pl-2 pr-2.5 py-1.5 border border-amber-400/40 shadow-[0_12px_36px_rgba(0,0,0,0.55)] backdrop-blur-md flex items-center justify-between gap-2.5 sm:gap-3.5 ring-1 ring-white/10">
              {toastData.type === 'dish' ? (
                <>
                  {/* Dish Thumbnail with Gold Rim */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-amber-400/70 shadow-xs shrink-0 bg-stone-800">
                      <img
                        src={toastData.image}
                        alt={toastData.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider truncate">
                          Đã thêm vào bàn
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">
                        {toastData.name}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Pill Button: Open Cart Drawer */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenCart();
                        closeToast();
                      }}
                      className="bg-[#96281b] hover:bg-[#7e1f14] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md transition-all active:scale-95 flex items-center gap-1 border border-red-400/30 group"
                    >
                      <span>Xem giỏ</span>
                      <span className="text-amber-300 font-black group-hover:translate-x-0.5 transition-transform">→</span>
                    </button>
                    <button
                      type="button"
                      onClick={closeToast}
                      aria-label="Đóng thông báo"
                      className="w-6 h-6 rounded-full text-stone-400 hover:text-white flex items-center justify-center transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                /* Generic system notification */
                <>
                  <div className="flex items-center gap-2 pl-2 pr-1 py-1 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-stone-100 truncate max-w-[260px] sm:max-w-[320px]">
                      {toastData.message}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={closeToast}
                    aria-label="Đóng thông báo"
                    className="w-6 h-6 rounded-full text-stone-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <Navbar
          cartCount={cartCount}
          onOpenCart={handleOpenCart}
          onOpenOrder={handleOpenOrder}
          onAddToCart={handleAddToCart}
          onOpenOrderHistory={() => setOrderHistoryOpen(true)}
          isCartJiggling={isCartJiggling}
          onToast={showToast}
        />

        {/* Auth Modal (Heritage Vintage Register/Login) */}
        <AuthModal onToast={showToast} />

        {/* Customer Order History Modal (Sổ Lịch Sử Đơn Hàng) */}
        <CustomerOrderHistoryModal
          isOpen={orderHistoryOpen}
          onClose={() => setOrderHistoryOpen(false)}
          onAddToCart={handleAddToCart}
          onToast={showToast}
          onNavigateToMenu={handleExploreMenu}
        />

        {/* Flying Parabolic Pho Bowls */}
        {flyingBowls.map((fly) => (
          <FlyingPhoBowl
            key={fly.id}
            fly={fly}
            onComplete={handleFlightComplete}
          />
        ))}

        {/* Main Sections */}
        <main className="flex-1">
          <Hero
            onExploreMenu={handleExploreMenu}
            onBookTable={handleOpenOrder}
          />
          <MenuSection onAddToCart={handleAddToCart} />
          <StorySection />
          <Testimonials />
          <OrderSection cartItems={cartItems} onClearCart={handleClearCart} />
        </main>

        {/* Slide-out Cart Drawer */}
        <CartDrawer
          isOpen={cartOpen}
          onClose={handleCloseCart}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
        />

        {/* Footer */}
        <Footer />
      </div>
  );
}

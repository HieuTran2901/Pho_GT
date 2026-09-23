import { useState, useCallback, useMemo, useRef, useEffect, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import StorySection from './components/StorySection';
import Testimonials from './components/Testimonials';
import OrderSection from './components/OrderSection';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import FlyingPhoBowl from './components/FlyingPhoBowl';
import FlyingGiftRibbon from './components/loyalty/FlyingGiftRibbon';
import HeritageIslandToast from './components/toast/HeritageIslandToast';
import { useAuth } from './context/AuthContext';
import { getCartStorageKey, loadCartFromStorage } from './utils/cartStorage';
import { TIER_CONFIG } from './components/navbar/navbarConstants';

import { useAppRouting } from './hooks/useAppRouting';
import HeritageRouteLoading from './components/common/HeritageRouteLoading';
import PwaInstallPrompt from './components/common/PwaInstallPrompt';

// Code-Splitting: Tải lười các phân khu và modal nặng để tối ưu dung lượng Bundle ban đầu
const AdminPortal = lazy(() => import('./components/admin/AdminPortal'));
const AdminLoginView = lazy(() => import('./components/admin/AdminLoginView'));
const MarketingPage = lazy(() => import('./marketing/MarketingPage'));
const CustomerOrderHistoryModal = lazy(() => import('./components/order/CustomerOrderHistoryModal'));
const GiftVaultModal = lazy(() => import('./components/loyalty/GiftVaultModal'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const MemberWelcome3DCard = lazy(() => import('./components/auth/MemberWelcome3DCard'));
const HeritageChatbox = lazy(() => import('./components/chat/HeritageChatbox'));
const SpotlightTour = lazy(() => import('./components/onboarding/SpotlightTour'));

export default function App() {
  const { user, openAuthModal, authModalOpen } = useAuth();
  const { isAdminRoute, isMarketingRoute, navigateToHome } = useAppRouting();

  // User-Scoped Cart Partitioning (deterministic non-PII keys)
  const currentCartKey = useMemo(() => getCartStorageKey(user), [user]);
  const activeCartKeyRef = useRef(currentCartKey);
  const isSwitchingUserRef = useRef(false);

  const [cartItems, setCartItems] = useState(() => loadCartFromStorage(currentCartKey, user));
  const cartItemsRef = useRef(cartItems);
  cartItemsRef.current = cartItems;

  // Tự động chuyển đổi và nạp giỏ hàng tương ứng khi chuyển tài khoản hoặc đăng xuất/đăng nhập
  useEffect(() => {
    if (activeCartKeyRef.current !== currentCartKey) {
      const oldKey = activeCartKeyRef.current;
      const newKey = currentCartKey;

      if (oldKey && typeof window !== 'undefined') {
        try { localStorage.setItem(oldKey, JSON.stringify(cartItemsRef.current)); } catch {}
      }

      isSwitchingUserRef.current = true;
      activeCartKeyRef.current = newKey;
      setCartItems(loadCartFromStorage(newKey, user));
    }
  }, [currentCartKey, user]);

  // Đồng bộ giỏ hàng vào partition của user đang hoạt động khi thêm/xóa/sửa món
  useEffect(() => {
    if (isSwitchingUserRef.current) {
      isSwitchingUserRef.current = false;
      return;
    }
    if (typeof window !== 'undefined' && activeCartKeyRef.current) {
      try { localStorage.setItem(activeCartKeyRef.current, JSON.stringify(cartItems)); } catch {}
    }
  }, [cartItems]);

  // Preload heavy modals when idle to ensure zero modal open delays
  useEffect(() => {
    const preload = () => {
      import('./components/AuthModal');
      import('./components/chat/HeritageChatbox');
      import('./components/onboarding/SpotlightTour');
      import('./components/auth/MemberWelcome3DCard');
    };
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        const id = window.requestIdleCallback(preload, { timeout: 3000 });
        return () => window.cancelIdleCallback(id);
      }
      const id = setTimeout(preload, 1500);
      return () => clearTimeout(id);
    }
  }, []);

  const [cartOpen, setCartOpen] = useState(false);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  const [giftVaultOpen, setGiftVaultOpen] = useState(false);
  const [toastData, setToastData] = useState(null);
  const [toastClosing, setToastClosing] = useState(false);
  const [flyingBowls, setFlyingBowls] = useState([]);
  const [flyingGifts, setFlyingGifts] = useState([]);
  const [isCartJiggling, setIsCartJiggling] = useState(false);

  const toastTimerRef = useRef(null), toastExitTimerRef = useRef(null), cartJiggleTimerRef = useRef(null);

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

  // Xác định tọa độ giỏ hàng chuẩn xác cho cả Desktop & Mobile
  const getCartTargetCoordinates = useCallback(() => {
    if (typeof window === 'undefined') return { endX: 0, endY: 0 };
    // Mobile (< 768px): Nhắm đúng nút Giỏ hàng nổi trung tâm ở Bottom Nav
    if (window.innerWidth < 768) {
      const mobileCart = document.getElementById('mobile-bottom-cart-btn') || 
                         document.querySelector('button[aria-label="Xem giỏ hàng"]');
      if (mobileCart && mobileCart.offsetParent !== null) {
        const rect = mobileCart.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          return { endX: rect.left + rect.width / 2, endY: rect.top + rect.height / 2 };
        }
      }
      return { endX: window.innerWidth / 2, endY: window.innerHeight - 38 };
    }
    // Desktop / Tablet (>= 768px): Nhắm nút Giỏ hàng trên Header
    const desktopCart = document.getElementById('navbar-cart-btn');
    if (desktopCart && desktopCart.offsetParent !== null) {
      const rect = desktopCart.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return { endX: rect.left + rect.width / 2, endY: rect.top + rect.height / 2 };
      }
    }
    return { endX: window.innerWidth - 65, endY: 42 };
  }, []);

  const handleAddToCart = useCallback((item, coords) => {
    if (item.isAvailable === false) {
      showToast({
        type: 'warning',
        name: item.name,
        image: item.image,
        msg: `Món "${item.name}" hiện đang tạm hết hàng tại bếp quán.`
      });
      return;
    }

    // 1. Add item to cart state
    const addedQty = item.quantity || 1;
    const itemKey = item.cartItemId || item.id;
    setCartItems((prev) => {
      const existing = prev.find((i) => (i.cartItemId || i.id) === itemKey);
      if (existing) {
        return prev.map((i) =>
          (i.cartItemId || i.id) === itemKey ? { ...i, quantity: i.quantity + addedQty } : i
        );
      }
      return [...prev, { ...item, quantity: addedQty }];
    });

    // 2. Spawn parabolic flying bowl if coordinates exist
    if (coords && typeof window !== 'undefined') {
      const { endX, endY } = getCartTargetCoordinates();
      const newFly = { id: Date.now() + Math.random(), image: item.image, name: item.name, startX: coords.startX, startY: coords.startY, endX, endY };
      setFlyingBowls((prev) => [...prev, newFly]);
    }

    // 3. Trigger Option 1 Dynamic Heritage Island Capsule Toast
    showToast({ type: 'dish', name: item.name, image: item.image, price: item.price });
  }, [showToast, getCartTargetCoordinates]);

  // Thêm quà tặng Tri Kỷ (0đ) vào giỏ hàng với quỹ đạo Parabol bay vào giỏ
  const handleApplyGiftToCart = useCallback((gift, coords) => {
    const giftItem = {
      id: `gift_${gift.dishId || gift.id}`,
      giftId: gift.id,
      name: gift.dishName || gift.title,
      price: 0,
      originalPrice: gift.discountValue || 15000,
      image: gift.image,
      quantity: 1, isFreeGift: true, voucherCode: gift.code
    };
    setCartItems((prev) => [...prev.filter((i) => !i.isFreeGift), giftItem]);

    if (coords && typeof window !== 'undefined') {
      const { endX, endY } = getCartTargetCoordinates();
      const newFlyGift = { id: Date.now() + Math.random(), image: gift.image, name: giftItem.name, startX: coords.startX, startY: coords.startY, endX, endY };
      setFlyingGifts((prev) => [...prev, newFlyGift]);
    } else {
      setCartOpen(true);
    }

    // 2. Kích hoạt Toast Viên Nang Sơn Mài Thượng Khách
    showToast({
      type: 'gift_applied',
      name: giftItem.name,
      image: giftItem.image,
      savings: giftItem.originalPrice
    });
  }, [showToast, getCartTargetCoordinates]);

  const handleGiftFlightComplete = useCallback((flyId) => {
    setFlyingGifts((prev) => prev.filter((f) => f.id !== flyId));
    setIsCartJiggling(true);
    if (cartJiggleTimerRef.current) clearTimeout(cartJiggleTimerRef.current);
    cartJiggleTimerRef.current = setTimeout(() => setIsCartJiggling(false), 700);
    setCartOpen(true);
  }, []);

  const handleFlightComplete = useCallback((flyId) => {
    setFlyingBowls((prev) => prev.filter((f) => f.id !== flyId));
    setIsCartJiggling(true);
    if (cartJiggleTimerRef.current) clearTimeout(cartJiggleTimerRef.current);
    cartJiggleTimerRef.current = setTimeout(() => setIsCartJiggling(false), 650);
  }, []);

  const handleUpdateQuantity = useCallback((id, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems((prev) => prev.filter((i) => (i.cartItemId || i.id) !== id));
      return;
    }
    setCartItems((prev) => prev.map((i) => ((i.cartItemId || i.id) === id ? { ...i, quantity: newQuantity } : i)));
  }, []);

  const handleRemoveItem = useCallback((id) => {
    setCartItems((prev) => prev.filter((i) => (i.cartItemId || i.id) !== id));
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

  const handleOpenCart = useCallback(() => setCartOpen(true), []), handleCloseCart = useCallback(() => setCartOpen(false), []);
  const handleOpenOrderHistory = useCallback(() => setOrderHistoryOpen(true), []), handleCloseOrderHistory = useCallback(() => setOrderHistoryOpen(false), []);
  const handleOpenGiftVault = useCallback(() => setGiftVaultOpen(true), []), handleCloseGiftVault = useCallback(() => setGiftVaultOpen(false), []);
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
  const handleNavigateToMenuFromCart = useCallback(() => {
    handleCloseCart();
    handleExploreMenu();
  }, [handleCloseCart, handleExploreMenu]);

  const cartCount = useMemo(
    () => cartItems.reduce((acc, curr) => acc + curr.quantity, 0),
    [cartItems]
  );

  if (isMarketingRoute) {
    return (
      <Suspense fallback={<HeritageRouteLoading />}>
        <MarketingPage
          onBackToHome={navigateToHome}
          onNavigateToSection={(section) => {
            navigateToHome();
            requestAnimationFrame(() => {
              requestAnimationFrame(() => scrollToSection(section));
            });
          }}
        />
      </Suspense>
    );
  }

  if (isAdminRoute) {
    return (
      <Suspense fallback={<HeritageRouteLoading />}>
        {user?.role === 'ADMIN' ? (
          <AdminPortal onBackToHome={navigateToHome} />
        ) : (
          <AdminLoginView onBackToHome={navigateToHome} />
        )}
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col font-sans pb-16 md:pb-0 overflow-x-hidden w-full max-w-full">
        {/* 3D Imperial Heritage Pass & Steam Aura Welcome Card */}
        {toastData && toastData.type === 'member_welcome' && (
          <Suspense fallback={null}>
            <MemberWelcome3DCard
              data={toastData}
              isClosing={toastClosing}
              onClose={closeToast}
              onQuickReorder={handleQuickReorderFromToast}
            />
          </Suspense>
        )}

        {/* Dynamic Heritage Island Capsule Toast */}
        <HeritageIslandToast
          toastData={toastData}
          toastClosing={toastClosing}
          onClose={closeToast}
          onOpenCart={handleOpenCart}
        />

        {/* Navigation */}
        <Navbar
          cartCount={cartCount}
          onOpenCart={handleOpenCart}
          onOpenOrder={handleOpenOrder}
          onAddToCart={handleAddToCart}
          onOpenOrderHistory={handleOpenOrderHistory}
          onOpenGiftVault={handleOpenGiftVault}
          isCartJiggling={isCartJiggling}
          onToast={showToast}
        />

        {/* Auth Modal (Heritage Vintage Register/Login) */}
        <Suspense fallback={authModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
          </div>
        ) : null}>
          <AuthModal onToast={showToast} />
        </Suspense>

        {/* Customer Order History Modal (Loaded on demand) */}
        {orderHistoryOpen && (
          <Suspense fallback={null}>
            <CustomerOrderHistoryModal
              isOpen={orderHistoryOpen}
              onClose={handleCloseOrderHistory}
              onAddToCart={handleAddToCart}
              onToast={showToast}
              onNavigateToMenu={handleExploreMenu}
            />
          </Suspense>
        )}

        {/* Customer Gift Vault Modal (Loaded on demand) */}
        {giftVaultOpen && (
          <Suspense fallback={null}>
            <GiftVaultModal
              isOpen={giftVaultOpen}
              onClose={handleCloseGiftVault}
              user={user}
              cartItems={cartItems}
              onApplyGiftToCart={handleApplyGiftToCart}
              onToast={showToast}
              openAuthModal={openAuthModal}
            />
          </Suspense>
        )}

        {/* Flying Parabolic Pho Bowls & Gift Ribbons */}
        {flyingBowls.map((fly) => (
          <FlyingPhoBowl key={fly.id} fly={fly} onComplete={handleFlightComplete} />
        ))}
        {flyingGifts.map((fly) => (
          <FlyingGiftRibbon key={fly.id} fly={fly} onComplete={handleGiftFlightComplete} />
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
          <OrderSection
            cartItems={cartItems}
            onClearCart={handleClearCart}
            onToast={showToast}
            onExploreMenu={handleExploreMenu}
          />
        </main>

        {/* Slide-out Cart Drawer */}
        <CartDrawer
          isOpen={cartOpen}
          onClose={handleCloseCart}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
          onNavigateToMenu={handleNavigateToMenuFromCart}
        />

        {/* Heritage AI Assistant Chatbox (Tiểu Nhị 1986) */}
        <Suspense fallback={null}>
          <HeritageChatbox
            onAddToCart={handleAddToCart}
            onOpenOrder={handleOpenOrder}
            onExploreMenu={handleExploreMenu}
            onToast={showToast}
          />
        </Suspense>

        {/* Heritage Onboarding Spotlight Tour (Tiểu Nhị 1986) */}
        <Suspense fallback={null}>
          <SpotlightTour />
        </Suspense>

        {/* PWA Mobile App Install Prompt */}
        <PwaInstallPrompt />

        {/* Footer */}
        <Footer />
      </div>
  );
}

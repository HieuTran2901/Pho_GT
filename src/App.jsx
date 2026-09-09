import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
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
import AuthModal from './components/AuthModal';
import CustomerOrderHistoryModal from './components/order/CustomerOrderHistoryModal';
import GiftVaultModal from './components/loyalty/GiftVaultModal';
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
  const { user, openAuthModal } = useAuth();
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
  const cartItemsRef = useRef(cartItems);
  cartItemsRef.current = cartItems;

  // Tự động chuyển đổi và nạp giỏ hàng tương ứng khi chuyển tài khoản hoặc đăng xuất/đăng nhập
  useEffect(() => {
    if (activeCartKeyRef.current !== currentCartKey) {
      const oldKey = activeCartKeyRef.current;
      const newKey = currentCartKey;

      // 1. Cất giỏ hàng hiện tại vào đúng partition của user cũ
      if (oldKey && typeof window !== 'undefined') {
        try {
          localStorage.setItem(oldKey, JSON.stringify(cartItemsRef.current));
        } catch {}
      }

      // 2. Kích hoạt cờ đang chuyển tài khoản để chặn ghi đè cartItems cũ vào user mới
      isSwitchingUserRef.current = true;
      activeCartKeyRef.current = newKey;

      // 3. Nạp giỏ hàng độc lập của user mới (hoặc giỏ trống nếu chưa có)
      const newCart = loadCartFromStorage(newKey);
      setCartItems(newCart);
    }
  }, [currentCartKey]);

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
  const [giftVaultOpen, setGiftVaultOpen] = useState(false);
  const [toastData, setToastData] = useState(null);
  const [toastClosing, setToastClosing] = useState(false);
  const [flyingBowls, setFlyingBowls] = useState([]);
  const [flyingGifts, setFlyingGifts] = useState([]);
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

  // [RAVEN & URBAN] Xác định tọa độ giỏ hàng chuẩn xác cho cả Desktop & Mobile
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
      const { endX, endY } = getCartTargetCoordinates();
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
  }, [showToast, getCartTargetCoordinates]);

  // [RAVEN & URBAN] Thêm quà tặng Tri Kỷ (0đ) vào giỏ hàng với quỹ đạo Parabol bay vào giỏ
  const handleApplyGiftToCart = useCallback((gift, coords) => {
    const giftItem = {
      id: `gift_${gift.dishId || gift.id}`,
      giftId: gift.id,
      name: gift.dishName || gift.title,
      price: 0,
      originalPrice: gift.discountValue || 15000,
      image: gift.image,
      quantity: 1,
      isFreeGift: true,
      voucherCode: gift.code
    };

    setCartItems((prev) => {
      // Mỗi đơn chỉ áp dụng 1 món quà tặng 0đ duy nhất, thay thế quà cũ nếu có
      const filtered = prev.filter((i) => !i.isFreeGift);
      return [...filtered, giftItem];
    });

    // 1. Phóng dải vé Parabol lượn vào giỏ hàng nếu có tọa độ nút bấm
    if (coords && typeof window !== 'undefined') {
      const { endX, endY } = getCartTargetCoordinates();

      const newFlyGift = {
        id: Date.now() + Math.random(),
        image: gift.image,
        name: giftItem.name,
        startX: coords.startX,
        startY: coords.startY,
        endX,
        endY
      };

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

    // Hiệu ứng tiếp đất: Rung lắc giỏ hàng và mở drawer đón quà
    setIsCartJiggling(true);
    if (cartJiggleTimerRef.current) clearTimeout(cartJiggleTimerRef.current);
    cartJiggleTimerRef.current = setTimeout(() => {
      setIsCartJiggling(false);
    }, 700);

    setCartOpen(true);
  }, []);

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
  const handleOpenOrderHistory = useCallback(() => setOrderHistoryOpen(true), []);
  const handleCloseOrderHistory = useCallback(() => setOrderHistoryOpen(false), []);
  const handleOpenGiftVault = useCallback(() => setGiftVaultOpen(true), []);
  const handleCloseGiftVault = useCallback(() => setGiftVaultOpen(false), []);
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
        <AuthModal onToast={showToast} />

        {/* Customer Order History Modal (Sổ Lịch Sử Đơn Hàng) */}
        <CustomerOrderHistoryModal
          isOpen={orderHistoryOpen}
          onClose={handleCloseOrderHistory}
          onAddToCart={handleAddToCart}
          onToast={showToast}
          onNavigateToMenu={handleExploreMenu}
        />

        {/* Customer Gift Vault Modal (Hòm Gấm Tri Kỷ 1986) */}
        <GiftVaultModal
          isOpen={giftVaultOpen}
          onClose={handleCloseGiftVault}
          user={user}
          cartItems={cartItems}
          onApplyGiftToCart={handleApplyGiftToCart}
          onToast={showToast}
          openAuthModal={openAuthModal}
        />

        {/* Flying Parabolic Pho Bowls */}
        {flyingBowls.map((fly) => (
          <FlyingPhoBowl
            key={fly.id}
            fly={fly}
            onComplete={handleFlightComplete}
          />
        ))}

        {/* Flying Parabolic Gift Ribbons */}
        {flyingGifts.map((fly) => (
          <FlyingGiftRibbon
            key={fly.id}
            fly={fly}
            onComplete={handleGiftFlightComplete}
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

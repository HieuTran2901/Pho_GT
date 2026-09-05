import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
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

export default function App() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Phở Bò Tái Lăn Hà Nội',
      price: 65000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80'
    }
  ]);
  const [cartOpen, setCartOpen] = useState(false);
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
    setToastData(typeof payload === 'string' ? { message: payload } : payload);

    toastTimerRef.current = setTimeout(() => {
      closeToast();
    }, 3200);
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

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleCheckout = useCallback(() => {
    setCartOpen(false);
    scrollToSection('order');
    showToast('Vui lòng hoàn tất thông tin giao hàng hoặc đặt bàn!');
  }, [scrollToSection, showToast]);

  const handleOpenCart = useCallback(() => setCartOpen(true), []);
  const handleCloseCart = useCallback(() => setCartOpen(false), []);
  const handleOpenOrder = useCallback(() => scrollToSection('order'), [scrollToSection]);
  const handleExploreMenu = useCallback(() => scrollToSection('menu'), [scrollToSection]);

  const cartCount = useMemo(
    () => cartItems.reduce((acc, curr) => acc + curr.quantity, 0),
    [cartItems]
  );

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col font-sans pb-16 md:pb-0 overflow-x-hidden w-full max-w-full">
        {/* Dynamic Heritage Island Capsule Toast (Option 1) */}
        {toastData && (
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
          isCartJiggling={isCartJiggling}
          onToast={showToast}
        />

        {/* Auth Modal (Heritage Vintage Register/Login) */}
        <AuthModal onToast={showToast} />

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
          <OrderSection />
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

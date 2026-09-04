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
  const [toastMessage, setToastMessage] = useState(null);
  const [flyingBowls, setFlyingBowls] = useState([]);
  const [isCartJiggling, setIsCartJiggling] = useState(false);

  const toastTimerRef = useRef(null);
  const cartJiggleTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (cartJiggleTimerRef.current) clearTimeout(cartJiggleTimerRef.current);
    };
  }, []);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 2500);
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

    showToast(`Đã thêm "${item.name}" vào giỏ!`);
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
    <div className="min-h-screen bg-brand-cream flex flex-col font-sans">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-400/40 text-sm font-medium flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          {toastMessage}
        </div>
      )}

      {/* Navigation */}
      <Navbar
        cartCount={cartCount}
        onOpenCart={handleOpenCart}
        onOpenOrder={handleOpenOrder}
        isCartJiggling={isCartJiggling}
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

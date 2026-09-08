import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Utensils } from 'lucide-react';
import useAnimatedNumber from '../hooks/useAnimatedNumber';
import GlidingGiftRibbon from './loyalty/GlidingGiftRibbon';

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const formatPrice = (price) => currencyFormatter.format(price);

function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onCheckout }) {
  // ESC key listener to close drawer gracefully
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const { totalAmount, itemCount, mainItems, freeGift } = useMemo(() => {
    let total = 0;
    let count = 0;
    const main = [];
    let gift = null;

    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      total += (item.price || 0) * (item.quantity || 1);
      count += (item.quantity || 1);
      if (item.isFreeGift) {
        gift = item;
      } else {
        main.push(item);
      }
    }
    return { totalAmount: total, itemCount: count, mainItems: main, freeGift: gift };
  }, [cartItems]);

  const animatedTotalAmount = useAnimatedNumber(totalAmount, 400);

  // [URBAN & RAVEN] Finite State Machine (FSM) cho quy trình Docking:
  // 'idle' -> 'gliding' -> 'bursting' -> 'applied' -> 'idle'
  const [dockStage, setDockStage] = useState('idle');
  const [targetRect, setTargetRect] = useState(null);
  const comboChildRef = useRef(null);
  const dockedGiftIdRef = useRef(null);
  const timersRef = useRef([]);

  // Tiện ích đăng ký timer có dọn dẹp tập trung (Zero Dangling Timeouts)
  const registerTimer = useCallback((fn, delay) => {
    const id = setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, delay);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  // Dọn dẹp an toàn khi unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // Derived state helpers (không cần lưu nhiều biến useState dư thừa)
  const isGliding = dockStage === 'gliding';
  const sparkleBurst = dockStage === 'bursting';
  const justApplied = dockStage === 'bursting' || dockStage === 'applied';

  // Callback khi dải lụa chạm đích vào đúng ô combo
  const handleDockComplete = useCallback(() => {
    setDockStage('bursting'); // Kích hoạt vầng hào quang + bụi kim tuyến
    registerTimer(() => {
      setDockStage('applied'); // Chuyển từ bursting sang applied
      registerTimer(() => {
        setDockStage('idle'); // Tự động hạ màn thanh lịch sau 3.2s
        setTargetRect(null);
      }, 3200);
    }, 700);
  }, [registerTimer]);

  // KÍCH HOẠT CHẶNG 2: Chỉ kích hoạt Glide & Dock KHI GIỎ HÀNG ĐÃ MỞ (isOpen === true)
  useEffect(() => {
    if (!isOpen) {
      clearAllTimers();
      setDockStage('idle');
      setTargetRect(null);
      return;
    }

    // Nếu giỏ mở và có quà chưa được kích hoạt hiệu ứng trong phiên này
    if (freeGift && freeGift.id !== dockedGiftIdRef.current) {
      dockedGiftIdRef.current = freeGift.id;

      // Đợi 300ms cho drawer trượt vào khung nhìn rồi mới đo tọa độ và kích hoạt Glide
      registerTimer(() => {
        if (comboChildRef.current) {
          const rect = comboChildRef.current.getBoundingClientRect();
          setTargetRect(rect);
          setDockStage('gliding');
        } else {
          setDockStage('applied');
          registerTimer(() => setDockStage('idle'), 3200);
        }
      }, 300);
    } else if (!freeGift) {
      dockedGiftIdRef.current = null;
      setDockStage('idle');
      setTargetRect(null);
    }
  }, [freeGift, isOpen, registerTimer, clearAllTimers]);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-500 ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop with smooth Fade & Blur */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity duration-500 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Slide-over panel container */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-auto max-w-full flex pl-0 sm:pl-10 pointer-events-none">
        <div
          className={`w-full sm:w-screen sm:max-w-md bg-white shadow-2xl flex flex-col pointer-events-auto transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 sm:p-6 bg-[#21150f] text-white flex items-center justify-between border-b border-amber-900/40 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <ShoppingBag className="w-5 h-5 text-amber-400 shrink-0" />
              <h2 className="font-serif text-base sm:text-lg font-bold text-amber-100 truncate">
                Món Phở Đã Chọn ({itemCount})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:rotate-90 cursor-pointer shrink-0 ml-2"
              aria-label="Đóng giỏ hàng"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-stone-500 py-12">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4 text-stone-400">
                  <Utensils className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-stone-800 text-lg mb-1">
                  Chưa có món nào trong giỏ
                </h3>
                <p className="text-sm text-stone-500 max-w-xs mb-6">
                  Hãy ghé qua thực đơn để chọn những tô phở thơm ngon chuẩn vị nhé!
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-brand-red text-white text-sm font-semibold hover:bg-brand-redhover shadow-md cursor-pointer"
                >
                  Khám Phá Món Ngon
                </button>
              </div>
            ) : (
              <>
                {/* 1. MÓN ĂN CHÍNH (KÈM COMBO MÓC NỐI GẤM NẾU CÓ QUÀ TẶNG) */}
                {mainItems.map((item, idx) => {
                  const isPrimaryBowl = idx === 0 && Boolean(freeGift);

                  return (
                    <div key={item.id} className="space-y-1.5">
                      {/* Thẻ món ăn chính */}
                      <div
                        className={`relative flex items-center gap-3.5 sm:gap-4 p-3 rounded-2xl transition-all duration-500 shadow-xs ${
                          justApplied && isPrimaryBowl
                            ? 'bg-amber-50/80 border-2 border-amber-400/90 shadow-[0_0_20px_rgba(245,158,11,0.45)]'
                            : 'bg-stone-50 border border-stone-200/90 hover:border-amber-400/60'
                        }`}
                      >
                        {/* [PHƯƠNG ÁN A] RUY BĂNG NƠ LỤA HÚT VÀO ẢNH BÁT PHỞ */}
                        {isPrimaryBowl && !isGliding && (
                          <div className="absolute -top-2.5 left-3 z-10 animate-ribbon-snap pointer-events-none">
                            <div className="bg-gradient-to-r from-[#9b2a1f] via-[#7d1d14] to-[#591008] border border-amber-300 text-amber-100 text-[10px] font-serif font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1.5 ring-1 ring-amber-400/40">
                              <span>🎀</span>
                              <span className="truncate max-w-[140px]">+ {freeGift.name}</span>
                            </div>
                          </div>
                        )}

                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-stone-200">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif font-bold text-sm text-stone-900 truncate">
                            {item.name}
                          </h4>
                          <div className="text-xs font-bold text-brand-red mt-0.5">
                            {formatPrice(item.price)}
                          </div>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 rounded bg-white border border-stone-300 flex items-center justify-center text-stone-700 hover:bg-stone-200 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-stone-800 px-1 font-mono">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-white border border-stone-300 flex items-center justify-center text-stone-700 hover:bg-stone-200 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-2 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Xóa món"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* [PHƯƠNG ÁN B] MÓC NỐI GẤM COMBO ĐI KÈM PHÍA DƯỚI BÁT PHỞ */}
                      {isPrimaryBowl && (
                        <div className="relative ml-5 sm:ml-7 pl-3.5 sm:pl-4 border-l-2 border-dashed border-amber-500/60 pb-1 animate-fadeIn">
                          {/* Đường chỉ cong hình cành mai nối liền vào thẻ con */}
                          <div className="absolute -left-[2px] top-5 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500/60 rounded-bl-lg pointer-events-none" />

                          <div
                            ref={comboChildRef}
                            className={`relative flex items-center gap-2.5 p-2 rounded-xl transition-all duration-500 ${
                              isGliding
                                ? 'border-2 border-dashed border-amber-400/90 bg-amber-50/60 scale-[0.98] opacity-70 shadow-inner'
                                : justApplied
                                ? 'bg-gradient-to-r from-[#fff9ee] via-[#fff3db] to-[#fdedcd] border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.55)] ring-2 ring-amber-400/60 scale-[1.005]'
                                : 'bg-gradient-to-r from-[#fffdf8] via-[#fcf5e8] to-[#f4e7d0] border border-[#c88d2b]/60 shadow-xs hover:border-[#c88d2b]'
                            }`}
                          >
                            {/* Làn bụi kim tuyến vàng bùng nổ khi tiếp đất (Docking Sparkle Burst) */}
                            {sparkleBurst && (
                              <div className="absolute inset-0 rounded-xl pointer-events-none border-2 border-amber-400 animate-docking-burst z-20" />
                            )}

                            {/* Thumbnail nhỏ gọn tỉ lệ hài hòa với món chính */}
                            <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-[#c88d2b]/80 shrink-0 bg-stone-900 shadow-xs">
                              <img
                                src={freeGift.image}
                                alt={freeGift.name}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#8a1f18] text-[6.5px] font-bold text-amber-200 border border-amber-300 flex items-center justify-center shadow-xs">
                                0đ
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-serif font-bold text-xs text-stone-900 truncate">
                                  {freeGift.name}
                                </span>
                                <span className="px-1.5 py-0.2 rounded bg-[#731911] text-amber-200 text-[8px] font-serif font-bold shrink-0">
                                  🎁 Kèm
                                </span>
                                {justApplied && !isGliding && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-[#9b2a1f] to-[#7a1811] text-amber-200 border border-amber-300 text-[7.5px] font-serif font-black shadow-xs flex items-center gap-0.5 animate-bounce shrink-0">
                                    <span>✨</span>
                                    <span>VỪA ÁP DỤNG</span>
                                  </span>
                                )}
                              </div>

                              {/* ANIMATION GẠCH GIÁ VÀ BỪNG SÁNG 0Đ */}
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="relative inline-block text-[11px] font-serif text-stone-400">
                                  <span>{formatPrice(freeGift.originalPrice || 15000)}</span>
                                  {!isGliding && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1.5px] bg-[#9b2a1f] rounded-full animate-strike-brush" />
                                  )}
                                </div>
                                {!isGliding && (
                                  <span className="text-emerald-700 font-serif font-black text-xs animate-pop-zero flex items-center gap-1">
                                    <span>0đ</span>
                                    <span className="text-[9px] text-emerald-800 font-sans font-medium">(Tặng kèm)</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => onRemoveItem(freeGift.id)}
                              className="p-1 text-stone-400 hover:text-red-600 transition-colors shrink-0 cursor-pointer"
                              title="Bỏ quà tặng"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 2. TRƯỜNG HỢP GIỎ CHƯA CÓ BÁT PHỞ NÀO MÀ CHỈ CÓ QUÀ TẶNG */}
                {mainItems.length === 0 && freeGift && (
                  <div className="space-y-2">
                    <div
                      ref={mainItems.length === 0 ? comboChildRef : null}
                      className={`relative flex items-center gap-3 p-2.5 rounded-xl transition-all duration-500 ${
                        isGliding
                          ? 'border-2 border-dashed border-amber-400/90 bg-amber-50/60 scale-[0.98] opacity-70 shadow-inner'
                          : justApplied
                          ? 'bg-gradient-to-r from-[#fff9ee] via-[#fff3db] to-[#fdedcd] border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.55)] ring-2 ring-amber-400/60'
                          : 'bg-gradient-to-r from-[#fffdf8] via-[#fcf5e8] to-[#f4e7d0] border border-[#c88d2b] shadow-xs'
                      }`}
                    >
                      {/* Làn bụi kim tuyến vàng bùng nổ khi tiếp đất */}
                      {sparkleBurst && (
                        <div className="absolute inset-0 rounded-xl pointer-events-none border-2 border-amber-400 animate-docking-burst z-20" />
                      )}

                      <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-[#c88d2b] shrink-0 bg-stone-900 shadow-xs">
                        <img
                          src={freeGift.image}
                          alt={freeGift.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#8a1f18] text-[7.5px] font-bold text-amber-200 border border-amber-300 flex items-center justify-center">
                          0đ
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-serif font-bold text-xs text-stone-900 truncate">
                            {freeGift.name}
                          </h4>
                          <span className="px-1.5 py-0.2 rounded bg-[#731911] text-amber-200 text-[9px] font-serif font-bold shrink-0">
                            🎁 Quà Tri Kỷ (0đ)
                          </span>
                          {justApplied && !isGliding && (
                            <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-[#9b2a1f] to-[#7a1811] text-amber-200 border border-amber-300 text-[7.5px] font-serif font-black shadow-xs flex items-center gap-0.5 animate-bounce shrink-0">
                              <span>✨</span>
                              <span>VỪA ÁP DỤNG</span>
                            </span>
                          )}
                        </div>

                        {/* ANIMATION GẠCH GIÁ VÀ BỪNG SÁNG 0Đ */}
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="relative inline-block text-[11px] font-serif text-stone-400">
                            <span>{formatPrice(freeGift.originalPrice || 15000)}</span>
                            {!isGliding && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1.5px] bg-[#9b2a1f] rounded-full animate-strike-brush" />
                            )}
                          </div>
                          {!isGliding && (
                            <span className="text-emerald-700 font-serif font-black text-xs animate-pop-zero flex items-center gap-1">
                              <span>0đ</span>
                              <span className="text-[9px] text-emerald-800 font-sans font-medium">(Tặng kèm)</span>
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-stone-500 font-serif italic mt-0.5">
                          Quà tặng cố định: 1 phần
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveItem(freeGift.id)}
                        className="p-2 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Xóa món"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Gợi ý khách thêm bát phở để gắn kết */}
                    <div className="text-[11px] font-serif text-amber-900 bg-gradient-to-r from-amber-100/90 to-orange-100/80 border border-amber-300/80 rounded-xl p-2.5 flex items-center gap-2 shadow-xs">
                      <span className="text-base">🍜</span>
                      <span>Hãy chọn thêm 01 bát phở để tạo thành <strong>Combo Tri Kỷ</strong> chuẩn vị nhé!</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer calculation & checkout */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-6 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-6 bg-stone-50 border-t border-stone-200 space-y-3 sm:space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Tạm tính ({itemCount} phần):</span>
                  <span className="font-semibold text-stone-900">{formatPrice(totalAmount)}</span>
                </div>
                {freeGift && (
                  <div className="flex justify-between text-stone-600">
                    <span className="flex items-center gap-1">
                      <span>🎁</span>
                      <span>Ưu đãi Tri Kỷ 1986:</span>
                    </span>
                    <span className="font-semibold text-emerald-600">
                      -{formatPrice(freeGift.originalPrice || 15000)} (0đ)
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Ưu đãi đặt trực tiếp:</span>
                  <span className="font-semibold text-emerald-600">Miễn phí giao hàng</span>
                </div>
                <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Tổng tiền thanh toán:</span>
                  {/* ODOMETER COUNT-DOWN NUMBER ROLL */}
                  <span className="text-brand-red font-serif text-lg font-black transition-all">
                    {formatPrice(animatedTotalAmount)}
                  </span>
                </div>
              </div>

              <button
                onClick={onCheckout}
                className="w-full py-3.5 rounded-xl bg-brand-red hover:bg-brand-redhover text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Gửi Yêu Cầu Đặt Món Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* [RAVEN & URBAN] HIỆU ỨNG LƯỚT NHẸ VÀO MÓN ĐI KÈM (GLIDE & DOCK) */}
      {isGliding && freeGift && targetRect && (
        <GlidingGiftRibbon
          targetRect={targetRect}
          gift={freeGift}
          onDockComplete={handleDockComplete}
        />
      )}
    </div>
  );
}

export default React.memo(CartDrawer);


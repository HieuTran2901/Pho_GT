import React, { useEffect, useMemo } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Utensils } from 'lucide-react';

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

  const totalAmount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

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
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
        <div
          className={`w-screen max-w-md bg-white shadow-2xl flex flex-col pointer-events-auto transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          
          {/* Header */}
          <div className="p-6 bg-[#21150f] text-white flex items-center justify-between border-b border-amber-900/40">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="font-serif text-lg font-bold text-amber-100">
                Món Phở Đã Chọn ({cartItems.reduce((acc, curr) => acc + curr.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-all duration-200 hover:rotate-90"
              aria-label="Đóng giỏ hàng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                  className="px-6 py-2.5 rounded-full bg-brand-red text-white text-sm font-semibold hover:bg-brand-redhover shadow-md"
                >
                  Khám Phá Món Ngon
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-stone-50 border border-stone-200/80 hover:border-amber-400/50 transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-sm text-stone-900 truncate">
                      {item.name}
                    </h4>
                    <div className="text-xs text-brand-red font-bold">
                      {formatPrice(item.price)}
                    </div>
                    
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-white border border-stone-300 flex items-center justify-center text-stone-700 hover:bg-stone-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-stone-800 px-1">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-white border border-stone-300 flex items-center justify-center text-stone-700 hover:bg-stone-200"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                    title="Xóa món"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer calculation & checkout */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-stone-50 border-t border-stone-200 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Tạm tính ({cartItems.reduce((a, b) => a + b.quantity, 0)} phần):</span>
                  <span className="font-semibold text-stone-900">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Ưu đãi đặt trực tiếp:</span>
                  <span className="font-semibold text-emerald-600">Tặng 01 Quẩy Giòn</span>
                </div>
                <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="text-brand-red font-serif text-lg">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={onCheckout}
                className="w-full py-3.5 rounded-xl bg-brand-red hover:bg-brand-redhover text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-colors"
              >
                <span>Gửi Yêu Cầu Đặt Món Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default React.memo(CartDrawer);

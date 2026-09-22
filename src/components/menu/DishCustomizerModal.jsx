import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { X, Plus, Minus, Check, Sparkles, ChefHat, Flame, Utensils } from 'lucide-react';

const TOPPINGS_LIST = [
  { id: 'top_trung', name: 'Trứng gà chần nước béo', price: 10000, desc: 'Lòng đào béo ngậy' },
  { id: 'top_quay', name: 'Đĩa quẩy giòn hoa mai (3 chiếc)', price: 5000, desc: 'Giòn rụm ngấm nước dùng' },
  { id: 'top_tiet', name: 'Bát tiết luộc nóng hổi', price: 15000, desc: 'Mềm mướt, ngọt thanh' },
  { id: 'top_bo_them', name: 'Thịt bò tái lăn thêm', price: 30000, desc: 'Tươi mềm xào lăn chảo gang' },
];

const BROTH_OPTIONS = [
  { id: 'trong', label: 'Nước Trong Thanh', sub: 'Chuẩn 1986' },
  { id: 'beo_vua', label: 'Nước Béo Vừa', sub: 'Thơm ngậy dịu' },
  { id: 'beo_ngay', label: 'Nước Béo Ngậy', sub: 'Thơm đậm tủy bò' },
];

const NOODLE_OPTIONS = [
  { id: 'vua', label: 'Bánh Tươi Vừa Độ', sub: 'Dai mềm tự nhiên' },
  { id: 'mem', label: 'Bánh Chần Mềm', sub: 'Tan trong miệng' },
  { id: 'it_banh', label: 'Ít Bánh Thêm Nước', sub: 'Nhẹ bụng, thanh tao' },
];

const HERB_OPTIONS = [
  { id: 'day_du', label: 'Đầy Đủ Hành Mùi', sub: 'Hành hoa & mùi tàu' },
  { id: 'dau_hanh', label: 'Nhiều Đầu Hành', sub: 'Chần ngọt giòn' },
  { id: 'khong_hanh', label: 'Không Lấy Hành', sub: 'Thuần vị nước phở' },
  { id: 'rieng', label: 'Rau Đĩa Riêng', sub: 'Thực khách tự thêm' },
];

const SPICE_OPTIONS = [
  { id: 'khong', label: 'Không Cay', sub: 'Thuần ngọt thanh' },
  { id: 'vua', label: 'Cay Vừa', sub: 'Tương ớt phở xưa' },
  { id: 'cay_nong', label: 'Cay Nồng', sub: 'Ớt tươi chỉ thiên' },
];

const formatVND = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

export default function DishCustomizerModal({ isOpen, onClose, dish, onConfirmAdd }) {
  const [broth, setBroth] = useState('trong');
  const [noodle, setNoodle] = useState('vua');
  const [herb, setHerb] = useState('day_du');
  const [spice, setSpice] = useState('vua');
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Reset form when opening for a new dish
  useEffect(() => {
    if (isOpen) {
      setBroth('trong');
      setNoodle('vua');
      setHerb('day_du');
      setSpice('vua');
      setSelectedToppings([]);
      setNotes('');
      setQuantity(1);
    }
  }, [isOpen, dish]);

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const toggleTopping = useCallback((topping) => {
    setSelectedToppings((prev) =>
      prev.some((t) => t.id === topping.id)
        ? prev.filter((t) => t.id !== topping.id)
        : [...prev, topping]
    );
  }, []);

  const { unitPrice, toppingsTotal, grandTotal } = useMemo(() => {
    const base = dish ? dish.price : 0;
    const topSum = selectedToppings.reduce((acc, curr) => acc + curr.price, 0);
    const unit = base + topSum;
    return {
      unitPrice: unit,
      toppingsTotal: topSum,
      grandTotal: unit * quantity,
    };
  }, [dish, selectedToppings, quantity]);

  const handleConfirm = useCallback((e) => {
    if (!dish) return;

    // Generate readable options tags
    const brothObj = BROTH_OPTIONS.find((b) => b.id === broth);
    const noodleObj = NOODLE_OPTIONS.find((n) => n.id === noodle);
    const herbObj = HERB_OPTIONS.find((h) => h.id === herb);
    const spiceObj = SPICE_OPTIONS.find((s) => s.id === spice);

    const customSummary = [
      brothObj?.label,
      noodleObj?.label,
      herbObj?.label,
      spiceObj?.label,
      ...selectedToppings.map((t) => `+${t.name}`),
    ].filter(Boolean);

    // Hash for composite cart item key
    const customHash = [broth, noodle, herb, spice, ...selectedToppings.map((t) => t.id).sort()].join('|');
    const cartItemId = `${dish.id}_${customHash}`;

    const customizedDish = {
      ...dish,
      cartItemId,
      unitPrice,
      price: unitPrice,
      quantity,
      customizations: {
        broth: brothObj?.label,
        brothId: broth,
        noodle: noodleObj?.label,
        noodleId: noodle,
        herb: herbObj?.label,
        herbId: herb,
        spice: spiceObj?.label,
        spiceId: spice,
        toppings: selectedToppings,
        notes: notes.trim(),
        summary: customSummary,
      },
    };

    onConfirmAdd(customizedDish, e);
    onClose();
  }, [dish, broth, noodle, herb, spice, selectedToppings, notes, quantity, unitPrice, onConfirmAdd, onClose]);

  if (!isOpen || !dish) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tùy biến gu ăn phở"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] bg-[#fbf8f1] rounded-t-3xl sm:rounded-3xl border-2 border-[#8a1e14] shadow-2xl flex flex-col overflow-hidden text-[#2c1d11] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Tem Phiếu 1986 */}
        <div className="relative bg-gradient-to-r from-[#8a1e14] via-[#75160d] to-[#591008] text-[#fcf8f2] p-4 sm:p-5 border-b-2 border-[#d4af37] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fbf8f1] border-2 border-[#d4af37] flex items-center justify-center text-[#8a1e14] shadow-md flex-shrink-0">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#f6d892] font-serif border border-[#f6d892]/40 px-1.5 py-0.5 rounded">
                  Tem Phiếu Khẩu Vị 1986
                </span>
                <span className="text-[10px] text-amber-200/80 italic font-serif">Gia Truyền Bát Phố</span>
              </div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-white truncate max-w-[280px] sm:max-w-xs">
                {dish.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-amber-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body - Scrollable Customization Groups */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 divide-y divide-[#d4af37]/20 text-xs sm:text-sm">
          {/* Group 1: Nước Dùng */}
          <div className="pt-2">
            <label className="block font-serif font-bold text-[#8a1e14] text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>1. Độ Béo Nước Dùng</span>
              <span className="text-stone-400 font-sans font-normal text-[11px]">(Ninh 24h xương ống bò)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {BROTH_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBroth(opt.id)}
                  className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all ${
                    broth === opt.id
                      ? 'bg-[#8a1e14] text-white border-[#8a1e14] shadow-md'
                      : 'bg-white/80 text-stone-700 border-stone-300 hover:border-[#8a1e14]/50'
                  }`}
                >
                  <p className="font-bold text-xs leading-tight">{opt.label}</p>
                  <p className={`text-[10px] mt-0.5 ${broth === opt.id ? 'text-amber-200' : 'text-stone-500'}`}>{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Group 2: Bánh Phở */}
          <div className="pt-4">
            <label className="block font-serif font-bold text-[#8a1e14] text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>2. Kết Cấu Bánh Phở</span>
              <span className="text-stone-400 font-sans font-normal text-[11px]">(Bánh tươi tráng tay)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {NOODLE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setNoodle(opt.id)}
                  className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all ${
                    noodle === opt.id
                      ? 'bg-[#8a1e14] text-white border-[#8a1e14] shadow-md'
                      : 'bg-white/80 text-stone-700 border-stone-300 hover:border-[#8a1e14]/50'
                  }`}
                >
                  <p className="font-bold text-xs leading-tight">{opt.label}</p>
                  <p className={`text-[10px] mt-0.5 ${noodle === opt.id ? 'text-amber-200' : 'text-stone-500'}`}>{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Group 3: Hành & Rau Thơm */}
          <div className="pt-4">
            <label className="block font-serif font-bold text-[#8a1e14] text-xs uppercase tracking-wider mb-2">
              3. Hành Hoa & Ngò Gai
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {HERB_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setHerb(opt.id)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    herb === opt.id
                      ? 'bg-[#8a1e14] text-white border-[#8a1e14] shadow-md'
                      : 'bg-white/80 text-stone-700 border-stone-300 hover:border-[#8a1e14]/50'
                  }`}
                >
                  <p className="font-bold text-xs leading-tight">{opt.label}</p>
                  <p className={`text-[10px] mt-0.5 ${herb === opt.id ? 'text-amber-200' : 'text-stone-500'}`}>{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Group 4: Gia Vị Cay */}
          <div className="pt-4">
            <label className="block font-serif font-bold text-[#8a1e14] text-xs uppercase tracking-wider mb-2">
              4. Cấp Độ Cay
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SPICE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSpice(opt.id)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    spice === opt.id
                      ? 'bg-[#8a1e14] text-white border-[#8a1e14] shadow-md'
                      : 'bg-white/80 text-stone-700 border-stone-300 hover:border-[#8a1e14]/50'
                  }`}
                >
                  <p className="font-bold text-xs leading-tight">{opt.label}</p>
                  <p className={`text-[10px] mt-0.5 ${spice === opt.id ? 'text-amber-200' : 'text-stone-500'}`}>{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Group 5: Món Ăn Kèm Tính Phí (Toppings) */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="font-serif font-bold text-[#8a1e14] text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>5. Thêm Món Ăn Kèm Gia Truyền</span>
              </label>
              <span className="text-[11px] text-stone-500 italic">Chọn nhiều món</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TOPPINGS_LIST.map((top) => {
                const isSelected = selectedToppings.some((t) => t.id === top.id);
                return (
                  <button
                    key={top.id}
                    type="button"
                    onClick={() => toggleTopping(top)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-amber-50 border-[#8a1e14] text-[#8a1e14] ring-1 ring-[#8a1e14]'
                        : 'bg-white/80 border-stone-300 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs">{top.name}</p>
                      <p className="text-[10px] text-stone-500">{top.desc}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="font-bold text-xs text-[#8a1e14]">+{formatVND(top.price)}</span>
                      <div className={`w-4 h-4 mt-1 ml-auto rounded border flex items-center justify-center ${isSelected ? 'bg-[#8a1e14] border-[#8a1e14] text-white' : 'border-stone-300'}`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 6: Ghi Chú Riêng */}
          <div className="pt-4">
            <label className="block font-serif font-bold text-[#8a1e14] text-xs uppercase tracking-wider mb-1">
              6. Lời Dặn Riêng Cho Bếp Trưởng
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Nhiều ớt tươi, xin thêm chanh ớt, ít bột ngọt..."
              maxLength={120}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white/90 text-stone-800 focus:outline-none focus:border-[#8a1e14] focus:ring-1 focus:ring-[#8a1e14]"
            />
          </div>
        </div>

        {/* Footer - Quantity & Price & Confirm Button */}
        <div className="p-4 bg-white border-t border-[#d4af37]/40 shadow-inner flex items-center justify-between gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center gap-2 bg-stone-100 rounded-xl p-1 border border-stone-200">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-stone-700 hover:bg-stone-50 active:scale-95 transition-all"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-bold text-sm text-stone-800">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-stone-700 hover:bg-stone-50 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to cart with grand total */}
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-[#8a1e14] via-[#9e2418] to-[#8a1e14] hover:from-[#9e2418] hover:to-[#b52a1c] text-white rounded-xl shadow-lg border border-[#d4af37]/60 font-serif font-bold text-xs sm:text-sm flex items-center justify-between active:scale-[0.98] transition-all"
          >
            <span>Thêm Vào Giỏ Hàng</span>
            <span className="text-amber-200 tracking-wide font-sans">{formatVND(grandTotal)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

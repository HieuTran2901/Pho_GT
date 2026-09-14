import React, { useState, useRef, useEffect } from 'react';
import { Plus, Calendar, Ticket, Utensils, Sparkles } from 'lucide-react';

function ChatActionCard({
  actionType,
  actionPayload,
  onAddToCart,
  onOpenOrder,
  onExploreMenu,
  onToast
}) {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  if (!actionType || actionType === 'NONE' || !actionPayload) {
    return null;
  }

  // 1. Thẻ Món Ăn (Dish Card)
  if (actionType === 'DISH') {
    const handleAdd = (e) => {
      if (onAddToCart) {
        const rect = e.currentTarget.getBoundingClientRect();
        const coords = {
          startX: rect.left + rect.width / 2,
          startY: rect.top + rect.height / 2
        };
        onAddToCart(actionPayload, coords);
      }
    };

    return (
      <div className="rounded-2xl border border-[#d4af37]/40 bg-gradient-to-r from-[#1b0e08] via-[#24120a] to-[#180c07] p-3 text-amber-50 shadow-[0_4px_16px_rgba(0,0,0,0.5)] flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
        <img
          src={actionPayload.image || 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=200&q=80'}
          alt={actionPayload.name}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-[#d4af37]/50 shrink-0 shadow-md"
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs sm:text-[13px] font-serif font-bold text-[#fae29c] truncate">
            {actionPayload.name}
          </div>
          <div className="text-xs sm:text-sm font-mono font-black text-[#e8c068] mt-0.5">
            {Number(actionPayload.price || 75000).toLocaleString('vi-VN')}đ
          </div>
          <button
            onClick={handleAdd}
            className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#fae29c] via-[#d4af37] to-[#b38032] hover:brightness-110 text-stone-950 font-serif font-bold text-[11px] sm:text-xs shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm vào giỏ</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Thẻ Đặt Bàn (Booking Card)
  if (actionType === 'BOOKING') {
    return (
      <div className="rounded-2xl border border-[#d4af37]/40 bg-gradient-to-r from-[#1b0e08] via-[#24120a] to-[#180c07] p-3 text-amber-50 shadow-[0_4px_16px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-[#d4af37]/50 flex items-center justify-center shrink-0 shadow-inner">
            <Calendar className="w-4 h-4 text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-[13px] font-serif font-bold text-[#fae29c] truncate">
              Đặt Bàn Giữ Chỗ 1986
            </div>
            <div className="text-[10px] text-stone-300/85 truncate">
              Bàn gỗ mộc hiên nhà & phòng ấm
            </div>
          </div>
        </div>
        <button
          onClick={() => onOpenOrder && onOpenOrder()}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#fae29c] via-[#d4af37] to-[#b38032] hover:brightness-110 text-stone-950 font-serif font-bold text-xs shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          Đặt Bàn
        </button>
      </div>
    );
  }

  // 3. Thẻ Tem Phiếu Ưu Đãi (Voucher Card)
  if (actionType === 'VOUCHER') {
    const code = actionPayload.code || 'PHO1986VIP';
    const discount = actionPayload.discount || 'GIẢM 20%';

    const handleCopy = () => {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(code);
      }
      setCopied(true);
      if (onToast) onToast(`Đã lưu tem phiếu [${code}] vào sổ tay!`);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2500);
    };

    return (
      <div className="rounded-2xl border border-dashed border-[#d4af37]/65 bg-gradient-to-r from-[#220d08] via-[#2a100a] to-[#1d0b07] p-3.5 text-amber-50 shadow-lg flex items-center justify-between gap-2.5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-red-900/90 border border-red-500/70 flex items-center justify-center shrink-0 shadow-md">
            <Ticket className="w-4 h-4 text-amber-200" />
          </div>
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{discount}</span>
            </div>
            <div className="text-xs font-mono font-black text-[#fae29c] tracking-wider">
              {code}
            </div>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm active:scale-95 ${
            copied
              ? 'bg-emerald-600 text-white shadow-emerald-900/50'
              : 'bg-gradient-to-r from-[#fae29c] via-[#d4af37] to-[#b38032] hover:brightness-110 text-stone-950'
          }`}
        >
          {copied ? 'Đã lưu' : 'Lấy mã'}
        </button>
      </div>
    );
  }

  // 4. Thẻ Thực Đơn (Menu Card)
  if (actionType === 'MENU') {
    return (
      <div>
        <button
          onClick={() => onExploreMenu && onExploreMenu()}
          className="w-full inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl border border-[#d4af37]/45 bg-gradient-to-r from-[#143224] via-[#0e241a] to-[#0a1b13] hover:bg-[#183d2e] text-[#fae29c] font-serif font-bold text-xs shadow-md transition-all cursor-pointer active:scale-[0.99]"
        >
          <Utensils className="w-3.5 h-3.5 text-amber-300" />
          <span>Xem Toàn Bộ Thực Đơn 1986</span>
        </button>
      </div>
    );
  }

  return null;
}

export default React.memo(ChatActionCard);

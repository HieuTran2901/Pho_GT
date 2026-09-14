import React from 'react';
import ChatActionCard from './ChatActionCard';

export function PhoBowlMiniIcon({ className = "w-4 h-4 text-amber-200" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c0 1.5 1 2 1 3s-1 1.5-1 3" strokeWidth="1.4" />
      <path d="M8 4c0 1.5 1 2 1 3s-1 1.5-1 3" strokeWidth="1.2" />
      <path d="M16 4c0 1.5 1 2 1 3s-1 1.5-1 3" strokeWidth="1.2" />
      <path d="M4 11h16c-0.4 5-3.6 8-8 8s-7.6-3-8-8z" fill="currentColor" fillOpacity="0.15" />
      <path d="M9 19h6v1.5H9z" fill="currentColor" />
    </svg>
  );
}

function ChatMessageItem({
  message,
  onAddToCart,
  onOpenOrder,
  onExploreMenu,
  onToast
}) {
  const isAssistant = message.role === 'assistant';

  if (!isAssistant) {
    // 1. Bong bóng Thực Khách: Giấy điệp dát vàng, đuôi thoại góc phải, nhịp thở 20px
    return (
      <div className="flex flex-col items-end mb-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="max-w-[82%] sm:max-w-[78%] flex flex-col items-end gap-1">
          <div className="px-4 py-2.5 sm:py-3 rounded-[20px] rounded-tr-[4px] text-xs sm:text-[13.5px] leading-relaxed shadow-[0_4px_14px_rgba(0,0,0,0.35)] bg-gradient-to-br from-[#e0b86c] via-[#c89643] to-[#b37f2f] text-stone-950 font-serif font-semibold border border-[#ffd580]/40">
            <div className="whitespace-pre-line">{message.content}</div>
          </div>
          <span className="text-[10px] text-[#fae29c]/50 font-serif pr-1">
            {message.time || 'Vừa xong'}
          </span>
        </div>
      </div>
    );
  }

  // 2. Bong bóng Tiểu Nhị: Khung ngọc bích men lam, viền chỉ vàng nổi khối, Thẻ hành động tách độc lập
  return (
    <div className="flex flex-col items-start mb-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Hàng 1: Huân chương Tiểu Nhị + Bong bóng thoại */}
      <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[80%]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0e271c] to-[#06120d] border border-[#d4af37]/80 flex items-center justify-center shrink-0 shadow-md shadow-emerald-950/60 mt-0.5">
          <PhoBowlMiniIcon className="w-4 h-4 text-[#f0d48f]" />
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          <div className="px-4 py-2.5 sm:py-3 rounded-[20px] rounded-tl-[4px] text-xs sm:text-[13.5px] leading-relaxed shadow-[0_4px_16px_rgba(0,0,0,0.45)] bg-gradient-to-br from-[#183d2e] via-[#122e23] to-[#0d221a] border border-[#d4af37]/40 text-[#f5ede0] font-serif backdrop-blur-md">
            <div className="whitespace-pre-line">{message.content}</div>
          </div>
          <span className="text-[10px] text-[#fae29c]/50 font-serif pl-1">
            {message.time || 'Vừa xong'}
          </span>
        </div>
      </div>

      {/* Hàng 2: Thẻ hành động độc lập (Decoupled Action Card) - Thoáng đãng, không bị bóp nghẹt */}
      {message.actionType && message.actionType !== 'NONE' && (
        <div className="pl-10.5 mt-2 w-full max-w-[95%] sm:max-w-[85%]">
          <ChatActionCard
            actionType={message.actionType}
            actionPayload={message.actionPayload}
            onAddToCart={onAddToCart}
            onOpenOrder={onOpenOrder}
            onExploreMenu={onExploreMenu}
            onToast={onToast}
          />
        </div>
      )}
    </div>
  );
}

export default React.memo(ChatMessageItem);

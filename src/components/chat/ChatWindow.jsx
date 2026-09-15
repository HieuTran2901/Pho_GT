import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Send, Smile, ArrowLeft, Phone, Flame, Sparkles, ArrowRight } from 'lucide-react';
import ChatMessageItem, { PhoBowlMiniIcon } from './ChatMessageItem';
import { QUICK_SUGGESTIONS } from './chatConstants';

function ChatWindow({
  isOpen,
  onClose,
  onMinimize,
  messages,
  onSend,
  isTyping,
  onAddToCart,
  onOpenOrder,
  onExploreMenu,
  onToast
}) {
  const messagesContainerRef = useRef(null);
  const [input, setInput] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);

  // Tối ưu hóa cuộn cô lập: Cuộn mượt trong container nội bộ, triệt tiêu Scroll Stuttering trên mobile
  useEffect(() => {
    if (isOpen && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const text = input;
    setInput('');
    setShowActionSheet(false);
    onSend(text);
  };

  const handleSuggestionClick = (query) => {
    if (isTyping) return;
    setShowActionSheet(false);
    onSend(query);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden select-none">
      
      {/* 1. Header Tiểu Nhị 1986 Chuẩn Native Mobile App (Có nút Quay lại & Hotline trên Mobile, Giữ nguyên Khung Ngọc Bích trên PC) */}
      <div className="relative pt-[max(0.75rem,env(safe-area-inset-top))] p-3 sm:p-4 pb-2.5 sm:pb-3 bg-gradient-to-b from-[#122b21] via-[#0d2119] to-[#0a1a13] border-b border-[#d4af37]/40 flex items-center justify-between shrink-0">
        {/* Botanical leaf flourishes overlay */}
        <div className="absolute top-0 right-14 pointer-events-none opacity-40">
          <svg width="70" height="35" viewBox="0 0 70 35" fill="none">
            <path d="M70 0c-15 5-25 15-30 30-2-12-10-22-25-28 15-2 30-2 55-2z" fill="#2d5e46" />
            <path d="M50 8c-8 3-15 10-18 20" stroke="#d4af37" strokeWidth="0.8" opacity="0.6" />
          </svg>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 relative z-10">
          {/* Nút Quay Lại Native trên Mobile (Thay thế nút X/Minus chật hẹp) */}
          <button
            onClick={onClose}
            className="sm:hidden -ml-1 p-2 text-[#d4af37] hover:text-amber-200 active:scale-95 transition-all rounded-full hover:bg-emerald-950/50 cursor-pointer flex items-center justify-center"
            aria-label="Đóng khung chat"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Huân chương Bát Phở Bát Tràng Tỏa Khói */}
          <div className="relative">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#0c2319] via-[#071610] to-[#040c08] border-2 border-[#d4af37] p-0.5 sm:p-1 shadow-[0_0_12px_rgba(212,175,55,0.4)] flex items-center justify-center">
              <div className="w-full h-full rounded-full border border-[#d4af37]/50 flex items-center justify-center bg-[#0d241a]">
                <PhoBowlMiniIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#fae29c] drop-shadow-md" />
              </div>
            </div>
            {/* Vệt hoa lá trang trí ôm sát góc trái */}
            <div className="absolute -top-1.5 -left-1.5 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none opacity-60">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M0 20C2 10 10 2 20 0 10 6 6 10 0 20z" fill="#2d6a4f" />
              </svg>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h3 className="font-serif font-black text-[13.5px] sm:text-base text-[#fdf8e6] tracking-tight leading-tight drop-shadow-sm">
                Tiểu Nhị Phố Cũ 1986
              </h3>
              <span className="px-1.5 py-0.5 rounded-full border border-[#d4af37]/90 bg-[#163628] text-[8.5px] sm:text-[9.5px] font-mono text-[#fae29c] font-black shadow-inner">
                AI
              </span>
            </div>
            <div className="text-[10px] sm:text-[11.5px] text-[#e2cf9b] font-serif flex items-center gap-1 mt-0.5">
              <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 animate-pulse" />
              <span>Đang đun nước dùng • Phản hồi tức thì</span>
            </div>
          </div>
        </div>

        {/* Cụm điều khiển: Phím gọi Hotline nhanh trên Mobile & Cụm nút Thu nhỏ/Đóng trên Desktop */}
        <div className="flex items-center gap-1.5 relative z-10 text-[#e5d4a4]">
          {/* Nút gọi Hotline Phở 1986 trên Mobile */}
          <a
            href="tel:0986198686"
            className="sm:hidden p-2 text-[#d4af37] hover:text-amber-200 active:scale-95 transition-all rounded-full bg-[#122b21]/90 border border-[#d4af37]/50 flex items-center justify-center shadow-sm"
            title="Gọi Hotline 1986"
            aria-label="Gọi Hotline 1986"
          >
            <Phone className="w-4 h-4" />
          </a>

          {/* Cụm nút Desktop (Minus, Close) */}
          <div className="hidden sm:flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={onMinimize}
              className="p-1.5 hover:text-white hover:bg-emerald-950/60 rounded-lg transition-colors cursor-pointer"
              title="Thu nhỏ"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:text-white hover:bg-emerald-950/60 rounded-lg transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Khu Vực Tin Nhắn & Nền Thủy Mặc Hà Nội 1986 */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-thin scrollbar-thumb-emerald-900/40 relative"
      >
        {/* Watermark 1: Bản vẽ nét vàng mái ngói chùa cổ phố Hà Nội (Dưới bên trái) */}
        <div className="absolute left-3 bottom-20 pointer-events-none opacity-[0.07] select-none z-0">
          <svg width="150" height="130" viewBox="0 0 150 130" fill="none" stroke="#d4af37" strokeWidth="1">
            <path d="M10 110h130M25 110v-30h100v30M35 80h80M45 80v-20h60v20M55 60h40M60 60v-15h30v15M75 45v-10" />
            <path d="M15 80c10-8 30-12 60-12s50 4 60 12M35 60c8-6 25-9 40-9s32 3 40 9M50 45c6-4 15-6 25-6s19 2 25 6" strokeWidth="1.4" />
            <line x1="75" y1="25" x2="75" y2="35" strokeWidth="1.8" />
          </svg>
        </div>

        {/* Danh sách tin nhắn */}
        <div className="relative z-10">
          {messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              onAddToCart={onAddToCart}
              onOpenOrder={onOpenOrder}
              onExploreMenu={onExploreMenu}
              onToast={onToast}
            />
          ))}

          {/* Hiệu ứng gõ chữ */}
          {isTyping && (
            <div className="flex items-center gap-2 mb-3 animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-full bg-[#0e271c] border border-[#d4af37]/80 flex items-center justify-center shrink-0">
                <PhoBowlMiniIcon className="w-4 h-4 text-[#f0d48f] animate-pulse" />
              </div>
              <div className="px-4 py-2.5 rounded-2xl rounded-tl-none bg-[#13261e]/90 border border-emerald-500/30 text-[#fae29c] flex items-center gap-1.5 shadow-md">
                <span className="text-xs font-serif italic text-stone-300">Tiểu Nhị đang soạn lời</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Khay Thao Tác Nhanh Di Sản 1986 với hiệu ứng AnimatePresence trượt mở mượt mà */}
      <AnimatePresence>
        {showActionSheet && (
          <>
            {/* Backdrop mờ nhẹ tự nhiên để đóng Action Sheet */}
            <motion.div
              key="action-sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowActionSheet(false)}
              className="absolute inset-0 z-20 bg-black/50 backdrop-blur-[2px]"
              aria-hidden="true"
            />

            {/* 3. Khay Thao Tác Nhanh Di Sản 1986 (Action Sheet - Viền Mảnh Sang Trọng & Tự Nhiên) */}
            <motion.div
              key="action-sheet-body"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 bottom-[62px] sm:bottom-[66px] z-30 bg-gradient-to-b from-[#0f291e] via-[#091b13] to-[#05110b] border-t border-[#d4af37]/35 sm:border sm:border-[#d4af37]/35 rounded-t-[2rem] sm:rounded-2xl sm:mx-3 shadow-[0_-15px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl p-4 pt-3 pb-4"
            >
              {/* Thanh chỉ dẫn kéo mềm mại (Grab Handle) */}
              <div className="w-10 h-1 rounded-full bg-[#d4af37]/35 mx-auto mb-3" />

              <div className="flex items-center justify-between pb-2.5 border-b border-[#d4af37]/20 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
                  <h4 className="font-serif font-bold text-xs sm:text-[13px] text-[#fdf8e6] tracking-wide">
                    Tiểu Nhị Khuyên Dùng • Thao Tác Nhanh
                  </h4>
                </div>
                <button
                  onClick={() => setShowActionSheet(false)}
                  className="p-1 text-emerald-400/70 hover:text-white hover:bg-emerald-950/60 rounded-full transition-colors cursor-pointer"
                  aria-label="Đóng khay gợi ý"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-[48vh] sm:max-h-[260px] overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-emerald-900/50">
                {QUICK_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug.id}
                    onClick={() => handleSuggestionClick(sug.query)}
                    disabled={isTyping}
                    className="w-full text-left p-2.5 rounded-xl bg-[#0b1f16]/60 hover:bg-[#133827]/90 border border-[#d4af37]/15 hover:border-[#d4af37]/45 transition-all active:scale-[0.99] flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0 w-8 h-8 rounded-lg bg-[#0e271c] border border-[#d4af37]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {sug.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="font-serif font-semibold text-xs sm:text-[12.5px] text-[#fae29c] group-hover:text-amber-200 truncate">
                          {sug.label}
                        </div>
                        <div className="text-[10.5px] text-stone-300/75 truncate mt-0.5 font-serif">
                          {sug.desc}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#d4af37]/50 group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 4. Khung Nhập Liệu Tách Rời Chuẩn Mực: Viên Nang Thoáng Đạt & Nút Máy Bay Tròn Riêng Biệt */}
      <div className="p-3 pt-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3 bg-gradient-to-t from-[#040c08] via-[#06120d] to-transparent z-10 shrink-0">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 max-w-full"
        >
          {/* Khung Input viên nang bo tròn chứa các icon và trường gõ */}
          <div className="flex-1 min-w-0 flex items-center gap-1 sm:gap-1.5 bg-[#0a1c15]/95 border border-[#d4af37]/30 focus-within:border-[#d4af37]/75 rounded-full px-2.5 sm:px-3 py-1.5 sm:py-2 shadow-[0_4px_25px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all backdrop-blur-md">
            {/* Biểu tượng mặt cười phong nhã */}
            <button
              type="button"
              className="text-[#fae29c]/60 hover:text-[#d4af37] p-1 transition-colors shrink-0 cursor-pointer"
              title="Biểu cảm"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Nút Gợi Ý Nhanh: Biểu tượng Sparkles thanh thoát tự nhiên */}
            <button
              type="button"
              onClick={() => setShowActionSheet((prev) => !prev)}
              className={`p-1 rounded-full transition-all shrink-0 cursor-pointer active:scale-95 ${
                showActionSheet
                  ? 'text-[#d4af37] bg-[#d4af37]/20 scale-105'
                  : 'text-[#fae29c]/60 hover:text-[#d4af37]'
              }`}
              title={showActionSheet ? 'Đóng gợi ý' : 'Mở gợi ý nhanh'}
              aria-label="Gợi ý nhanh"
            >
              <Sparkles className="w-5 h-5" />
            </button>

            {/* Ô nhập câu hỏi với chữ placeholder nhỏ nhắn, tinh tế vừa vặn */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi món ngon, đặt bàn, ưu đãi..."
              maxLength={300}
              className="flex-1 min-w-0 bg-transparent text-[#fdf8e6] placeholder-[#fae29c]/40 text-xs sm:text-[13px] placeholder:text-[11px] sm:placeholder:text-[12px] font-serif focus:outline-none px-1"
            />
          </div>

          {/* Nút gửi máy bay tách riêng thành khung tròn độc lập với sắc hoàng kim di sản */}
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all shrink-0 shadow-md ${
              input.trim() && !isTyping
                ? 'bg-gradient-to-br from-[#fae29c] via-[#d4af37] to-[#aa7e2b] text-stone-950 shadow-[0_3px_15px_rgba(212,175,55,0.45)] hover:scale-105 active:scale-95 cursor-pointer'
                : 'bg-gradient-to-br from-[#d4af37]/35 via-[#b89530]/25 to-[#6d5415]/20 border border-[#d4af37]/30 text-stone-900/60 cursor-not-allowed opacity-60'
            }`}
            aria-label="Gửi câu hỏi"
          >
            <Send className="w-4 h-4 text-stone-950 ml-0.5" />
          </button>
        </form>
      </div>

      {/* 5. Chân Đế Gỗ Mộc Sơn Mài Bát Tràng (Tablet Pedestal) - Chỉ hiển thị trên Desktop */}
      <div className="hidden sm:flex h-3.5 bg-gradient-to-r from-[#1c0f08] via-[#3a2012] to-[#1c0f08] border-t border-[#d4af37]/35 relative items-center justify-center shrink-0">
        <div className="w-24 h-0.5 rounded-full bg-[#d4af37]/50 shadow-[0_0_8px_#d4af37]" />
      </div>
    </div>
  );
}

export default React.memo(ChatWindow);

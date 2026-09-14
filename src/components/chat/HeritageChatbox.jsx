import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChatLauncher from './ChatLauncher';
import ChatWindow from './ChatWindow';
import { INITIAL_GREETING, CLIENT_FALLBACK_ANSWERS } from './chatConstants';
import { getApiBaseUrl } from '../../services/apiConfig';

const STORAGE_KEY = 'pho1986_chat_history';

// [RAVEN & URBAN] Heritage Portal Bloom Architecture (Tối ưu GPU Transform 60fps thuần khiết)
const smoothEase = [0.16, 1, 0.3, 1];
const exitEase = [0.4, 0, 0.2, 1];

const windowVariants = {
  initial: (isMobile) => (isMobile
    ? {
        opacity: 0,
        y: '100%'
      }
    : {
        opacity: 0,
        y: 20,
        scale: 0.82
      }),
  animate: (isMobile) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: isMobile ? 0.32 : 0.38,
      ease: smoothEase
    }
  }),
  exit: (isMobile) => (isMobile
    ? {
        opacity: 0,
        y: '100%',
        transition: {
          duration: 0.24,
          ease: exitEase
        }
      }
    : {
        opacity: 0,
        y: 20,
        scale: 0.82,
        transition: {
          duration: 0.25,
          ease: exitEase
        }
      })
};

export default function HeritageChatbox({
  onAddToCart,
  onOpenOrder,
  onExploreMenu,
  onToast
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 640 : false));
  const fallbackTimerRef = useRef(null);

  // [RAVEN & URBAN] Lắng nghe thay đổi kích thước viewport phản ứng linh hoạt
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // [RAVEN] Cleanup timer khi component unmount tránh memory leak
  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
    };
  }, []);

  // [RAVEN & URBAN] Khóa cuộn trang nền khi mở Native Chatbox trên Mobile (Triệt tiêu Zero Scroll Yanking)
  useEffect(() => {
    if (isOpen && isMobile) {
      if (typeof window !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
    }
  }, [isOpen, isMobile]);

  // [RAVEN & URBAN] Chỉ mở khóa cuộn sau khi Animation đóng đã hoàn tất 100% (Tránh reflow khi đang exit)
  const handleExitComplete = useCallback(() => {
    if (typeof window !== 'undefined' && document.body.style.overflow === 'hidden') {
      document.body.style.overflow = '';
    }
  }, []);

  // Cleanup an toàn khi unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
      }
    };
  }, []);

  const [messages, setMessages] = useState(() => {
    if (typeof window === 'undefined') return [INITIAL_GREETING];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // quiet fail
    }
    return [INITIAL_GREETING];
  });

  const [isTyping, setIsTyping] = useState(false);

  // [RAVEN] Ổn định hóa tham chiếu bằng useRef tránh hook churn và re-render liên đới
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const isTypingRef = useRef(isTyping);
  isTypingRef.current = isTyping;

  // Lưu lịch sử chat
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
      } catch {
        // quiet fail
      }
    }
  }, [messages]);

  const handleSend = useCallback(async (userText) => {
    const text = (userText || '').trim();
    if (!text || isTypingRef.current) return;

    const userMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Chuẩn bị lịch sử rút gọn gửi lên server
    const currentMessages = messagesRef.current;
    const history = currentMessages.slice(-4).map((m) => ({
      role: m.role,
      content: m.content
    }));

    try {
      const chatApiUrl = getApiBaseUrl('chat');
      const res = await fetch(chatApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          history
        })
      });

      if (res.ok) {
        const data = await res.json();
        const botMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          content: data.reply || 'Dạ Tiểu Nhị xin hầu chuyện Bác!',
          actionType: data.actionType || 'NONE',
          actionPayload: data.actionPayload || null,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
        return;
      }
    } catch (err) {
      console.warn('[HeritageChatbox] Lỗi gọi API chat:', err);
    }

    // Client-side fallback nếu backend bận hoặc ngoại tuyến
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
    }
    fallbackTimerRef.current = setTimeout(() => {
      let matched = null;
      const lower = text.toLowerCase();
      if (lower.includes('bạn là ai') || lower.includes('em là ai') || lower.includes('tên gì')) {
        matched = {
          reply: 'Dạ em là Tiểu Nhị quán Phở Gia Truyền 1986. Em túc trực ở đây để hầu chuyện, giới thiệu thực đơn ninh chậm 24h và giúp Bác đặt bàn, nhận ưu đãi ạ!',
          actionType: 'NONE',
          actionPayload: null
        };
      } else if (lower.includes('tái lăn') || lower.includes('gợi ý')) matched = CLIENT_FALLBACK_ANSWERS.tai_lan;
      else if (lower.includes('đặt bàn') || lower.includes('giữ chỗ')) matched = CLIENT_FALLBACK_ANSWERS.booking;
      else if (lower.includes('mã') || lower.includes('voucher') || lower.includes('giảm giá')) matched = CLIENT_FALLBACK_ANSWERS.voucher;

      const fallbackReply = matched
        ? matched.reply
        : 'Dạ em chào Bác! Nước dùng phở 1986 được ninh chậm 24 giờ thơm lừng thảo mộc. Bác có muốn em gợi ý một bát phở tái lăn áp chảo hay hướng dẫn đặt bàn trước không ạ?';

      const botMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: fallbackReply,
        actionType: matched ? matched.actionType : 'NONE',
        actionPayload: matched ? matched.actionPayload : null,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 600);
  }, []);

  return (
    <>
      {/* 1. Nút Launcher Trò Chuyện (Tiểu Nhị 1986) - Handoff mượt mà, trễ nhẹ đón đầu khi Chatbox thu hồi */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="chatbox-launcher-wrapper"
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { duration: 0.22, delay: 0.12, ease: [0.16, 1, 0.3, 1] }
            }}
            exit={{
              opacity: 0,
              scale: 0.75,
              transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] }
            }}
            className="fixed bottom-20 sm:bottom-6 right-3.5 sm:right-6 z-40 select-none pointer-events-auto"
          >
            <ChatLauncher
              isOpen={false}
              onClick={() => setIsOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Khung Bảo Vệ Cắt Tràn Cố Định - Tránh tràn scrollbar và bảo toàn vòng đời AnimatePresence */}
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden select-none">
        <AnimatePresence onExitComplete={handleExitComplete}>
          {isOpen && (
            <motion.div
              key="chatbox-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              onClick={() => setIsOpen(false)}
              className="pointer-events-auto sm:hidden fixed inset-0 z-40 bg-black/65 backdrop-blur-[2px]"
              aria-hidden="true"
            />
          )}

          {isOpen && (
            <motion.div
              key="chatbox-window-wrapper"
              variants={windowVariants}
              custom={isMobile}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ transformOrigin: isMobile ? 'bottom center' : 'bottom right' }}
              className="pointer-events-auto transform-gpu will-change-[transform,opacity] fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 w-full sm:w-[418px] h-[100dvh] sm:h-[610px] max-h-[100dvh] sm:max-h-[90vh] rounded-none sm:rounded-[2.2rem] border-0 sm:border-2 border-[#d4af37]/90 bg-gradient-to-b from-[#0b1b15] via-[#07130e] to-[#040b08] shadow-[0_-12px_45px_rgba(0,0,0,0.9),0_0_35px_rgba(212,175,55,0.2)] flex flex-col overflow-hidden backdrop-blur-2xl select-none origin-bottom-right"
            >
              <ChatWindow
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onMinimize={() => setIsOpen(false)}
                messages={messages}
                onSend={handleSend}
                isTyping={isTyping}
                onAddToCart={onAddToCart}
                onOpenOrder={onOpenOrder}
                onExploreMenu={onExploreMenu}
                onToast={onToast}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Utensils, Flame } from 'lucide-react';

export default function MarketingStickyBookingBar({ show, onActionClick }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          aria-label="Thanh ưu đãi đặt bàn nhanh"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-5 inset-x-4 max-w-4xl mx-auto z-40"
        >
          <div className="rounded-full border border-amber-500/60 bg-stone-950/90 backdrop-blur-xl p-2 sm:p-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3">
            {/* Left: Real-time Social Proof & Urgency */}
            <div className="flex items-center gap-3 pl-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-serif font-bold text-amber-200">
                    Phở Gia Truyền 1986
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.2 rounded bg-red-950/80 text-red-300 border border-red-800/40">
                    Chỉ còn 18 suất 20%
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 font-serif">
                  1.482 thực khách đã thưởng thức hôm nay
                </div>
              </div>
              <div className="sm:hidden text-left">
                <span className="text-xs font-serif font-bold text-amber-300 block">Ưu Đãi 20%</span>
                <span className="text-[10px] text-stone-400 font-mono">Chỉ còn 18 suất</span>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex items-center gap-2 pr-1">
              <button
                onClick={() => onActionClick && onActionClick('BOOK_TABLE')}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-serif font-bold text-xs sm:text-sm shadow-lg shadow-amber-950/70 hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
              >
                <Calendar className="w-4 h-4" />
                <span>Đặt Bàn (30s)</span>
              </button>

              <button
                onClick={() => onActionClick && onActionClick('VIEW_MENU')}
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-amber-600/40 bg-stone-900/80 text-amber-200 hover:bg-stone-800 text-xs font-serif font-semibold transition-all whitespace-nowrap"
              >
                <Utensils className="w-3.5 h-3.5 text-amber-400" />
                <span>Menu</span>
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

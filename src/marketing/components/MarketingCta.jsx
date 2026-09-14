import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, UtensilsCrossed, Calendar, Sparkles, MapPin } from 'lucide-react';

export default function MarketingCta({ onActionClick }) {
  return (
    <section className="py-32 px-4 sm:px-8 bg-transparent text-amber-50 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.3em] uppercase text-amber-400 mb-3 px-3.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/50">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>KÍNH MỜI TRI KỶ THƯỞNG VỊ</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 mb-6 leading-tight drop-shadow-md">
            Ghé Quán Thưởng Phở 1986
          </h2>

          <p className="text-stone-300 font-serif text-base sm:text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
            Dưới mái hiên ngói rêu phong và làn gió heo may, kính mời bạn cùng tri kỷ ghé quán bên chiếc bàn gỗ mộc, nâng thìa nước dùng sóng sánh ngạt ngào hương hồi quế.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900/80 border border-amber-700/50 text-amber-300 text-xs font-mono mb-10">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <span>Mỗi buổi chỉ chưng cất đủ 150 bát nước dùng cốt tủy để giữ trọn đỉnh vị</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <button
              onClick={() => onActionClick && onActionClick('BOOK_TABLE')}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-serif font-bold text-base shadow-[0_10px_35px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Calendar className="w-5 h-5" />
              <span>Đặt Bàn Giữ Chỗ (30s)</span>
            </button>

            <button
              onClick={() => onActionClick && onActionClick('EXPLORE_MENU')}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full border border-amber-600/50 bg-stone-900/80 text-amber-200 hover:bg-stone-800 hover:border-amber-400 font-serif font-semibold text-base transition-all duration-200 backdrop-blur-md"
            >
              <UtensilsCrossed className="w-5 h-5 text-amber-400" />
              <span>Xem Thực Đơn 1986</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          <div className="mt-16 text-xs text-stone-400 font-mono tracking-widest uppercase">
            PHỞ GIA TRUYỀN 1986 • HÀ NỘI CULINARY ARCHIVE • 06:00 — 23:00 DAILY
          </div>
        </motion.div>
      </div>
    </section>
  );
}

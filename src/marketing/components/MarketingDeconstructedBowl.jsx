import React, { useState, useRef } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { Sparkles, Utensils, CheckCircle2, Flame } from 'lucide-react';
import { MARKETING_BOWL_LAYERS } from '../marketingConstants';

export default function MarketingDeconstructedBowl({ onExploreDish }) {
  const [activeTab, setActiveTab] = useState(0);
  const [isAssembled, setIsAssembled] = useState(false);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  return (
    <section
      ref={containerRef}
      className="py-32 px-4 sm:px-8 bg-transparent text-amber-50 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Editorial Header */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-70px' }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 mb-16 border-b border-amber-800/30"
        >
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.3em] uppercase text-amber-400 mb-3 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-600/40">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>CHƯƠNG IV • BẢN GIAO HƯỞNG BÁT CHIẾT YÊU</span>
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 leading-tight drop-shadow-md">
              Phân Rã & Hội Tụ
            </h2>
          </div>

          {/* Heritage Mode Switcher */}
          <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-stone-900/90 border border-amber-700/50 backdrop-blur-md shadow-xl">
            <button
              onClick={() => setIsAssembled(false)}
              className={`px-6 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider font-bold transition-all ${
                !isAssembled
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 shadow-md scale-105'
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              Phân Rã 4 Tầng
            </button>
            <button
              onClick={() => setIsAssembled(true)}
              className={`px-6 py-2.5 rounded-full font-mono text-xs uppercase tracking-wider font-bold transition-all ${
                isAssembled
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 shadow-md scale-105'
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              Hội Tụ Bát Phở
            </button>
          </div>
        </motion.div>

        {/* Dynamic Display Area */}
        <AnimatePresence mode="wait">
          {!isAssembled ? (
            /* Mode 1: 4 Tầng Phân Rã Khám Phá với 3D Card Stack */
            <motion.div
              key="deconstructed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center [perspective:1200px]"
            >
              {/* Left Column: Interactive Layer Cards */}
              <div className="lg:col-span-5 space-y-4">
                {MARKETING_BOWL_LAYERS.map((layer, idx) => (
                  <motion.div
                    key={layer.id}
                    initial={{ opacity: 0, x: -40, rotateY: 15 }}
                    whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      type: 'spring',
                      stiffness: 240,
                      damping: 22,
                      delay: idx * 0.09
                    }}
                    whileHover={{ scale: 1.02, x: 6 }}
                    onClick={() => setActiveTab(idx)}
                    className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 backdrop-blur-md ${
                      activeTab === idx
                        ? 'border-amber-400 bg-amber-950/60 shadow-[0_0_25px_rgba(245,158,11,0.25)] scale-[1.02]'
                        : 'border-amber-800/30 bg-stone-900/60 hover:bg-stone-900/90'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {layer.title}
                      </span>
                      <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-700/40">
                        {layer.badge}
                      </span>
                    </div>
                    <h4 className="text-lg font-serif font-bold text-amber-100 mb-1">
                      {layer.name}
                    </h4>
                    <p className="text-xs text-stone-300 font-serif line-clamp-2">
                      {layer.desc}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Right Column: Layer Visual Focus Preview */}
              <div className="lg:col-span-7">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="relative rounded-3xl overflow-hidden border border-amber-500/40 bg-stone-900/90 backdrop-blur-md shadow-2xl p-4"
                >
                  <div className="relative h-80 sm:h-[420px] rounded-2xl overflow-hidden mb-4">
                    <img
                      src={MARKETING_BOWL_LAYERS[activeTab].image}
                      alt={MARKETING_BOWL_LAYERS[activeTab].name}
                      className="w-full h-full object-cover brightness-100 contrast-105 transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-left">
                      <span className="inline-block px-3 py-1 rounded-full bg-amber-500 text-stone-950 text-xs font-mono uppercase tracking-wider font-bold mb-2 shadow-lg">
                        {MARKETING_BOWL_LAYERS[activeTab].badge}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100 mb-1">
                        {MARKETING_BOWL_LAYERS[activeTab].name}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-300 font-serif max-w-xl">
                        {MARKETING_BOWL_LAYERS[activeTab].desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2 pt-1 text-xs text-stone-400 font-serif">
                    <span>Cấu trúc bát phở truyền thống Bát Tràng</span>
                    <button
                      onClick={() => setIsAssembled(true)}
                      className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold"
                    >
                      <span>Hội tụ bát phở hoàn chỉnh</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            /* Mode 2: Bát Phở Đã Hội Tụ Hoàn Mỹ với 3D Assembly */
            <motion.div
              key="assembled"
              initial={{ opacity: 0, scale: 0.88, rotateX: 15 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="relative rounded-3xl overflow-hidden border-2 border-amber-400/80 bg-stone-900/95 p-8 shadow-2xl backdrop-blur-xl">
                <div className="relative h-80 sm:h-[420px] rounded-2xl overflow-hidden mb-6 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1000&q=80"
                    alt="Bát Phở Hoàn Bích 1986"
                    className="w-full h-full object-cover brightness-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 18, delay: 0.2 }}
                    className="absolute top-5 right-5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-mono text-xs uppercase tracking-wider font-black shadow-xl flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-stone-950" />
                    <span>HOÀN HẢO HỘI TỤ</span>
                  </motion.div>
                </div>

                <h3 className="text-3xl sm:text-4xl font-serif font-black text-amber-100 mb-2">
                  Bát Chiết Yêu Men Lam Bát Tràng 1986
                </h3>
                <p className="text-stone-300 font-serif text-sm max-w-xl mx-auto mb-8 leading-relaxed">
                  Khi gốm men lam giữ trọn hơi nóng bỏng rẫy, bánh phở tráng cối đá ngậm nước dùng hổ phách, bò tơ thơm nồng tỏi phi và hành hoa chẻ xoăn tơ — đó là đỉnh cao của phong vị Hà Nội 1986.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={() => onExploreDish && onExploreDish('menu')}
                    className="inline-flex items-center gap-2 px-9 py-4 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-serif font-bold text-base shadow-2xl shadow-amber-900/70 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Utensils className="w-4 h-4" />
                    <span>Thưởng Thức Ngay Tại Menu 1986</span>
                  </button>
                  <button
                    onClick={() => setIsAssembled(false)}
                    className="inline-flex items-center gap-2 px-6 py-4 rounded-full border border-amber-600/40 bg-stone-900/70 text-amber-200 hover:bg-stone-800 text-sm font-serif font-semibold transition-all"
                  >
                    <span>Xem lại 4 tầng nguyên liệu</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

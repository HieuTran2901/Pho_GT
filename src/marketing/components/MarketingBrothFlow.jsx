import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Clock, Flame, Sparkles } from 'lucide-react';
import { MARKETING_TIMELINE } from '../marketingConstants';

export default function MarketingBrothFlow() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center']
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section
      ref={containerRef}
      className="py-28 px-4 sm:px-8 bg-transparent text-amber-50 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Editorial Header */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-70px' }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 mb-20 border-b border-amber-800/30"
        >
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.3em] uppercase text-amber-400 mb-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/50">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>CHƯƠNG III • GIAN BẾP THAN HOA 1986</span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 leading-tight">
              24 Giờ Chưng Cất
            </h2>
          </div>
          <p className="text-stone-300 font-serif text-sm sm:text-base max-w-md leading-relaxed">
            Lửa than liu riu suốt đêm đông phố cũ, tủy xương tơ thôi ra từng giọt béo ngọt tự nhiên, hòa quyện cùng sá sùng phơi sương và gừng nướng thơm lừng.
          </p>
        </motion.div>

        {/* Timeline Gallery with 3D Perspective */}
        <div className="relative pl-6 sm:pl-0 [perspective:1200px]">
          {/* Base Guide Hairline */}
          <div className="absolute left-6 sm:left-1/2 top-4 bottom-4 w-px -translate-x-1/2 bg-stone-800/80" />

          {/* Glowing Amber Spine Line */}
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-6 sm:left-1/2 top-4 w-0.5 -translate-x-1/2 bg-gradient-to-b from-amber-400 via-amber-300 to-yellow-200 shadow-[0_0_15px_#fbbf24] rounded-full origin-top"
          />

          {/* Timeline Nodes */}
          <div className="space-y-16 sm:space-y-24">
            {MARKETING_TIMELINE.map((item, index) => {
              const isEven = index % 2 === 0;

              return (
                <div
                  key={item.hour}
                  className={`relative flex flex-col sm:flex-row items-start ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  } gap-8 sm:gap-16`}
                >
                  {/* Central Node Indicator with Charcoal Fire Pulse */}
                  <motion.div
                    initial={{ scale: 0.4, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ type: 'spring', stiffness: 320, damping: 15 }}
                    className="absolute left-6 sm:left-1/2 top-2 -translate-x-1/2 z-20 flex items-center justify-center"
                  >
                    <div className="w-9 h-9 rounded-full bg-stone-950 border border-amber-400/80 flex items-center justify-center shadow-[0_0_14px_rgba(245,158,11,0.6)]">
                      <Clock className="w-4 h-4 text-amber-300" />
                    </div>
                  </motion.div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden sm:block sm:w-1/2" />

                  {/* 3D Fly-In Editorial Milestone Card */}
                  <motion.div
                    initial={{
                      opacity: 0,
                      x: isEven ? -60 : 60,
                      rotateY: isEven ? 15 : -15,
                      scale: 0.92
                    }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                      rotateY: 0,
                      scale: 1
                    }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{
                      type: 'spring',
                      stiffness: 220,
                      damping: 22,
                      delay: index * 0.1
                    }}
                    whileHover={{
                      scale: 1.02,
                      y: -4,
                      transition: { duration: 0.2 }
                    }}
                    className={`ml-10 sm:ml-0 sm:w-1/2 rounded-3xl border border-amber-700/40 bg-gradient-to-br from-stone-900/90 via-stone-950/85 to-[#1a0c06]/90 p-8 backdrop-blur-md shadow-2xl hover:border-amber-400/80 transition-colors ${
                      isEven ? 'sm:text-right' : 'sm:text-left'
                    }`}
                  >
                    {/* Oversized Vintage Retro Hour Display */}
                    <div className="flex items-baseline gap-3 mb-2 justify-start sm:justify-start">
                      <span className={`text-4xl sm:text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400 tracking-tight drop-shadow-sm ${isEven ? 'sm:ml-auto' : ''}`}>
                        {item.hour}
                      </span>
                      <span className="text-xs font-mono tracking-widest uppercase px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-700/50 text-amber-300">
                        {item.step}
                      </span>
                    </div>

                    <h3 className="text-2xl font-serif font-bold text-amber-100 mb-2">
                      {item.title}
                    </h3>

                    <div className={`inline-flex items-center gap-1.5 text-xs text-amber-300 font-semibold mb-3 ${isEven ? 'sm:justify-end' : 'sm:justify-start'}`}>
                      <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                      <span>{item.highlight}</span>
                    </div>

                    <p className="text-stone-300 font-serif text-sm leading-relaxed">
                      {item.desc}
                    </p>

                    <div className={`mt-5 pt-4 border-t border-amber-900/30 text-[11px] font-mono text-amber-400/70 flex items-center gap-2 ${isEven ? 'sm:justify-end' : 'sm:justify-start'}`}>
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Than củi đượm lửa • Nồi đồng 1986</span>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

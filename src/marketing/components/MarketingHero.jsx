import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Star, ShieldCheck, Flame, ChevronDown } from 'lucide-react';
import { MARKETING_CAMPAIGN } from '../marketingConstants';

export default function MarketingHero({ onActionClick }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '16%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.15]);
  const bowlScale = useTransform(scrollYProgress, [0, 0.8], [1, 1.06]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[96vh] flex flex-col justify-center items-center px-4 sm:px-8 overflow-hidden bg-transparent text-amber-50"
    >
      {/* 1986 Mộc Bản Xưa Chìm Khẽ (Vintage Woodblock Watermark) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[18vw] font-serif font-black text-amber-500/[0.04] select-none pointer-events-none tracking-tighter leading-none z-0">
        1986
      </div>

      {/* Main Content Showcase */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="w-full max-w-6xl mx-auto text-center relative z-10 pt-16 pb-14"
      >
        {/* Heritage Badge mộc mạc */}
        <motion.div
          initial={{ opacity: 0, y: -15, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-amber-600/50 bg-stone-900/85 backdrop-blur-md shadow-xl mb-6"
        >
          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs uppercase font-mono tracking-[0.25em] text-amber-300 font-bold">
            {MARKETING_CAMPAIGN.badge}
          </span>
          <span className="w-1 h-1 rounded-full bg-stone-600" />
          <span className="text-[11px] text-stone-300 font-serif">1.482 Bát Phục Vụ Hôm Nay</span>
        </motion.div>

        {/* Tiêu Đề Thư Pháp Tràng An */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
          className="mb-4"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif font-black tracking-tight leading-[1.05] text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-400 drop-shadow-[0_8px_30px_rgba(245,158,11,0.25)]">
            PHỞ GIA TRUYỀN
          </h1>
          <div className="text-xs sm:text-sm font-serif tracking-[0.35em] uppercase text-amber-400/90 mt-2 font-semibold">
            HÀ NỘI 1986 • BÁT CHIẾT YÊU MEN LAM • NƯỚC DÙNG NINH 24H
          </div>
        </motion.div>

        {/* Trích Dẫn Văn Chương Thạch Lam — Đậm Hồn Hà Nội Xưa */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="max-w-3xl mx-auto my-6 p-4 rounded-2xl border border-amber-700/30 bg-stone-950/60 backdrop-blur-sm"
        >
          <p className="text-sm sm:text-base md:text-lg text-amber-100/90 font-serif italic leading-relaxed">
            {MARKETING_CAMPAIGN.quote}
          </p>
          <div className="text-xs text-amber-400/80 font-serif mt-1 font-semibold">
            {MARKETING_CAMPAIGN.author}
          </div>
        </motion.div>

        {/* Bát Chiết Yêu Men Lam Bát Tràng (Focal Centerpiece) */}
        <div className="relative max-w-4xl mx-auto my-8 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Cột Mốc Trái: Xương Tơ 24h */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="hidden md:block text-left w-56 p-5 rounded-3xl border border-amber-700/30 bg-stone-900/70 backdrop-blur-md shadow-xl"
          >
            <div className="text-[10px] font-mono text-amber-400 tracking-widest uppercase mb-1">CỐT LÕI</div>
            <div className="text-xl font-serif font-bold text-amber-100">Xương Ống Tơ</div>
            <div className="text-xs text-stone-300 font-serif mt-1">Ninh chậm 24 giờ trên bếp than củi, nước trong vắt ngọt tủy.</div>
          </motion.div>

          {/* Bát Phở Chiết Yêu Trung Tâm */}
          <motion.div
            style={{ scale: bowlScale }}
            className="relative w-72 sm:w-80 md:w-96 mx-auto group cursor-pointer"
            onClick={() => onActionClick && onActionClick('VIEW_MENU')}
          >
            {/* Vầng hào quang ánh vàng ấm áp */}
            <div className="absolute inset-0 bg-amber-500/25 rounded-full blur-3xl group-hover:bg-amber-400/35 transition-all duration-700" />

            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.85)] bg-stone-900/90 p-3 backdrop-blur-md"
            >
              <img
                src="https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80"
                alt="Bát Phở Chiết Yêu Men Lam 1986"
                className="w-full h-64 sm:h-72 object-cover rounded-2xl brightness-105 contrast-105 group-hover:scale-105 transition-transform duration-700"
                loading="eager"
              />
              <div className="absolute bottom-5 left-5 right-5 p-3.5 rounded-2xl bg-stone-950/95 backdrop-blur-md border border-amber-700/50 text-left shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-serif text-amber-300 font-bold">Bát Chiết Yêu Men Lam</span>
                  <span className="text-[9px] font-mono text-amber-400 bg-amber-950/90 px-2 py-0.5 rounded border border-amber-700/50">HÀ NỘI 1986</span>
                </div>
                <div className="text-[11px] text-stone-300 font-serif mt-0.5">Thịt bò tơ tái lăn, gầu giòn, nước dùng hổ phách</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Cột Mốc Phải: Sá Sùng Tự Nhiên */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="hidden md:block text-right w-56 p-5 rounded-3xl border border-amber-700/30 bg-stone-900/70 backdrop-blur-md shadow-xl"
          >
            <div className="text-[10px] font-mono text-amber-400 tracking-widest uppercase mb-1">BÍ TRUYỀN</div>
            <div className="text-xl font-serif font-bold text-amber-100">Sá Sùng Quan Lạn</div>
            <div className="text-xs text-stone-300 font-serif mt-1">Tạo vị ngọt umami tự nhiên, tuyệt đối không mì chính.</div>
          </motion.div>
        </div>

        {/* Cụm Nút Hành Động Mộc Mạc & Tinh Tế */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-6 mb-10"
        >
          <button
            onClick={() => onActionClick && onActionClick('CLAIM_VOUCHER')}
            className="group relative inline-flex items-center gap-2.5 px-9 py-4 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-serif font-bold text-base shadow-[0_10px_35px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span>{MARKETING_CAMPAIGN.ctaPrimary}</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => onActionClick && onActionClick('VIEW_MENU')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-amber-600/50 bg-stone-900/80 text-amber-200 hover:bg-stone-800 hover:border-amber-400 font-serif font-semibold text-base transition-all duration-200 backdrop-blur-md shadow-lg"
          >
            <span>{MARKETING_CAMPAIGN.ctaSecondary}</span>
          </button>
        </motion.div>

        {/* Cam Kết Di Sản */}
        <div className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-serif text-stone-300">
          <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Được yêu mến qua hơn 4 thập kỷ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Nguyên liệu tươi sạch mỗi sớm mai</span>
          </div>
        </div>

        {/* Cuộn Xuống Khám Phá */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-12 flex flex-col items-center gap-1 text-stone-400 text-xs font-serif"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-amber-400">CUỘN ĐỂ THƯỞNG VỊ TRÀNG AN</span>
          <ChevronDown className="w-4 h-4 text-amber-400 animate-bounce" />
        </motion.div>
      </motion.div>
    </section>
  );
}

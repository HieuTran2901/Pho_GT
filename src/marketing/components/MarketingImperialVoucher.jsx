import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Sparkles, Award } from 'lucide-react';
import { MARKETING_PROMOS } from '../marketingConstants';

export default function MarketingImperialVoucher({ onToast }) {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyCode = (code) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    if (onToast) {
      onToast(`Đã lưu tem phiếu [${code}] vào sổ tay!`);
    }
    setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev));
    }, 2800);
  };

  return (
    <section className="py-28 px-4 sm:px-8 bg-transparent text-amber-50 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Editorial Header */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-70px' }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 mb-16 border-b border-amber-800/30"
        >
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.3em] uppercase text-amber-400 mb-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/50">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>CHƯƠNG V • TEM PHIẾU BAO CẤP 1986</span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 leading-tight">
              Phiếu Thưởng Vị Tri Ân
            </h2>
          </div>
          <p className="text-stone-300 font-serif text-sm sm:text-base max-w-md leading-relaxed">
            Tấm phiếu mộc mạc lưu dấu phong vị kinh kỳ 1986. Sưu tầm mã phiếu để nhận đặc quyền quẩy giòn và ưu đãi 20% khi ghé quán.
          </p>
        </motion.div>

        {/* Vintage Coupon Perforated Grid with 3D Entrance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 [perspective:1200px]">
          {MARKETING_PROMOS.map((promo, idx) => {
            const isCopied = copiedCode === promo.code;

            return (
              <motion.div
                key={promo.code}
                initial={{ opacity: 0, y: 40, rotateX: 12, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ type: 'spring', stiffness: 220, damping: 20, delay: idx * 0.12 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="relative overflow-hidden rounded-3xl border-2 border-dashed border-amber-600/50 bg-gradient-to-br from-[#1c0f0a]/95 via-stone-900/90 to-[#140804]/95 p-8 shadow-2xl backdrop-blur-md flex flex-col justify-between"
              >
                {/* Vintage Tear-off Perforation Circles on Left & Right */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#120502] border border-amber-800/60" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#120502] border border-amber-800/60" />

                {/* Vintage Red Ink Seal Stamp with Spring Slam Animation */}
                <motion.div
                  initial={{ y: -60, scale: 0.3, opacity: 0, rotate: -35 }}
                  whileInView={{ y: 0, scale: 1, opacity: 1, rotate: idx === 0 ? 12 : -8 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.3 + idx * 0.15 }}
                  className="absolute -top-3 -right-3 w-24 h-24 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-amber-950 border-2 border-red-300/80 shadow-[0_0_25px_rgba(220,38,38,0.7)] flex items-center justify-center pointer-events-none ring-4 ring-red-900/40"
                >
                  <div className="text-center">
                    <div className="text-[10px] font-serif font-black text-amber-200 tracking-tighter">PHỞ 1986</div>
                    <div className="text-[8px] font-mono text-red-200 uppercase font-black">CHÍNH HỘI</div>
                    <div className="text-[7px] font-mono text-amber-300/90 tracking-widest">★ ĐÃ DUYỆT ★</div>
                  </div>
                </motion.div>

                <div>
                  {/* Promo Discount Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-md bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono text-xs uppercase tracking-wider font-bold mb-4 shadow-inner">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{promo.discount}</span>
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-amber-100 mb-2">
                    {promo.title}
                  </h3>

                  <p className="text-stone-300 font-serif text-sm leading-relaxed mb-8">
                    {promo.condition}
                  </p>
                </div>

                <div className="pt-6 border-t border-dashed border-amber-800/40 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-stone-400 font-mono">
                    <span className="text-stone-500 block text-[10px] uppercase">Thời hạn thưởng vị:</span>
                    <span className="text-amber-300 font-semibold">{promo.expiry}</span>
                  </div>

                  {/* Copy Action */}
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-amber-300 tracking-widest bg-stone-950 px-4 py-2 rounded-xl border border-amber-600/70 text-sm shadow-inner">
                      {promo.code}
                    </span>

                    <button
                      onClick={() => handleCopyCode(promo.code)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all ${
                        isCopied
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 hover:scale-105 active:scale-95 shadow-lg shadow-amber-950/70'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>ĐÃ LƯU</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>LẤY MÃ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

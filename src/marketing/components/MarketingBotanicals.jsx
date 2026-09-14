import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Compass, Sparkles, Wind } from 'lucide-react';
import { MARKETING_BOTANICALS } from '../marketingConstants';

export default function MarketingBotanicals() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const col1Y = useTransform(scrollYProgress, [0, 1], ['45px', '-45px']);
  const col2Y = useTransform(scrollYProgress, [0, 1], ['-35px', '35px']);

  return (
    <section
      ref={containerRef}
      className="py-32 px-4 sm:px-8 bg-transparent text-amber-50 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Tiêu Đề Phân Khúc Mộc Mạc */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 mb-16 border-b border-amber-800/30"
        >
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.3em] uppercase text-amber-400 mb-3 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-600/40">
              <Wind className="w-3.5 h-3.5 text-amber-400" />
              <span>PHÂN KHÚC II • MẸT TRE DƯỢC LIỆU</span>
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 leading-tight drop-shadow-md">
              Ngũ Vị Thảo Mộc
            </h2>
          </div>
          <p className="text-stone-300 font-serif text-sm sm:text-base max-w-md leading-relaxed">
            Nằm trên mẹt tre phơi sương sớm, từng vị thảo mộc được sao vàng trên chảo gang than hoa, tạo nên mùi thơm mộc mạc len lỏi vào từng góc phố Hà Nội.
          </p>
        </motion.div>

        {/* Lưới Thẻ Bài Gỗ Mộc 3D Bay Hoành Tráng */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-[1200px]">
          {MARKETING_BOTANICALS.map((bot, index) => {
            const yOffset = index % 2 === 0 ? col1Y : col2Y;
            const indexStr = `0${index + 1}`;
            const isLeft = index % 3 === 0;
            const isRight = index % 3 === 2;

            return (
              <motion.div
                key={bot.id}
                style={{ y: yOffset }}
                initial={{
                  opacity: 0,
                  y: 90,
                  scale: 0.65,
                  rotateX: 20,
                  rotateY: isLeft ? -15 : (isRight ? 15 : 0)
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  rotateX: 0,
                  rotateY: 0
                }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 18,
                  delay: index * 0.1
                }}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                  rotateX: -3,
                  transition: { duration: 0.25 }
                }}
                className="group relative rounded-3xl border-2 border-amber-700/40 bg-[#160a04]/90 p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] hover:border-amber-400/80 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Vân Gỗ / Giấy Dó Mộc Mạc */}
                <div className="absolute inset-0 bg-[radial-gradient(#d9770608_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                <div>
                  {/* Thanh Tiêu Đề Thẻ Bài */}
                  <div className="flex items-center justify-between gap-2 mb-6 pb-4 border-b border-amber-900/40 relative z-10">
                    <span className="text-xs font-mono font-bold text-amber-400/90 tracking-widest bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-700/50">
                      [{indexStr}]
                    </span>
                    <span className="text-xs font-serif italic text-amber-300/80">
                      {bot.pinyin}
                    </span>
                  </div>

                  {/* Icon & Tên Dược Liệu */}
                  <div className="flex items-start gap-4 mb-4 relative z-10">
                    <span className="text-4xl filter drop-shadow-md group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                      {bot.icon}
                    </span>
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
                        {bot.name}
                      </h3>
                      <div className="text-[11px] font-serif uppercase tracking-wider text-amber-400/90 mt-0.5 font-semibold">
                        {bot.material}
                      </div>
                    </div>
                  </div>

                  {/* Miêu Tả Chân Chất */}
                  <p className="text-stone-300 font-serif text-sm leading-relaxed mb-6 relative z-10">
                    {bot.desc}
                  </p>
                </div>

                {/* Chân Thẻ: Nguồn Gốc Thổ Nhưỡng */}
                <div className="flex items-center gap-2 pt-4 border-t border-amber-900/40 text-xs text-stone-400 font-serif relative z-10">
                  <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Thổ nhưỡng: <strong className="text-amber-200">{bot.origin}</strong></span>
                </div>
              </motion.div>
            );
          })}

          {/* Thẻ Thứ 6: Lời Tuyên Hứa 1986 */}
          <motion.div
            style={{ y: col2Y }}
            initial={{ opacity: 0, y: 90, scale: 0.65 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.45 }}
            className="rounded-3xl border-2 border-dashed border-amber-500/50 bg-amber-950/30 p-8 flex flex-col justify-center items-center text-center backdrop-blur-xl shadow-2xl"
          >
            <Sparkles className="w-12 h-12 text-amber-400 mb-4 animate-spin" style={{ animationDuration: '14s' }} />
            <div className="text-xs font-mono uppercase tracking-[0.25em] text-amber-400 mb-2 font-bold">
              LỜI HỨA TRÀNG AN
            </div>
            <h3 className="text-2xl font-serif font-bold text-amber-100 mb-3">
              Vị Ngọt Tự Nhiên Tuyệt Đối
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 font-serif leading-relaxed">
              Không dùng mì chính hay hương liệu hóa học. Toàn bộ vị ngọt hậu đằm thắm đến từ sá sùng Quan Lạn và tủy xương bò tơ ninh chậm 24 giờ.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

import React, { useMemo } from 'react';
import { motion, useTransform } from 'framer-motion';

export default function MarketingScenicCanvas({ scrollProgress }) {
  // Scene Opacities based on overall page scroll:
  // Scene 1: Phố Cổ Hà Nội 5h Sáng Sương Lam (0% -> 25%)
  const scene1Opacity = useTransform(scrollProgress, [0, 0.2, 0.28], [1, 1, 0]);
  // Scene 2: Mẹt Tre Dược Liệu & Chợ Xưa (22% -> 52%)
  const scene2Opacity = useTransform(scrollProgress, [0.2, 0.28, 0.48, 0.54], [0, 1, 1, 0]);
  // Scene 3: Gian Bếp Than Củi Đỏ Lửa 24 Giờ (48% -> 76%)
  const scene3Opacity = useTransform(scrollProgress, [0.48, 0.54, 0.72, 0.78], [0, 1, 1, 0]);
  // Scene 4: Bàn Gỗ Mộc Hiên Nhà & Mộc Son (72% -> 100%)
  const scene4Opacity = useTransform(scrollProgress, [0.72, 0.78, 1], [0, 1, 1]);

  // Ambient traveling light
  const lightY = useTransform(scrollProgress, [0, 1], ['8%', '88%']);

  // Floating gentle embers (Than hoa đượm hồng tí tách)
  const embers = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      size: 1.5 + (i % 3) * 1.2,
      left: `${(i * 17 + 8) % 94}%`,
      delay: (i % 6) * 1.1,
      duration: 7 + (i % 4) * 2.2,
      opacity: 0.22 + ((i % 3) * 0.14)
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0c0502]">
      {/* SCENE 1: Phố Cổ 5h Sáng Sương Lam & Đèn Dầu Vàng Ấm */}
      <motion.div
        style={{ opacity: scene1Opacity }}
        className="absolute inset-0 transition-opacity duration-700"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c0d06]/85 via-[#0e0502]/92 to-[#090301]" />
        {/* Ánh đèn dầu le lói & vầng sương phố cũ */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[720px] h-[420px] bg-amber-600/18 rounded-full blur-[140px]" />
        <div className="absolute top-10 right-1/4 w-[400px] h-[300px] bg-yellow-600/10 rounded-full blur-[120px]" />
      </motion.div>

      {/* SCENE 2: Mẹt Tre Dược Liệu & Góc Chợ Đồng Xuân Xưa */}
      <motion.div
        style={{ opacity: scene2Opacity }}
        className="absolute inset-0 transition-opacity duration-700"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e0f06]/85 via-[#100602]/92 to-[#090301]" />
        {/* Tông màu mẹt tre, thảo mộc & lá mùi xanh */}
        <div className="absolute top-1/3 left-1/3 w-[620px] h-[450px] bg-amber-700/16 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 right-1/4 w-[480px] h-[380px] bg-emerald-900/12 rounded-full blur-[130px]" />
      </motion.div>

      {/* SCENE 3: Gian Bếp Than Củi Đỏ Lửa & Nồi Đồng Ninh Chậm */}
      <motion.div
        style={{ opacity: scene3Opacity }}
        className="absolute inset-0 transition-opacity duration-700"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#260a02]/85 via-[#120401]/92 to-[#090301]" />
        {/* Than hoa rực hồng ấm áp */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[520px] bg-orange-600/20 rounded-full blur-[135px]" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[480px] h-[320px] bg-amber-500/22 rounded-full blur-[115px]" />
      </motion.div>

      {/* SCENE 4: Bàn Gỗ Mộc Hiên Nhà & Mộc Son 1986 */}
      <motion.div
        style={{ opacity: scene4Opacity }}
        className="absolute inset-0 transition-opacity duration-700"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#200705]/85 via-[#0f0302]/92 to-[#090301]" />
        {/* Sắc mộc son đỏ & ánh vàng hiên nhà */}
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[720px] h-[460px] bg-red-700/14 rounded-full blur-[140px]" />
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[520px] h-[260px] bg-amber-500/18 rounded-full blur-[120px]" />
      </motion.div>

      {/* Traveling Ambient Spotlight */}
      <motion.div
        style={{ top: lightY }}
        className="absolute left-1/2 -translate-x-1/2 w-[760px] h-[760px] bg-amber-500/9 rounded-full blur-[160px]"
      />

      {/* Giấy dó / Vintage Parchment Texture mộc mạc */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:24px_24px] opacity-80" />

      {/* Đốm than hoa đượm hồng tí tách bay lượn */}
      <div className="absolute inset-0">
        {embers.map((ember) => (
          <motion.div
            key={ember.id}
            initial={{ y: '100vh', opacity: 0 }}
            animate={{
              y: '-10vh',
              opacity: [0, ember.opacity, ember.opacity, 0]
            }}
            transition={{
              duration: ember.duration,
              repeat: Infinity,
              delay: ember.delay,
              ease: 'linear'
            }}
            style={{
              left: ember.left,
              width: `${ember.size}px`,
              height: `${ember.size}px`
            }}
            className="absolute rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"
          />
        ))}
      </div>
    </div>
  );
}

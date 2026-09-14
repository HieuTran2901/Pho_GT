import React, { useMemo } from 'react';
import { motion, useTransform } from 'framer-motion';

export default function MarketingAtmosphere({ scrollProgress }) {
  // 20 elegant micro golden dust particles drifting gently
  const microDust = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      size: 1.5 + (i % 3),
      left: `${(i * 19 + 5) % 94}%`,
      delay: (i % 5) * 1.2,
      duration: 8 + (i % 4) * 2.5,
      opacity: 0.2 + ((i % 3) * 0.12)
    }));
  }, []);

  // Museum Gallery morphing dark palette:
  // 0.0 (Hero): Deep obsidian & amber halo (#070201)
  // 0.25 (Botanicals): Rich dark copper & aged wood (#0a0402)
  // 0.50 (Broth Flow): Deep ember glow (#0e0401)
  // 0.75 (Deconstructed): Focused studio noir (#080201)
  // 1.00 (Imperial Seal): Imperial lacquer noir (#0a0202)
  const bgGradient = useTransform(
    scrollProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [
      'radial-gradient(circle at 50% 15%, #180803 0%, #080201 55%, #040101 100%)',
      'radial-gradient(circle at 45% 35%, #1d0903 0%, #0a0301 55%, #050101 100%)',
      'radial-gradient(circle at 50% 55%, #220801 0%, #0c0301 55%, #060101 100%)',
      'radial-gradient(circle at 55% 75%, #1b0702 0%, #090201 55%, #050101 100%)',
      'radial-gradient(circle at 50% 90%, #200504 0%, #0b0202 55%, #060101 100%)'
    ]
  );

  // Smooth floating ambient spotlight that tracks scroll
  const spotlightTop = useTransform(scrollProgress, [0, 1], ['5%', '85%']);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Museum Gallery Base Gradient */}
      <motion.div
        style={{ background: bgGradient }}
        className="absolute inset-0 transition-colors duration-1000"
      />

      {/* Floating Center Spotlight (Cinematic Rim Glow) */}
      <motion.div
        style={{ top: spotlightTop }}
        className="absolute left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-[150px]"
      />

      {/* Subtle Noise / Luxury Matte Finish */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:32px_32px] opacity-70" />

      {/* Micro Golden Dust Particles */}
      <div className="absolute inset-0">
        {microDust.map((dust) => (
          <motion.div
            key={dust.id}
            initial={{ y: '100vh', opacity: 0 }}
            animate={{
              y: '-10vh',
              opacity: [0, dust.opacity, dust.opacity, 0]
            }}
            transition={{
              duration: dust.duration,
              repeat: Infinity,
              delay: dust.delay,
              ease: 'linear'
            }}
            style={{
              left: dust.left,
              width: `${dust.size}px`,
              height: `${dust.size}px`
            }}
            className="absolute rounded-full bg-amber-300 shadow-[0_0_6px_#fbbf24]"
          />
        ))}
      </div>
    </div>
  );
}

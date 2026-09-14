import React from 'react';
import { motion, useTransform } from 'framer-motion';

export default function MarketingContinuousRiver({ scrollProgress }) {
  // Height of the liquid stream that fills as user scrolls down
  const streamHeight = useTransform(scrollProgress, [0, 1], ['0%', '100%']);
  
  // Position of the traveling golden ember / liquid drop
  const dropTop = useTransform(scrollProgress, [0, 1], ['0%', '98%']);
  const dropOpacity = useTransform(scrollProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0.5]);

  return (
    <div className="fixed left-3 sm:left-6 top-16 bottom-16 w-1 z-30 pointer-events-none hidden md:block">
      {/* Background Track Guide */}
      <div className="absolute inset-y-0 left-0 w-[2px] bg-stone-800/40 rounded-full" />

      {/* Flowing Liquid Amber Stream */}
      <motion.div
        style={{ height: streamHeight }}
        className="absolute top-0 left-0 w-[2px] bg-gradient-to-b from-amber-500/80 via-amber-400 to-yellow-300 shadow-[0_0_12px_rgba(245,158,11,0.9)] rounded-full origin-top"
      />

      {/* Traveling Golden Drop / Broth Essence Particle */}
      <motion.div
        style={{ top: dropTop, opacity: dropOpacity }}
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_12px_#fbbf24] animate-ping opacity-75" />
        <div className="absolute w-2 h-2 rounded-full bg-yellow-100 shadow-[0_0_8px_#fef08a]" />
      </motion.div>

      {/* Subtle Milestone Hash Marks (0%, 25%, 50%, 75%, 100%) */}
      <div className="absolute top-[0%] -left-1 text-[9px] font-mono text-amber-500/60 select-none">I</div>
      <div className="absolute top-[25%] -left-1 text-[9px] font-mono text-amber-500/60 select-none">II</div>
      <div className="absolute top-[50%] -left-1 text-[9px] font-mono text-amber-500/60 select-none">III</div>
      <div className="absolute top-[75%] -left-1 text-[9px] font-mono text-amber-500/60 select-none">IV</div>
      <div className="absolute top-[98%] -left-1 text-[9px] font-mono text-amber-500/60 select-none">V</div>
    </div>
  );
}

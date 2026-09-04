import React, { useEffect, useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';

export default function FlyingHeart({ fly, onComplete }) {
  const [position, setPosition] = useState({
    x: fly.startX,
    y: fly.startY,
    scale: 1,
    opacity: 1,
    rotation: 0,
  });

  useEffect(() => {
    // Slower, graceful floating duration (~1000ms)
    const duration = 1000;
    const startTime = performance.now();
    const controlX = (fly.startX + fly.endX) / 2;
    // Higher, elegant loft above the cards
    const controlY = Math.min(fly.startY, fly.endY) - 190;
    let frameId;

    const updateTrajectory = (now) => {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);

      // Smooth easeInOut timing curve: gentle takeoff and cushioned landing
      const t =
        rawProgress < 0.5
          ? 2 * rawProgress * rawProgress
          : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

      // Quadratic Bézier curve formula
      const currentX =
        Math.pow(1 - t, 2) * fly.startX +
        2 * (1 - t) * t * controlX +
        Math.pow(t, 2) * fly.endX;
      const currentY =
        Math.pow(1 - t, 2) * fly.startY +
        2 * (1 - t) * t * controlY +
        Math.pow(t, 2) * fly.endY;

      // Dynamic scale: gently grows in the air, shrinks softly into the tab
      const scale = t < 0.5 ? 1 + t * 0.85 : 1.425 - (t - 0.5) * 1.25;
      // Gentle wobble rotation
      const rotation = Math.sin(t * Math.PI * 2) * 18;
      const opacity = t > 0.9 ? 1 - (t - 0.9) / 0.1 : 1;

      setPosition({
        x: currentX,
        y: currentY,
        scale,
        opacity,
        rotation,
      });

      if (rawProgress < 1) {
        frameId = requestAnimationFrame(updateTrajectory);
      } else {
        onComplete(fly.id);
      }
    };

    frameId = requestAnimationFrame(updateTrajectory);
    return () => cancelAnimationFrame(frameId);
  }, [fly, onComplete]);

  return (
    <div
      className="fixed z-[9999] pointer-events-none will-change-transform"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%) scale(${position.scale}) rotate(${position.rotation}deg)`,
        opacity: position.opacity,
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* Glowing aura */}
        <div className="absolute inset-0 -z-10 rounded-full bg-rose-500/40 blur-md scale-150 animate-pulse"></div>
        {/* Heart icon */}
        <Heart className="w-8 h-8 fill-[#96281b] text-rose-500 drop-shadow-[0_0_14px_rgba(225,29,72,0.95)]" />
        {/* Tiny golden sparkle on the heart */}
        <Sparkles className="absolute -top-1 -right-1.5 w-4 h-4 text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,1)]" />
      </div>
    </div>
  );
}
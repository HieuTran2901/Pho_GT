import React, { useEffect, useState } from 'react';

export default function FlyingPhoBowl({ fly, onComplete }) {
  const [position, setPosition] = useState({
    x: fly.startX,
    y: fly.startY,
    scale: 1,
    opacity: 1,
    rotation: 0,
  });

  useEffect(() => {
    const duration = 750;
    const startTime = performance.now();
    const controlX = (fly.startX + fly.endX) / 2;
    // Keep curve apex inside comfortable view above button and below top viewport edge
    const controlY = Math.max(25, Math.min(fly.startY, fly.endY) - 100);
    let frameId;

    const updateTrajectory = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easeInOut curve for natural acceleration into cart
      const t =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const currentX =
        Math.pow(1 - t, 2) * fly.startX +
        2 * (1 - t) * t * controlX +
        Math.pow(t, 2) * fly.endX;
      const currentY =
        Math.pow(1 - t, 2) * fly.startY +
        2 * (1 - t) * t * controlY +
        Math.pow(t, 2) * fly.endY;

      // Pop out gently from button then gracefully scale down into cart icon
      const scale =
        progress < 0.25
          ? 1 + progress * 0.8
          : Math.max(0.3, 1.2 - (progress - 0.25) * 1.1);
      const rotation = t * 270;
      const opacity = progress > 0.9 ? 1 - (progress - 0.9) / 0.1 : 1;

      setPosition({
        x: currentX,
        y: currentY,
        scale,
        opacity,
        rotation,
      });

      if (progress < 1) {
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
      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.8),0_10px_20px_rgba(0,0,0,0.4)] bg-amber-950/80">
        <img
          src={fly.image}
          alt={fly.name || 'Phở'}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-transparent to-white/40 pointer-events-none"></div>
      </div>
      <div className="absolute inset-0 -z-10 rounded-full bg-amber-400/30 blur-md scale-125"></div>
    </div>
  );
}

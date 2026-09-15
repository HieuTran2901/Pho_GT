import React, { useEffect, useRef } from 'react';

/**
 * FlyingRedeemedVoucher
 * Phở Gia Truyền 1986
 *
 * Hiệu ứng khung voucher thu nhỏ bay theo đường cong Parabol từ nút 'Đổi quà'
 * vào tab 'Quà của tôi' trên thanh Tab Kho Quà khi đổi điểm thành công.
 *
 * Tối ưu kiến trúc 120fps: Sử dụng Direct DOM Ref (Zero React Re-render)
 */
export default function FlyingRedeemedVoucher({ fly, onComplete }) {
  const voucherRef = useRef(null);

  useEffect(() => {
    if (!voucherRef.current || !fly) return;

    const duration = 750;
    const startTime = performance.now();
    const controlX = (fly.startX + fly.endX) / 2;
    const controlY = Math.min(fly.startY, fly.endY) - 90;
    let frameId;

    const updateTrajectory = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const t =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currentX =
        Math.pow(1 - t, 2) * fly.startX +
        2 * (1 - t) * t * controlX +
        Math.pow(t, 2) * fly.endX;
      const currentY =
        Math.pow(1 - t, 2) * fly.startY +
        2 * (1 - t) * t * controlY +
        Math.pow(t, 2) * fly.endY;

      const scale =
        progress < 0.25
          ? 1.05 + progress * 0.4
          : Math.max(0.35, 1.15 - (progress - 0.25) * 1.05);

      const rotation = Math.sin(t * Math.PI * 2) * 18 - t * 45;
      const opacity = progress > 0.9 ? Math.max(0, 1 - (progress - 0.9) / 0.1) : 1;

      if (voucherRef.current) {
        voucherRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`;
        voucherRef.current.style.opacity = opacity;
      }

      if (progress < 1) {
        frameId = requestAnimationFrame(updateTrajectory);
      } else {
        if (onComplete) onComplete(fly.id);
      }
    };

    frameId = requestAnimationFrame(updateTrajectory);
    return () => cancelAnimationFrame(frameId);
  }, [fly, onComplete]);

  if (!fly) return null;

  return (
    <div
      ref={voucherRef}
      className="fixed top-0 left-0 z-[99999] pointer-events-none will-change-transform"
      style={{
        transform: `translate3d(${fly.startX}px, ${fly.startY}px, 0) translate(-50%, -50%) scale(1.05) rotate(0deg)`,
        opacity: 1,
      }}
    >
      <div className="relative flex items-center bg-gradient-to-r from-[#8a1f18] via-[#6a150c] to-[#400d07] border-2 border-[#f59e0b] rounded-2xl px-3 py-2 shadow-[0_0_35px_rgba(245,158,11,0.9),0_15px_35px_rgba(0,0,0,0.85)] text-amber-100 min-w-[170px] max-w-[210px]">
        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#180f0b] border-r border-[#f59e0b]" />
        <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#180f0b] border-l border-[#f59e0b]" />

        <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-300 shadow-md shrink-0 bg-stone-900 mr-2.5">
          <img
            src={fly.image || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=300&q=80'}
            alt={fly.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[9px] font-serif font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
            <span>★</span>
            <span>VÉ VỪA ĐỔI</span>
          </div>
          <div className="text-xs font-serif font-black text-white truncate leading-tight mt-0.5">
            {fly.title}
          </div>
          <div className="text-[9px] font-mono font-bold text-amber-200 mt-0.5">
            {fly.rewardType === 'FREE_ITEM' ? 'TẶNG MÓN 0đ' : 'GIẢM GIÁ'}
          </div>
        </div>

        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-100 flex items-center justify-center text-[8px] font-black text-stone-950 shadow-xs shrink-0 ml-1.5">
          ✓
        </div>
      </div>

      <div className="absolute inset-0 -z-10 rounded-2xl bg-amber-400/50 blur-xl scale-150 animate-pulse" />
    </div>
  );
}

import React, { useEffect, useRef } from 'react';

/**
 * [RAVEN & URBAN] GlidingGiftRibbon
 * Phở Gia Truyền 1986
 *
 * Hiệu ứng dải lụa vé gấm lướt nhẹ (glide & dock) từ đỉnh giỏ hàng
 * đáp thẳng vào khay món phụ đi kèm của Bát Phở chính.
 *
 * Tối ưu kiến trúc 120fps: Sử dụng Direct DOM Ref (Zero React Re-render)
 */
export default function GlidingGiftRibbon({ startPos, targetRect, gift, onDockComplete }) {
  const ribbonRef = useRef(null);

  useEffect(() => {
    if (!targetRect || !ribbonRef.current) return;

    const startX = startPos?.x || window.innerWidth - 80;
    const startY = startPos?.y || 60;
    // Điểm đến là tâm của ô combo món đi kèm
    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2;

    const duration = 520; // 520ms lướt êm ái
    const startTime = performance.now();
    let frameId;

    // Điểm kiểm soát uốn lượn hình chữ S mềm mại
    const controlX = startX + (endX - startX) * 0.35 + 25;
    const controlY = startY + (endY - startY) * 0.45 - 20;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing cubic-bezier(0.22, 1, 0.36, 1) cho chuyển động trôi lơ lửng rồi hít êm
      const t = 1 - Math.pow(1 - progress, 3);

      // Tính tọa độ đường cong Bezier
      const currentX =
        Math.pow(1 - t, 2) * startX +
        2 * (1 - t) * t * controlX +
        Math.pow(t, 2) * endX;
      const currentY =
        Math.pow(1 - t, 2) * startY +
        2 * (1 - t) * t * controlY +
        Math.pow(t, 2) * endY;

      // Hiệu ứng đung đưa như dải lụa rơi nhẹ
      const rotation = (1 - t) * 14 * Math.cos(t * Math.PI * 2.5);
      const scale = 0.85 + (1 - 0.85) * t;
      const opacity = progress < 0.95 ? 1 : Math.max(0, 1 - (progress - 0.95) / 0.05);

      // Trực tiếp cập nhật DOM style - ZERO RE-RENDER
      if (ribbonRef.current) {
        ribbonRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`;
        ribbonRef.current.style.opacity = opacity;
      }

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        onDockComplete?.();
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [startPos, targetRect, onDockComplete]);

  if (!targetRect) return null;

  const initialX = startPos?.x || (typeof window !== 'undefined' ? window.innerWidth - 80 : 0);
  const initialY = startPos?.y || 60;

  return (
    <div
      ref={ribbonRef}
      className="fixed top-0 left-0 z-[99999] pointer-events-none will-change-transform"
      style={{
        transform: `translate3d(${initialX}px, ${initialY}px, 0) translate(-50%, -50%) scale(0.85) rotate(14deg)`,
        opacity: 0.95,
      }}
    >
      {/* VÉ LỤA GẤM THU NHỎ LƯỚT NHẸ */}
      <div className="relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#9b2a1f] via-[#7a1811] to-[#591008] border border-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.85),0_6px_14px_rgba(0,0,0,0.4)] text-amber-100 min-w-[160px] max-w-[210px]">
        {/* Ảnh thumbnail món quà */}
        <div className="w-8 h-8 rounded-md overflow-hidden border border-amber-300 shrink-0 bg-stone-900 shadow-inner">
          <img
            src={gift?.image}
            alt={gift?.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Thông tin món quà đi kèm */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[7.5px] px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 font-serif font-black uppercase">
              🎀 Gắn Kèm
            </span>
          </div>
          <div className="text-[11px] font-serif font-bold text-white truncate mt-0.5">
            {gift?.name}
          </div>
          <div className="text-[8.5px] font-mono font-black text-amber-200">
            0đ • Tặng kèm
          </div>
        </div>

        {/* Con dấu son 0đ */}
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-amber-500 border border-amber-200 flex items-center justify-center text-[7.5px] font-bold text-white shadow-xs shrink-0">
          0đ
        </div>

        {/* Hào quang vàng kim theo sau */}
        <div className="absolute inset-0 -z-10 rounded-lg bg-amber-400/40 blur-md scale-110" />
      </div>
    </div>
  );
}

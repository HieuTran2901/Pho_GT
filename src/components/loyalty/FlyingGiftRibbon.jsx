import React, { useEffect, useRef } from 'react';

/**
 * [RAVEN & URBAN] FlyingGiftRibbon
 * Phở Gia Truyền 1986
 *
 * Hiệu ứng dải vé voucher gấm đỏ viền vàng kim bay theo đường cong Parabol
 * từ vị trí bấm "Dùng ngay" trong Kho Quà vào biểu tượng giỏ hàng trên thanh Navbar.
 *
 * Tối ưu kiến trúc 120fps: Sử dụng Direct DOM Ref (Zero React Re-render)
 */
export default function FlyingGiftRibbon({ fly, onComplete }) {
  const ribbonRef = useRef(null);

  useEffect(() => {
    if (!ribbonRef.current) return;

    const duration = 800; // 800ms mang lại cảm giác lượn sóng êm ái
    const startTime = performance.now();
    const controlX = (fly.startX + fly.endX) / 2;
    // Đỉnh cung uốn cong lên trên để tạo cảm giác bay bổng
    const controlY = Math.max(20, Math.min(fly.startY, fly.endY) - 130);
    let frameId;

    const updateTrajectory = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing cubic easeInOut để tạo quán tính khởi hành và giảm tốc khi vào giỏ
      const t =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      // Tính tọa độ đường cong Bezier bậc 2
      const currentX =
        Math.pow(1 - t, 2) * fly.startX +
        2 * (1 - t) * t * controlX +
        Math.pow(t, 2) * fly.endX;
      const currentY =
        Math.pow(1 - t, 2) * fly.startY +
        2 * (1 - t) * t * controlY +
        Math.pow(t, 2) * fly.endY;

      // Hiệu ứng co giãn: Phóng to nhẹ khi xuất phát rồi thu nhỏ dần khi tiếp đất
      const scale =
        progress < 0.2
          ? 1.1 + progress * 0.5
          : Math.max(0.35, 1.2 - (progress - 0.2) * 1.05);

      // Hiệu ứng vẫy lượn cánh cung như dải lụa
      const rotation = Math.sin(t * Math.PI * 2) * 25 + t * 180;
      const opacity = progress > 0.92 ? Math.max(0, 1 - (progress - 0.92) / 0.08) : 1;

      // Trực tiếp cập nhật DOM style - ZERO RE-RENDER
      if (ribbonRef.current) {
        ribbonRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`;
        ribbonRef.current.style.opacity = opacity;
      }

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
      ref={ribbonRef}
      className="fixed top-0 left-0 z-[99999] pointer-events-none will-change-transform"
      style={{
        transform: `translate3d(${fly.startX}px, ${fly.startY}px, 0) translate(-50%, -50%) scale(1.1) rotate(0deg)`,
        opacity: 1,
      }}
    >
      {/* VÉ QUÀ TẶNG GẤM ĐỎ THẮT NƠ VÀNG KIM */}
      <div className="relative flex items-center bg-gradient-to-r from-[#9b2a1f] via-[#7d1d14] to-[#591008] border border-[#f59e0b] rounded-xl px-3 py-1.5 shadow-[0_0_30px_rgba(245,158,11,0.9),0_15px_30px_rgba(0,0,0,0.7)] text-amber-100 min-w-[150px] max-w-[180px]">
        {/* Vết khoét cuống vé nhỏ */}
        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#180f0b] border-r border-[#f59e0b]/80" />
        <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#180f0b] border-l border-[#f59e0b]/80" />

        {/* Thumbnail món quà */}
        <div className="w-9 h-9 rounded-lg overflow-hidden border border-amber-300/80 shadow-inner shrink-0 bg-stone-900 mr-2">
          <img
            src={fly.image}
            alt={fly.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Nội dung vé */}
        <div className="min-w-0 flex-1">
          <div className="text-[9px] font-serif font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1">
            <span>★</span>
            <span>QUÀ TRI KỶ</span>
          </div>
          <div className="text-[11px] font-serif font-bold text-white truncate leading-tight">
            {fly.name}
          </div>
          <div className="text-[9px] font-mono font-black text-amber-200 mt-0.5">
            0đ • TẶNG KÈM
          </div>
        </div>

        {/* Con dấu son nhỏ */}
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-amber-600 border border-amber-200 flex items-center justify-center text-[8px] font-bold text-white shadow-xs shrink-0 ml-1">
          0đ
        </div>
      </div>

      {/* Vầng hào quang ánh sáng vàng kim phía sau */}
      <div className="absolute inset-0 -z-10 rounded-2xl bg-amber-400/40 blur-lg scale-150 animate-pulse" />
    </div>
  );
}

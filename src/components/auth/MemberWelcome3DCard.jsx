import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, ArrowRight, X, Utensils } from 'lucide-react';

/**
 * MemberWelcome3DCard — "Dải Lụa Gấm Lơ Lửng Trong Khói Phở"
 * Replaces the rigid box card with an organic, flowing 3D Silk Ribbon:
 * 1. Frameless Atmospheric Mist & Golden Shockwave Ripple.
 * 2. 3D Flowing Silk Ribbon (Dải Lụa Gấm Son Đỏ Thêu Chỉ Vàng) with swallowtail folds.
 * 3. Physical Silk Tassels (Tua rua tơ tằm) swaying under pendulum inertia.
 * 4. Die-cut Ancient Bowl with unrestrained volumetric steam wisps.
 * 5. 3D Imperial Wax Seal Button "Gọi Bát Quen" (1-click reorder).
 */
export default function MemberWelcome3DCard({
  data,
  isClosing,
  onClose,
  onQuickReorder
}) {
  const ribbonRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50, opacity: 0 });
  const [shockwave, setShockwave] = useState(true);

  // Disable shockwave after initial burst
  useEffect(() => {
    const timer = setTimeout(() => setShockwave(false), 900);
    return () => clearTimeout(timer);
  }, []);

  // 3D Parallax Tilt calculations
  const handleMouseMove = useCallback((e) => {
    if (!ribbonRef.current) return;
    const rect = ribbonRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rx = ((y - 0.5) * -18).toFixed(2);
    const ry = ((x - 0.5) * 20).toFixed(2);
    setTilt({ rx, ry });
    setShine({ x: (x * 100).toFixed(1), y: (y * 100).toFixed(1), opacity: 0.75 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0 });
    setShine((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  const user = data?.user || {};
  const tierInfo = data?.tierInfo || {};
  const points = data?.points ?? 50;

  return (
    <div
      className={`fixed top-[70px] sm:top-[88px] left-1/2 -translate-x-1/2 z-[70] pointer-events-auto select-none transition-all duration-300 overflow-visible ${
        isClosing ? 'animate-toast-island-out pointer-events-none' : 'animate-toast-island-in'
      }`}
      style={{ perspective: '1200px' }}
      role="status"
      aria-live="polite"
    >
      {/* 1. Làn Sương Khói Loang Tỏa Tự Do Không Biên Giới (Atmospheric Vapor Cloud) */}
      <div
        className="absolute -inset-10 sm:-inset-16 bg-gradient-to-r from-transparent via-[#2b1810]/60 to-transparent blur-2xl rounded-full pointer-events-none z-0 animate-atmospheric-mist"
        aria-hidden="true"
      />

      {/* Sóng Xung Kích Hoàng Kim khi xuất hiện */}
      {shockwave && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 rounded-full border-2 border-amber-300/80 bg-gradient-to-r from-amber-500/20 via-yellow-200/10 to-transparent pointer-events-none z-0 animate-shockwave-burst"
          aria-hidden="true"
        />
      )}

      {/* 2. Dải Lụa Gấm 3D Uốn Lượn Tự Nhiên (Flowing Silk Ribbon) */}
      <div
        ref={ribbonRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(0)`,
          transition: tilt.rx === 0 ? 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          transformStyle: 'preserve-3d'
        }}
        className="relative w-[345px] sm:w-[470px] animate-silk-wave overflow-visible cursor-pointer group"
      >
        {/* Nếp Gấp Đuôi Nheo Phía Sau (Back Ribbon Fold Left & Right) */}
        <div
          className="absolute -left-3 sm:-left-4 top-2 bottom-2 w-8 bg-[#4e0f09] -skew-y-6 rounded-l-md shadow-lg pointer-events-none z-0 border-l border-amber-500/30"
          style={{ transform: 'translateZ(-12px)' }}
        />
        <div
          className="absolute -right-3 sm:-right-4 top-2 bottom-2 w-8 bg-[#4e0f09] skew-y-6 rounded-r-md shadow-lg pointer-events-none z-0 border-r border-amber-500/30"
          style={{ transform: 'translateZ(-12px)' }}
        />

        {/* Thân Chính Của Dải Lụa Gấm (Main Silk Fabric) */}
        <div
          className="relative z-10 bg-gradient-to-r from-[#7a1810] via-[#942016] to-[#7a1810] rounded-lg shadow-[0_20px_45px_-10px_rgba(0,0,0,0.85),0_0_30px_rgba(212,175,55,0.3)] px-3.5 sm:px-5 py-3 sm:py-3.5 border-y-2 border-[#d4af37] overflow-hidden"
          style={{ transform: 'translateZ(10px)' }}
        >
          {/* Vân Gấm Thêu Chỉ Vàng Chìm (Brocade Silk Weave Pattern) */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, #fef08a 1px, transparent 1px)',
              backgroundSize: '12px 12px'
            }}
          />

          {/* Dải Phản Quang Ánh Kim Lụa Quét Theo Chuột */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
            style={{
              background: `radial-gradient(circle 180px at ${shine.x}% ${shine.y}%, rgba(254, 240, 138, 0.45), transparent 70%)`,
              opacity: shine.opacity
            }}
            aria-hidden="true"
          />

          {/* Nút Đóng Dạng Khánh Ngọc Nhỏ */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng thông báo"
            className="absolute top-2 right-2 z-30 w-6 h-6 rounded-full bg-black/40 hover:bg-[#8a1e14] text-amber-200/80 hover:text-white border border-amber-300/40 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs"
            style={{ transform: 'translateZ(30px)' }}
          >
            <X className="w-3 h-3" />
          </button>

          {/* Nội Dung Nổi Trên Dải Lụa */}
          <div className="relative z-20 flex items-center gap-3 sm:gap-4">
            {/* Cụm Bát Phở / Avatar Son Đỏ Nổi 3D với Khói Bốc Tự Do Ra Ngoài */}
            <div className="relative shrink-0" style={{ transform: 'translateZ(26px)' }}>
              {/* Khói phở bốc cao tự do không giới hạn */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none flex justify-center w-16 h-10 overflow-visible z-30">
                <span className="w-2 h-7 bg-gradient-to-t from-amber-200/40 via-white/30 to-transparent rounded-full blur-[1px] animate-steam-3d-1 inline-block -mr-1" />
                <span className="w-2.5 h-8 bg-gradient-to-t from-red-300/30 via-amber-100/35 to-transparent rounded-full blur-[1px] animate-steam-3d-2 inline-block ml-1" />
              </div>

              {/* Bát phở avatar son đỏ khảm mộc 1986 */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#9b2a1f] via-[#7d1d14] to-[#4e0f09] text-amber-200 flex flex-col items-center justify-center border-2 border-amber-300 shadow-xl relative animate-seal-impact">
                <span className="font-serif font-black text-sm sm:text-base leading-none">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'P'}
                </span>
                <span className="text-[7px] font-sans font-black tracking-tighter text-amber-300 mt-0.5">
                  1986
                </span>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-[#8a1e14] flex items-center justify-center text-[8px] font-black shadow-md border border-white/60">
                  ★
                </span>
              </div>
            </div>

            {/* Thông Tin Hội Viên Thếp Vàng Thư Pháp */}
            <div className="min-w-0 flex-1 pr-1" style={{ transform: 'translateZ(22px)' }}>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] uppercase font-sans font-black text-amber-300 tracking-widest flex items-center gap-1">
                  <span>DẢI LỤA TRI KỶ</span>
                </span>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-black/35 text-amber-200 font-sans font-bold text-[9px] border border-amber-300/50">
                  {tierInfo.icon || '⚜️'} {tierInfo.badge || 'Khởi Vị'}
                </span>
              </div>

              <div className="text-sm sm:text-base font-serif font-black text-amber-50 truncate tracking-tight mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {user.fullName || 'Quý Khách Tri Kỷ'}
              </div>

              <div className="text-[10px] sm:text-[11px] text-amber-200/90 font-sans flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                  <span>{points}đ Tri Kỷ</span>
                </span>
                <span className="text-amber-400/60">•</span>
                <span className="truncate text-amber-100/80">Khẩu vị ruột đã sẵn bếp!</span>
              </div>
            </div>
          </div>

          {/* Nút Ấn Triện 3D "Gọi Bát Quen" */}
          <div
            className="mt-2.5 pt-2 border-t border-amber-300/30 flex items-center justify-between gap-2"
            style={{ transform: 'translateZ(28px)' }}
          >
            <div className="text-[10px] text-amber-200/70 font-serif italic hidden sm:flex items-center gap-1">
              <Utensils className="w-3 h-3 text-amber-300" />
              <span>Chạm lụa để lên món ruột</span>
            </div>

            <button
              type="button"
              onClick={() => onQuickReorder(user)}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-[#54120c] text-xs font-serif font-black px-4 py-1.5 rounded-lg shadow-[0_4px_0_#92400e,0_8px_14px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_1px_0_#92400e] transition-all flex items-center justify-center gap-1.5 border border-white/60 group cursor-pointer ml-auto"
            >
              <span>Gọi Bát Quen</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#54120c] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* 3. Chùm Tua Rua Tơ Tằm Đung Đưa Dưới Dải Lụa (Silk Tassels) */}
        <div
          className="absolute -bottom-5 left-8 flex flex-col items-center animate-tassel-sway pointer-events-none z-0"
          style={{ transform: `rotate(${Number(tilt.ry) * 0.8}deg)` }}
          aria-hidden="true"
        >
          <div className="w-2 h-2 rounded-full bg-amber-400 border border-[#8a1e14] shadow-xs" />
          <div className="w-0.5 h-2.5 bg-amber-400" />
          <div className="w-2 h-3.5 bg-gradient-to-b from-[#8a1e14] to-amber-500 rounded-b-xs shadow-xs" />
        </div>

        <div
          className="absolute -bottom-5 right-8 flex flex-col items-center animate-tassel-sway pointer-events-none z-0"
          style={{ transform: `rotate(${Number(tilt.ry) * 0.8}deg)`, animationDelay: '0.4s' }}
          aria-hidden="true"
        >
          <div className="w-2 h-2 rounded-full bg-amber-400 border border-[#8a1e14] shadow-xs" />
          <div className="w-0.5 h-2.5 bg-amber-400" />
          <div className="w-2 h-3.5 bg-gradient-to-b from-[#8a1e14] to-amber-500 rounded-b-xs shadow-xs" />
        </div>
      </div>
    </div>
  );
}

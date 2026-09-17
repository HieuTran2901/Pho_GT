import React, { memo } from 'react';

const SpotlightOverlay = memo(function SpotlightOverlay({
  targetRect,
  onBackdropClick,
  isNudged,
  isInteractive = false,
  actionHint = '',
  isPraising = false
}) {
  if (!targetRect) {
    return (
      <div
        onClick={onBackdropClick}
        className="fixed inset-0 z-[9990] bg-[#050c08]/80 backdrop-blur-xs transition-opacity duration-300"
      />
    );
  }

  const { top, left, width, height } = targetRect;
  const r = Math.min(16, width / 2, height / 2);
  const windowW = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const windowH = typeof window !== 'undefined' ? window.innerHeight : 1080;

  // Đường Path hình học rỗng tâm: Khung toàn màn hình trừ đi lỗ khoét bo góc tại targetRect
  // Nhờ fillRule="evenodd", vùng lỗ khoét hoàn toàn không có pixel hình học -> Sự kiện click xuyên thấu 100% xuống nút bấm
  const cutoutPath = `M 0,0 L ${windowW},0 L ${windowW},${windowH} L 0,${windowH} Z M ${left + r},${top} H ${left + width - r} A ${r},${r} 0 0 1 ${left + width},${top + r} V ${top + height - r} A ${r},${r} 0 0 1 ${left + width - r},${top + height} H ${left + r} A ${r},${r} 0 0 1 ${left},${top + height - r} V ${top + r} A ${r},${r} 0 0 1 ${left + r},${top} Z`;

  return (
    <>
      {/* SVG Fullscreen Cutout Path với fillRule="evenodd" */}
      <svg
        className="fixed inset-0 w-full h-full z-[9990] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={cutoutPath}
          fill="rgba(5, 12, 8, 0.78)"
          fillRule="evenodd"
          onClick={onBackdropClick}
          className="cursor-default pointer-events-auto transition-all duration-200"
        />
      </svg>

      {/* Khung viền vàng kim hoàng gia & Hào quang nhấp nháy ôm sát phần tử */}
      <div
        style={{
          top: `${top}px`,
          left: `${left}px`,
          width: `${width}px`,
          height: `${height}px`
        }}
        className={`fixed z-[9995] rounded-2xl border-2 pointer-events-none transition-all duration-300 ease-out ${
          isPraising
            ? 'border-emerald-400 ring-4 ring-emerald-400/90 shadow-[0_0_45px_rgba(16,185,129,0.9),inset_0_0_20px_rgba(16,185,129,0.3)] scale-[1.02]'
            : isNudged
            ? 'border-[#fae29c] ring-4 ring-amber-400/80 shadow-[0_0_40px_rgba(250,226,156,0.9),inset_0_0_20px_rgba(212,175,55,0.4)] scale-[1.01]'
            : isInteractive
            ? 'border-amber-300 ring-2 ring-emerald-400/60 shadow-[0_0_30px_rgba(212,175,55,0.8),inset_0_0_15px_rgba(16,185,129,0.25)]'
            : 'border-[#d4af37] shadow-[0_0_25px_rgba(212,175,55,0.7),inset_0_0_15px_rgba(212,175,55,0.25)]'
        }`}
      >
        {/* Vòng hào quang nhịp đập (Pulsing aura ring) */}
        <div
          className={`absolute -inset-1 rounded-2xl border animate-ping ${
            isPraising
              ? 'border-emerald-400/80 [animation-duration:1.2s]'
              : isInteractive
              ? 'border-emerald-400/70 [animation-duration:1.8s]'
              : 'border-[#d4af37]/60 [animation-duration:2.5s]'
          }`}
        />

        {/* Tooltip gợi ý thao tác trực tiếp nếu là trạm thực hành */}
        {isInteractive && !isPraising && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#152e23]/95 text-amber-200 border border-amber-400/60 px-3 py-0.5 rounded-full text-[11px] font-sans font-bold shadow-lg whitespace-nowrap animate-bounce flex items-center gap-1">
            <span>{actionHint || '👉 Chạm vào đây để thử ngay!'}</span>
          </div>
        )}

        {/* Thông báo chúc mừng nổi bật ngay trên phần tử khi thao tác thành công */}
        {isPraising && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-emerald-900/95 text-emerald-100 border border-emerald-400 px-3.5 py-0.5 rounded-full text-[11px] font-sans font-black shadow-xl whitespace-nowrap animate-pulse flex items-center gap-1.5">
            <span>✨ Thao tác chuẩn chỉ! Đang chuyển bước...</span>
          </div>
        )}

        {/* 4 Góc đồng cổ xưa truyền thống */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#fae29c]" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#fae29c]" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#fae29c]" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#fae29c]" />
      </div>
    </>
  );
});

export default SpotlightOverlay;

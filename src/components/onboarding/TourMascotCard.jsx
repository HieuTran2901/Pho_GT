import React, { useMemo, memo } from 'react';
import { ChevronLeft, ChevronRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import HeritageMascotFigure from './HeritageMascotFigure';

const TourMascotCard = memo(function TourMascotCard({
  step,
  stepIndex,
  totalSteps,
  targetRect,
  onNext,
  onPrev,
  onSkip,
  isNudged,
  isPraising = false,
  praiseData = null
}) {
  const isLastStep = stepIndex === totalSteps - 1;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Trạng thái biểu cảm động của nhân vật Chibi Tiểu Nhị 1986
  const mascotExpression = isPraising
    ? 'praising'
    : step.isInteractive
    ? 'pointing'
    : 'idle';

  // Tính toán vị trí thẻ Tiểu Nhị thông minh chống tràn mép màn hình và chống văng ngoài viewport
  const cardStyle = useMemo(() => {
    const cardWidth = isMobile
      ? Math.min(350, typeof window !== 'undefined' ? window.innerWidth - 24 : 340)
      : 370;
    const cardHeight = 195;

    if (!targetRect || typeof window === 'undefined') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${cardWidth}px`
      };
    }

    const { top, bottom, left, width, height } = targetRect;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // 1. TRÊN THIẾT BỊ DI ĐỘNG (< 768px):
    // Cơ chế Ghim nửa màn hình ngược chiều (Smart Opposite Pinning) triệt tiêu việc che khuất nút bấm
    if (isMobile) {
      const isTargetInBottomHalf = top > viewportHeight * 0.42 || bottom > viewportHeight * 0.55;
      if (isTargetInBottomHalf) {
        return {
          top: '12px',
          left: '12px',
          right: '12px',
          width: 'calc(100% - 24px)',
          maxWidth: `${cardWidth}px`,
          margin: '0 auto'
        };
      }
      return {
        bottom: '12px',
        left: '12px',
        right: '12px',
        width: 'calc(100% - 24px)',
        maxWidth: `${cardWidth}px`,
        margin: '0 auto'
      };
    }

    // 2. TRÊN MÁY TÍNH & TABLET (>= 768px):
    // Neo cạnh trái giỏ hàng khi ở bước checkout trong CartDrawer
    if (step.id === 'order-checkout-cart') {
      const drawerWidth = Math.min(448, viewportWidth * 0.45);
      return {
        bottom: '24px',
        right: `${drawerWidth + 24}px`,
        width: `${cardWidth}px`
      };
    }

    const isTargetVeryLarge = height > viewportHeight * 0.55;
    const isTargetOffscreen = bottom < 10 || top > viewportHeight + 50 || left > viewportWidth + 50;

    if (isTargetVeryLarge || isTargetOffscreen) {
      return {
        bottom: '24px',
        right: '24px',
        width: `${cardWidth}px`
      };
    }

    // Đặt cạnh bên nếu có khoảng trống rộng rãi
    const preferredSide = step.preferredPlacement === 'side';
    const spaceRight = viewportWidth - (left + width) - 24;
    const spaceLeft = left - 24;

    if (preferredSide || (spaceRight >= cardWidth && height > 160)) {
      if (spaceRight >= cardWidth) {
        const clampedSideTop = Math.max(16, Math.min(top, viewportHeight - cardHeight - 16));
        return {
          top: `${clampedSideTop}px`,
          left: `${left + width + 20}px`,
          width: `${cardWidth}px`
        };
      } else if (spaceLeft >= cardWidth) {
        const clampedSideTop = Math.max(16, Math.min(top, viewportHeight - cardHeight - 16));
        return {
          top: `${clampedSideTop}px`,
          left: `${left - cardWidth - 20}px`,
          width: `${cardWidth}px`
        };
      }
    }

    // Căn giữa theo trục X, kẹp an toàn trong viewport
    const targetCenterX = left + width / 2;
    const rawLeft = targetCenterX - cardWidth / 2;
    const clampedLeft = Math.max(16, Math.min(rawLeft, viewportWidth - cardWidth - 16));

    // Tính toán trục dọc Y
    const canPlaceBelow = bottom >= 0 && bottom <= viewportHeight - 100 && (viewportHeight - bottom >= cardHeight + 24);
    const canPlaceAbove = top >= cardHeight + 24 && top <= viewportHeight;

    let computedTop;
    if (step.preferredPlacement === 'top' && canPlaceAbove) {
      computedTop = top - cardHeight - 16;
    } else if (canPlaceBelow) {
      computedTop = bottom + 16;
    } else if (canPlaceAbove) {
      computedTop = top - cardHeight - 16;
    } else {
      computedTop = Math.max(16, viewportHeight / 2 - cardHeight / 2);
    }

    const clampedTop = Math.max(16, Math.min(computedTop, viewportHeight - cardHeight - 16));

    return {
      top: `${clampedTop}px`,
      left: `${clampedLeft}px`,
      width: `${cardWidth}px`
    };
  }, [targetRect, step.preferredPlacement, step.id, isMobile]);

  return (
    <div
      style={cardStyle}
      className="fixed z-[9999] pointer-events-auto select-none transition-all duration-300"
    >
      {/* Nudge Attention Tooltip khi bấm nhầm ra ngoài */}
      {isNudged && !isPraising && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#fae29c] text-[#7a1e12] text-[11px] font-sans font-bold px-3 py-1 rounded-full shadow-xl border border-amber-500 animate-bounce whitespace-nowrap z-40 flex items-center gap-1.5 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-[#96281b]" />
          <span>Bác bấm &quot;Tiếp tục&quot; hoặc &quot;✕&quot; ở đây nhé!</span>
        </div>
      )}

      {/* BỐ CỤC: NHÂN VẬT CHIBI TIỂU NHỊ 1986 + BONG BÓNG THOẠI DI SẢN */}
      <div className={`relative flex ${isMobile ? 'flex-row items-end gap-2' : 'flex-row items-start gap-3'}`}>
        
        {/* NHÂN VẬT CHIBI TIỂU NHỊ 1986 NỔI BẬT */}
        <div className="relative shrink-0 flex flex-col items-center z-20">
          <HeritageMascotFigure
            expression={mascotExpression}
            size={isMobile ? 'sm' : 'md'}
            showSteam={true}
          />
          {/* Nhãn chức danh Tiểu Nhị mạ vàng */}
          <span className="mt-1 px-2 py-0.2 rounded-full bg-[#183a2b] border border-[#d4af37]/60 text-[9px] font-mono font-bold text-amber-200 shadow-sm whitespace-nowrap">
            Tiểu Nhị 1986
          </span>
        </div>

        {/* BONG BÓNG THOẠI (COMIC SPEECH BUBBLE) SƠN MÀI NGỌC BÍCH */}
        <div
          className={`relative flex-1 rounded-3xl bg-gradient-to-br from-[#163527]/98 via-[#0e241b]/98 to-[#081711]/98 backdrop-blur-md border-2 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(212,175,55,0.25)] text-stone-100 p-4 font-serif transition-all duration-300 ${
            isPraising
              ? 'border-amber-400 ring-4 ring-amber-400/90 shadow-[0_0_55px_rgba(250,226,156,0.95)] scale-[1.02]'
              : isNudged
              ? 'border-[#fae29c] ring-4 ring-amber-400/80 shadow-[0_0_45px_rgba(250,226,156,0.9)] scale-[1.03] -translate-y-1'
              : 'border-[#d4af37]/85'
          }`}
        >
          {/* Đuôi nhọn bong bóng thoại (Speech Bubble Tail) chỉ sang Tiểu Nhị trên Desktop */}
          {!isMobile && (
            <>
              <div className="absolute top-7 -left-2.5 w-0 h-0 border-y-[8px] border-y-transparent border-r-[10px] border-r-[#d4af37]" />
              <div className="absolute top-[29px] -left-2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-[#112a1f]" />
            </>
          )}

          {/* Header: Badge trạm hiện tại & Nút đóng */}
          <div className="flex items-center justify-between gap-2 border-b border-[#d4af37]/20 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              {isPraising ? (
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-100 bg-emerald-800/90 px-2 py-0.5 rounded-full border border-emerald-400 shadow-sm animate-pulse flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>XUẤT SẮC!</span>
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#fae29c] bg-[#1a382b] px-2 py-0.5 rounded-full border border-[#d4af37]/40">
                  {step.badge || `BƯỚC ${stepIndex + 1}/${totalSteps}`}
                </span>
              )}
              <span className="text-[10px] text-amber-200/70 font-mono">
                ({stepIndex + 1}/{totalSteps})
              </span>
            </div>

            {/* Nút đóng / bỏ qua tour */}
            <button
              onClick={onSkip}
              className="text-stone-400 hover:text-amber-300 p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Bỏ qua hướng dẫn (ESC)"
              aria-label="Bỏ qua hướng dẫn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body: Tiêu đề & Lời thoại ấm áp của Tiểu Nhị */}
          <div className="space-y-1.5 mb-3">
            <h4 className="text-sm sm:text-base font-black text-[#fae29c] leading-tight font-serif">
              {isPraising ? (praiseData?.title || 'Làm tốt lắm Bác ơi! 🎉') : step.title}
            </h4>
            <p className="text-xs text-stone-200 leading-relaxed font-sans font-normal opacity-95">
              {isPraising ? (praiseData?.message || step.mascotMessage) : step.mascotMessage}
            </p>

            {/* Gợi ý thao tác trực quan */}
            {step.isInteractive && !isPraising && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-sans text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-1 rounded-xl animate-pulse">
                <span>{step.actionHint || '👉 Bác chạm thử trực tiếp trên màn hình nhé!'}</span>
              </div>
            )}

            {/* Thông báo chuẩn bị chuyển bước khi khen ngợi */}
            {isPraising && (
              <div className="mt-2 flex items-center gap-2 text-[11px] font-sans text-amber-200 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-xl shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin [animation-duration:3s]" />
                <span>Tiểu Nhị đang đưa Bác sang trạm tiếp theo...</span>
              </div>
            )}
          </div>

          {/* Footer: Tiến trình & Nút điều hướng tinh gọn */}
          <div className="flex items-center justify-between pt-2.5 border-t border-[#d4af37]/20">
            {/* Progress dots */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === stepIndex
                      ? 'w-4 bg-gradient-to-r from-amber-400 to-amber-200'
                      : idx < stepIndex
                      ? 'w-1.5 bg-emerald-500/70'
                      : 'w-1.5 bg-stone-700'
                  }`}
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onSkip}
                className="text-stone-400 hover:text-amber-200 text-[11px] font-sans px-1.5 py-0.5 transition-colors cursor-pointer"
                title="Bỏ qua hướng dẫn (ESC)"
              >
                Bỏ qua
              </button>

              {stepIndex > 0 && (
                <button
                  onClick={onPrev}
                  className="px-2.5 py-1 rounded-lg border border-stone-600 text-stone-300 hover:text-white hover:border-stone-400 text-[11px] font-sans transition-all flex items-center gap-0.5 cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>Trước</span>
                </button>
              )}

              <button
                onClick={onNext}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#96281b] to-[#7a1e12] hover:from-[#aa2e1f] hover:to-[#8c2315] border border-amber-400/60 text-amber-100 font-bold text-[11px] tracking-wide shadow-md transition-all flex items-center gap-1 cursor-pointer active:scale-95 group"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-amber-200" />
                    <span>Hoàn tất</span>
                  </>
                ) : (
                  <>
                    <span>Tiếp</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

export default TourMascotCard;

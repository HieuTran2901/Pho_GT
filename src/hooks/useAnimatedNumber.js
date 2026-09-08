import { useState, useEffect, useRef } from 'react';

/**
 * [RAVEN] useAnimatedNumber hook
 * Odometer count-down mượt mà 60fps với cơ chế Continuous Interpolation.
 * Khi giá trị thay đổi liên tục (nhanh), animation mới sẽ tiếp nối mượt mà từ số đang hiển thị, không bị giật số.
 */
export function useAnimatedNumber(targetValue, duration = 450) {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const currentInterpolatedRef = useRef(targetValue);

  useEffect(() => {
    const startValue = currentInterpolatedRef.current;
    const endValue = targetValue;
    if (startValue === endValue) return;

    const startTime = performance.now();
    let frameId;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startValue + (endValue - startValue) * ease);

      currentInterpolatedRef.current = current;
      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        currentInterpolatedRef.current = endValue;
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [targetValue, duration]);

  return displayValue;
}

export default useAnimatedNumber;

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useHorizontalDragScroll
 * Cung cấp khả năng kéo thả chuột mượt mà (Mouse Drag-to-Scroll),
 * chuyển đổi lăn con lăn chuột dọc sang ngang (Wheel to Scroll),
 * và điều hướng bước nhảy Prev / Next cho băng chuyền Desktop.
 */
export function useHorizontalDragScroll({ step = 374, speed = 1.2 } = {}) {
  const scrollContainerRef = useRef(null);
  const resizeObserverRef = useRef(null);

  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    hasDragged: false,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const checkScrollLimits = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);

    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(maxScroll > 6 && scrollLeft < maxScroll - 6);
    setScrollProgress(maxScroll > 0 ? Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)) : 0);
  }, []);

  const setContainerRef = useCallback((node) => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    scrollContainerRef.current = node;

    if (node) {
      // Đo lường ngay khi DOM node được mount vào cây giao diện
      const update = () => {
        const { scrollLeft, scrollWidth, clientWidth } = node;
        const maxScroll = Math.max(0, scrollWidth - clientWidth);
        setCanScrollLeft(scrollLeft > 6);
        setCanScrollRight(maxScroll > 6 && scrollLeft < maxScroll - 6);
        setScrollProgress(maxScroll > 0 ? Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)) : 0);
      };

      update();
      requestAnimationFrame(update);
      setTimeout(update, 80);

      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => update());
        ro.observe(node);
        resizeObserverRef.current = ro;
      }
    }
  }, []);

  useEffect(() => {
    const handleResize = () => checkScrollLimits();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [checkScrollLimits]);

  const handleMouseDown = useCallback((e) => {
    // Chỉ kích hoạt khi nhấn chuột trái
    if (e.button !== 0) return;
    const el = scrollContainerRef.current;
    if (!el) return;

    dragRef.current = {
      isDragging: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      hasDragged: false,
    };
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current.isDragging) return;
    const el = scrollContainerRef.current;
    if (!el) return;

    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragRef.current.startX) * speed;

    if (Math.abs(walk) > 6) {
      dragRef.current.hasDragged = true;
    }

    el.scrollLeft = dragRef.current.scrollLeft - walk;
    checkScrollLimits();
  }, [speed, checkScrollLimits]);

  const handleMouseEnd = useCallback(() => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    setIsDragging(false);
    checkScrollLimits();

    // Giữ trạng thái hasDragged trong 60ms để chặn sự kiện onClick nếu vừa kéo
    if (dragRef.current.hasDragged) {
      setTimeout(() => {
        dragRef.current.hasDragged = false;
      }, 60);
    }
  }, [checkScrollLimits]);

  const handleClickCapture = useCallback((e) => {
    if (dragRef.current.hasDragged) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  const handleWheel = useCallback((e) => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // Nếu người dùng lăn chuột dọc và không giữ Shift
    if (e.deltaY !== 0 && !e.shiftKey) {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;

      const isScrollingLeft = e.deltaY < 0;
      const isScrollingRight = e.deltaY > 0;

      // Nếu đang ở đầu và lăn lên, hoặc ở cuối và lăn xuống: nhường cho cuộn trang
      if ((isScrollingLeft && el.scrollLeft <= 0) || (isScrollingRight && el.scrollLeft >= maxScroll)) {
        return;
      }

      e.preventDefault();
      el.scrollLeft += e.deltaY * 0.9;
      checkScrollLimits();
    }
  }, [checkScrollLimits]);

  const scrollStep = useCallback((direction, customStep) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distance = customStep || step;
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
    // Cập nhật trạng thái nút sau khi hiệu ứng cuộn mượt kết thúc
    setTimeout(checkScrollLimits, 150);
    setTimeout(checkScrollLimits, 400);
  }, [step, checkScrollLimits]);

  return {
    scrollContainerRef,
    isDragging,
    canScrollLeft,
    canScrollRight,
    scrollProgress,
    scrollStep,
    containerProps: {
      ref: setContainerRef,
      onScroll: checkScrollLimits,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseEnd,
      onMouseLeave: handleMouseEnd,
      onClickCapture: handleClickCapture,
      onWheel: handleWheel,
    },
  };
}

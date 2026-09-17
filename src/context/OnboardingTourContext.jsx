import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  HERITAGE_TOUR_STEPS,
  ORDERING_TOUR_STEPS,
  TOUR_STORAGE_KEY
} from '../components/onboarding/tourSteps';
import { playTourStepChime, playTourCompleteFanfare, playPraiseChime } from '../utils/tourSound';

const OnboardingTourContext = createContext(null);

// Tiện ích so sánh nông tọa độ tránh re-render khi phần tử không xê dịch
const areRectsEqual = (r1, r2) => {
  if (!r1 && !r2) return true;
  if (!r1 || !r2) return false;
  return (
    Math.abs(r1.top - r2.top) < 0.5 &&
    Math.abs(r1.left - r2.left) < 0.5 &&
    Math.abs(r1.width - r2.width) < 0.5 &&
    Math.abs(r1.height - r2.height) < 0.5
  );
};

export function OnboardingTourProvider({ children }) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [isModeSelectorOpen, setIsModeSelectorOpen] = useState(false);
  const [tourMode, setTourMode] = useState('heritage');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [isPraising, setIsPraising] = useState(false);
  const [praiseData, setPraiseData] = useState({ title: '', message: '' });
  const rafIdRef = useRef(null);
  const praiseTimerRef = useRef(null);

  const activeSteps = useMemo(() => {
    return tourMode === 'ordering' ? ORDERING_TOUR_STEPS : HERITAGE_TOUR_STEPS;
  }, [tourMode]);

  const currentStep = activeSteps[currentStepIndex] || activeSteps[0];
  const totalSteps = activeSteps.length;

  // Cập nhật vị trí Bounding Rect của phần tử mục tiêu có lọc chống rung
  const updateTargetRect = useCallback(() => {
    if (!isTourActive) {
      setTargetRect(null);
      return;
    }

    const step = activeSteps[currentStepIndex];
    if (!step) return;

    const selectors = step.targetSelector.split(',').map((s) => s.trim());
    let targetEl = null;

    for (const sel of selectors) {
      const elements = document.querySelectorAll(sel);
      for (const el of elements) {
        if (el && (el.offsetParent !== null || el.getClientRects().length > 0)) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            targetEl = el;
            break;
          }
        }
      }
      if (targetEl) break;
    }

    let calculatedRect;
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      const padding = 8;
      calculatedRect = {
        top: Math.max(8, rect.top - padding),
        left: Math.max(8, rect.left - padding),
        width: Math.min(window.innerWidth - 16, rect.width + padding * 2),
        height: rect.height + padding * 2,
        bottom: rect.bottom + padding,
        right: rect.right + padding
      };
    } else {
      // Fallback nếu không tìm thấy target: căn giữa màn hình
      calculatedRect = {
        top: window.innerHeight * 0.25,
        left: window.innerWidth * 0.1,
        width: window.innerWidth * 0.8,
        height: 180,
        bottom: window.innerHeight * 0.25 + 180,
        right: window.innerWidth * 0.9
      };
    }

    setTargetRect((prev) => (areRectsEqual(prev, calculatedRect) ? prev : calculatedRect));
  }, [isTourActive, currentStepIndex, activeSteps]);

  // Cuộn mượt tới phần tử khi chuyển bước
  const scrollToTarget = useCallback((stepIndex) => {
    const step = activeSteps[stepIndex];
    if (!step) return;

    const findVisible = (selectorStr) => {
      if (!selectorStr) return null;
      const list = selectorStr.split(',').map((s) => s.trim());
      for (const sel of list) {
        const elements = document.querySelectorAll(sel);
        for (const el of elements) {
          if (el && (el.offsetParent !== null || el.getClientRects().length > 0)) {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) return el;
          }
        }
      }
      return null;
    };

    const target = findVisible(step.scrollSelector) || findVisible(step.targetSelector);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeSteps]);

  // Lắng nghe scroll và resize để đồng bộ vùng sáng 60fps
  useEffect(() => {
    if (!isTourActive) return;

    const handleSync = () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(updateTargetRect);
    };

    window.addEventListener('resize', handleSync, { passive: true });
    window.addEventListener('scroll', handleSync, { passive: true });

    // Cập nhật ngay lần đầu và đồng bộ nhiều pha khi trang cuộn êm (smooth scroll) & drawer trượt vào
    updateTargetRect();
    const t1 = setTimeout(updateTargetRect, 200);
    const t2 = setTimeout(updateTargetRect, 500);
    const t3 = setTimeout(updateTargetRect, 580);
    const t4 = setTimeout(updateTargetRect, 720);
    const t5 = setTimeout(updateTargetRect, 850);

    return () => {
      window.removeEventListener('resize', handleSync);
      window.removeEventListener('scroll', handleSync);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isTourActive, updateTargetRect]);

  const openModeSelector = useCallback(() => {
    setIsTourActive(false);
    setTargetRect(null);
    setIsModeSelectorOpen(true);
  }, []);

  const closeModeSelector = useCallback(() => {
    setIsModeSelectorOpen(false);
  }, []);

  const selectTourMode = useCallback((mode) => {
    setTourMode(mode);
    setIsModeSelectorOpen(false);
    setCurrentStepIndex(0);
    setIsTourActive(true);
    playTourStepChime();
    const steps = mode === 'ordering' ? ORDERING_TOUR_STEPS : HERITAGE_TOUR_STEPS;
    if (steps[0]) {
      setTimeout(() => {
        const firstStep = steps[0];
        const selectorList = (firstStep.scrollSelector || firstStep.targetSelector)
          .split(',')
          .map((s) => s.trim());
        let el = null;
        for (const sel of selectorList) {
          const found = document.querySelector(sel);
          if (found && (found.offsetParent !== null || found.getClientRects().length > 0)) {
            el = found;
            break;
          }
        }
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
    }
  }, []);

  const startTour = useCallback((mode = null, startIndex = 0) => {
    if (mode) {
      selectTourMode(mode);
    } else {
      openModeSelector();
    }
  }, [selectTourMode, openModeSelector]);

  const completeTour = useCallback(() => {
    if (praiseTimerRef.current) clearTimeout(praiseTimerRef.current);
    setIsPraising(false);
    setIsTourActive(false);
    setIsModeSelectorOpen(false);
    setTargetRect(null);
    playTourCompleteFanfare();
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    } catch {}
  }, []);

  const skipTour = useCallback(() => {
    if (praiseTimerRef.current) clearTimeout(praiseTimerRef.current);
    setIsPraising(false);
    setIsTourActive(false);
    setIsModeSelectorOpen(false);
    setTargetRect(null);
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    } catch {}
  }, []);

  const nextStep = useCallback(() => {
    if (praiseTimerRef.current) clearTimeout(praiseTimerRef.current);
    setIsPraising(false);
    if (currentStepIndex < totalSteps - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      playTourStepChime();
      scrollToTarget(nextIdx);
    } else {
      completeTour();
    }
  }, [currentStepIndex, totalSteps, completeTour, scrollToTarget]);

  const prevStep = useCallback(() => {
    if (praiseTimerRef.current) clearTimeout(praiseTimerRef.current);
    setIsPraising(false);
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      playTourStepChime();
      scrollToTarget(prevIdx);
    }
  }, [currentStepIndex, scrollToTarget]);

  // Thông báo hành động tương tác thành công và chuyển sang chế độ khen ngợi
  const notifyTourAction = useCallback((actionType) => {
    if (!isTourActive || isPraising) return;
    const step = activeSteps[currentStepIndex];
    if (!step || !step.isInteractive) return;

    if (step.expectedAction === actionType) {
      setIsPraising(true);
      setPraiseData({
        title: step.praiseTitle || 'Làm tốt lắm Bác ơi! 🎉',
        message: step.praiseMessage || 'Thao tác của Bác rất chuẩn xác!'
      });
      playPraiseChime();

      if (praiseTimerRef.current) clearTimeout(praiseTimerRef.current);
      const delay = step.autoAdvanceDelay || 1700;
      praiseTimerRef.current = setTimeout(() => {
        setIsPraising(false);
        if (currentStepIndex < totalSteps - 1) {
          const nextIdx = currentStepIndex + 1;
          setCurrentStepIndex(nextIdx);
          playTourStepChime();
          scrollToTarget(nextIdx);
        } else {
          completeTour();
        }
      }, delay);
    }
  }, [isTourActive, isPraising, activeSteps, currentStepIndex, totalSteps, completeTour, scrollToTarget]);

  // Lắng nghe sự kiện click thực tế trên các phần tử tương tác
  useEffect(() => {
    if (!isTourActive || !currentStep?.isInteractive || isPraising) return;

    const handleGlobalClick = (e) => {
      const step = currentStep;
      if (!step || !step.expectedAction) return;

      if (step.expectedAction === 'ADD_TO_CART') {
        const targetBtn = e.target.closest(
          '#tour-first-dish-add-btn, #tour-first-dish-add-btn-mobile, [data-tour="dish-add-btn"]'
        );
        if (targetBtn) {
          notifyTourAction('ADD_TO_CART');
        }
      } else if (step.expectedAction === 'OPEN_CART') {
        const targetCart = e.target.closest(
          '#navbar-cart-btn, #mobile-bottom-cart-btn, [data-tour="navbar-gift-vault-btn"]'
        );
        if (targetCart) {
          notifyTourAction('OPEN_CART');
        }
      } else if (step.expectedAction === 'CLICK_CHECKOUT') {
        const targetCheckout = e.target.closest(
          '#cart-drawer-checkout-btn, [data-tour="cart-checkout-btn"]'
        );
        if (targetCheckout) {
          notifyTourAction('CLICK_CHECKOUT');
        }
      } else if (step.expectedAction === 'SELECT_PAYMENT_OR_SUBMIT') {
        const targetPayment = e.target.closest(
          '#order-form-card input, #order-form-card button, #order-form-card label'
        );
        if (targetPayment) {
          notifyTourAction('SELECT_PAYMENT_OR_SUBMIT');
        }
      }
    };

    window.addEventListener('click', handleGlobalClick, true);

    const handleCustomTourAction = (e) => {
      if (e.detail?.action) {
        notifyTourAction(e.detail.action);
      }
    };
    window.addEventListener('pho1986:tour-action', handleCustomTourAction);

    return () => {
      window.removeEventListener('click', handleGlobalClick, true);
      window.removeEventListener('pho1986:tour-action', handleCustomTourAction);
    };
  }, [isTourActive, currentStep, isPraising, notifyTourAction]);

  // Tự động nâng z-index cho phần tử mục tiêu khi ở trạm tương tác (Dynamic Z-Index Elevation)
  useEffect(() => {
    if (!isTourActive || !currentStep?.isInteractive) return;

    const selectors = (currentStep.targetSelector || '').split(',').map((s) => s.trim());
    let elevatedEl = null;

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && (el.offsetParent !== null || el.getClientRects().length > 0)) {
        elevatedEl = el;
        break;
      }
    }

    if (elevatedEl) {
      elevatedEl.classList.add('pho-tour-elevated');
      elevatedEl.style.position = 'relative';
      elevatedEl.style.zIndex = '9996';
      elevatedEl.style.pointerEvents = 'auto';
    }

    return () => {
      if (elevatedEl) {
        elevatedEl.classList.remove('pho-tour-elevated');
        elevatedEl.style.position = '';
        elevatedEl.style.zIndex = '';
        elevatedEl.style.pointerEvents = '';
      }
    };
  }, [isTourActive, currentStep]);

  // Dọn dẹp timer khi unmount
  useEffect(() => {
    return () => {
      if (praiseTimerRef.current) clearTimeout(praiseTimerRef.current);
    };
  }, []);

  // Phím tắt bàn phím: Escape, Mũi tên Trái/Phải
  useEffect(() => {
    if (!isTourActive) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        skipTour();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourActive, nextStep, prevStep, skipTour]);

  // Tự động kích hoạt sau 1.8s cho khách mới lần đầu
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Không tự bung nếu đang ở trang Admin hoặc Marketing
    const path = window.location.pathname;
    if (path.includes('/admin') || path.includes('/marketing')) return;

    try {
      const hasCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!hasCompleted) {
        const timer = setTimeout(() => {
          openModeSelector();
        }, 1800);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [openModeSelector]);

  const value = useMemo(
    () => ({
      isTourActive,
      isModeSelectorOpen,
      tourMode,
      currentStepIndex,
      currentStep,
      totalSteps,
      targetRect,
      isPraising,
      praiseData,
      notifyTourAction,
      startTour,
      openModeSelector,
      closeModeSelector,
      selectTourMode,
      nextStep,
      prevStep,
      skipTour,
      completeTour
    }),
    [
      isTourActive,
      isModeSelectorOpen,
      tourMode,
      currentStepIndex,
      currentStep,
      totalSteps,
      targetRect,
      isPraising,
      praiseData,
      notifyTourAction,
      startTour,
      openModeSelector,
      closeModeSelector,
      selectTourMode,
      nextStep,
      prevStep,
      skipTour,
      completeTour
    ]
  );

  return (
    <OnboardingTourContext.Provider value={value}>
      {children}
    </OnboardingTourContext.Provider>
  );
}

export function useOnboardingTour() {
  const context = useContext(OnboardingTourContext);
  if (!context) {
    throw new Error('useOnboardingTour must be used within OnboardingTourProvider');
  }
  return context;
}

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useOnboardingTour } from '../../context/OnboardingTourContext';
import SpotlightOverlay from './SpotlightOverlay';
import TourMascotCard from './TourMascotCard';
import TourModeSelectorCard from './TourModeSelectorCard';

export default function SpotlightTour() {
  const {
    isTourActive,
    isModeSelectorOpen,
    closeModeSelector,
    selectTourMode,
    currentStep,
    currentStepIndex,
    totalSteps,
    targetRect,
    isPraising,
    praiseData,
    nextStep,
    prevStep,
    skipTour
  } = useOnboardingTour();

  const [isMounted, setIsMounted] = useState(false);
  const [isNudged, setIsNudged] = useState(false);
  const nudgeTimerRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    };
  }, []);

  // Kích hoạt rung lắc nhẹ nhắc nhở khi thực khách bấm nhầm ra ngoài
  const handleBackdropNudge = useCallback(() => {
    setIsNudged(true);
    if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    nudgeTimerRef.current = setTimeout(() => {
      setIsNudged(false);
    }, 500);
  }, []);

  if (!isMounted || (!isTourActive && !isModeSelectorOpen)) return null;

  return createPortal(
    <AnimatePresence>
      {/* 1. Thẻ Chào Mừng Lựa Chọn Hành Trình (Mode Selector) */}
      {isModeSelectorOpen && (
        <TourModeSelectorCard
          key="pho-tour-mode-selector"
          onSelectMode={selectTourMode}
          onClose={closeModeSelector}
        />
      )}

      {/* 2. Luồng Tour Rọi Sáng Spotlight */}
      {isTourActive && (
        <motion.div
          key="pho-spotlight-tour"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          className="fixed inset-0 z-[9980] pointer-events-none"
          role="dialog"
          aria-modal="true"
          aria-label="Hướng dẫn sử dụng Phở Gia Truyền 1986"
        >
          {/* 1. Lớp phủ đen khoét lỗ vùng sáng SVG với khóa bảo vệ backdrop */}
          <SpotlightOverlay
            targetRect={targetRect}
            onBackdropClick={handleBackdropNudge}
            isNudged={isNudged}
            isInteractive={currentStep?.isInteractive}
            actionHint={currentStep?.actionHint}
            isPraising={isPraising}
          />

          {/* 2. Thẻ hội thoại Tiểu Nhị 1986 bám theo phần tử */}
          <TourMascotCard
            step={currentStep}
            stepIndex={currentStepIndex}
            totalSteps={totalSteps}
            targetRect={targetRect}
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={skipTour}
            isNudged={isNudged}
            isPraising={isPraising}
            praiseData={praiseData}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

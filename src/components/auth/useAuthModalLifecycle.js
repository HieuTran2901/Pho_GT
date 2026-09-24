import { useState, useEffect, useCallback, useRef } from 'react';

export function useAuthModalLifecycle({ authModalOpen, closeAuthModal }) {
  const [mounted, setMounted] = useState(authModalOpen);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef(null);
  const isFirstRender = useRef(true);

  // Immediate mount synchronization to avoid 1-frame blank tick
  if (authModalOpen && !mounted) {
    setMounted(true);
    setIsClosing(false);
  }

  // Synchronize modal open/close lifecycle
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!authModalOpen) return;
    }
    if (authModalOpen) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setMounted(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
      closeTimerRef.current = setTimeout(() => {
        setMounted(false);
        setIsClosing(false);
        closeTimerRef.current = null;
      }, 280);
    }
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [authModalOpen]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    if (closeAuthModal) closeAuthModal();
  }, [isClosing, closeAuthModal]);

  // Handle ESC key listener & body scroll lock
  useEffect(() => {
    if (!mounted) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isClosing) handleClose();
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mounted, isClosing, handleClose]);

  return {
    mounted,
    isClosing,
    handleClose
  };
}

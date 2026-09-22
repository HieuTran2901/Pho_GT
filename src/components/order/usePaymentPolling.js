import { useEffect } from 'react';

/**
 * usePaymentPolling - Realtime Polling & Cross-Tab Broadcast for VietQR confirmation
 * Isolates background network polling from order form state.
 */
export function usePaymentPolling({
  step,
  paymentData,
  isVietQrConfirmed,
  handleVerifyPayment,
  setPaymentData,
  setIsVietQrConfirmed,
  onClearCart
}) {
  useEffect(() => {
    if (step !== 3 || !paymentData?.paymentCode) return;
    if (paymentData.status === 'SUCCESS' || isVietQrConfirmed) return;

    let pollAttempts = 0;
    const MAX_POLL_ATTEMPTS = 300;

    // Check once immediately upon entering Step 3 in case webhook already arrived
    handleVerifyPayment();

    const pollInterval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      pollAttempts += 1;
      if (pollAttempts > MAX_POLL_ATTEMPTS) {
        clearInterval(pollInterval);
        return;
      }
      const res = await handleVerifyPayment();
      if (res?.success || res?.status === 'EXPIRED') clearInterval(pollInterval);
    }, 3000);

    // Tự động đối soát ngay khi tab/app quay lại foreground hoặc focus
    const handleWakeup = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        handleVerifyPayment();
      }
    };

    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', handleWakeup);
    if (typeof window !== 'undefined') window.addEventListener('focus', handleWakeup);

    // Nhận thông báo xác nhận tức thì từ tab khác đang mở cùng phiên VietQR
    let syncChannel = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        syncChannel = new BroadcastChannel('pho1986_payment_channel');
        syncChannel.onmessage = (event) => {
          if (event.data?.type === 'PAYMENT_CONFIRMED' && event.data?.paymentCode === paymentData?.paymentCode) {
            setPaymentData((prev) => ({ ...prev, ...event.data.data, status: 'SUCCESS' }));
            setIsVietQrConfirmed(true);
            if (onClearCart) onClearCart();
          }
        };
      } catch {}
    }

    return () => {
      clearInterval(pollInterval);
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', handleWakeup);
      if (typeof window !== 'undefined') window.removeEventListener('focus', handleWakeup);
      if (syncChannel) {
        try {
          syncChannel.close();
        } catch {}
      }
    };
  }, [step, paymentData?.paymentCode, paymentData?.status, isVietQrConfirmed, handleVerifyPayment, onClearCart, setPaymentData, setIsVietQrConfirmed]);
}

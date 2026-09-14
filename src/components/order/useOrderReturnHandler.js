import { useEffect } from 'react';
import { getOrderSession } from './orderConstants';

/**
 * [RAVEN] Hook handling return URL parameters (MOMO, SePay, VietQR callbacks)
 * Supports full page reload, hashchange, and popstate without causing redirect loops.
 */
export function useOrderReturnHandler({
  setFormData,
  setSelectedPaymentMethod,
  setIsMoreMethodsOpen,
  setPaymentData,
  setBookingCode,
  setSelectedTable,
  setIsVietQrConfirmed,
  setStep,
  setDirection,
  onClearCart,
  setPaymentNotice,
  scrollToOrderSection,
  scrollTimersRef,
  lastProcessedUrlRef
}) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const processReturnUrl = () => {
      const searchString = window.location.search ? window.location.search.substring(1) : '';
      const hashQueryIndex = window.location.hash.indexOf('?');
      const hashString = hashQueryIndex >= 0 ? window.location.hash.substring(hashQueryIndex + 1) : '';
      const combinedParams = new URLSearchParams(searchString ? `${searchString}&${hashString}` : hashString);

      const paymentStatus = combinedParams.get('paymentStatus') || combinedParams.get('result') || combinedParams.get('sepayResult');
      const momoResultCode = combinedParams.get('resultCode');
      const momoMessage = combinedParams.get('message');
      const orderCode = combinedParams.get('orderCode') || combinedParams.get('orderId') || combinedParams.get('order_id');

      const isSuccess =
        (paymentStatus && (paymentStatus.toLowerCase() === 'success' || paymentStatus === '00')) ||
        momoResultCode === '0' ||
        momoMessage === 'Successful.';

      const isCancelled =
        (paymentStatus && (paymentStatus.toLowerCase() === 'cancel' || paymentStatus.toLowerCase() === 'error')) ||
        (momoResultCode && momoResultCode !== '0');

      if (!isSuccess && !isCancelled) return;
      if (lastProcessedUrlRef.current === window.location.href) {
        if (isSuccess || isCancelled) scrollToOrderSection('card', true);
        return;
      }
      lastProcessedUrlRef.current = window.location.href;

      const saved = getOrderSession(orderCode);
      if (saved) {
        if (saved.formData) setFormData(saved.formData);
        if (saved.selectedPaymentMethod) {
          setSelectedPaymentMethod(saved.selectedPaymentMethod);
          if (['SEPAY', 'MOMO', 'VNPAY', 'ZALOPAY', 'CREDIT_CARD'].includes(saved.selectedPaymentMethod)) {
            setIsMoreMethodsOpen(true);
          }
        }
        if (saved.paymentData) setPaymentData(saved.paymentData);
        if (saved.bookingCode) setBookingCode(saved.bookingCode);
        if (saved.selectedTable) setSelectedTable(saved.selectedTable);
      } else if (orderCode) {
        setBookingCode(orderCode);
      }

      const cleanHistoryTimer = () => {
        scrollTimersRef.current.push(setTimeout(() => {
          if (typeof window !== 'undefined') window.history.replaceState(null, '', window.location.pathname);
        }, 3500));
      };

      if (isSuccess) {
        setIsVietQrConfirmed(true);
        setStep(3);
        setDirection('forward');
        if (onClearCart) onClearCart();
        setPaymentNotice({ type: 'success', message: 'Thanh toán trực tuyến thành công! Thẻ bàn di sản của quý khách đã được xác nhận.' });
        scrollToOrderSection('card', true);
        cleanHistoryTimer();
      } else if (isCancelled) {
        setStep(2);
        setDirection('backward');
        setPaymentNotice({ type: 'cancel', message: 'Giao dịch thanh toán chưa hoàn tất hoặc đã bị hủy. Quý khách vui lòng chọn lại phương thức thanh toán phù hợp.' });
        scrollToOrderSection('card', true);
        cleanHistoryTimer();
      }
    };

    processReturnUrl();
    window.addEventListener('hashchange', processReturnUrl);
    window.addEventListener('popstate', processReturnUrl);

    return () => {
      window.removeEventListener('hashchange', processReturnUrl);
      window.removeEventListener('popstate', processReturnUrl);
    };
  }, [
    scrollToOrderSection,
    onClearCart,
    setFormData,
    setSelectedPaymentMethod,
    setIsMoreMethodsOpen,
    setPaymentData,
    setBookingCode,
    setSelectedTable,
    setIsVietQrConfirmed,
    setStep,
    setDirection,
    setPaymentNotice,
    scrollTimersRef,
    lastProcessedUrlRef
  ]);
}

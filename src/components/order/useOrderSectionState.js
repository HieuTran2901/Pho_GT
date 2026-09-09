import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { paymentApi } from '../../services/paymentApi';
import { submitSePayCheckout } from '../../utils/submitSePayCheckout';
import {
  BRANCH_LABELS,
  INITIAL_FORM_DATA,
  saveOrderSession,
  saveCustomerHistoryOrder,
  getOrderSession,
  SESSION_LATEST_KEY
} from './orderConstants';

export function useOrderSectionState(sectionRef, { cartItems = [], onClearCart } = {}) {
  const { user } = useAuth();

  // Lazy initialize form data with authenticated user info
  const [formData, setFormData] = useState(() => ({
    ...INITIAL_FORM_DATA,
    customerName: user?.fullName || '',
    phone: user?.phone || ''
  }));

  // In-Place Multi-Step navigation states
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('forward');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('POST_PAID_AT_STORE');
  const [isMoreMethodsOpen, setIsMoreMethodsOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [bookingCode, setBookingCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isVietQrConfirmed, setIsVietQrConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  const [selectedTable, setSelectedTable] = useState(null);
  const [isSeatMapOpen, setIsSeatMapOpen] = useState(false);

  const submitTimerRef = useRef(null);
  const copyTimerRef = useRef(null);
  const hasAutoFilledRef = useRef(Boolean(user?.fullName || user?.phone));
  const hasHandledReturnRef = useRef(false);

  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const calculatedAmount = useMemo(() => {
    if (cartItems && cartItems.length > 0) {
      return cartItems.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
    }
    const guestNum = parseInt(formData.guestCount, 10) || 2;
    return formData.orderType === 'dine-in' ? guestNum * 75000 : 150000;
  }, [cartItems, formData.orderType, formData.guestCount]);

  const selectedTasteSet = useMemo(() => {
    if (!formData.note) return new Set();
    return new Set(
      formData.note
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    );
  }, [formData.note]);

  // Auto-fill user contact info once
  useEffect(() => {
    if (user && !hasAutoFilledRef.current) {
      hasAutoFilledRef.current = true;
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.fullName || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'branch') {
      setSelectedTable(null);
    }
  }, []);

  const handleSetOrderType = useCallback((type) => {
    setFormData((prev) => ({ ...prev, orderType: type }));
    setSelectedPaymentMethod(type === 'dine-in' ? 'POST_PAID_AT_STORE' : 'COD');
    if (type === 'delivery') {
      setSelectedTable(null);
    }
  }, []);

  const handleSetGuestCount = useCallback((count) => {
    setFormData((prev) => ({ ...prev, guestCount: count }));
    setSelectedTable((prevTable) => {
      if (prevTable && prevTable.capacity < parseInt(count, 10)) {
        return null;
      }
      return prevTable;
    });
  }, []);

  const handleToggleTaste = useCallback((pref) => {
    setFormData((prev) => {
      const current = (prev.note || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const exists = current.includes(pref);
      const updated = exists ? current.filter((s) => s !== pref) : [...current, pref];
      return { ...prev, note: updated.join(', ') };
    });
  }, []);

  const scrollTimersRef = useRef([]);
  const lastProcessedUrlRef = useRef('');

  const clearScrollTimers = useCallback(() => {
    scrollTimersRef.current.forEach((t) => clearTimeout(t));
    scrollTimersRef.current = [];
  }, []);

  // Hủy toàn bộ timer cuộn tự động ngay khi người dùng chủ động chạm hoặc cuộn màn hình
  useEffect(() => {
    const handleUserInteraction = () => clearScrollTimers();
    window.addEventListener('wheel', handleUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [clearScrollTimers]);

  const scrollToOrderSection = useCallback((target = 'card') => {
    if (typeof window === 'undefined') return;

    clearScrollTimers();

    const performScroll = () => {
      const cardEl = document.getElementById('order-form-card');
      const orderEl = sectionRef.current || document.getElementById('order');
      const targetEl = (target === 'card' && cardEl) ? cardEl : (cardEl || orderEl);
      if (targetEl) {
        const isMobile = window.innerWidth < 1024;
        const rect = targetEl.getBoundingClientRect();
        // Không giật lại nếu form đã nằm vừa vặn trong tầm mắt
        const isComfortablyVisible = rect.top >= 40 && rect.top <= 180;
        if (!isComfortablyVisible) {
          const offset = isMobile ? 68 : -2;
          const targetY = rect.top + window.scrollY - offset;
          window.scrollTo({
            top: Math.max(0, Math.round(targetY)),
            behavior: 'smooth'
          });
        }
      }
    };

    // Chỉ cuộn nhẹ nhàng 1 lần duy nhất sau 50ms khi React render bước mới
    const t = setTimeout(performScroll, 50);
    scrollTimersRef.current.push(t);
  }, [sectionRef, clearScrollTimers]);

  const handleCloseSeatMap = useCallback(() => {
    setIsSeatMapOpen(false);
  }, []);

  const handleConfirmTable = useCallback((table) => {
    setSelectedTable(table);
  }, []);

  useEffect(() => {
    return () => {
      clearScrollTimers();
      if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, [clearScrollTimers]);

  // Handle return URL parameters (support full reload, hashchange, and popstate)
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
      if (lastProcessedUrlRef.current === window.location.href) return;
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

      if (isSuccess) {
        setIsVietQrConfirmed(true);
        setStep(3);
        setDirection('forward');
        if (onClearCart) onClearCart();
        setPaymentNotice({
          type: 'success',
          message: 'Thanh toán trực tuyến thành công! Thẻ bàn di sản của quý khách đã được xác nhận.'
        });

        scrollToOrderSection('card');

        const cleanTimer = setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }, 2200);
        scrollTimersRef.current.push(cleanTimer);
      } else if (isCancelled) {
        setStep(2);
        setDirection('backward');
        setPaymentNotice({
          type: 'cancel',
          message: 'Giao dịch thanh toán chưa hoàn tất hoặc đã bị hủy. Quý khách vui lòng chọn lại phương thức thanh toán phù hợp.'
        });

        scrollToOrderSection('card');

        const cleanTimer = setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }, 2200);
        scrollTimersRef.current.push(cleanTimer);
      }
    };

    processReturnUrl();
    window.addEventListener('hashchange', processReturnUrl);
    window.addEventListener('popstate', processReturnUrl);

    return () => {
      window.removeEventListener('hashchange', processReturnUrl);
      window.removeEventListener('popstate', processReturnUrl);
    };
  }, [scrollToOrderSection, onClearCart]);

  // Realtime Polling for Webhook confirmation
  useEffect(() => {
    if (step !== 3 || !paymentData?.paymentCode) return;
    if (paymentData.status === 'SUCCESS' || isVietQrConfirmed) return;

    let pollAttempts = 0;
    const MAX_POLL_ATTEMPTS = 100;

    const checkPaymentStatus = async () => {
      try {
        const res = await paymentApi.getPaymentStatus(paymentData.paymentCode);
        if (res && res.status === 'SUCCESS') {
          setPaymentData((prev) => ({ ...prev, ...res }));
          setIsVietQrConfirmed(true);
          if (onClearCart) onClearCart();
          return true;
        }
      } catch (e) {
        // quiet poll
      }
      return false;
    };

    const pollInterval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return;

      pollAttempts += 1;
      if (pollAttempts > MAX_POLL_ATTEMPTS) {
        clearInterval(pollInterval);
        return;
      }

      const isDone = await checkPaymentStatus();
      if (isDone) clearInterval(pollInterval);
    }, 3000);

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        checkPaymentStatus();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      clearInterval(pollInterval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [step, paymentData?.paymentCode, paymentData?.status, isVietQrConfirmed, onClearCart]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setIsLoading(true);

    if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
    submitTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      const branchPrefix = formData.branch?.startsWith('hcm') ? 'SG' : 'HN';
      const randomSalt = Math.floor(1000 + Math.random() * 9000);
      setBookingCode(`PHO1986-${branchPrefix}-${randomSalt}`);
      setDirection('forward');
      setStep(2);
      scrollToOrderSection();
    }, 450);
  };

  const handleConfirmOrder = async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);
    try {
      const orderAmount = calculatedAmount;
      const targetAddress = formData.orderType === 'dine-in'
        ? (BRANCH_LABELS[formData.branch] || 'Cơ sở Phở Gia Truyền 1986')
        : (formData.address || 'Địa chỉ nhận hàng');

      const paymentRes = await paymentApi.createPayment({
        orderCode: bookingCode,
        paymentMethod: selectedPaymentMethod,
        note: formData.note,
        customerName: formData.customerName,
        phone: formData.phone,
        address: targetAddress,
        amount: orderAmount
      });
      setPaymentData(paymentRes);

      saveOrderSession(bookingCode, {
        bookingCode,
        formData,
        selectedPaymentMethod,
        paymentData: paymentRes,
        amount: orderAmount,
        selectedTable,
        createdAt: Date.now()
      });

      saveCustomerHistoryOrder({
        bookingCode,
        formData,
        selectedPaymentMethod,
        orderAmount,
        selectedTable,
        targetAddress,
        cartItems
      });

      if (onClearCart) onClearCart();

      if (selectedPaymentMethod === 'SEPAY' && paymentRes?.checkoutUrl && paymentRes?.checkoutFields) {
        setDirection('forward');
        setStep(3);
        scrollToOrderSection();
        const submitted = submitSePayCheckout({
          checkoutUrl: paymentRes.checkoutUrl,
          checkoutFields: paymentRes.checkoutFields
        });
        if (submitted) return;
      }

      if (selectedPaymentMethod === 'MOMO' && paymentRes?.payUrl) {
        setDirection('forward');
        setStep(3);
        scrollToOrderSection();
        window.location.assign(paymentRes.payUrl);
        return;
      }

      setDirection('forward');
      setStep(3);
      scrollToOrderSection();
    } catch (err) {
      console.warn('[OrderSection] Payment API creation error:', err);
      setPaymentError(
        'Không thể khởi tạo phiên thanh toán lúc này. Quý khách vui lòng thử lại hoặc chọn hình thức "Thanh toán sau tại quán".'
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleBackToStep1 = () => { setDirection('backward'); setStep(1); scrollToOrderSection(); };
  const handleBackToStep2 = () => { setDirection('backward'); setStep(2); scrollToOrderSection(); };

  const handleCopyCode = (text) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setDirection('backward');
    setStep(1);
    scrollToOrderSection();
    setPaymentData(null);
    setIsVietQrConfirmed(false);
    setPaymentNotice(null);
    setPaymentError(null);
    setSelectedTable(null);
    setIsSeatMapOpen(false);
    try { sessionStorage.removeItem(SESSION_LATEST_KEY); } catch (e) {}
    setFormData({
      ...INITIAL_FORM_DATA,
      customerName: user?.fullName || '',
      phone: user?.phone || ''
    });
    setSelectedPaymentMethod('POST_PAID_AT_STORE');
    setIsMoreMethodsOpen(false);
  };

  return {
    formData,
    step,
    direction,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    isMoreMethodsOpen,
    setIsMoreMethodsOpen,
    paymentData,
    bookingCode,
    isCopied,
    isProcessingPayment,
    isVietQrConfirmed,
    setIsVietQrConfirmed,
    isLoading,
    paymentNotice,
    paymentError,
    selectedTable,
    isSeatMapOpen,
    setIsSeatMapOpen,
    todayDateStr,
    calculatedAmount,
    selectedTasteSet,
    handleInputChange,
    handleSetOrderType,
    handleSetGuestCount,
    handleToggleTaste,
    scrollToOrderSection,
    handleCloseSeatMap,
    handleConfirmTable,
    handleSubmit,
    handleConfirmOrder,
    handleBackToStep1,
    handleBackToStep2,
    handleCopyCode,
    handleReset
  };
}

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { paymentApi } from '../../services/paymentApi';
import { loyaltyApi } from '../../services/loyaltyApi';
import { fetchAndPickRandomTable, checkTableStillAvailable } from '../../utils/randomTableHelper';
import { useOrderLockoutGuard } from './useOrderLockoutGuard';
import { useOrderReturnHandler } from './useOrderReturnHandler';
import { usePaymentPolling } from './usePaymentPolling';
import { BRANCH_LABELS, INITIAL_FORM_DATA, saveOrderSession, saveCustomerHistoryOrder, SESSION_LATEST_KEY } from './orderConstants';

export function useOrderSectionState(sectionRef, { cartItems = [], onClearCart, onToast } = {}) {
  const { user } = useAuth();

  // Lazy initialize form data with authenticated user info and today date
  const [formData, setFormData] = useState(() => ({
    ...INITIAL_FORM_DATA,
    customerName: user?.fullName || '',
    phone: user?.phone || '',
    date: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  }));

  // In-Place Multi-Step navigation states
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('forward');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('POST_PAID_AT_STORE');
  const [isMoreMethodsOpen, setIsMoreMethodsOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null), [bookingCode, setBookingCode] = useState('');
  const [isCopied, setIsCopied] = useState(false), [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isVietQrConfirmed, setIsVietQrConfirmed] = useState(false), [isLoading, setIsLoading] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState(null), [paymentError, setPaymentError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null), [tableLockWarning, setTableLockWarning] = useState(null);
  const [isSeatMapOpen, setIsSeatMapOpen] = useState(false), [mainDishWarning, setMainDishWarning] = useState(null);
  const submitTimerRef = useRef(null), copyTimerRef = useRef(null);
  const hasAutoFilledRef = useRef(Boolean(user?.fullName || user?.phone));

  // Chốt chặn tài khoản bị khóa trong luồng đặt bàn & thanh toán
  const {
    isOrderLocked,
    lockoutReason,
    setIsOrderLocked,
    setLockoutReason,
    checkOrderEligibility,
    handleResetLockout
  } = useOrderLockoutGuard({
    onResetToStep1: () => { setDirection('backward'); setStep(1); scrollToOrderSection(); },
    onAccountLocked: () => { setFormData((prev) => ({ ...prev, customerName: '', phone: '' })); hasAutoFilledRef.current = false; }
  });

  const todayDateStr = useMemo(() => {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  }, []);

  const calculatedAmount = useMemo(() => {
    if (cartItems && cartItems.length > 0) {
      return cartItems.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
    }
    const guestNum = parseInt(formData.guestCount, 10) || 2;
    return formData.orderType === 'dine-in' ? guestNum * 75000 : 150000;
  }, [cartItems, formData.orderType, formData.guestCount]);

  const selectedTasteSet = useMemo(() => {
    if (!formData.note) return new Set();
    return new Set(formData.note.split(',').map((s) => s.trim()).filter(Boolean));
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
    if (name === 'phone' && isOrderLocked) { setIsOrderLocked(false); setLockoutReason(''); }
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, [isOrderLocked, setIsOrderLocked, setLockoutReason]);

  const handleSetOrderType = useCallback((type) => {
    setTableLockWarning(null);
    setFormData((prev) => ({ ...prev, orderType: type }));
    setSelectedPaymentMethod(type === 'dine-in' ? 'POST_PAID_AT_STORE' : 'COD');
  }, []);

  const handleSetGuestCount = useCallback((count) => {
    setTableLockWarning(null);
    setFormData((prev) => ({ ...prev, guestCount: count }));
    const partySize = parseInt(count, 10) || 2;
    setSelectedTable((prevTable) => {
      if (!prevTable) return null;
      if (prevTable.capacity >= partySize) return prevTable;
      fetchAndPickRandomTable(partySize, prevTable.id).then((newTable) => {
        if (newTable) setSelectedTable(newTable);
      });
      return prevTable;
    });
  }, []);

  const handleToggleTaste = useCallback((pref) => {
    setFormData((prev) => {
      const current = (prev.note || '').split(',').map((s) => s.trim()).filter(Boolean);
      const updated = current.includes(pref) ? current.filter((s) => s !== pref) : [...current, pref];
      return { ...prev, note: updated.join(', ') };
    });
  }, []);

  const scrollTimersRef = useRef([]);
  const lastProcessedUrlRef = useRef('');
  const isPaymentReturnActiveRef = useRef(false);

  const clearScrollTimers = useCallback((reason = '') => {
    if (isPaymentReturnActiveRef.current && (reason.startsWith('user-') || reason === 'unmount')) return;
    scrollTimersRef.current.forEach((t) => clearTimeout(t));
    scrollTimersRef.current = [];
  }, []);

  // Hủy toàn bộ timer cuộn tự động khi người dùng chủ động tương tác màn hình (trừ khi đang trong luồng thanh toán return)
  useEffect(() => {
    const handleUserInteraction = (e) => {
      if (isPaymentReturnActiveRef.current) return;
      clearScrollTimers(`user-${e.type}`);
    };
    window.addEventListener('wheel', handleUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [clearScrollTimers]);

  const scrollToOrderSection = useCallback((target = 'card', isPaymentReturn = false) => {
    if (typeof window === 'undefined') return;

    if (isPaymentReturn) isPaymentReturnActiveRef.current = true;
    clearScrollTimers('new-scroll');

    const performScroll = (behavior = 'smooth') => {
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
            behavior
          });
        }
      }
    };

    if (isPaymentReturn) {
      performScroll('instant');
      [100, 300, 700, 1200].forEach((delay) => {
        const t = setTimeout(() => performScroll('smooth'), delay);
        scrollTimersRef.current.push(t);
      });
      const endTimer = setTimeout(() => {
        isPaymentReturnActiveRef.current = false;
      }, 1500);
      scrollTimersRef.current.push(endTimer);
    } else {
      // Chỉ cuộn nhẹ nhàng 1 lần duy nhất sau 50ms khi React render bước mới trong trang
      const t = setTimeout(() => performScroll('smooth'), 50);
      scrollTimersRef.current.push(t);
    }
  }, [sectionRef, clearScrollTimers]);

  const handleCloseSeatMap = useCallback(() => {
    setIsSeatMapOpen(false);
  }, []);

  const handleConfirmTable = useCallback((table) => {
    setTableLockWarning(null);
    setSelectedTable(table);
  }, []);

  useEffect(() => {
    return () => {
      clearScrollTimers('unmount');
      if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, [clearScrollTimers]);

  // Handle return URL parameters (support full reload, hashchange, and popstate)
  useOrderReturnHandler({
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
  });

  const inFlightVerifyPromiseRef = useRef(null);

  // [Zero-Trust Anti-Fraud] Tra cứu trạng thái thanh toán từ Backend và cập nhật UI tức thì
  const handleVerifyPayment = useCallback(async () => {
    if (!paymentData?.paymentCode) return { success: false, status: 'NOT_FOUND' };
    if (inFlightVerifyPromiseRef.current) return inFlightVerifyPromiseRef.current;

    const verifyPromise = (async () => {
      try {
        const res = await paymentApi.getPaymentStatus(paymentData.paymentCode);
        if (res && res.status === 'SUCCESS') {
          setPaymentData((prev) => ({ ...prev, ...res }));
          setIsVietQrConfirmed(true);
          if (onClearCart) onClearCart();
          loyaltyApi.getLoyaltySummary().then((s) => s?.account && window.dispatchEvent(new CustomEvent('pho1986:loyalty-updated', { detail: s.account }))).catch(() => {});

          // [Issue #5] Đồng bộ tức thì giữa nhiều tab qua BroadcastChannel
          if (typeof BroadcastChannel !== 'undefined') {
            try {
              const syncChannel = new BroadcastChannel('pho1986_payment_channel');
              syncChannel.postMessage({ type: 'PAYMENT_CONFIRMED', paymentCode: paymentData.paymentCode, data: res });
              syncChannel.close();
            } catch {}
          }
          return { success: true, status: 'SUCCESS', data: res };
        }
        if (res && res.status === 'EXPIRED') {
          setPaymentData((prev) => ({ ...prev, ...res, status: 'EXPIRED' }));
        }
        return { success: false, status: res?.status || 'PENDING', data: res };
      } catch (e) {
        return { success: false, status: 'ERROR', error: e };
      } finally {
        inFlightVerifyPromiseRef.current = null;
      }
    })();

    inFlightVerifyPromiseRef.current = verifyPromise;
    return verifyPromise;
  }, [paymentData?.paymentCode, onClearCart]);

  // Realtime Polling & Cross-Tab Broadcast for Webhook confirmation
  usePaymentPolling({
    step,
    paymentData,
    isVietQrConfirmed,
    handleVerifyPayment,
    setPaymentData,
    setIsVietQrConfirmed,
    onClearCart
  });

  const handleSelectRandomTable = useCallback(async () => {
    setTableLockWarning(null);
    const table = await fetchAndPickRandomTable(formData.guestCount, selectedTable?.id);
    if (table) {
      setSelectedTable(table);
    } else {
      setTableLockWarning('Hiện tại quán đã hết bàn trống phù hợp với số lượng khách. Quý khách vui lòng chọn giờ khác hoặc liên hệ hotline!');
    }
    return table;
  }, [formData.guestCount, selectedTable?.id]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    // Kiểm tra ràng buộc món chính khi dùng voucher/quà tặng
    const hasFreeGift = (cartItems || []).some((i) => i.isFreeGift);
    const hasPaidItems = (cartItems || []).some((i) => !i.isFreeGift && (i.price || 0) > 0);
    if (hasFreeGift && !hasPaidItems) {
      setMainDishWarning('Quý khách vui lòng chọn thêm ít nhất 01 bát phở chính để áp dụng ưu đãi.');
      return;
    }
    setMainDishWarning(null);

    setIsLoading(true);
    const eligible = await checkOrderEligibility(formData.phone);
    if (!eligible) {
      setIsLoading(false);
      return;
    }

    // Dine-in: Ensure table is assigned and still available in realtime (not locked by Admin)
    if (formData.orderType === 'dine-in') {
      const activeTable = selectedTable;
      const isLocked = activeTable && !(await checkTableStillAvailable(activeTable.id || activeTable.name));
      if (isLocked) {
        setIsLoading(false);
        setSelectedTable(null);
        const rawName = activeTable.name || `Bàn ${activeTable.id}`;
        const tableName = rawName.startsWith('Bàn') ? rawName : `Bàn ${rawName}`;
        const warningMsg = `${tableName} vừa được quán tạm khóa để bảo trì. Quý khách vui lòng chọn lại bàn khác trên sơ đồ hoặc bấm "Chọn Bàn Ngẫu Nhiên"!`;
        setTableLockWarning(warningMsg);
        return;
      }

      if (!activeTable) {
        const freshTable = await fetchAndPickRandomTable(formData.guestCount);
        if (freshTable) {
          setSelectedTable(freshTable);
        } else {
          setIsLoading(false);
          setTableLockWarning('Hiện tại quán đang hết bàn trống phù hợp với số lượng khách. Quý khách vui lòng liên hệ hotline hoặc thử lại sau!');
          return;
        }
      }
    }
    setIsLoading(false);

    const branchPrefix = formData.branch?.startsWith('hcm') ? 'SG' : 'HN';
    const randomSalt = Math.floor(1000 + Math.random() * 9000);
    setBookingCode(`PHO1986-${branchPrefix}-${randomSalt}`);
    setDirection('forward');
    setStep(2);
    scrollToOrderSection();
  }, [formData.branch, formData.phone, formData.orderType, formData.guestCount, selectedTable, checkOrderEligibility, scrollToOrderSection, cartItems, onToast]);

  const handleConfirmOrder = useCallback(async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);
    try {
      const orderAmount = calculatedAmount;
      const targetAddress = formData.orderType === 'dine-in'
        ? (BRANCH_LABELS[formData.branch] || 'Cơ sở Phở Gia Truyền 1986')
        : (formData.address || 'Địa chỉ nhận hàng');

      const freeGiftItem = cartItems.find((i) => i.isFreeGift);
      const appliedGiftId = freeGiftItem?.giftId || freeGiftItem?.voucherCode || null;
      const hasPaid = (cartItems || []).some((i) => !i.isFreeGift && (i.price || 0) > 0);
      if (appliedGiftId && !hasPaid) {
        setIsProcessingPayment(false);
        setPaymentError('Đơn hàng không hợp lệ. Quý khách cần chọn ít nhất 01 món chính để áp dụng ưu đãi.');
        return;
      }

      const orderItems = (cartItems || []).map((i) => ({
        dishId: String(i.id || i.dishId || ''),
        dishName: i.dishName || i.name || 'Món phở gia truyền',
        unitPrice: Number(i.price ?? i.unitPrice ?? 0),
        quantity: Number(i.quantity ?? 1),
        subtotal: Number(i.price ?? i.unitPrice ?? 0) * Number(i.quantity ?? 1),
        customizedOptions: JSON.stringify({ broth: i.broth || null, onion: i.onion || null, herb: i.herb || null, cruller: i.cruller || null })
      }));

      const paymentRes = await paymentApi.createPayment({
        orderCode: bookingCode, paymentMethod: selectedPaymentMethod,
        note: formData.note, customerName: formData.customerName,
        phone: formData.phone, address: targetAddress, amount: orderAmount,
        tableNumber: (formData.orderType === 'dine-in' && selectedTable) ? (selectedTable.name || selectedTable.id) : null,
        appliedGiftId, items: orderItems
      });
      setPaymentData(paymentRes);

      if (appliedGiftId) {
        loyaltyApi.applyGift(appliedGiftId, bookingCode).catch(() => {});
        try {
          window.dispatchEvent(new CustomEvent('pho1986:gift-vault-updated', { detail: { giftId: appliedGiftId, orderCode: bookingCode } }));
        } catch {}
      }

      saveOrderSession(bookingCode, {
        bookingCode, formData, selectedPaymentMethod, paymentData: paymentRes,
        amount: orderAmount, selectedTable, createdAt: Date.now()
      });
      saveCustomerHistoryOrder({
        bookingCode, formData, selectedPaymentMethod, orderAmount,
        selectedTable, targetAddress, cartItems
      });

      if (onClearCart) onClearCart();
      loyaltyApi.getLoyaltySummary().then((s) => s?.account && window.dispatchEvent(new CustomEvent('pho1986:loyalty-updated', { detail: s.account }))).catch(() => {});

      // SePay: Chuyển sang Bước 3 hiển thị mã QR VietQR Napas 247 (Tự động khớp đơn qua SePay Webhook)
      // Tránh form POST tự động sang pay.sepay.vn gây redirect loop 302 hoặc tự reset trang
      if (selectedPaymentMethod === 'MOMO' && paymentRes?.payUrl) {
        setDirection('forward'); setStep(3); scrollToOrderSection();
        try { window.open(paymentRes.payUrl, '_blank'); } catch {}
        return;
      }

      setDirection('forward'); setStep(3); scrollToOrderSection();
    } catch (err) {
      console.warn('[OrderSection] Payment API creation error:', err);
      if (err.isLocked || err.status === 423) {
        setIsOrderLocked(true);
        setLockoutReason(err.message || 'Số điện thoại này hiện đang bị tạm khóa dịch vụ.');
      } else if (err.status === 400 && err.message && (err.message.includes('bảo trì') || err.message.includes('tạm khóa') || err.message.includes('khóa') || err.message.includes('chọn bàn khác'))) {
        // Chốt chặn bàn bị khóa: Không cho trôi sang Step 3! Quay về Step 1 & cảnh báo đỏ
        setSelectedTable(null);
        setTableLockWarning(err.message);
        setDirection('backward');
        setStep(1);
        scrollToOrderSection('card');
      } else {
        setPaymentError(err.message || 'Không thể khởi tạo phiên thanh toán lúc này. Quý khách vui lòng thử lại hoặc chọn hình thức "Thanh toán sau tại quán".');
      }
    } finally {
      setIsProcessingPayment(false);
    }
  }, [calculatedAmount, formData, bookingCode, selectedPaymentMethod, selectedTable, cartItems, onClearCart, scrollToOrderSection, setIsOrderLocked, setLockoutReason]);

  const handleBackToStep1 = useCallback(() => { setDirection('backward'); setStep(1); scrollToOrderSection(); }, [scrollToOrderSection]);
  const handleBackToStep2 = useCallback(() => { setDirection('backward'); setStep(2); scrollToOrderSection(); }, [scrollToOrderSection]);

  const handleCopyCode = useCallback((text) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setIsCopied(false), 2000);
    }
  }, []);

  const handleReset = useCallback(() => {
    setDirection('backward'); setStep(1); scrollToOrderSection();
    setPaymentData(null); setIsVietQrConfirmed(false); setPaymentNotice(null);
    setPaymentError(null); setSelectedTable(null); setTableLockWarning(null); setIsSeatMapOpen(false);
    setMainDishWarning(null); setIsOrderLocked(false); setLockoutReason('');
    try { sessionStorage.removeItem(SESSION_LATEST_KEY); } catch (e) {}
    setFormData({ ...INITIAL_FORM_DATA, customerName: user?.fullName || '', phone: user?.phone || '' });
    setSelectedPaymentMethod('POST_PAID_AT_STORE'); setIsMoreMethodsOpen(false);
  }, [user?.fullName, user?.phone, scrollToOrderSection, setIsOrderLocked, setLockoutReason]);

  return {
    formData, step, direction, selectedPaymentMethod, setSelectedPaymentMethod,
    isMoreMethodsOpen, setIsMoreMethodsOpen, paymentData, bookingCode, isCopied,
    isProcessingPayment, isVietQrConfirmed, setIsVietQrConfirmed, isLoading,
    paymentNotice, paymentError, selectedTable, tableLockWarning, setTableLockWarning,
    mainDishWarning, setMainDishWarning, isSeatMapOpen, setIsSeatMapOpen, todayDateStr, calculatedAmount, selectedTasteSet,
    isOrderLocked, lockoutReason, handleResetLockout, handleInputChange,
    handleSetOrderType, handleSetGuestCount, handleToggleTaste, scrollToOrderSection,
    handleCloseSeatMap, handleConfirmTable, handleSelectRandomTable, handleSubmit,
    handleConfirmOrder, handleBackToStep1, handleBackToStep2, handleCopyCode, handleReset,
    handleVerifyPayment
  };
}

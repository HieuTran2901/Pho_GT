import { useState, useEffect, useCallback, useRef } from 'react';
import { auth, formatVietnamPhoneE164, createRecaptchaVerifier, resetRecaptchaVerifier, signInWithPhoneNumber } from '../../config/firebase';

export function useAuthModalForm({
  authModalOpen,
  authTab,
  setAuthTab,
  login,
  register,
  onToast,
  handleClose
}) {
  // Form states
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveTasteProfile, setSaveTasteProfile] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [isPermanentLocked, setIsPermanentLocked] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const maxLockoutRef = useRef(60);

  // Phone OTP states for registration
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const phoneInputRef = useRef(null);

  // Clear sensitive form state when modal closes
  useEffect(() => {
    if (!authModalOpen) {
      setPassword('');
      setErrorMessage('');
    }
  }, [authModalOpen]);

  // Countdown timer khi bị tạm khóa đăng nhập (Rate Limit / Brute-force lockout)
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setErrorMessage('');
          setCurrentRound((r) => Math.min(5, r + 1));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Đếm ngược cooldown 60s gửi mã OTP
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setTimeout(() => setOtpCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  const handleTabChange = useCallback((tab) => {
    setAuthTab(tab);
    setErrorMessage('');
    setPassword('');
    setIsPermanentLocked(false);
    setOtpSent(false);
    setOtpCode('');
    setOtpCooldown(0);
    setConfirmationResult(null);
  }, [setAuthTab]);

  // Gửi mã OTP qua Firebase khi đăng ký
  const handleSendOtp = useCallback(async () => {
    const cleanPhone = phone.replace(/[\s.-]+/g, '');
    const vnPhoneRegex = /^(0[35789])[0-9]{8}$/;
    if (!vnPhoneRegex.test(cleanPhone)) {
      setErrorMessage('Số điện thoại không hợp lệ (cần 10 chữ số, bắt đầu 03, 05, 07, 08, 09)');
      return;
    }
    setErrorMessage('');
    setIsOtpSending(true);
    try {
      const phoneE164 = formatVietnamPhoneE164(cleanPhone);
      const appVerifier = await createRecaptchaVerifier('recaptcha-container');
      const confirmation = await signInWithPhoneNumber(auth, phoneE164, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setOtpCooldown(60);
      if (onToast) onToast(`Đã gửi mã xác thực tới số ${cleanPhone}.`);
    } catch (err) {
      console.error('[FIREBASE_OTP]', err);
      resetRecaptchaVerifier();
      if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Đã gửi mã quá nhiều lần từ thiết bị này. Vui lòng thử lại sau.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMessage('Vùng gửi SMS (+84) đang được kích hoạt. Bác vui lòng thử lại sau ít phút.');
      } else {
        setErrorMessage(err.message || 'Không thể gửi mã OTP. Bác vui lòng thử lại.');
      }
    } finally {
      setIsOtpSending(false);
    }
  }, [phone, onToast]);

  // Cơ chế 1-click đổi số điện thoại & reset trạng thái khóa form
  const handleChangePhone = useCallback(() => {
    setIsPermanentLocked(false);
    setErrorMessage('');
    setPhone('');
    setPassword('');
    setOtpSent(false);
    setOtpCode('');
    setOtpCooldown(0);
    setConfirmationResult(null);
    setTimeout(() => { if (phoneInputRef.current) phoneInputRef.current.focus(); }, 50);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;
    if (isPermanentLocked) {
      handleChangePhone();
      return;
    }
    setErrorMessage('');

    // Sanitize phone number (strip whitespace, dashes, dots)
    const cleanPhone = phone.replace(/[\s.-]+/g, '');

    if (!cleanPhone) {
      setErrorMessage('Vui lòng nhập số điện thoại');
      return;
    }

    // Validate Vietnamese mobile number (10 digits starting with 03, 05, 07, 08, 09)
    const vnPhoneRegex = /^(0[35789])[0-9]{8}$/;
    if (!vnPhoneRegex.test(cleanPhone)) {
      setErrorMessage('Số điện thoại không hợp lệ (cần 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09)');
      return;
    }
    if (!password.trim()) { setErrorMessage('Vui lòng nhập mật khẩu'); return; }
    if (password.trim().length < 6) { setErrorMessage('Mật khẩu phải có tối thiểu 6 ký tự'); return; }
    if (authTab === 'register') {
      if (!fullName.trim()) { setErrorMessage('Vui lòng nhập họ và tên của bạn'); return; }
      if (otpSent && confirmationResult) {
        if (!otpCode || otpCode.length < 6) { setErrorMessage('Vui lòng nhập đủ 6 số mã xác thực OTP'); return; }
        try {
          await confirmationResult.confirm(otpCode);
        } catch (otpErr) {
          setErrorMessage('Mã OTP không chính xác hoặc đã hết hiệu lực.');
          return;
        }
      }
    }

    setIsLoading(true);
    try {
      if (authTab === 'login') {
        const user = await login(cleanPhone, password);
        if (onToast) onToast({ type: 'member_welcome', user, points: user?.loyaltyAccount?.availablePoints ?? 50 });
      } else {
        const user = await register(cleanPhone, fullName.trim(), password, null, saveTasteProfile);
        if (onToast) onToast({ type: 'member_welcome', user, isNew: true, points: 50 });
      }
      setPassword('');
      setLockoutSeconds(0);
      setIsPermanentLocked(false);
      setOtpSent(false);
      setOtpCode('');
      setOtpCooldown(0);
      setConfirmationResult(null);
    } catch (err) {
      if (err.isPermanent || err.status === 423) {
        setIsPermanentLocked(true);
        setLockoutSeconds(0);
      }
      const activeRound = err.round || err.data?.data?.round;
      if (activeRound) setCurrentRound(Number(activeRound));
      const waitSec = err.retryAfterSeconds || err.data?.data?.retryAfterSeconds;
      if (waitSec && Number(waitSec) > 0) {
        maxLockoutRef.current = Math.max(Number(waitSec), 60);
        setLockoutSeconds(Number(waitSec));
      } else if (err.message && err.message.includes('thử lại sau')) {
        const match = err.message.match(/(\d+)\s*giây/);
        if (match && match[1]) {
          maxLockoutRef.current = Math.max(parseInt(match[1], 10), 60);
          setLockoutSeconds(parseInt(match[1], 10));
        }
      }
      setErrorMessage(err.message || 'Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  }, [phone, password, fullName, authTab, saveTasteProfile, login, register, onToast, lockoutSeconds, isPermanentLocked, handleChangePhone, otpSent, confirmationResult, otpCode]);

  // Demo fill quick login
  const handleQuickDemo = useCallback((type) => {
    if (type === 'member') {
      setPhone('0988888888');
      setPassword('123456');
      handleTabChange('login');
    } else {
      setPhone('0912345678');
      setFullName('Bác Hai Phố Cổ');
      setPassword('123456');
      handleTabChange('register');
    }
  }, [handleTabChange]);

  const handleForgotPassword = useCallback(() => {
    if (onToast) onToast('Quán đã nhận yêu cầu. Đang kích hoạt lấy lại mật khẩu qua SMS OTP cho số ' + (phone || 'của bác') + '.');
  }, [onToast, phone]);

  const handleGuestOrder = useCallback(() => {
    if (handleClose) handleClose();
    const el = document.getElementById('order-form-card') || document.getElementById('order');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, [handleClose]);

  return {
    phone,
    setPhone,
    fullName,
    setFullName,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    saveTasteProfile,
    setSaveTasteProfile,
    isLoading,
    errorMessage,
    setErrorMessage,
    lockoutSeconds,
    setLockoutSeconds,
    isPermanentLocked,
    setIsPermanentLocked,
    currentRound,
    otpCode,
    setOtpCode,
    otpSent,
    isOtpSending,
    otpCooldown,
    phoneInputRef,
    handleTabChange,
    handleSendOtp,
    handleChangePhone,
    handleSubmit,
    handleQuickDemo,
    handleForgotPassword,
    handleGuestOrder
  };
}

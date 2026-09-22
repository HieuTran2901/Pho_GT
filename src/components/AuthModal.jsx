import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { X, User, Lock, Eye, EyeOff, Sparkles, ShieldCheck, ArrowRight, Heart, Clock, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLockoutBanner from './auth/AuthLockoutBanner';
import AuthModalHeader from './auth/AuthModalHeader';
import AuthPhoneOtpField from './auth/AuthPhoneOtpField';
import AuthTasteLoyaltyBox from './auth/AuthTasteLoyaltyBox';
import { auth, formatVietnamPhoneE164, createRecaptchaVerifier, resetRecaptchaVerifier, signInWithPhoneNumber } from '../config/firebase';

function AuthModal({ onToast }) {
  const { authModalOpen, closeAuthModal, authTab, setAuthTab, login, register } = useAuth();
  
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
  const [mounted, setMounted] = useState(authModalOpen);
  const [isClosing, setIsClosing] = useState(false);
  const maxLockoutRef = useRef(60);
  const closeTimerRef = useRef(null);
  const isFirstRender = useRef(true);

  // Phone OTP states for registration
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState(null);

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
      if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
      setMounted(true); setIsClosing(false); setErrorMessage('');
    } else {
      setIsClosing(true);
      closeTimerRef.current = setTimeout(() => {
        setMounted(false); setIsClosing(false); closeTimerRef.current = null; setPassword('');
      }, 280);
    }
    return () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); };
  }, [authModalOpen]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    closeAuthModal();
  }, [isClosing, closeAuthModal]);

  // Handle ESC key listener & body scroll lock
  useEffect(() => {
    if (!mounted) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape' && !isClosing) handleClose(); };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mounted, isClosing, handleClose]);

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

  const phoneInputRef = useRef(null);

  const handleTabChange = useCallback((tab) => {
    setAuthTab(tab); setErrorMessage(''); setPassword(''); setIsPermanentLocked(false);
    setOtpSent(false); setOtpCode(''); setOtpCooldown(0); setConfirmationResult(null);
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
    setIsPermanentLocked(false); setErrorMessage(''); setPhone(''); setPassword('');
    setOtpSent(false); setOtpCode(''); setOtpCooldown(0); setConfirmationResult(null);
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
      setPassword(''); setLockoutSeconds(0); setIsPermanentLocked(false);
      setOtpSent(false); setOtpCode(''); setOtpCooldown(0); setConfirmationResult(null);
    } catch (err) {
      if (err.isPermanent || err.status === 423) {
        setIsPermanentLocked(true); setLockoutSeconds(0);
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
      setPhone('0988888888'); setPassword('123456'); handleTabChange('login');
    } else {
      setPhone('0912345678'); setFullName('Bác Hai Phố Cổ'); setPassword('123456'); handleTabChange('register');
    }
  }, [handleTabChange]);

  if (!mounted) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto ${
        isClosing ? 'pointer-events-none' : ''
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* 1. Backdrop với hiệu ứng sương mờ cổ kính */}
      <div 
        className={`fixed inset-0 bg-black/65 backdrop-blur-sm ${
          isClosing ? 'animate-backdrop-fade-out' : 'animate-backdrop-fade-in'
        }`}
        onClick={handleClose}
      />

      {/* 2. Main Modal Card (Parchment Texture & Vintage Seal) */}
      <div className={`relative w-full max-w-[490px] max-h-[92vh] flex flex-col bg-[#fbf9f4] border-2 border-[#8a1e14] rounded-2xl shadow-2xl overflow-hidden z-10 my-auto transform-gpu will-change-transform ${
        isClosing ? 'animate-modal-steam-dissipate' : 'animate-modal-steam-unveil'
      }`}>
        
        {/* Đường chỉ vàng hoàng gia & vân góc truyền thống với hiệu ứng ánh kim */}
        <div className="absolute inset-1.5 border border-[#d4af37]/60 rounded-xl pointer-events-none z-20 animate-golden-shimmer" />

        {/* Nút Đóng (X) Phong Cách Đồng Vintage */}
        <button
          onClick={handleClose}
          disabled={isClosing}
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-[#f4ebd9] hover:bg-[#8a1e14] text-[#8a1e14] hover:text-white border border-[#8a1e14]/30 flex items-center justify-center transition-all duration-200 shadow-sm group"
          aria-label="Đóng cửa sổ"
        >
          <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
        </button>

        {/* Header: Dấu Mộc & Tiêu Đề Cổ Kính */}
        <AuthModalHeader />

        {/* Tabs Điều Hướng: Đăng Nhập / Đăng Ký */}
        <div className="px-6 pt-4 pb-2 shrink-0">
          <div className="flex rounded-xl bg-[#ede3cf] p-1 border border-[#d6c7ac]">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-serif font-bold rounded-lg transition-all ${authTab === 'login' ? 'bg-white text-[#8a1e14] shadow-xs border border-[#cbb898]' : 'text-[#6b584c] hover:text-[#2b1810]'}`}
            >
              ĐĂNG NHẬP (KHÁCH QUEN)
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('register')}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-serif font-bold rounded-lg transition-all relative flex items-center justify-center gap-1.5 ${authTab === 'register' ? 'bg-white text-[#8a1e14] shadow-xs border border-[#cbb898]' : 'text-[#6b584c] hover:text-[#2b1810]'}`}
            >
              <span>ĐĂNG KÝ MỚI</span>
              <span className="bg-gradient-to-r from-amber-500 to-red-600 text-white text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-full shadow-xs animate-pulse">+50Đ</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-2 overflow-y-auto flex-1">
          {/* Invisible reCAPTCHA Anchor */}
          <div id="recaptcha-container" />

          {/* Multi-Tier Lockout & Cooldown Banner */}
          {(isPermanentLocked || lockoutSeconds > 0) ? (
            <AuthLockoutBanner
              isPermanent={isPermanentLocked}
              lockoutSeconds={lockoutSeconds}
              currentRound={currentRound}
              maxRounds={5}
              errorMessage={errorMessage}
              onChangePhone={handleChangePhone}
              onForgotPassword={() => {
                if (onToast) onToast('Quán đã nhận yêu cầu. Đang kích hoạt lấy lại mật khẩu qua SMS OTP cho số ' + (phone || 'của bác') + '.');
              }}
              onGuestOrder={() => {
                handleClose();
                const el = document.getElementById('order-form-card') || document.getElementById('order');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          ) : errorMessage ? (
            <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-shake">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : null}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Trường Họ và tên (Chỉ hiện khi Đăng Ký) */}
            {authTab === 'register' && (
              <div>
                <label htmlFor="auth-fullname" className="block text-xs font-serif font-bold text-[#3a251b] mb-1">
                  Họ và Tên của bạn <span className="text-[#8a1e14]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn Hiếu"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-[#d6c7ac] text-[#2b1810] text-sm placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#8a1e14] focus:border-[#8a1e14] transition-all shadow-xs"
                    required={authTab === 'register'}
                  />
                </div>
              </div>
            )}

            {/* Trường Số điện thoại & Nút Gửi mã OTP bên cạnh khi đăng ký */}
            <AuthPhoneOtpField
              phone={phone}
              setPhone={setPhone}
              phoneInputRef={phoneInputRef}
              lockoutSeconds={lockoutSeconds}
              isPermanentLocked={isPermanentLocked}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              setIsPermanentLocked={setIsPermanentLocked}
              handleChangePhone={handleChangePhone}
              authTab={authTab}
              isOtpSending={isOtpSending}
              otpCooldown={otpCooldown}
              otpSent={otpSent}
              handleSendOtp={handleSendOtp}
              otpCode={otpCode}
              setOtpCode={setOtpCode}
              isLoading={isLoading}
            />

            {/* Trường Mật khẩu */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="auth-password" className="text-xs font-serif font-bold text-[#3a251b]">
                  Mật Khẩu <span className="text-[#8a1e14]">*</span>
                </label>
                {authTab === 'login' && (
                  <button 
                    type="button"
                    onClick={() => {
                      if (onToast) onToast('Tính năng khôi phục mật khẩu qua SMS OTP đang được kích hoạt.');
                    }}
                    className="text-[11px] text-[#8a1e14] hover:underline font-serif"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  disabled={lockoutSeconds > 0}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (isPermanentLocked || errorMessage) {
                      setIsPermanentLocked(false);
                      setErrorMessage('');
                    }
                  }}
                  placeholder={authTab === 'register' ? 'Tối thiểu 6 ký tự' : 'Nhập mật khẩu của bạn'}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#d6c7ac] text-[#2b1810] text-sm placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#8a1e14] focus:border-[#8a1e14] transition-all shadow-xs disabled:opacity-60 disabled:bg-stone-100 disabled:cursor-not-allowed"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-500 hover:text-[#8a1e14]"
                  tabIndex="-1"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Lợi quyền hội viên: Box Tem Phiếu Khách Quen */}
            {authTab === 'register' && (
              <AuthTasteLoyaltyBox
                saveTasteProfile={saveTasteProfile}
                setSaveTasteProfile={setSaveTasteProfile}
              />
            )}

            {/* Nút Submit Chính */}
            {isPermanentLocked ? (
              <button
                type="button"
                onClick={handleChangePhone}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-red-700 hover:brightness-110 active:scale-[0.99] text-amber-100 font-serif font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 border border-amber-400/40 cursor-pointer mt-3"
              >
                <RotateCcw className="w-4 h-4 text-amber-200" />
                <span>SỐ NÀY ĐÃ BỊ KHÓA • BẤM ĐỂ ĐỔI SỐ KHÁC</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || lockoutSeconds > 0}
                className="w-full py-3 px-4 rounded-xl bg-[#8a1e14] hover:bg-[#731910] active:scale-[0.99] text-amber-100 font-serif font-bold text-sm tracking-wider uppercase transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 border border-amber-400/30 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer mt-3"
              >
                {lockoutSeconds > 0 ? (
                  <><Clock className="w-4 h-4 animate-pulse text-amber-300" /><span>TẠM KHÓA THỬ LẠI ({lockoutSeconds}S)</span></>
                ) : isLoading ? (
                  <><div className="w-4 h-4 border-2 border-amber-200 border-t-transparent rounded-full animate-spin" /><span>Đang xử lý...</span></>
                ) : (
                  <><span>{authTab === 'login' ? 'ĐĂNG NHẬP VÀO QUÁN' : 'GIA NHẬP BÁT PHỞ TRI KỶ'}</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            )}
          </form>

          {/* Quick Demo Test Buttons */}
          <div className="mt-4 pt-3 border-t border-[#e8ddc9]">
            <div className="text-[10px] text-stone-500 font-serif uppercase tracking-widest text-center mb-2">Hoặc trải nghiệm nhanh:</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('member')}
                className="flex-1 py-1.5 px-2 rounded-lg bg-[#f4ebd9] hover:bg-[#ede0c8] text-[#8a1e14] text-[11px] font-serif font-semibold border border-[#d6c7ac] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Khách Quen Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('new')}
                className="flex-1 py-1.5 px-2 rounded-lg bg-[#f4ebd9] hover:bg-[#ede0c8] text-[#2b1810] text-[11px] font-serif font-semibold border border-[#d6c7ac] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Heart className="w-3 h-3 text-red-500" />
                <span>Khách Mới Demo</span>
              </button>
            </div>
          </div>

          <div className="mt-3 text-center flex items-center justify-center gap-1.5 text-[10px] text-stone-500">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
            <span>Thông tin được bảo mật tuyệt đối theo chuẩn Phở Gia Truyền 1986</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(AuthModal);

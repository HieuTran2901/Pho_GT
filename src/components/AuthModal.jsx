import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, User, Phone, Lock, Eye, EyeOff, Sparkles, Gift, 
  CheckCircle2, Utensils, ShieldCheck, ArrowRight, Heart, Clock, ShieldAlert 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  const maxLockoutRef = useRef(60);
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

  // [RAVEN & BLADE] Countdown timer khi bị tạm khóa đăng nhập (Rate Limit / Brute-force lockout)
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) { clearInterval(interval); setErrorMessage(''); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;
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
    if (authTab === 'register' && !fullName.trim()) { setErrorMessage('Vui lòng nhập họ và tên của bạn'); return; }

    setIsLoading(true);
    try {
      if (authTab === 'login') {
        const user = await login(cleanPhone, password);
        if (onToast) onToast({ type: 'member_welcome', user, points: user?.loyaltyAccount?.availablePoints ?? 50 });
      } else {
        const user = await register(cleanPhone, fullName.trim(), password, null, saveTasteProfile);
        if (onToast) onToast({ type: 'member_welcome', user, isNew: true, points: 50 });
      }
      // Reset sensitive password after successful login/registration
      setPassword('');
      setLockoutSeconds(0);
    } catch (err) {
      const waitSec = err.retryAfterSeconds || err.data?.data?.retryAfterSeconds;
      if (waitSec && Number(waitSec) > 0) {
        maxLockoutRef.current = Math.max(Number(waitSec), 60);
        setLockoutSeconds(Number(waitSec));
      } else if (err.message && err.message.includes('thử lại sau')) {
        const match = err.message.match(/(\d+)\s*giây/);
        if (match && match[1]) {
          const sec = parseInt(match[1], 10);
          maxLockoutRef.current = Math.max(sec, 60);
          setLockoutSeconds(sec);
        }
      }
      setErrorMessage(err.message || 'Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  }, [phone, password, fullName, authTab, saveTasteProfile, login, register, onToast, lockoutSeconds]);

  // Demo fill quick login
  const handleQuickDemo = useCallback((type) => {
    if (type === 'member') {
      setPhone('0988888888'); setPassword('123456'); setAuthTab('login');
    } else {
      setPhone('0912345678'); setFullName('Bác Hai Phố Cổ'); setPassword('123456'); setAuthTab('register');
    }
  }, [setAuthTab]);

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
        <div className="absolute inset-1.5 border border-[#d4af37]/60 rounded-xl pointer-events-none z-20 animate-golden-shimmer"></div>

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
        <div className="bg-gradient-to-b from-[#f2e7d5] via-[#f7f0e3] to-[#fbf9f4] pt-7 pb-4 px-6 text-center border-b border-[#e2d5be] relative overflow-hidden shrink-0">
          
          {/* Làn khói phở bốc hơi thanh thoát từ dấu mộc (Phương án 1: Làn Khói Phở) */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none flex justify-center w-24 h-10 overflow-visible z-10">
            <span className="w-1.5 h-6 bg-gradient-to-t from-[#8a1e14]/20 via-[#d4af37]/25 to-transparent rounded-full blur-[1px] animate-seal-steam-1 inline-block mr-1.5"></span>
            <span className="w-2 h-7 bg-gradient-to-t from-[#8a1e14]/25 via-[#f59e0b]/20 to-transparent rounded-full blur-[1px] animate-seal-steam-2 inline-block ml-1.5"></span>
          </div>

          {/* Con dấu mộc đỏ tròn "1986" đóng dứt khoát (Phương án 2: Dấu Mộc Son Đỏ 1986) */}
          <div className="mx-auto w-14 h-14 rounded-full border-2 border-[#8a1e14] p-0.5 flex items-center justify-center bg-white shadow-md mb-2.5 animate-seal-stamp origin-center relative z-20">
            <div className="w-full h-full rounded-full border border-dashed border-[#8a1e14] flex flex-col items-center justify-center text-[#8a1e14]">
              <span className="text-[7px] font-bold uppercase tracking-tighter">TRI KỶ</span>
              <Utensils className="w-4 h-4 text-[#8a1e14] my-0.5" />
              <span className="text-[8px] font-serif font-bold">1986</span>
            </div>
          </div>

          <h2 id="auth-modal-title" className="font-serif text-2xl sm:text-3xl font-bold text-[#2b1810] tracking-tight relative z-20">
            PHỞ GIA TRUYỀN 1986
          </h2>
          <p className="text-xs text-[#8a1e14] font-serif font-medium tracking-wide uppercase mt-1 flex items-center justify-center gap-2">
            <span className="w-6 h-px bg-[#8a1e14]/40"></span>
            <span>Bát Phở Tri Kỷ • Khẩu Vị Thân Quen</span>
            <span className="w-6 h-px bg-[#8a1e14]/40"></span>
          </p>
        </div>

        {/* Tabs Điều Hướng: Đăng Nhập / Đăng Ký */}
        <div className="px-6 pt-4 pb-2 shrink-0">
          <div className="flex rounded-xl bg-[#ede3cf] p-1 border border-[#d6c7ac]">
            <button
              type="button"
              onClick={() => { setAuthTab('login'); setErrorMessage(''); setPassword(''); }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-serif font-bold rounded-lg transition-all ${
                authTab === 'login'
                  ? 'bg-white text-[#8a1e14] shadow-sm border border-[#cbb898]'
                  : 'text-[#6b584c] hover:text-[#2b1810]'
              }`}
            >
              ĐĂNG NHẬP (KHÁCH QUEN)
            </button>

            <button
              type="button"
              onClick={() => { setAuthTab('register'); setErrorMessage(''); setPassword(''); }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-serif font-bold rounded-lg transition-all relative flex items-center justify-center gap-1.5 ${
                authTab === 'register'
                  ? 'bg-white text-[#8a1e14] shadow-sm border border-[#cbb898]'
                  : 'text-[#6b584c] hover:text-[#2b1810]'
              }`}
            >
              <span>ĐĂNG KÝ MỚI</span>
              {/* Badge +50 điểm Tri kỷ */}
              <span className="bg-gradient-to-r from-amber-500 to-red-600 text-white text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-full shadow-xs animate-pulse">
                +50Đ
              </span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-2 overflow-y-auto flex-1">
          
          {/* Retro Heritage Lockout Banner khi bị tạm khóa nhập sai quá 5 lần */}
          {lockoutSeconds > 0 ? (
            <div className="mb-4 p-3.5 rounded-xl bg-[#fff8ed] border-2 border-[#ea580c] shadow-sm relative overflow-hidden animate-shake">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#8a1e14]/10 border border-[#8a1e14]/20 flex items-center justify-center shrink-0 mt-0.5 text-[#8a1e14]">
                  <ShieldAlert className="w-5 h-5 animate-pulse text-[#ea580c]" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-[#8a1e14] text-sm uppercase tracking-wide">
                      Tạm Khóa Thử Lại
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#8a1e14] text-amber-100 font-mono font-bold text-xs shadow-xs">
                      <Clock className="w-3 h-3 animate-spin" />
                      00:{String(lockoutSeconds).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-[#6b4a38] font-sans mt-1 leading-relaxed">
                    Quý khách đã nhập sai mật khẩu quá 5 lần. Để bảo vệ an toàn cho tài khoản, hệ thống tạm dừng nhận thử lại trong <strong>{lockoutSeconds} giây</strong>.
                  </p>

                  {/* Cải tiến 2: Dải Progress Bar đếm lùi thời gian thực */}
                  <div className="mt-2 h-1.5 w-full bg-[#ea580c]/15 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-[#ea580c] transition-all duration-1000 ease-linear rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, (lockoutSeconds / (maxLockoutRef.current || 60)) * 100))}%` }}
                    />
                  </div>

                  {/* Cải tiến 1: 1-Click Action Button Đặt bàn ngay không cần đăng nhập */}
                  <div className="mt-2.5 pt-2 border-t border-[#ea580c]/20 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#8a1e14] font-medium flex items-center gap-1">
                      <Utensils className="w-3.5 h-3.5 shrink-0" />
                      <span>Đặt bàn vãng lai ngay:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        const el = document.getElementById('order-form-card') || document.getElementById('order');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8a1e14] hover:bg-[#731910] text-amber-100 text-[10.5px] font-serif font-bold uppercase tracking-wider transition-all shadow-xs hover:shadow active:scale-95 group cursor-pointer"
                    >
                      <span>Đặt bàn ngay</span>
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : errorMessage ? (
            <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-shake">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
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

            {/* Trường Số điện thoại */}
            <div>
              <label htmlFor="auth-phone" className="block text-xs font-serif font-bold text-[#3a251b] mb-1">
                Số Điện Thoại <span className="text-[#8a1e14]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="auth-phone"
                  type="tel"
                  disabled={lockoutSeconds > 0}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0988 888 888"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-[#d6c7ac] text-[#2b1810] text-sm placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#8a1e14] focus:border-[#8a1e14] transition-all shadow-xs disabled:opacity-60 disabled:bg-stone-100 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

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
                  onChange={(e) => setPassword(e.target.value)}
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
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/70 border border-dashed border-amber-400/80 my-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/15 text-[#8a1e14] flex items-center justify-center shrink-0 mt-0.5">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] text-[#4a3528] leading-snug">
                    <div className="font-serif font-bold text-[#8a1e14] text-xs">
                      Đặc quyền Bát Phở Tri Kỷ 1986
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-stone-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Tặng ngay <strong>50 điểm Tri Kỷ</strong> để đổi quẩy giòn</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-stone-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>1-Click <strong>"Gọi lại bát quen"</strong> chuẩn vị ruột</span>
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-2 mt-2 pt-2 border-t border-amber-300/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveTasteProfile}
                    onChange={(e) => setSaveTasteProfile(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#8a1e14] rounded"
                  />
                  <span className="text-[11px] text-stone-700 font-medium">
                    Tự động ghi nhớ Gu Ăn Phở của tôi cho lần gọi sau
                  </span>
                </label>
              </div>
            )}

            {/* Nút Submit Chính */}
            <button
              type="submit"
              disabled={isLoading || lockoutSeconds > 0}
              className="w-full py-3 px-4 rounded-xl bg-[#8a1e14] hover:bg-[#731910] active:scale-[0.99] text-amber-100 font-serif font-bold text-sm tracking-wider uppercase transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 border border-amber-400/30 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer mt-3"
            >
              {lockoutSeconds > 0 ? (
                <>
                  <Clock className="w-4 h-4 animate-pulse text-amber-300" />
                  <span>TẠM KHÓA THỬ LẠI ({lockoutSeconds}S)</span>
                </>
              ) : isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-amber-200 border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span>{authTab === 'login' ? 'ĐĂNG NHẬP VÀO QUÁN' : 'GIA NHẬP BÁT PHỞ TRI KỶ'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Test Buttons */}
          <div className="mt-4 pt-3 border-t border-[#e8ddc9]">
            <div className="text-[10px] text-stone-500 font-serif uppercase tracking-widest text-center mb-2">
              Hoặc trải nghiệm nhanh:
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('member')}
                className="flex-1 py-1.5 px-2 rounded-lg bg-[#f4ebd9] hover:bg-[#ede0c8] text-[#8a1e14] text-[11px] font-serif font-semibold border border-[#d6c7ac] transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Khách Quen Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('new')}
                className="flex-1 py-1.5 px-2 rounded-lg bg-[#f4ebd9] hover:bg-[#ede0c8] text-[#2b1810] text-[11px] font-serif font-semibold border border-[#d6c7ac] transition-colors flex items-center justify-center gap-1.5"
              >
                <Heart className="w-3 h-3 text-red-500" />
                <span>Khách Mới Demo</span>
              </button>
            </div>
          </div>

          {/* Cam kết thương hiệu bảo mật */}
          <div className="mt-3 text-center flex items-center justify-center gap-1.5 text-[10px] text-stone-500">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
            <span>Thông tin được bảo mật tuyệt đối theo chuẩn Phở Gia Truyền 1986</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default React.memo(AuthModal);

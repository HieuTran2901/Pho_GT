import React, { useState, useEffect, useRef } from 'react';
import { Phone, ArrowRight, RotateCcw, Sparkles, CheckCircle2, ShieldCheck, User } from 'lucide-react';
import { auth, formatVietnamPhoneE164, createRecaptchaVerifier, signInWithPhoneNumber } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import PhoneOtpInput from './PhoneOtpInput';

export default function AuthPhoneOtpPanel({ onToast, onSuccess }) {
  const { loginWithFirebasePhone } = useAuth();

  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [step, setStep] = useState('ENTER_PHONE'); // 'ENTER_PHONE' | 'ENTER_OTP'
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const timerRef = useRef(null);

  // Bộ đếm ngược 60 giây chống bấm gửi lại liên tục
  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cooldown]);

  // Gửi mã OTP qua Firebase Phone Auth
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const rawDigits = phone.replace(/\D/g, '');
    if (rawDigits.length < 9 || rawDigits.length > 11) {
      setErrorMessage('Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 số (VD: 0988 888 888).');
      return;
    }

    setIsLoading(true);
    try {
      const phoneE164 = formatVietnamPhoneE164(phone);
      const appVerifier = createRecaptchaVerifier('recaptcha-container', () => {
        // Callback khi reCAPTCHA verify thành công
      });

      const confirmation = await signInWithPhoneNumber(auth, phoneE164, appVerifier);
      setConfirmationResult(confirmation);
      setStep('ENTER_OTP');
      setCooldown(60);
      if (onToast) {
        onToast(`Mã xác thực OTP đã được gửi đến số ${phone}. Bác kiểm tra tin nhắn nhé!`);
      }
    } catch (err) {
      console.error('[FIREBASE_PHONE_OTP] Lỗi gửi mã:', err);
      if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Bác đã yêu cầu gửi mã quá nhiều lần từ thiết bị này. Vui lòng thử lại sau ít phút.');
      } else if (err.code === 'auth/invalid-phone-number') {
        setErrorMessage('Số điện thoại không đúng định dạng quốc tế. Bác vui lòng kiểm tra lại.');
      } else if (err.code === 'auth/captcha-check-failed') {
        setErrorMessage('Xác thực bảo mật chống bot chưa hoàn tất. Bác vui lòng thử bấm lại nhé.');
      } else {
        setErrorMessage(err.message || 'Chưa thể gửi mã OTP lúc này. Bác vui lòng thử lại sau nhé!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Xác nhận mã OTP và đăng nhập vào Backend Spring Boot
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số mã OTP.');
      return;
    }

    if (!confirmationResult) {
      setErrorMessage('Phiên xác thực đã hết hạn. Vui lòng yêu cầu gửi lại mã.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // 1. Xác thực OTP với Firebase
      const userCredential = await confirmationResult.confirm(otpCode);
      const idToken = await userCredential.user.getIdToken();

      // 2. Gửi ID Token xuống Spring Boot backend để nhận JWT Cookie
      const response = await loginWithFirebasePhone(idToken, fullName.trim() || null);

      if (onToast) {
        const bonusMsg = response?.pointsEarned ? ` + Nhận ngay ${response.pointsEarned} Điểm Tri Kỷ!` : '';
        onToast(`Chào mừng Bác! Đăng nhập bằng số điện thoại thành công!${bonusMsg}`);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('[FIREBASE_PHONE_OTP] Lỗi xác thực OTP:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setErrorMessage('Mã OTP không chính xác. Bác vui lòng kiểm tra lại tin nhắn nhé!');
      } else if (err.code === 'auth/code-expired') {
        setErrorMessage('Mã OTP đã hết hiệu lực. Bác bấm "Gửi lại mã" bên dưới nhé.');
      } else {
        setErrorMessage(err.message || 'Xác thực OTP thất bại. Bác vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Invisible reCAPTCHA Anchor */}
      <div id="recaptcha-container" />

      {/* Thông báo lỗi nếu có */}
      {errorMessage && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-shake">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {step === 'ENTER_PHONE' ? (
        /* BƯỚC 1: NHẬP SĐT VÀ TÊN */
        <form onSubmit={handleSendOtp} className="space-y-3.5 font-sans">
          <div>
            <label htmlFor="otp-phone" className="block text-xs font-serif font-bold text-[#3a251b] mb-1">
              Số Điện Thoại Nhận OTP <span className="text-[#8a1e14]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="otp-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="0988 888 888"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#d6c7ac] rounded-lg text-sm text-[#2b1810] font-mono tracking-wider focus:outline-hidden focus:border-[#8a1e14] focus:ring-1 focus:ring-[#8a1e14] transition-all"
                required
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1 italic">
              Quán sẽ gửi mã xác thực 6 số qua tin nhắn SMS miễn phí.
            </p>
          </div>

          <div>
            <label htmlFor="otp-fullname" className="block text-xs font-serif font-bold text-[#3a251b] mb-1">
              Họ và Tên của Bác <span className="text-stone-400 font-normal">(Tùy chọn)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                <User className="w-4 h-4" />
              </div>
              <input
                id="otp-fullname"
                type="text"
                placeholder="VD: Bác Ba Phố Cổ"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#d6c7ac] rounded-lg text-sm text-[#2b1810] focus:outline-hidden focus:border-[#8a1e14] focus:ring-1 focus:ring-[#8a1e14] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !phone.trim()}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#8a1e14] via-[#9e2418] to-[#73180f] hover:from-[#9e2418] hover:to-[#8a1e14] text-white font-serif font-bold text-sm tracking-wide shadow-md shadow-[#8a1e14]/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-amber-200" />
                <span>Đang gửi mã OTP...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Nhận Mã Xác Thực OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* BƯỚC 2: NHẬP 6 Ô SỐ OTP */
        <form onSubmit={handleVerifyOtp} className="space-y-4 font-sans text-center">
          <div className="bg-[#f2e9dc] p-3 rounded-xl border border-[#d6c7ac]/60">
            <p className="text-xs text-stone-700">
              Mã xác thực gồm 6 chữ số đã được gửi tới:
            </p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="font-mono font-bold text-[#8a1e14] text-sm">{phone}</span>
              <button
                type="button"
                onClick={() => { setStep('ENTER_PHONE'); setOtpCode(''); setErrorMessage(''); }}
                className="text-[11px] text-amber-800 underline hover:text-amber-900 cursor-pointer"
              >
                (Đổi số khác)
              </button>
            </div>
          </div>

          {/* 6 Ô NHẬP MÃ OTP */}
          <div className="py-2">
            <PhoneOtpInput
              length={6}
              value={otpCode}
              onChange={setOtpCode}
              disabled={isLoading}
              isError={Boolean(errorMessage)}
            />
          </div>

          {/* Nút gửi lại mã & Cooldown */}
          <div className="text-xs text-stone-600">
            {cooldown > 0 ? (
              <span className="text-stone-500 font-mono">
                Bác có thể yêu cầu gửi lại mã sau: <strong className="text-[#8a1e14]">{cooldown}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading}
                className="text-[#8a1e14] font-bold hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Chưa nhận được mã? Gửi lại ngay</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || otpCode.length < 6}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#1b3d2f] via-[#24523f] to-[#122b20] hover:from-[#24523f] hover:to-[#1b3d2f] border border-emerald-500/40 text-amber-100 font-serif font-bold text-sm tracking-wide shadow-md shadow-emerald-950/40 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-amber-200" />
                <span>Đang xác thực mã...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Xác Nhận & Đăng Nhập</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Cam kết bảo mật chuẩn di sản */}
      <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Bảo mật chuẩn Google Firebase • Không cần ghi nhớ mật khẩu</span>
      </div>
    </div>
  );
}

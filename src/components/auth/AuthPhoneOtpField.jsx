import React, { memo } from 'react';
import { Phone, RotateCcw } from 'lucide-react';
import PhoneOtpInput from './PhoneOtpInput';

function AuthPhoneOtpField({
  phone,
  setPhone,
  phoneInputRef,
  lockoutSeconds,
  isPermanentLocked,
  errorMessage,
  setErrorMessage,
  setIsPermanentLocked,
  handleChangePhone,
  authTab,
  isOtpSending,
  otpCooldown,
  otpSent,
  handleSendOtp,
  otpCode,
  setOtpCode,
  isLoading
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label htmlFor="auth-phone" className="block text-xs font-serif font-bold text-[#3a251b]">
          Số Điện Thoại <span className="text-[#8a1e14]">*</span>
        </label>
        {isPermanentLocked && (
          <button
            type="button"
            onClick={handleChangePhone}
            className="text-[11px] text-amber-700 hover:text-[#8a1e14] font-serif font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Đổi số khác</span>
          </button>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
            <Phone className="w-4 h-4" />
          </div>
          <input
            ref={phoneInputRef}
            id="auth-phone"
            type="tel"
            disabled={lockoutSeconds > 0}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (isPermanentLocked || errorMessage) {
                setIsPermanentLocked(false);
                setErrorMessage('');
              }
            }}
            placeholder="0988 888 888"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-[#d6c7ac] text-[#2b1810] text-sm placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#8a1e14] focus:border-[#8a1e14] transition-all shadow-xs disabled:opacity-60 disabled:bg-stone-100 disabled:cursor-not-allowed"
            required
          />
        </div>

        {authTab === 'register' && (
          <button
            type="button"
            disabled={isOtpSending || otpCooldown > 0}
            onClick={handleSendOtp}
            className="shrink-0 px-3.5 py-2.5 rounded-xl bg-[#8a1e14] hover:bg-[#731910] text-amber-100 font-serif font-bold text-xs tracking-wide transition-all shadow-xs border border-amber-400/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1"
          >
            {isOtpSending ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Đang gửi...</span>
              </>
            ) : otpCooldown > 0 ? (
              <span>Gửi lại ({otpCooldown}s)</span>
            ) : otpSent ? (
              <span>Gửi lại</span>
            ) : (
              <span>Gửi mã</span>
            )}
          </button>
        )}
      </div>

      {/* 6 Ô nhập OTP khi đăng ký */}
      {authTab === 'register' && otpSent && (
        <div className="mt-3 pt-2.5 border-t border-dashed border-[#d6c7ac]/60">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-serif font-bold text-[#3a251b]">
              Mã Xác Thực (6 số) <span className="text-[#8a1e14]">*</span>
            </label>
          </div>
          <PhoneOtpInput
            length={6}
            value={otpCode}
            onChange={setOtpCode}
            disabled={isLoading}
            isError={Boolean(errorMessage && errorMessage.includes('OTP'))}
          />
        </div>
      )}
    </div>
  );
}

export default memo(AuthPhoneOtpField);

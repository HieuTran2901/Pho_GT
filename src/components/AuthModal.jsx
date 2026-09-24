import { memo } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLockoutBanner from './auth/AuthLockoutBanner';
import AuthModalHeader from './auth/AuthModalHeader';
import AuthFullNameField from './auth/AuthFullNameField';
import AuthPhoneOtpField from './auth/AuthPhoneOtpField';
import AuthTasteLoyaltyBox from './auth/AuthTasteLoyaltyBox';
import { useAuthModalForm } from './auth/useAuthModalForm';
import { useAuthModalLifecycle } from './auth/useAuthModalLifecycle';
import AuthTabNav from './auth/AuthTabNav';
import AuthPasswordField from './auth/AuthPasswordField';
import AuthQuickDemoBar from './auth/AuthQuickDemoBar';
import AuthSubmitButton from './auth/AuthSubmitButton';

function AuthModal({ onToast }) {
  const { authModalOpen, closeAuthModal, authTab, setAuthTab, login, register } = useAuth();

  const { mounted, isClosing, handleClose } = useAuthModalLifecycle({
    authModalOpen,
    closeAuthModal
  });

  const {
    phone, setPhone, fullName, setFullName, password, setPassword,
    showPassword, setShowPassword, saveTasteProfile, setSaveTasteProfile,
    isLoading, errorMessage, setErrorMessage, lockoutSeconds,
    isPermanentLocked, setIsPermanentLocked, currentRound,
    otpCode, setOtpCode, otpSent, isOtpSending, otpCooldown, phoneInputRef,
    handleTabChange, handleSendOtp, handleChangePhone, handleSubmit,
    handleQuickDemo, handleForgotPassword, handleGuestOrder
  } = useAuthModalForm({
    authModalOpen,
    authTab,
    setAuthTab,
    login,
    register,
    onToast,
    handleClose
  });

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
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-[#f4ebd9] hover:bg-[#8a1e14] text-[#8a1e14] hover:text-white border border-[#8a1e14]/30 flex items-center justify-center transition-all duration-200 shadow-sm group cursor-pointer"
          aria-label="Đóng cửa sổ"
        >
          <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
        </button>

        {/* Header: Dấu Mộc & Tiêu Đề Cổ Kính */}
        <AuthModalHeader />

        {/* Tabs Điều Hướng: Đăng Nhập / Đăng Ký */}
        <AuthTabNav
          authTab={authTab}
          onTabChange={handleTabChange}
        />

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
              onForgotPassword={handleForgotPassword}
              onGuestOrder={handleGuestOrder}
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
              <AuthFullNameField
                fullName={fullName}
                setFullName={setFullName}
                required={authTab === 'register'}
              />
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
            <AuthPasswordField
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              authTab={authTab}
              lockoutSeconds={lockoutSeconds}
              isPermanentLocked={isPermanentLocked}
              errorMessage={errorMessage}
              setIsPermanentLocked={setIsPermanentLocked}
              setErrorMessage={setErrorMessage}
              onForgotPassword={handleForgotPassword}
            />

            {/* Lợi quyền hội viên: Box Tem Phiếu Khách Quen */}
            {authTab === 'register' && (
              <AuthTasteLoyaltyBox
                saveTasteProfile={saveTasteProfile}
                setSaveTasteProfile={setSaveTasteProfile}
              />
            )}

            {/* Nút Submit / Khóa */}
            <AuthSubmitButton
              isPermanentLocked={isPermanentLocked}
              lockoutSeconds={lockoutSeconds}
              isLoading={isLoading}
              authTab={authTab}
              onChangePhone={handleChangePhone}
            />
          </form>

          {/* Quick Demo Test Buttons */}
          <AuthQuickDemoBar onQuickDemo={handleQuickDemo} />

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

import { memo } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

function AuthPasswordField({
  password,
  setPassword,
  showPassword,
  setShowPassword,
  authTab,
  lockoutSeconds,
  isPermanentLocked,
  errorMessage,
  setIsPermanentLocked,
  setErrorMessage,
  onForgotPassword
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label htmlFor="auth-password" className="text-xs font-serif font-bold text-[#3a251b]">
          Mật Khẩu <span className="text-[#8a1e14]">*</span>
        </label>
        {authTab === 'login' && (
          <button 
            type="button"
            onClick={onForgotPassword}
            className="text-[11px] text-[#8a1e14] hover:underline font-serif cursor-pointer"
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
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-500 hover:text-[#8a1e14] cursor-pointer"
          tabIndex="-1"
          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default memo(AuthPasswordField);

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  Lock,
  Phone,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Clock,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MAX_LOGIN_ATTEMPTS = 5;
const DEFAULT_LOCKOUT_SECONDS = 60;
const STORAGE_LOCKOUT_KEY = 'pho1986_admin_lockout_until';
const STORAGE_ATTEMPTS_KEY = 'pho1986_admin_failed_attempts';

export default function AdminLoginView({ onBackToHome }) {
  const { login, logout } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Khôi phục trạng thái tạm khóa từ sessionStorage (chống bypass bằng cách F5 / refresh trang)
  const [lockoutSeconds, setLockoutSeconds] = useState(() => {
    try {
      const savedUntil = sessionStorage.getItem(STORAGE_LOCKOUT_KEY);
      if (savedUntil) {
        const remaining = Math.ceil((parseInt(savedUntil, 10) - Date.now()) / 1000);
        return remaining > 0 ? remaining : 0;
      }
    } catch {
      // Fallback nếu sessionStorage bị chặn
    }
    return 0;
  });

  // Khôi phục số lần thử sai liên tiếp từ sessionStorage
  const [failedAttempts, setFailedAttempts] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_ATTEMPTS_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const maxLockoutRef = useRef(DEFAULT_LOCKOUT_SECONDS);

  // Kích hoạt tạm khóa hệ thống và lưu mốc thời gian tuyệt đối
  const triggerLockout = useCallback((seconds = DEFAULT_LOCKOUT_SECONDS) => {
    const sec = Math.max(Number(seconds), 1);
    maxLockoutRef.current = Math.max(sec, 60);
    const until = Date.now() + sec * 1000;
    try {
      sessionStorage.setItem(STORAGE_LOCKOUT_KEY, until.toString());
      sessionStorage.removeItem(STORAGE_ATTEMPTS_KEY);
    } catch {}
    setFailedAttempts(0);
    setLockoutSeconds(sec);
    setErrorMsg('');
  }, []);

  // Ghi nhận 1 lần thử sai: cảnh báo số lần còn lại hoặc khóa khi đủ 5 lần
  const recordFailureAttempt = useCallback((customMsg = '') => {
    const next = failedAttempts + 1;
    setFailedAttempts(next);
    try {
      sessionStorage.setItem(STORAGE_ATTEMPTS_KEY, next.toString());
    } catch {}

    if (next >= MAX_LOGIN_ATTEMPTS) {
      triggerLockout(DEFAULT_LOCKOUT_SECONDS);
    } else {
      const remaining = MAX_LOGIN_ATTEMPTS - next;
      const remainingText = `(còn ${remaining} lần thử trước khi tạm khóa)`;
      const baseMsg = customMsg || 'Số điện thoại hoặc mật khẩu không chính xác.';
      setErrorMsg(`${baseMsg} ${remainingText}`);
    }
  }, [failedAttempts, triggerLockout]);

  // Bộ đếm lùi thời gian thực chuẩn xác theo timestamp (không bị trôi nhịp)
  useEffect(() => {
    if (lockoutSeconds <= 0) {
      try {
        sessionStorage.removeItem(STORAGE_LOCKOUT_KEY);
        sessionStorage.removeItem(STORAGE_ATTEMPTS_KEY);
      } catch {}
      setFailedAttempts(0);
      return;
    }

    const timer = setInterval(() => {
      try {
        const savedUntil = sessionStorage.getItem(STORAGE_LOCKOUT_KEY);
        if (savedUntil) {
          const remaining = Math.ceil((parseInt(savedUntil, 10) - Date.now()) / 1000);
          if (remaining <= 0) {
            setLockoutSeconds(0);
            setErrorMsg('');
            clearInterval(timer);
          } else {
            setLockoutSeconds(remaining);
          }
          return;
        }
      } catch {}

      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMsg('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const handleVisibility = () => {
      try {
        const savedUntil = sessionStorage.getItem(STORAGE_LOCKOUT_KEY);
        if (savedUntil) {
          const remaining = Math.ceil((parseInt(savedUntil, 10) - Date.now()) / 1000);
          setLockoutSeconds(remaining > 0 ? remaining : 0);
        }
      } catch {}
    };
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      clearInterval(timer);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [lockoutSeconds > 0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutSeconds > 0 || loading) return;

    // 1. Chuẩn hóa & kiểm tra tính hợp lệ của số điện thoại
    const cleanPhone = phone.replace(/[\s.-]+/g, '');
    if (!cleanPhone) {
      setErrorMsg('Vui lòng nhập số điện thoại quản trị.');
      return;
    }

    const vnPhoneRegex = /^(0[35789])[0-9]{8}$/;
    if (!vnPhoneRegex.test(cleanPhone)) {
      setErrorMsg('Số điện thoại không hợp lệ (cần 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09).');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu quản trị.');
      return;
    }

    if (password.trim().length < 6) {
      setErrorMsg('Mật khẩu quản trị phải có tối thiểu 6 ký tự.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const user = await login(cleanPhone, password);

      // Kiểm tra quyền hạn Quản Trị Viên nghiêm ngặt
      if (user?.role !== 'ADMIN' && user?.role !== 'ROLE_ADMIN') {
        try {
          if (logout) await logout();
        } catch {}
        recordFailureAttempt('Tài khoản của bạn không có quyền truy cập khu vực Quản Trị Viên.');
        return;
      }

      // Đăng nhập thành công -> Xóa bộ nhớ đếm lỗi
      try {
        sessionStorage.removeItem(STORAGE_ATTEMPTS_KEY);
        sessionStorage.removeItem(STORAGE_LOCKOUT_KEY);
      } catch {}
      setFailedAttempts(0);
    } catch (err) {
      // Nhận diện tín hiệu Rate Limit từ Backend (HTTP 429)
      const waitSec = err.retryAfterSeconds || err.data?.data?.retryAfterSeconds;
      if (waitSec && Number(waitSec) > 0) {
        triggerLockout(Number(waitSec));
      } else if (err.message && err.message.includes('thử lại sau')) {
        const match = err.message.match(/(\d+)\s*giây/);
        if (match && match[1]) {
          triggerLockout(parseInt(match[1], 10));
        } else {
          triggerLockout(DEFAULT_LOCKOUT_SECONDS);
        }
      } else {
        recordFailureAttempt(err.message || 'Số điện thoại hoặc mật khẩu không chính xác.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setPhone('0999999999');
    setPassword('admin123');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#120a07] text-[#f5eedc] flex items-center justify-center p-4 relative overflow-hidden font-serif">
      {/* Background ambient texture */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#8a1e14]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#d4af37]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#1c120c] border border-[#d4af37]/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Top Back Button */}
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs text-[#d4af37]/80 hover:text-[#d4af37] transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Về trang chủ khách hàng</span>
        </button>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#8a1e14]/30 border border-[#d4af37]/50 flex items-center justify-center mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-[#d4af37]" />
          </div>
          <span className="text-[11px] tracking-[0.25em] uppercase text-[#d4af37] font-semibold">
            Bát Phở Tri Kỷ 1986
          </span>
          <h1 className="text-2xl font-bold text-[#fcf9f2] mt-1 font-serif">
            Khu Vực Quản Trị Viên
          </h1>
          <p className="text-xs text-[#a89f91] mt-1 font-sans">
            Hệ thống vận hành thực đơn, đặt bàn & doanh thu nội bộ
          </p>
        </div>

        {/* Retro Heritage Lockout Banner khi bị tạm khóa nhập sai quá 5 lần */}
        {lockoutSeconds > 0 ? (
          <div className="mb-6 p-4 bg-[#2a1309] border-2 border-[#ea580c] rounded-2xl text-amber-100 shadow-xl shadow-red-950/40 font-sans animate-shake relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-950/90 border border-[#ea580c]/60 flex items-center justify-center shrink-0 mt-0.5 text-rose-400">
                <ShieldAlert className="w-5 h-5 text-[#ea580c] animate-pulse" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-[#fcf9f2] text-sm uppercase tracking-wide">
                    Tạm Khóa Thử Lại
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#8a1e14] text-amber-200 font-mono font-bold text-xs border border-amber-500/40 shadow-xs">
                    <Clock className="w-3.5 h-3.5 animate-spin text-amber-300" />
                    00:{String(lockoutSeconds).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-amber-200/90 mt-1.5 leading-relaxed font-sans">
                  Bạn đã nhập sai thông tin quản trị quá 5 lần. Để chống tấn công vét cạn (Brute-force) và bảo vệ an toàn cho nhà hàng, hệ thống tạm dừng nhận thử lại trong <strong>{lockoutSeconds} giây</strong>.
                </p>

                {/* Dải Progress Bar đếm lùi thời gian thực */}
                <div className="mt-3 h-1.5 w-full bg-[#ea580c]/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-[#ea580c] transition-all duration-1000 ease-linear rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(0, (lockoutSeconds / (maxLockoutRef.current || 60)) * 100))}%`
                    }}
                  />
                </div>

                <div className="mt-3 pt-2.5 border-t border-amber-900/40 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-amber-400/80 font-serif">
                    Form tự động mở lại sau đếm ngược
                  </span>
                  <button
                    type="button"
                    onClick={onBackToHome}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8a1e14] hover:bg-[#731910] text-amber-100 text-[10.5px] font-serif font-bold uppercase tracking-wider transition-all shadow-xs active:scale-95"
                  >
                    <span>Về trang chủ</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : errorMsg ? (
          <div className="mb-6 p-3.5 bg-[#8a1e14]/25 border border-[#8a1e14] rounded-xl text-xs text-rose-300 flex items-start gap-2.5 font-sans animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#d4af37] font-semibold mb-1.5 font-serif">
              Số Điện Thoại Quản Trị
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#a89f91]">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                disabled={lockoutSeconds > 0}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0999999999"
                className="w-full pl-9 pr-3 py-2.5 bg-[#120a07] border border-[#d4af37]/30 rounded-lg text-[#fcf9f2] placeholder-[#665d52] focus:outline-none focus:border-[#d4af37] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#d4af37] font-semibold mb-1.5 font-serif">
              Mật Khẩu Quản Trị
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#a89f91]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                disabled={lockoutSeconds > 0}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-[#120a07] border border-[#d4af37]/30 rounded-lg text-[#fcf9f2] placeholder-[#665d52] focus:outline-none focus:border-[#d4af37] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || lockoutSeconds > 0}
            className="w-full mt-2 py-3 bg-gradient-to-r from-[#8a1e14] to-[#a32217] hover:from-[#9c2217] hover:to-[#b8271a] text-[#fcf9f2] font-semibold rounded-lg shadow-lg shadow-[#8a1e14]/40 border border-[#d4af37]/40 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed font-serif tracking-wide text-base flex items-center justify-center gap-2"
          >
            {lockoutSeconds > 0 ? (
              <>
                <Clock className="w-4 h-4 animate-pulse text-amber-300" />
                <span className="uppercase tracking-wide">Tạm Khóa Thử Lại ({lockoutSeconds}s)</span>
              </>
            ) : loading ? (
              'Đang xác thực...'
            ) : (
              'Đăng Nhập Quản Trị'
            )}
          </button>
        </form>

        {/* Demo Fast Fill Button (Chỉ hiển thị trong môi trường Development) */}
        {import.meta.env.DEV && (
          <div className="mt-6 pt-5 border-t border-[#d4af37]/20 text-center font-sans">
            <button
              type="button"
              disabled={lockoutSeconds > 0}
              onClick={fillDemoAdmin}
              className="inline-flex items-center gap-1.5 text-xs text-[#d4af37] hover:underline disabled:opacity-40 disabled:pointer-events-none"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nạp tài khoản mẫu: 0999999999 / admin123</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

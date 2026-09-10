import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  Lock,
  Phone,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLockoutBanner from '../auth/AuthLockoutBanner';

const MAX_LOGIN_ATTEMPTS = 5;
const DEFAULT_LOCKOUT_SECONDS = 60;
const STORAGE_LOCKOUT_KEY = 'pho1986_admin_lockout_until';
const STORAGE_ATTEMPTS_KEY = 'pho1986_admin_failed_attempts';
const STORAGE_ROUND_KEY = 'pho1986_admin_lockout_round';
const STORAGE_PERMANENT_KEY = 'pho1986_admin_permanent_locked';

export default function AdminLoginView({ onBackToHome }) {
  const { login, logout } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Khôi phục trạng thái khóa vĩnh viễn
  const [isPermanentLocked, setIsPermanentLocked] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_PERMANENT_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Khôi phục vòng thử hiện tại
  const [currentRound, setCurrentRound] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_ROUND_KEY);
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });

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
  const triggerLockout = useCallback((seconds = DEFAULT_LOCKOUT_SECONDS, roundOverride = null) => {
    const sec = Math.max(Number(seconds), 1);
    maxLockoutRef.current = Math.max(sec, 60);
    const until = Date.now() + sec * 1000;
    const activeRound = roundOverride !== null ? roundOverride : currentRound;
    try {
      sessionStorage.setItem(STORAGE_LOCKOUT_KEY, until.toString());
      sessionStorage.removeItem(STORAGE_ATTEMPTS_KEY);
      sessionStorage.setItem(STORAGE_ROUND_KEY, activeRound.toString());
    } catch {}
    setFailedAttempts(0);
    setLockoutSeconds(sec);
    setCurrentRound(activeRound);
    setErrorMsg('');
  }, [currentRound]);

  // Ghi nhận 1 lần thử sai: cảnh báo số lần còn lại hoặc khóa khi đủ 5 lần
  const recordFailureAttempt = useCallback((customMsg = '') => {
    const next = failedAttempts + 1;
    setFailedAttempts(next);
    try {
      sessionStorage.setItem(STORAGE_ATTEMPTS_KEY, next.toString());
    } catch {}

    if (next >= MAX_LOGIN_ATTEMPTS) {
      if (currentRound >= 5) {
        setIsPermanentLocked(true);
        try { sessionStorage.setItem(STORAGE_PERMANENT_KEY, 'true'); } catch {}
        setErrorMsg('Tài khoản quản trị đã bị niêm phong do quá 5 vòng thử sai.');
      } else {
        const cooldowns = [60, 180, 300, 600];
        const sec = cooldowns[Math.min(currentRound - 1, cooldowns.length - 1)];
        triggerLockout(sec, currentRound);
      }
    } else {
      const remaining = MAX_LOGIN_ATTEMPTS - next;
      const remainingText = `(Vòng ${currentRound}/5: còn ${remaining} lần thử)`;
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
            setCurrentRound((prev) => {
              const next = Math.min(5, prev + 1);
              try { sessionStorage.setItem(STORAGE_ROUND_KEY, next.toString()); } catch {}
              return next;
            });
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
          setCurrentRound((r) => {
            const next = Math.min(5, r + 1);
            try { sessionStorage.setItem(STORAGE_ROUND_KEY, next.toString()); } catch {}
            return next;
          });
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
        sessionStorage.removeItem(STORAGE_ROUND_KEY);
        sessionStorage.removeItem(STORAGE_PERMANENT_KEY);
      } catch {}
      setFailedAttempts(0);
      setCurrentRound(1);
      setIsPermanentLocked(false);
    } catch (err) {
      if (err.isPermanent || err.status === 423) {
        setIsPermanentLocked(true);
        try { sessionStorage.setItem(STORAGE_PERMANENT_KEY, 'true'); } catch {}
        setLockoutSeconds(0);
        setErrorMsg(err.message || 'Tài khoản quản trị đã bị niêm phong do quá 5 vòng thử sai.');
      } else {
        const round = err.round || err.data?.data?.round;
        if (round) {
          setCurrentRound(Number(round));
          try { sessionStorage.setItem(STORAGE_ROUND_KEY, round.toString()); } catch {}
        }
        // Nhận diện tín hiệu Rate Limit từ Backend (HTTP 429)
        const waitSec = err.retryAfterSeconds || err.data?.data?.retryAfterSeconds;
        if (waitSec && Number(waitSec) > 0) {
          triggerLockout(Number(waitSec), round || currentRound);
        } else if (err.message && err.message.includes('thử lại sau')) {
          const match = err.message.match(/(\d+)\s*giây/);
          const sec = match && match[1] ? parseInt(match[1], 10) : DEFAULT_LOCKOUT_SECONDS;
          triggerLockout(sec, round || currentRound);
        } else {
          recordFailureAttempt(err.message || 'Số điện thoại hoặc mật khẩu không chính xác.');
        }
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

        {/* Multi-Tier Lockout & Cooldown Banner (SENTINEL & URBAN) */}
        {(isPermanentLocked || lockoutSeconds > 0) ? (
          <AuthLockoutBanner
            isPermanent={isPermanentLocked}
            lockoutSeconds={lockoutSeconds}
            currentRound={currentRound}
            maxRounds={5}
            errorMessage={errorMsg}
            onGuestOrder={onBackToHome}
          />
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
                disabled={lockoutSeconds > 0 || isPermanentLocked}
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
                disabled={lockoutSeconds > 0 || isPermanentLocked}
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
            disabled={loading || lockoutSeconds > 0 || isPermanentLocked}
            className="w-full mt-2 py-3 bg-gradient-to-r from-[#8a1e14] to-[#a32217] hover:from-[#9c2217] hover:to-[#b8271a] text-[#fcf9f2] font-semibold rounded-lg shadow-lg shadow-[#8a1e14]/40 border border-[#d4af37]/40 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed font-serif tracking-wide text-base flex items-center justify-center gap-2"
          >
            {isPermanentLocked ? (
              <>
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span className="uppercase tracking-wide">Tài Khoản Đã Bị Khóa Bảo Vệ</span>
              </>
            ) : lockoutSeconds > 0 ? (
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

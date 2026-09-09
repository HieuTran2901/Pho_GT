import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, Phone, ArrowLeft, AlertCircle, Sparkles, Clock, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginView({ onBackToHome }) {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const maxLockoutRef = useRef(60);

  // Countdown timer khi bị tạm khóa đăng nhập quản trị
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setErrorMsg('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;
    if (!phone || !password) {
      setErrorMsg('Vui lòng điền đầy đủ số điện thoại và mật khẩu.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const user = await login(phone, password);
      if (user?.role !== 'ADMIN') {
        setErrorMsg('Tài khoản của bạn không có quyền truy cập khu vực Quản Trị Viên. Vui lòng kiểm tra lại hoặc liên hệ quản lý.');
      }
    } catch (err) {
      const waitSec = err.retryAfterSeconds || err.data?.data?.retryAfterSeconds;
      if (waitSec && Number(waitSec) > 0) {
        maxLockoutRef.current = Math.max(Number(waitSec), 60);
        setLockoutSeconds(Number(waitSec));
      } else if (err.message && err.message.includes('thử lại sau')) {
        const match = err.message.match(/(\d+)\s*giây/);
        if (match && match[1]) {
          const s = parseInt(match[1], 10);
          maxLockoutRef.current = Math.max(s, 60);
          setLockoutSeconds(s);
        }
      }
      setErrorMsg(err.message || 'Đăng nhập quản trị thất bại. Vui lòng kiểm tra lại thông tin.');
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

      <div className="w-full max-w-md bg-[#1c120c] border border-[#d4af37]/30 rounded-2xl p-8 shadow-2xl relative z-10">
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

        {lockoutSeconds > 0 ? (
          <div className="mb-6 p-4 bg-[#2a1309] border border-[#ea580c] rounded-xl text-amber-100 shadow-xl shadow-red-950/40 font-sans animate-shake">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-950/80 border border-[#ea580c]/60 flex items-center justify-center shrink-0 mt-0.5 text-rose-400">
                <ShieldAlert className="w-5 h-5 text-[#ea580c] animate-pulse" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-[#fcf9f2] text-sm tracking-wide">
                    TẠM KHÓA TRUY CẬP QUẢN TRỊ
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#8a1e14] text-amber-200 font-mono font-bold text-xs border border-amber-500/30">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    00:{String(lockoutSeconds).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-amber-200/80 mt-1.5 leading-relaxed">
                  Đăng nhập sai mật khẩu quản trị quá 5 lần. Để chống tấn công vét cạn (Brute-force), hệ thống tạm thời khóa thao tác trong <strong>{lockoutSeconds} giây</strong>.
                </p>

                {/* Dải Progress Bar đếm lùi thời gian thực */}
                <div className="mt-2.5 h-1.5 w-full bg-[#ea580c]/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-[#ea580c] transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, (lockoutSeconds / (maxLockoutRef.current || 60)) * 100))}%` }}
                  />
                </div>

                <div className="mt-2.5 pt-2 border-t border-amber-900/40 text-[11px] text-amber-400/90 font-medium">
                  Cơ chế bảo mật OWASP - Form tự động kích hoạt lại sau khi kết thúc đếm ngược.
                </div>
              </div>
            </div>
          </div>
        ) : errorMsg ? (
          <div className="mb-6 p-3 bg-[#8a1e14]/30 border border-[#8a1e14] rounded-lg text-xs text-rose-300 flex items-start gap-2 font-sans">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
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
                type="text"
                disabled={lockoutSeconds > 0}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0999999999"
                className="w-full pl-9 pr-3 py-2.5 bg-[#120a07] border border-[#d4af37]/30 rounded-lg text-[#fcf9f2] placeholder-[#665d52] focus:outline-none focus:border-[#d4af37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#d4af37] font-semibold mb-1.5 font-serif">
              Mật Khẩu
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
                className="w-full pl-9 pr-3 py-2.5 bg-[#120a07] border border-[#d4af37]/30 rounded-lg text-[#fcf9f2] placeholder-[#665d52] focus:outline-none focus:border-[#d4af37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span>Tạm Khóa Thử Lại ({lockoutSeconds}s)</span>
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
              onClick={fillDemoAdmin}
              className="inline-flex items-center gap-1.5 text-xs text-[#d4af37] hover:underline"
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

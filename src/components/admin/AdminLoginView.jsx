import React, { useState } from 'react';
import { ShieldCheck, Lock, Phone, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginView({ onBackToHome }) {
  const { login } = useAuth();
  const [phone, setPhone] = useState('0999999999');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      setErrorMsg('Vui lòng điền đầy đủ số điện thoại và mật khẩu.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const user = await login(phone, password);
      if (user?.role !== 'ADMIN') {
        setErrorMsg('Tài khoản này không có quyền Quản Trị Viên (Yêu cầu ROLE_ADMIN).');
      }
    } catch (err) {
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

        {errorMsg && (
          <div className="mb-6 p-3 bg-[#8a1e14]/30 border border-[#8a1e14] rounded-lg text-xs text-rose-300 flex items-start gap-2 font-sans">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0999999999"
                className="w-full pl-9 pr-3 py-2.5 bg-[#120a07] border border-[#d4af37]/30 rounded-lg text-[#fcf9f2] placeholder-[#665d52] focus:outline-none focus:border-[#d4af37] transition-colors"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-[#120a07] border border-[#d4af37]/30 rounded-lg text-[#fcf9f2] placeholder-[#665d52] focus:outline-none focus:border-[#d4af37] transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-[#8a1e14] to-[#a32217] hover:from-[#9c2217] hover:to-[#b8271a] text-[#fcf9f2] font-semibold rounded-lg shadow-lg shadow-[#8a1e14]/40 border border-[#d4af37]/40 transition-all transform active:scale-[0.99] disabled:opacity-50 font-serif tracking-wide text-base"
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập Quản Trị'}
          </button>
        </form>

        {/* Demo Fast Fill Button */}
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
      </div>
    </div>
  );
}

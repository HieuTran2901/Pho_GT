import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Clock,
  Armchair,
  MapPin,
  ExternalLink,
  Flame,
  Sparkles,
  Award
} from 'lucide-react';

const CONFETTI_PARTICLES = [
  { x: -65, y: -45, r: 45, delay: '0.05s', color: '#f59e0b' },
  { x: 70, y: -50, r: -35, delay: '0.12s', color: '#fbbf24' },
  { x: -85, y: 15, r: 60, delay: '0.18s', color: '#e11d48' },
  { x: 88, y: 20, r: -50, delay: '0.22s', color: '#f59e0b' },
  { x: -45, y: -75, r: 25, delay: '0.08s', color: '#d97706' },
  { x: 50, y: -70, r: -40, delay: '0.15s', color: '#f43f5e' },
  { x: -35, y: 40, r: 15, delay: '0.26s', color: '#fbbf24' },
  { x: 38, y: 42, r: -20, delay: '0.24s', color: '#10b981' },
];

function OrderStep3Success({
  formData,
  bookingCode,
  isCopied,
  handleCopyCode,
  selectedPaymentMethod,
  selectedTable,
  handleReset,
  branchLabels = {}
}) {
  // Live 30-minute priority radar countdown (starts at 1800s = 30:00)
  const [countdownSeconds, setCountdownSeconds] = useState(1800);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const branchAddress = branchLabels[formData?.branch] || 'Cơ sở Phở Gia Truyền 1986';

  return (
    <div className="text-center py-2 space-y-4 relative">
      {/* 1. Festive Gold Confetti Burst Particles */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none z-20">
        {CONFETTI_PARTICLES.map((p, idx) => (
          <span
            key={idx}
            className="absolute w-2 h-2 rounded-sm animate-confetti-particle"
            style={{
              backgroundColor: p.color,
              animationDelay: p.delay,
              '--tx': `${p.x}px`,
              '--ty': `${p.y}px`,
              '--tr': `${p.r}deg`
            }}
          />
        ))}
      </div>

      {/* 2. Top Celebrating Badge with Steaming Aroma & Radar Glow */}
      <div className="relative inline-flex items-center justify-center">
        {/* Radar Ring Glow */}
        <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-radar-ring" />
        
        {/* Vapor Wisps */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none">
          <div className="w-1.5 h-4 bg-gradient-to-t from-amber-200/40 to-transparent rounded-full blur-[1px] animate-success-steam-1" />
          <div className="w-2 h-6 bg-gradient-to-t from-amber-100/50 to-transparent rounded-full blur-[1px] animate-success-steam-2" />
          <div className="w-1.5 h-4 bg-gradient-to-t from-amber-200/40 to-transparent rounded-full blur-[1px] animate-success-steam-1" />
        </div>

        {/* Central Icon */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/25 to-amber-500/20 text-emerald-400 flex items-center justify-center border-2 border-amber-400/50 shadow-2xl animate-pop-spring relative z-10">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
      </div>

      {/* Header Titles */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-widest mb-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Vinh Dự Tiếp Đón Thực Khách</span>
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
          {formData.orderType === 'dine-in' ? 'Đặt Bàn Thành Công!' : 'Giao Phở Đã Xác Nhận!'}
        </h3>
        <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-md mx-auto leading-relaxed">
          {formData.orderType === 'dine-in'
            ? `Cảm ơn ${formData.customerName || 'quý khách'}! Thẻ bàn di sản đã được kích hoạt ưu tiên tại quán.`
            : `Bếp Phở Gia Truyền 1986 đang chuẩn bị nước dùng 90°C và sẽ giao tận nơi tới ${formData.customerName || 'bạn'}.`}
        </p>
      </div>

      {/* 3. Live Concierge 3-Stage Milestone Journey Tracker */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-2 rounded-2xl bg-black/40 border border-white/10 text-left">
        <div className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-emerald-300 truncate">1. Xác Nhận</div>
            <div className="text-[9px] text-stone-400 truncate">Đã giữ chỗ</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-xl bg-amber-500/10 border border-amber-500/25">
          <Flame className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-amber-300 truncate">2. Bếp Nổi Lửa</div>
            <div className="text-[9px] text-stone-400 truncate">Nước dùng 90°C</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/10">
          <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-stone-200 truncate">3. Tiếp Đón</div>
            <div className="text-[9px] text-stone-400 truncate">Tại bàn ăn</div>
          </div>
        </div>
      </div>

      {/* 4. Heritage Boarding Pass with Perforated Stub & 3D Wax Seal */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#1c120c] to-[#0f0a07] border-2 border-amber-500/45 text-left relative overflow-hidden shadow-2xl animate-pass-card">
        {/* Ticket Perforations on Left & Right Edges */}
        <div className="ticket-perforation-left" />
        <div className="ticket-perforation-right" />

        {/* Metallic Gold Shimmer Sweep */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-amber-300/15 to-transparent absolute top-0 left-0 animate-gold-shimmer" />
        </div>

        {/* 3D Vermilion Heritage Stamp ("ĐÃ XÁC NHẬN - PHỞ GIA TRUYỀN 1986") */}
        <div className="absolute right-3 sm:right-6 bottom-16 sm:bottom-12 pointer-events-none z-10 flex items-center justify-center">
          {/* Micro Shockwave Ring behind Stamp */}
          <div className="absolute w-24 h-24 rounded-full border border-red-500/60 animate-stamp-shockwave pointer-events-none" />
          
          {/* Stamp Graphic */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-red-600/90 p-1 flex items-center justify-center animate-stamp-slam shadow-lg bg-red-950/20 backdrop-blur-[1px]">
            <div className="w-full h-full rounded-full border border-dashed border-red-500/80 flex flex-col items-center justify-center text-center p-1 text-red-500 font-bold uppercase tracking-wider">
              <span className="text-[7px] sm:text-[8px] font-serif leading-none tracking-widest text-red-400">PHỞ GIA TRUYỀN</span>
              <span className="text-[6px] tracking-tighter text-amber-500">★ 1986 ★</span>
              <div className="my-0.5 px-1.5 py-0.5 rounded bg-red-600/30 border border-red-500/50">
                <span className="text-[8px] sm:text-[9px] font-black text-red-200 tracking-wider">ĐÃ XÁC NHẬN</span>
              </div>
              <span className="text-[6px] text-red-400 leading-none">HÀ NỘI GỐC</span>
            </div>
          </div>
        </div>

        {/* Stub Header */}
        <div className="flex items-center justify-between border-b border-dashed border-amber-500/35 pb-3">
          <div>
            <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold tracking-widest uppercase">
              <Award className="w-3 h-3 text-amber-400" />
              <span>{formData.orderType === 'dine-in' ? 'Thẻ Bàn Di Sản 1986' : 'Phiếu Giao Phở Nóng 1986'}</span>
            </div>
            <div className="font-mono text-base sm:text-lg font-bold text-white tracking-wider flex items-center gap-2 mt-0.5">
              <span>#{bookingCode}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(bookingCode)}
                className="text-stone-400 hover:text-amber-300 p-0.5 transition-colors cursor-pointer"
                title="Sao chép mã"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Radar Countdown 30 Minutes */}
          <div className="text-right">
            <span className="text-[10px] text-stone-400">Thời gian giữ chỗ:</span>
            <div className="text-xs sm:text-sm font-mono font-bold text-amber-300 flex items-center gap-1.5 justify-end">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span className="tracking-wider">{formatCountdown(countdownSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Booking Details Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs relative z-0">
          <div>
            <span className="text-stone-400 text-[10px]">Khách hàng:</span>
            <div className="font-semibold text-stone-200">{formData.customerName || 'Quý khách'}</div>
          </div>
          <div>
            <span className="text-stone-400 text-[10px]">Số điện thoại:</span>
            <div className="font-semibold text-stone-200">{formData.phone}</div>
          </div>
          <div>
            <span className="text-stone-400 text-[10px]">
              {formData.orderType === 'dine-in' ? 'Thời gian & Bàn:' : 'Thời gian giao:'}
            </span>
            <div className="font-semibold text-stone-200">
              {formData.orderType === 'dine-in'
                ? `${formData.time || '19:00'} • ${formData.guestCount} khách${selectedTable ? ` • Bàn ${selectedTable.name}` : ''}`
                : 'Giao ngay (25-35 phút)'}
            </div>
          </div>
          <div>
            <span className="text-stone-400 text-[10px]">Thanh toán:</span>
            <div className="font-semibold text-emerald-400 truncate">
              {selectedPaymentMethod === 'POST_PAID_AT_STORE'
                ? 'Tại quầy sau khi ăn'
                : selectedPaymentMethod === 'COD'
                ? 'Tiền mặt khi nhận phở'
                : selectedPaymentMethod === 'MOMO'
                ? 'Ví điện tử MoMo ✓'
                : selectedPaymentMethod === 'SEPAY'
                ? 'Cổng SePay Tự Động ✓'
                : selectedPaymentMethod === 'VNPAY'
                ? 'Cổng VNPAY-QR'
                : selectedPaymentMethod === 'ZALOPAY'
                ? 'Ví điện tử ZaloPay'
                : selectedPaymentMethod === 'CREDIT_CARD'
                ? 'Thẻ Quốc Tế (Visa/Master)'
                : 'Đã thanh toán VietQR ✓'}
            </div>
          </div>
        </div>

        {/* Selected Table Callout */}
        {selectedTable && formData.orderType === 'dine-in' && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200 animate-fadeIn mt-2">
            <div className="flex items-center gap-2">
              <Armchair className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Vị trí giữ trước: <strong className="text-white font-bold">{selectedTable.name}</strong> ({selectedTable.zoneName})</span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/30">
              Ưu tiên xếp bàn
            </span>
          </div>
        )}

        {/* Note / Taste preference */}
        {formData.note && (
          <div className="border-t border-white/10 pt-2 mt-2 text-[11px] text-amber-300/90 italic">
            Khẩu vị riêng: {formData.note}
          </div>
        )}

        {/* 1-Tap Google Maps Directions Button */}
        {formData.orderType === 'dine-in' && (
          <div className="pt-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Phở Gia Truyền 1986 ${branchAddress}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/25 to-amber-500/15 hover:from-amber-500/25 hover:to-amber-500/25 active:scale-98 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Mở Google Maps Chỉ Đường Đến Quán</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400/80 shrink-0 ml-0.5" />
            </a>
          </div>
        )}
      </div>

      {/* 5. Bottom Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 pt-2">
        <button
          type="button"
          onClick={handleReset}
          className="w-full sm:flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 text-stone-300 font-semibold text-xs transition-colors cursor-pointer text-center"
        >
          Tạo Yêu Cầu Mới
        </button>
        <button
          type="button"
          onClick={() => handleCopyCode(`PHO1986 - Mã giữ bàn: #${bookingCode} (${formData.customerName} - ${formData.phone})`)}
          className="w-full sm:flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-red to-red-700 hover:from-brand-redhover hover:to-red-600 active:bg-red-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 text-white animate-bounce" />
              <span>Đã Sao Chép Mã ✓</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-white" />
              <span>Lưu Mã Giữ Bàn</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default React.memo(OrderStep3Success);

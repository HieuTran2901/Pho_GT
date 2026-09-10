import React from 'react';
import { Clock, Phone, AlertTriangle, Utensils, ArrowRight, KeyRound, RotateCcw } from 'lucide-react';
import PhoMascotExpression from './PhoMascotExpression';

/**
 * [SENTINEL, URBAN & RAVEN] AuthLockoutBanner
 * Banner thông báo bảo mật đa tầng mang đậm phong vị Quán Phở Gia Truyền 1986:
 * - Thay vì thông báo kỹ thuật khô khan (HTTP 429/423), dùng giọng văn dí dỏm, ấm áp của Bác Chủ Quán.
 * - Tích hợp Mascot Bé Tô Phở 1986 phản ánh đúng tâm lý và biểu cảm qua từng vòng.
 * - Hỗ trợ các nút hành động cứu nguy thông minh (Quên MK, Hotline, Đặt bàn vãng lai, Đổi số điện thoại).
 */
export default function AuthLockoutBanner({
  isPermanent = false,
  lockoutSeconds = 0,
  currentRound = 1,
  maxRounds = 5,
  errorMessage = '',
  hotline = '0986 1986 86',
  onForgotPassword,
  onGuestOrder,
  onChangePhone
}) {
  // Định dạng thời gian đếm ngược (MM:SS)
  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- TRƯỜNG HỢP 1: KHÓA CỨNG VĨNH VIỄN (PERMANENT LOCKED) ---
  if (isPermanent) {
    return (
      <div className="mb-3.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-[#3b120c] via-[#2a0c07] to-[#180503] border-2 border-red-500/80 shadow-[0_6px_25px_rgba(239,68,68,0.3)] text-[#fff8ed] animate-fadeIn">
        <div className="flex items-start gap-3">
          <PhoMascotExpression mood="locked" className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 mt-0.5" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-serif font-black text-red-300 uppercase tracking-wide">
                Niêm Phong Bảo Vệ Két • Phở 1986 🔐
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-200 font-serif font-bold border border-red-500/40">
                Đã Khóa
              </span>
            </div>

            <p className="text-[11.5px] text-stone-200 font-serif mt-1 leading-relaxed">
              {errorMessage || 'Số điện thoại này hiện đang trong trạng thái tạm khóa. Bác có thể nhập số khác hoặc gọi Hotline để Bếp Trưởng hỗ trợ mở két nhé!'}
            </p>

            <div className="mt-2.5 pt-2 border-t border-red-500/25 flex flex-wrap items-center gap-2">
              {onChangePhone && (
                <button
                  type="button"
                  onClick={onChangePhone}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 font-serif font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                  <span>Đổi số khác</span>
                </button>
              )}

              <a
                href={`tel:${hotline.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-serif font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Hotline: {hotline}</span>
              </a>

              {onGuestOrder && (
                <button
                  type="button"
                  onClick={onGuestOrder}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-serif font-medium transition-all cursor-pointer ml-auto"
                >
                  <Utensils className="w-3 h-3 text-amber-300" />
                  <span>Ăn vãng lai</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TRƯỜNG HỢP 2: TẠM KHÓA THEO VÒNG (TIERED COOLDOWN) ---
  if (lockoutSeconds > 0) {
    const remainingRounds = Math.max(0, maxRounds - currentRound);

    // Xác định cốt truyện & tâm lý Bé Tô Phở theo từng vòng
    const getRoundStory = (round) => {
      switch (round) {
        case 1:
          return {
            mood: 'tea',
            badge: 'Lệnh Quán: Thong Thả Uống Trà 🍵',
            subBadge: 'Vòng 1/5 • Tạm nghỉ 60s',
            quote: 'Ấy dà! Bác gõ nhầm mật khẩu 5 lần rồi kìa. Thong thả nhấp chén trà nóng 1 phút cho ấm bụng, thư thái đầu óc rồi gõ lại nhé bác ơi!',
            color: 'from-[#2b1609] via-[#1f0e05] to-[#150803]',
            borderColor: 'border-amber-500/80',
            accentColor: 'text-amber-300'
          };
        case 2:
          return {
            mood: 'crying',
            badge: 'Bác Ơi Đừng Bấm Nữa Nha... 🥺',
            subBadge: 'Vòng 2/5 • Tạm nghỉ 3 phút',
            quote: 'Bác ơi, chắc bác lỡ quên mật khẩu thật rồi đúng không? Đừng ráng bấm nữa mà tội nghiệp tài khoản nha! Bác bấm "Quên mật khẩu" bên dưới để quán hỗ trợ bác ngay nè.',
            color: 'from-[#2d110f] via-[#200c0a] to-[#170706]',
            borderColor: 'border-rose-500/80',
            accentColor: 'text-rose-300'
          };
        case 3:
          return {
            mood: 'suspicious',
            badge: 'Nghi Vấn: Hack Nồi Nước Dùng? 🧐',
            subBadge: 'Vòng 3/5 • Tạm nghỉ 10 phút',
            quote: 'Khoan đã nha... Bác thử sai tới vòng thứ 3 rồi đó! Có phải bác đang tính "hack" công thức nước dùng 38 năm gia truyền của quán em không? Quán bảo vệ kỹ lắm đó nghen!',
            color: 'from-[#291708] via-[#1d0f04] to-[#130902]',
            borderColor: 'border-amber-600/80',
            accentColor: 'text-amber-300'
          };
        case 4:
          return {
            mood: 'alarm',
            badge: 'Báo Động Cấp 1: Sắp Niêm Phong! 🚨',
            subBadge: 'Vòng 4/5 • Tạm nghỉ 30 phút',
            quote: 'Bác ơi, báo động cấp 1 rồi! Chỉ còn ĐÚNG 1 VÒNG THỬ NỮA là tài khoản bị niêm phong két luôn đấy ạ. Bác dừng tay lại ngay, gọi Hotline quán em hỗ trợ liền chứ đừng bấm bừa nữa nhé!',
            color: 'from-[#38100a] via-[#260a06] to-[#160402]',
            borderColor: 'border-red-500/90',
            accentColor: 'text-red-300'
          };
        default:
          return {
            mood: 'alarm',
            badge: 'Vòng Thử Cuối Cùng! ⚠️',
            subBadge: `Vòng ${round}/${maxRounds}`,
            quote: 'Cảnh báo khẩn cấp: Đây là cơ hội thử cuối cùng. Nếu nhập sai tiếp, tài khoản sẽ lập tức bị niêm phong vĩnh viễn!',
            color: 'from-[#3b120c] via-[#270b07] to-[#180503]',
            borderColor: 'border-red-500',
            accentColor: 'text-red-300'
          };
      }
    };

    const story = getRoundStory(currentRound);

    return (
      <div className={`mb-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br ${story.color} border ${story.borderColor} shadow-[0_8px_30px_rgba(245,158,11,0.25)] text-[#fff8ed] animate-fadeIn`}>
        <div className="flex items-start gap-3 sm:gap-4">
          <PhoMascotExpression mood={story.mood} className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 mt-0.5" />

          <div className="flex-1 min-w-0">
            {/* Header: Tiêu đề giọng quán phở & Đồng hồ đếm ngược */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-xs sm:text-sm font-serif font-bold ${story.accentColor}`}>
                  {story.badge}
                </span>
                <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-black/40 text-amber-200/90 font-serif border border-white/10">
                  {story.subBadge}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/60 border border-amber-500/30">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span className="font-mono font-black text-amber-400 text-xs sm:text-sm tracking-widest">
                  {formatTime(lockoutSeconds)}
                </span>
              </div>
            </div>

            {/* Thanh tiến trình số vòng thử (Vòng 1 -> 5) */}
            <div className="mt-2.5 flex items-center gap-1.5 w-full">
              {Array.from({ length: maxRounds }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    i < currentRound
                      ? 'bg-gradient-to-r from-red-500 to-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.7)]'
                      : 'bg-white/10'
                  }`}
                  title={`Vòng ${i + 1}`}
                />
              ))}
            </div>

            {/* Lời nhắn nhủ mang hồn quán phở */}
            <p className="text-[11.5px] sm:text-xs text-stone-200 font-serif mt-2.5 leading-relaxed bg-black/25 p-2 rounded-xl border border-white/5">
              "{story.quote}"
            </p>

            {/* Cảnh báo số vòng còn lại */}
            <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-amber-300/85 italic font-serif">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                {remainingRounds > 0
                  ? `Bác còn ${remainingRounds} vòng thử trước khi tài khoản bị niêm phong két.`
                  : 'CẢNH BÁO ĐỎ: Đây là vòng thử cuối cùng của bác!'}
              </span>
            </div>

            {/* Nút cứu hộ khẩn cấp theo từng vòng */}
            <div className="mt-3 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              {/* Vòng 2 hoặc khi có quên mật khẩu: Nổi bật nút Lấy lại mật khẩu */}
              {currentRound >= 2 && onForgotPassword && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 text-[11px] font-serif font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <KeyRound className="w-3 h-3 text-amber-300" />
                  <span>Quên mật khẩu? Lấy mã ngay</span>
                </button>
              )}

              {/* Vòng 3-4: Nút gọi hotline */}
              {currentRound >= 3 && (
                <a
                  href={`tel:${hotline.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/30 hover:bg-red-600/40 text-red-200 border border-red-400/40 text-[11px] font-serif font-bold transition-all"
                >
                  <Phone className="w-3 h-3 text-red-300" />
                  <span>Gọi quán: {hotline}</span>
                </a>
              )}

              {/* Nút đặt bàn vãng lai */}
              {onGuestOrder && (
                <button
                  type="button"
                  onClick={onGuestOrder}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8a1e14] hover:bg-[#a12419] text-amber-100 text-[10.5px] font-serif font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer ml-auto"
                >
                  <Utensils className="w-3 h-3" />
                  <span>Đặt bàn vãng lai</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

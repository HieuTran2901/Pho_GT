import {
  Phone,
  Soup,
  Gift,
  Eye,
  Unlock,
  AlertTriangle
} from 'lucide-react';

const TIER_META = {
  KIM_CUONG: {
    label: 'Thượng Khách Kim Cương',
    badge: 'bg-cyan-500/15 text-cyan-900 border-cyan-500/40',
    icon: '💎'
  },
  VANG: {
    label: 'Tri Kỷ Hạng Vàng',
    badge: 'bg-amber-400/25 text-amber-900 border-amber-500/50',
    icon: '👑'
  },
  BAC: {
    label: 'Khách Thân Hạng Bạc',
    badge: 'bg-slate-200 text-slate-800 border-slate-400',
    icon: '🥈'
  },
  DONG: {
    label: 'Khách Quen Hạng Đồng',
    badge: 'bg-amber-900/10 text-amber-900 border-amber-800/25',
    icon: '🥢'
  }
};

const BROTH_TEXT = {
  THANH: 'Nước thanh tao',
  DAM_DA: 'Nước đậm đà',
  BEO_NGAY: 'Nước béo ngậy mỡ gầu'
};

const ONION_TEXT = {
  NHIEU_HANH: 'Nhiều hành hoa',
  IT_HANH: 'Ít hành',
  HANH_TRAN: 'Hành trần cả củ',
  DAU_HANH: 'Đầu hành chẻ'
};

export default function AdminCustomerCard({
  customer,
  onOpenDetail,
  onQuickPoints,
  onUnlock,
  actionLoading,
  currentUser
}) {
  const isLocked = customer.status === 'LOCKED';
  const tier = TIER_META[customer.membershipTier] || TIER_META.DONG;
  const isSelfOrAdmin = Boolean(
    customer.role === 'ADMIN' ||
    (currentUser && (currentUser.id === customer.id || currentUser.phone === customer.phone))
  );


  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        isLocked
          ? 'border-rose-400/80 shadow-md shadow-rose-900/10 ring-1 ring-rose-300'
          : 'border-[#d4af37]/35 shadow-xs hover:shadow-md hover:border-[#d4af37]/70'
      }`}
    >
      {/* PHẦN ĐỈNH: THÔNG TIN KHÁCH & HẠNG HỘI VIÊN */}
      <div className="p-4 sm:p-4.5 space-y-3">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center font-serif text-base font-bold shrink-0 shadow-xs ${
                isLocked
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-gradient-to-br from-[#8a1e14] to-[#60120b] text-[#fcedc7] border border-[#d4af37]/60'
              }`}
            >
              {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'K'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-serif font-bold text-sm sm:text-base text-[#22130b] leading-tight">
                  {customer.fullName || 'Thực khách thân thiết'}
                </h4>
                {isSelfOrAdmin && (
                  <span className="px-1.5 py-0.5 text-[9px] rounded-md bg-amber-500/20 text-amber-900 border border-amber-500/40 font-serif font-bold">
                    Quản trị viên
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#8c7a6b] font-mono mt-0.5">
                <Phone className="w-3 h-3 text-amber-700" />
                <span>{customer.phone}</span>
              </div>
            </div>

          </div>

          {/* BADGE HẠNG QUÁN ĂN */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-serif text-[11px] font-bold border shrink-0 ${tier.badge}`}
          >
            <span>{tier.icon}</span>
            <span>{tier.label}</span>
          </span>
        </div>

        {/* CẢNH BÁO NẾU TÀI KHOẢN BỊ KHÓA */}
        {isLocked && (
          customer.lockType === 'ADMIN_MANUAL' ? (
            <div className="p-2.5 rounded-xl bg-rose-50/90 border border-rose-300 flex items-center justify-between text-xs text-rose-900">
              <div className="flex items-center gap-1.5 font-medium truncate max-w-[65%]">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                <span className="truncate" title={customer.lockReason || 'Khóa bởi Quản trị viên'}>
                  🚫 {customer.lockReason ? `Khóa: ${customer.lockReason}` : 'Khóa xử lý vi phạm'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onOpenDetail(customer.id)}
                className="px-2.5 py-1 rounded-lg bg-rose-900 hover:bg-rose-950 text-rose-100 font-serif text-[11px] font-bold shadow-xs transition-all shrink-0"
              >
                Xem xét mở khóa
              </button>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-300 flex items-center justify-between text-xs text-amber-950">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="text-sm">🔑</span>
                <span>Tạm khóa (Quên MK)</span>
              </div>
              <button
                type="button"
                onClick={() => onUnlock(customer.id)}
                disabled={actionLoading}
                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-serif text-[11px] font-bold shadow-xs flex items-center gap-1 transition-all shrink-0"
              >
                <Unlock className="w-3 h-3" /> Mở khóa tại bàn
              </button>
            </div>
          )
        )}

        {/* KHU VỰC TRUNG TÂM: BÁT PHỞ RUỘT & KHẨU VỊ GIA TRUYỀN */}
        <div className="p-3 rounded-xl bg-[#faf5ea] border border-[#d4af37]/25 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-serif font-bold text-[#8a1e14] flex items-center gap-1.5">
              <Soup className="w-3.5 h-3.5 text-[#8a1e14]" /> Bát Phở Ruột:
            </span>
            <span className="font-medium text-[#22130b] truncate max-w-45">
              {customer.favoriteDishName || 'Tùy chọn đa dạng'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {customer.brothType && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#d4af37]/20 text-[10px] font-medium text-[#4a3525]">
                🍲 {BROTH_TEXT[customer.brothType] || customer.brothType}
              </span>
            )}
            {customer.onionStyle && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#d4af37]/20 text-[10px] font-medium text-[#4a3525]">
                🌿 {ONION_TEXT[customer.onionStyle] || customer.onionStyle}
              </span>
            )}
            {!customer.brothType && !customer.onionStyle && (
              <span className="text-[11px] text-[#8c7a6b] italic">
                Khách chưa lưu khẩu vị riêng tại quán
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CHÂN THẺ: TỔNG KẾT CHI TIÊU & THAO TÁC 1-CHẠM */}
      <div className="px-4 py-3 bg-[#faf6ee]/80 border-t border-[#d4af37]/20 flex items-center justify-between text-xs">
        <div>
          <div className="font-mono font-bold text-sm text-[#8a1e14] flex items-center gap-1">
            <span>🪙 {customer.availablePoints || 0}</span>
            <span className="text-[10px] font-serif font-normal text-[#8c7a6b]">điểm</span>
          </div>
          <div className="text-[10px] text-[#8c7a6b] font-mono mt-0.5">
            {(customer.totalSpent || 0).toLocaleString('vi-VN')}đ • {customer.totalOrdersCount || 0} lần ghé
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* NÚT NHANH: TẶNG ĐIỂM TRI ÂN */}
          <button
            type="button"
            onClick={() => onQuickPoints(customer)}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-600/30 text-[#60120b] font-serif text-[11px] font-bold transition-all flex items-center gap-1"
            title="Tặng điểm tri ân khách quen"
          >
            <Gift className="w-3.5 h-3.5 text-amber-700" />
            <span>+50đ</span>
          </button>

          {/* NÚT MỞ CHI TIẾT */}
          <button
            type="button"
            onClick={() => onOpenDetail(customer.id)}
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#8a1e14] hover:text-white border border-[#d4af37]/40 text-[#22130b] font-serif text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem hồ sơ</span>
          </button>
        </div>
      </div>
    </div>
  );
}

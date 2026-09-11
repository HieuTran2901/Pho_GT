import { User, Phone, Mail, Award, Calendar, ShoppingBag, Coins, Soup } from 'lucide-react';

const TIER_TARGETS = {
  DONG: { name: 'Hạng Đồng', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  BAC: { name: 'Hạng Bạc', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  VANG: { name: 'Hạng Vàng', color: 'bg-amber-50 text-amber-900 border-amber-300' },
  KIM_CUONG: { name: 'Kim Cương', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' }
};

export default function CustomerInfoTab({ summary, taste }) {
  const tierInfo = TIER_TARGETS[summary?.membershipTier] || TIER_TARGETS.DONG;

  return (
    <div className="space-y-4 animate-fadeIn text-xs">
      {/* 1. THẺ THÔNG TIN CƠ BẢN */}
      <div className="p-5 rounded-2xl border border-stone-200/80 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
            <User className="w-4 h-4 text-stone-700" />
            <span>Hồ sơ thực khách</span>
          </div>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${tierInfo.color}`}>
            {tierInfo.name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center gap-3">
            <User className="w-4 h-4 text-stone-500 shrink-0" />
            <div>
              <span className="text-stone-400 block text-[10px]">Họ và tên</span>
              <span className="font-bold text-stone-800">{summary?.fullName || 'Khách vãng lai'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center gap-3">
            <Phone className="w-4 h-4 text-stone-500 shrink-0" />
            <div>
              <span className="text-stone-400 block text-[10px]">Số điện thoại</span>
              <span className="font-bold text-stone-800 font-mono">{summary?.phone || '---'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center gap-3">
            <Mail className="w-4 h-4 text-stone-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-stone-400 block text-[10px]">Email liên hệ</span>
              <span className="font-bold text-stone-800 truncate block">{summary?.email || 'Chưa cập nhật'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center gap-3">
            <Calendar className="w-4 h-4 text-stone-500 shrink-0" />
            <div>
              <span className="text-stone-400 block text-[10px]">Ngày đăng ký</span>
              <span className="font-bold text-stone-800 font-mono">
                {summary?.createdAt ? new Date(summary.createdAt).toLocaleDateString('vi-VN') : 'Mới tham gia'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CHỈ SỐ HOẠT ĐỘNG */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl border border-stone-200/80 bg-white text-center shadow-2xs">
          <span className="text-stone-500 text-[11px] block">Điểm khả dụng</span>
          <span className="text-lg font-bold font-mono text-[#e11d48] block mt-1">
            {(summary?.availablePoints || 0).toLocaleString('vi-VN')}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-stone-200/80 bg-white text-center shadow-2xs">
          <span className="text-stone-500 text-[11px] block">Tổng chi tiêu</span>
          <span className="text-sm sm:text-base font-bold font-mono text-stone-800 block mt-1">
            {(summary?.totalSpent || 0).toLocaleString('vi-VN')}đ
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-stone-200/80 bg-white text-center shadow-2xs">
          <span className="text-stone-500 text-[11px] block">Lượt ghé quán</span>
          <span className="text-lg font-bold font-mono text-stone-800 block mt-1">
            {summary?.totalOrdersCount || 0}
          </span>
        </div>
      </div>

      {/* 3. BÁT PHỞ RUỘT */}
      {taste?.favoriteDishName && (
        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8a1e14] text-amber-200 flex items-center justify-center shrink-0 shadow-xs">
              <Soup className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-amber-800 uppercase font-bold tracking-wider block">Bát Phở Ruột</span>
              <span className="text-sm font-bold text-stone-900">{taste.favoriteDishName}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

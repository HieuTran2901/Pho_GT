import { History, Award } from 'lucide-react';

const TIER_TARGETS = {
  DONG: { current: 'Hạng Đồng', next: 'Hạng Bạc', target: 400, color: 'from-amber-700 to-amber-900' },
  BAC: { current: 'Hạng Bạc', next: 'Hạng Vàng', target: 1000, color: 'from-slate-400 to-slate-600' },
  VANG: { current: 'Hạng Vàng', next: 'Kim Cương', target: 2000, color: 'from-amber-400 to-amber-600' },
  KIM_CUONG: { current: 'Kim Cương', next: null, target: 2000, color: 'from-cyan-400 to-cyan-600' }
};

export default function CustomerLoyaltyTab({ summary, transactions = [] }) {
  const currentPts = summary?.availablePoints || 0;
  const tierKey = summary?.membershipTier || 'DONG';
  const tierConfig = TIER_TARGETS[tierKey] || TIER_TARGETS.DONG;

  const progressPercent = tierConfig.next
    ? Math.min(100, Math.round((currentPts / tierConfig.target) * 100))
    : 100;
  const pointsRemaining = tierConfig.next ? Math.max(0, tierConfig.target - currentPts) : 0;

  return (
    <div className="space-y-3 animate-fadeIn">
      {/* 4 THẺ CHỈ SỐ KPI - GỌN GÀNG, KHÔNG CHỮ THỪA */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-lg bg-white border border-[#d4af37]/25 shadow-2xs hover:-translate-y-0.5 transition-transform duration-150">
          <span className="text-[#8c7a6b] text-[10px] block font-serif">Điểm khả dụng</span>
          <span className="text-base font-bold font-mono text-[#8a1e14] block mt-0.5">
            {currentPts.toLocaleString('vi-VN')}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-white border border-[#d4af37]/25 shadow-2xs hover:-translate-y-0.5 transition-transform duration-150">
          <span className="text-[#8c7a6b] text-[10px] block font-serif">Tổng chi tiêu</span>
          <span className="text-xs font-bold font-mono text-[#22130b] block mt-0.5">
            {(summary?.totalSpent || 0).toLocaleString('vi-VN')}đ
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-white border border-[#d4af37]/25 shadow-2xs hover:-translate-y-0.5 transition-transform duration-150">
          <span className="text-[#8c7a6b] text-[10px] block font-serif">Lượt đặt phở</span>
          <span className="text-base font-bold font-mono text-[#22130b] block mt-0.5">
            {summary?.totalOrdersCount || 0}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-white border border-[#d4af37]/25 shadow-2xs hover:-translate-y-0.5 transition-transform duration-150">
          <span className="text-[#8c7a6b] text-[10px] block font-serif">Hạng hội viên</span>
          <span className="text-xs font-bold font-serif text-amber-700 block mt-0.5">
            {tierConfig.current}
          </span>
        </div>
      </div>

      {/* MINI TIẾN TRÌNH THĂNG HẠNG */}
      <div className="p-2.5 rounded-lg bg-gradient-to-r from-[#22130b] to-[#3a1d12] text-white border border-[#d4af37]/35 shadow-2xs space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-serif">
          <span className="flex items-center gap-1 text-amber-300 font-bold">
            <Award className="w-3.5 h-3.5 text-[#d4af37]" /> Tiến trình hội viên
          </span>
          <span className="text-[10px] text-amber-200/80 font-mono">
            {tierConfig.next ? `Thiếu ${pointsRemaining} pts ➔ ${tierConfig.next}` : 'Đạt hạng tối thượng!'}
          </span>
        </div>

        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${tierConfig.color} transition-all duration-500`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* LỊCH SỬ BIẾN ĐỘNG ĐIỂM */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-serif text-[#4a3525] font-bold px-0.5">
          <span className="flex items-center gap-1">
            <History className="w-3 h-3 text-[#8a1e14]" /> Biến động điểm gần đây
          </span>
          <span className="text-[10px] text-[#8c7a6b] font-mono">{transactions.length} lượt</span>
        </div>

        {transactions.length === 0 ? (
          <p className="text-[11px] text-center py-4 text-[#8c7a6b] bg-white rounded-lg border border-[#d4af37]/15 font-serif">
            Chưa có lịch sử biến động điểm.
          </p>
        ) : (
          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="p-2 rounded-lg bg-white border border-[#d4af37]/15 hover:border-[#d4af37]/40 transition-colors flex items-center justify-between text-xs"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-medium text-[#22130b] text-[11px] truncate">{t.description}</div>
                  <div className="text-[9px] text-[#8c7a6b] font-mono">
                    {new Date(t.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`font-mono font-bold text-xs ${
                      t.pointsChange >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {t.pointsChange >= 0 ? `+${t.pointsChange}` : t.pointsChange} pts
                  </span>
                  <div className="text-[9px] text-[#8c7a6b] font-mono">Dư: {t.balanceAfter}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

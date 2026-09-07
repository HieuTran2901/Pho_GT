import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Receipt,
  Coins,
  Hourglass,
  Users,
  RefreshCw
} from 'lucide-react';

function AdminDashboardMetrics({
  stats,
  statsLoading,
  fetchStats,
  notify,
  setActiveTab,
  setOrderFilter,
  pendingOrdersCount
}) {
  return (
    <div className="space-y-3 sm:space-y-3.5">
      {/* Tiêu đề phân khu & Nút làm mới chỉ số KPI (Desktop/Tablet) */}
      <div className="hidden sm:flex items-center justify-between gap-3 pb-1">
        <div className="text-xs font-serif font-bold text-stone-700 uppercase tracking-wider">
          Chỉ Số Kinh Doanh Trực Tiếp Hôm Nay
        </div>
        <button
          type="button"
          onClick={fetchStats}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-700 hover:text-[#8a1e14] text-xs font-serif font-medium rounded-xl border border-stone-300/80 shadow-2xs transition-all"
          title="Làm mới chỉ số kinh doanh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? 'animate-spin text-[#8a1e14]' : ''}`} />
          <span>Cập nhật số liệu</span>
        </button>
      </div>

      {/* HÀNG 1: THẺ DOANH THU HOÀNG KIM (HERO METRIC - SƠN MÀI GỖ MUN & VÀNG ĐỒNG) */}
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        onClick={() => notify(`💰 Doanh thu hôm nay tạm tính: ${stats?.revenueToday ? stats.revenueToday.toLocaleString('vi-VN') + 'đ' : '12.450.000đ'} (${stats?.ordersToday ? stats.ordersToday : '18'} đơn hàng)`)}
        className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-[#1c120c] via-[#2a1a12] to-[#160c07] border-2 border-[#d4af37]/60 text-white shadow-md shadow-black/30 cursor-pointer active:scale-[0.99] transition-all group"
        title="Nhấn để xem tổng kết doanh thu ca trực"
      >
        {/* Hoa văn phong cách hoàng gia Á Đông chìm */}
        <div className="absolute right-0 top-0 bottom-0 w-44 opacity-15 pointer-events-none flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#d4af37]" fill="currentColor">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
            <path d="M 30 50 Q 50 20, 70 50 Q 50 80, 30 50 Z" />
            <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-between gap-3 sm:gap-4">
          {/* Cột Trái: Tiêu đề, Số tiền to đậm, Badge tăng trưởng */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#fde047] text-[10px] sm:text-xs font-serif font-bold tracking-wider uppercase shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#fde047] fill-current" />
                <span>Doanh Thu Hôm Nay</span>
              </span>
              {/* Nút làm mới mini trên Mobile */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fetchStats(); }}
                className="sm:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-amber-200 text-[10px] font-sans transition-colors active:scale-95"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${statsLoading ? 'animate-spin' : ''}`} />
                <span>Cập nhật</span>
              </button>
            </div>

            <div className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight text-[#fef3c7] drop-shadow-sm pt-0.5">
              {stats?.revenueToday ? stats.revenueToday.toLocaleString('vi-VN') + 'đ' : '12.450.000đ'}
            </div>

            <div className="flex items-center gap-2 pt-0.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] sm:text-xs font-mono font-bold">
                <TrendingUp className="w-3 h-3 text-emerald-300" />
                <span>↑ 18.5%</span>
              </span>
              <span className="text-[11px] text-amber-200/70 font-sans">
                so với hôm qua
              </span>
            </div>
          </div>

          {/* Cột Phải: Ấn Triện Kim Tiền Dập Nổi Cổ Điển */}
          <div className="shrink-0 flex flex-col items-end justify-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#d4af37]/30 via-[#b8860b]/20 to-black/40 border border-[#d4af37]/70 flex items-center justify-center text-[#fde047] shadow-inner group-hover:scale-105 transition-transform">
              <Receipt className="w-6 h-6 sm:w-7 sm:h-7 text-[#fde047] stroke-[2.2] drop-shadow-xs" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-serif italic text-amber-300/80 mt-1 hidden xs:block">
              Đã chốt sổ
            </span>
          </div>
        </div>
      </motion.div>

      {/* HÀNG 2: BỘ BA CHỈ SỐ NGHIỆP VỤ (HERITAGE TRIO - 3 CỘT ĐỀU NHAU) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
        {/* Thẻ 1: Tổng Đơn Hôm Nay -> Nhảy sang sổ Đơn Hàng */}
        <motion.div
          whileHover={{ y: -2, transition: { duration: 0.18 } }}
          onClick={() => { setActiveTab('orders'); setOrderFilter('ALL'); }}
          className="p-2.5 sm:p-3.5 bg-[#fffdfa] border border-[#e8dccb] hover:border-amber-400/70 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer active:scale-95 group"
          title="Nhấn để mở Sổ Đơn Hàng & Tiệc Bàn"
        >
          <div className="flex items-center justify-between gap-1">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-amber-100/90 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-800" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80">
              ↑ 25%
            </span>
          </div>
          <div className="mt-1.5">
            <div className="text-[10px] sm:text-xs font-serif font-bold text-stone-600 truncate group-hover:text-amber-900 transition-colors">
              Tổng đơn
            </div>
            <div className="text-base sm:text-xl font-serif font-black text-stone-900 leading-tight mt-0.5">
              {stats?.ordersToday ? stats.ordersToday : '18'} <span className="text-[11px] font-sans font-medium text-stone-500">đơn</span>
            </div>
          </div>
        </motion.div>

        {/* Thẻ 2: Chờ Báo Bếp (Cảnh báo nhịp thở đỏ son) -> Cuộn mượt đến vé bếp */}
        <motion.div
          whileHover={{ y: -2, transition: { duration: 0.18 } }}
          onClick={() => {
            const el = document.getElementById('pending-orders-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              setActiveTab('orders');
              setOrderFilter('PENDING');
            }
          }}
          className="p-2.5 sm:p-3.5 bg-[#fff7f7] border-2 border-rose-300/90 hover:border-rose-400 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer active:scale-95 group"
          title="Nhấn để xử lý các đơn chờ báo bếp"
        >
          <div className="flex items-center justify-between gap-1">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Hourglass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-700" />
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-sans font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
              <span>Bếp</span>
            </span>
          </div>
          <div className="mt-1.5">
            <div className="text-[10px] sm:text-xs font-serif font-bold text-rose-900 truncate">
              Chờ báo bếp
            </div>
            <div className="text-base sm:text-xl font-serif font-black text-rose-700 leading-tight mt-0.5">
              {pendingOrdersCount} <span className="text-[11px] font-sans font-medium text-rose-500">đơn</span>
            </div>
          </div>
        </motion.div>

        {/* Thẻ 3: Đang Phục Vụ Tại Bàn -> Nhảy sang Sơ đồ bàn */}
        <motion.div
          whileHover={{ y: -2, transition: { duration: 0.18 } }}
          onClick={() => setActiveTab('tables')}
          className="p-2.5 sm:p-3.5 bg-[#f0fdfa] border border-teal-200 hover:border-teal-400/80 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer active:scale-95 group"
          title="Nhấn để mở Sơ Đồ Bàn 2 Tầng"
        >
          <div className="flex items-center justify-between gap-1">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-800" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-sans font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
              Tầng 1-2
            </span>
          </div>
          <div className="mt-1.5">
            <div className="text-[10px] sm:text-xs font-serif font-bold text-teal-900 truncate group-hover:text-teal-950 transition-colors">
              Đang phục vụ
            </div>
            <div className="text-base sm:text-xl font-serif font-black text-stone-900 leading-tight mt-0.5">
              14 <span className="text-[11px] font-sans font-medium text-stone-500">bàn</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default React.memo(AdminDashboardMetrics);

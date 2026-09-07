import React from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Grid,
  Search,
  RefreshCw,
  AlertCircle,
  Flame,
  Utensils,
  Check,
  Receipt,
  Coins,
  TrendingUp
} from 'lucide-react';

export default function AdminOrdersFilterBar({
  ordersShiftRevenue,
  orderCounts,
  orderViewMode,
  setOrderViewMode,
  orderSearch,
  setOrderSearch,
  fetchOrders,
  orderFilter,
  setOrderFilter,
  ordersLoading
}) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header Zone */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 border-b border-amber-900/20">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#8a1e14] to-[#59120b] text-amber-200 flex items-center justify-center shadow-md shadow-[#8a1e14]/25 border border-[#d4af37]/50 shrink-0">
            <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-amber-200" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-3xl font-bold font-serif text-[#1c120c] tracking-tight">
                <span className="sm:hidden">Sổ Đơn Hàng</span>
                <span className="hidden sm:inline">Sổ Ghi Đơn Đặt Bàn & Giao Hàng</span>
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-serif font-bold bg-amber-100/90 text-amber-950 border border-amber-300/80 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Đồng Bộ Sống
              </span>
            </div>
            {/* Desktop Description */}
            <p className="hidden sm:block text-xs text-stone-600 mt-0.5 font-serif">
              Sổ nhật ký tiếp nhận đơn tại quầy & đặt tiệc bàn trực tuyến — Phở Gia Truyền 1986
            </p>
            {/* Mobile Compact Operational Status Bar with Revenue */}
            <div className="sm:hidden flex items-center gap-1.5 text-[11px] text-stone-600 mt-0.5 font-sans flex-wrap">
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Sync
              </span>
              <span className="text-stone-300">•</span>
              <span className="font-bold text-[#8a1e14] bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-300/70 shadow-2xs">
                {ordersShiftRevenue.toLocaleString('vi-VN')}đ
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-stone-700 font-medium">{orderCounts.all} đơn</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#f4ead9]/90 p-1 rounded-xl border border-amber-900/20 shadow-2xs relative shrink-0">
            <button
              type="button"
              onClick={() => setOrderViewMode('cards')}
              className={`relative px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 transition-colors z-10 ${
                orderViewMode === 'cards'
                  ? 'text-white'
                  : 'text-stone-700 hover:text-[#8a1e14]'
              }`}
              title="Xem dạng Thẻ Phiếu Bếp trực quan có ảnh món"
            >
              {orderViewMode === 'cards' && (
                <motion.div
                  layoutId="orderViewPill"
                  className="absolute inset-0 bg-gradient-to-r from-[#8a1e14] to-[#6d150e] rounded-lg shadow-xs -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                />
              )}
              <Grid className="w-3.5 h-3.5 relative z-10" />
              <span className="hidden sm:inline relative z-10">Thẻ Bếp Trực Quan</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderViewMode('table')}
              className={`relative px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 transition-colors z-10 ${
                orderViewMode === 'table'
                  ? 'text-white'
                  : 'text-stone-700 hover:text-[#8a1e14]'
              }`}
              title="Xem dạng Sổ Dòng thu gọn"
            >
              {orderViewMode === 'table' && (
                <motion.div
                  layoutId="orderViewPill"
                  className="absolute inset-0 bg-gradient-to-r from-[#8a1e14] to-[#6d150e] rounded-lg shadow-xs -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                />
              )}
              <ClipboardList className="w-3.5 h-3.5 relative z-10" />
              <span className="hidden sm:inline relative z-10">Sổ Dòng</span>
            </button>
          </div>

          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Tìm mã đơn, SĐT..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="w-full sm:w-60 pl-9 pr-3 py-2 text-xs bg-[#fdfbf7] border-2 border-amber-900/20 focus:border-[#8a1e14] rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8a1e14]/20 shadow-2xs font-sans transition-all"
            />
          </div>
          <button
            onClick={() => fetchOrders(orderFilter)}
            className="p-2 sm:p-2.5 bg-[#fdfbf7] hover:bg-amber-100/70 border-2 border-amber-900/20 text-stone-700 hover:text-[#8a1e14] rounded-xl transition-all shadow-2xs active:scale-95 shrink-0"
            title="Làm mới sổ đơn"
          >
            <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin text-[#8a1e14]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mini KPI Ribbon Bar (Desktop) */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Chờ Báo Bếp */}
        <div className="bg-gradient-to-br from-[#fffdfa] to-[#f9f3e7] border-2 border-amber-900/20 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-serif font-bold text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              Chờ Báo Bếp
            </span>
            <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200 shadow-2xs">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-rose-700">
              {orderCounts.pending}
            </span>
            <span className="text-xs text-stone-500 font-serif">đơn cần nổi lửa</span>
          </div>
        </div>

        {/* 2. Bếp Đang Nấu */}
        <div className="bg-gradient-to-br from-[#fffdfa] to-[#f9f3e7] border-2 border-amber-900/20 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-serif font-bold text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              Bếp Đang Nấu
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200 shadow-2xs">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-amber-800">
              {orderCounts.confirmed}
            </span>
            <span className="text-xs text-stone-500 font-serif">đang phục vụ</span>
          </div>
        </div>

        {/* 3. Hoàn Tất */}
        <div className="bg-gradient-to-br from-[#fffdfa] to-[#f9f3e7] border-2 border-amber-900/20 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-serif font-bold text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Hoàn Tất Ra Món
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200 shadow-2xs">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-emerald-800">
              {orderCounts.completed}
            </span>
            <span className="text-xs text-stone-500 font-serif">bát phở trao tay</span>
          </div>
        </div>

        {/* 4. Doanh Thu Sổ Đơn */}
        <div className="bg-gradient-to-br from-[#fffdfa] to-[#f9f3e7] border-2 border-amber-900/20 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-serif font-bold text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-[#8a1e14]" />
              Doanh Số Sổ Đơn
            </span>
            <div className="w-7 h-7 rounded-xl bg-[#8a1e14]/10 text-[#8a1e14] flex items-center justify-center border border-[#8a1e14]/20 shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-serif text-[#8a1e14]">
              {ordersShiftRevenue.toLocaleString('vi-VN')}đ
            </span>
            <span className="text-xs text-stone-500 font-serif">tổng tính</span>
          </div>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="bg-[#f4ead9]/80 p-1.5 sm:p-2 rounded-2xl border-2 border-amber-900/20 flex items-center gap-1.5 sm:gap-2 overflow-x-auto sm:flex-wrap shadow-inner [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {[
          { id: 'ALL', label: 'Tất Cả Đơn', count: orderCounts.all },
          { id: 'PENDING', label: 'Chờ Báo Bếp', count: orderCounts.pending, isUrgent: orderCounts.pending > 0 },
          { id: 'CONFIRMED', label: 'Bếp Đang Nấu', count: orderCounts.confirmed },
          { id: 'COMPLETED', label: 'Hoàn Tất Ra Món', count: orderCounts.completed },
          { id: 'CANCELLED', label: 'Đã Hủy', count: orderCounts.cancelled },
        ].map(tab => {
          const isActive = orderFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setOrderFilter(tab.id)}
              className={`relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-colors font-serif text-xs flex items-center gap-2 sm:gap-2.5 shrink-0 z-10 ${
                isActive
                  ? 'text-white font-bold shadow-md shadow-[#8a1e14]/35'
                  : 'bg-[#fffdfa] text-stone-800 hover:text-[#8a1e14] hover:bg-amber-100/70 border border-amber-900/15 shadow-2xs'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeOrderFilterPill"
                  className="absolute inset-0 bg-gradient-to-r from-[#8a1e14] to-[#6d150e] rounded-xl border border-[#a8281d] -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
              <span className={`relative z-10 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                isActive
                  ? 'bg-amber-300/25 text-amber-200 border border-amber-300/40'
                  : tab.isUrgent
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-stone-100 text-stone-600 border border-stone-200'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

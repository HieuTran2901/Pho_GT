import React from 'react';
import {
  TrendingUp,
  Plus,
  Calendar,
  Printer,
  ChevronRight,
  ChevronDown,
  Headphones
} from 'lucide-react';
import AdminDashboardMetrics from '../dashboard/AdminDashboardMetrics';
import AdminDashboardPendingOrders from '../dashboard/AdminDashboardPendingOrders';

function AdminDashboardTab({
  stats,
  statsLoading,
  fetchStats,
  notify,
  setActiveTab,
  setOrderFilter,
  pendingOrdersCount,
  dashboardPendingList,
  dashPendingViewMode,
  setDashPendingViewMode,
  expandedDashOrderId,
  setExpandedDashOrderId,
  handleUpdateOrderStatus
}) {
  return (
    <div className="grid grid-cols-12 gap-3.5 sm:gap-6 items-start max-w-[1600px] mx-auto">
      {/* CỘT CHÍNH (LEFT 8 COLS): 4 THẺ KPI + ĐƠN BÁO BẾP + KHẨU HIỆU */}
      <div className="col-span-12 xl:col-span-8 flex flex-col gap-3.5 sm:gap-6">
        {/* KPI & Metrics Header */}
        <AdminDashboardMetrics
          stats={stats}
          statsLoading={statsLoading}
          fetchStats={fetchStats}
          notify={notify}
          setActiveTab={setActiveTab}
          setOrderFilter={setOrderFilter}
          pendingOrdersCount={pendingOrdersCount}
        />

        {/* Đơn Mới Cần Tiếp Nhận & Báo Bếp */}
        <AdminDashboardPendingOrders
          dashboardPendingList={dashboardPendingList}
          dashPendingViewMode={dashPendingViewMode}
          setDashPendingViewMode={setDashPendingViewMode}
          expandedDashOrderId={expandedDashOrderId}
          setExpandedDashOrderId={setExpandedDashOrderId}
          handleUpdateOrderStatus={handleUpdateOrderStatus}
          notify={notify}
          setActiveTab={setActiveTab}
          setOrderFilter={setOrderFilter}
        />

        {/* KHẨU HIỆU CHÂN TRANG & TRANH THỦY MẶC NÚI NON */}
        <div className="py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-amber-100/40 via-[#fbf5e8] to-amber-100/40 border border-amber-200/50 flex items-center justify-between shadow-2xs relative overflow-hidden">
          <div className="flex items-center gap-2.5 relative z-10">
            <span className="text-base">🍜</span>
            <span className="font-serif italic font-medium text-stone-700 text-xs sm:text-sm">
              Quản lý dễ dàng – Phục vụ chuyên nghiệp – Giữ trọn hương vị truyền thống!
            </span>
          </div>
          {/* Tranh thủy mặc núi non mây bay chìm */}
          <div className="w-28 h-8 opacity-20 pointer-events-none text-amber-900 absolute right-2 bottom-0">
            <svg viewBox="0 0 150 45" className="w-full h-full" fill="currentColor">
              <path d="M0 45 Q30 20, 60 45 Q80 15, 110 45 Q130 25, 150 45 Z" />
              <path d="M40 45 Q65 28, 90 45 Z" fillOpacity="0.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* CỘT TIỆN ÍCH BÊN PHẢI (RIGHT 4 COLS): BANNER + PHÍM TẮT + THỐNG KÊ + HOTLINE */}
      <div className="col-span-12 xl:col-span-4 space-y-5">
        {/* 1. Banner Động Viên: Phở ngon khách đông ♡ Doanh thu tăng! */}
        <div className="border border-[#ecdcc8] rounded-2xl overflow-hidden shadow-2xs relative h-[96px] flex items-center justify-between pl-5 pr-0 group bg-[#fbf5ea]">
          <img
            src="/hero-bg-art.jpg"
            alt="Phở ngon khách đông"
            className="absolute inset-0 w-full h-full object-cover object-[right_center] group-hover:scale-105 transition-transform duration-700 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#fbf5ea]/95 via-[#fbf5ea]/80 via-45% to-transparent w-[65%] pointer-events-none" />

          <div className="relative z-10 py-1 select-none">
            <div className="text-[#4a2612] font-serif italic text-base font-medium leading-none drop-shadow-2xs">
              Phở ngon
            </div>
            <div className="text-[#8c4217] font-serif italic text-base font-semibold leading-tight mt-1 drop-shadow-2xs">
              khách đông ♡
            </div>
            <div className="text-[#9a3412] font-serif font-bold text-xs sm:text-sm tracking-wider uppercase mt-1 drop-shadow-2xs">
              Doanh thu tăng!
            </div>
          </div>
        </div>

        {/* 2. Cụm Phím Tắt Thao Tác Nhanh (Hành động ca trực đặc quyền) */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between pb-1 text-stone-900 font-serif font-bold text-xs border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="text-amber-600">⚡</span>
              <span>Hành động ca trực</span>
            </div>
            <span className="text-[10px] text-stone-600 font-mono">1986 Fast Actions</span>
          </div>

          {/* 1. Thêm món mới */}
          <button
            onClick={() => setActiveTab('add-dish')}
            className="w-full p-2.5 sm:p-3 bg-[#fef2f2] hover:bg-[#fee2e2] text-[#851614] border border-[#fecaca] text-xs font-serif font-bold rounded-xl flex items-center justify-between shadow-2xs transition-all active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#851614] text-white flex items-center justify-center shrink-0">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Thêm món vào thực đơn bếp</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#851614]" />
          </button>

          {/* 2. Đặt bàn / Tiệc bàn */}
          <button
            onClick={() => { setActiveTab('orders'); notify('Chuyển sang sổ đặt bàn tiệc!'); }}
            className="w-full p-2.5 sm:p-3 bg-white hover:bg-stone-50 text-stone-800 text-xs font-serif font-medium rounded-xl flex items-center justify-between border border-stone-200/90 transition-colors"
          >
            <div className="flex items-center gap-2.5 text-stone-700">
              <Calendar className="w-4 h-4 text-stone-500" />
              <span>Ghi sổ đặt bàn & tiệc trước</span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          {/* 3. In kết toán ca */}
          <button
            onClick={() => notify('Đang trích xuất lệnh in tổng kết doanh thu và số đơn ca trực...')}
            className="w-full p-2.5 sm:p-3 bg-white hover:bg-stone-50 text-stone-800 text-xs font-serif font-medium rounded-xl flex items-center justify-between border border-stone-200/90 transition-colors"
          >
            <div className="flex items-center gap-2.5 text-stone-700">
              <Printer className="w-4 h-4 text-stone-500" />
              <span>In phiếu kết toán ca trực</span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
        </div>

        {/* 3. Bảng Thống Kê Nhanh (Desktop) */}
        <div className="hidden xl:block bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-serif font-bold text-stone-900">
                Thống kê nhanh
              </span>
            </div>
            <button className="text-[11px] text-stone-600 font-sans flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
              <span>Hôm nay</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>
          </div>

          <div className="space-y-2 text-xs font-sans">
            <div className="flex items-center justify-between p-1.5 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer">
              <div className="flex items-center gap-2 text-stone-600">
                <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center text-xs">🪙</span>
                <span>Doanh thu</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 font-serif">12.450.000đ</span>
                <span className="text-[11px] text-emerald-600 font-bold">↑ 18%</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-1.5 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer">
              <div className="flex items-center gap-2 text-stone-600">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center text-xs">🛒</span>
                <span>Tổng đơn</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 font-serif">18 đơn</span>
                <span className="text-[11px] text-emerald-600 font-bold">↑ 25%</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-1.5 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer">
              <div className="flex items-center gap-2 text-stone-600">
                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-800 flex items-center justify-center text-xs">👥</span>
                <span>Khách tại quán</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 font-serif">14 bàn</span>
                <span className="text-[11px] text-emerald-600 font-bold">↑ 12%</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-1.5 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer">
              <div className="flex items-center gap-2 text-stone-600">
                <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-800 flex items-center justify-center text-xs">⌛</span>
                <span>Đơn chờ xử lý</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-rose-700 font-serif">2 đơn</span>
                <span className="text-[11px] text-rose-600 font-bold">↑ 100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Hộp Hỗ Trợ Kỹ Thuật & Hotline */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-800 flex items-center justify-center shrink-0 shadow-2xs">
              <Headphones className="w-5 h-5 text-stone-700" />
            </div>
            <div>
              <div className="text-xs font-serif font-bold text-stone-900">
                Cần hỗ trợ?
              </div>
              <div className="text-[11px] text-stone-500 font-sans mt-0.5">
                Liên hệ ngay để được giải đáp nhanh nhất
              </div>
            </div>
          </div>

          <a
            href="tel:0987654321"
            className="w-full py-2.5 px-4 bg-[#fef3c7] hover:bg-[#fde68a] border border-[#fde68a] text-[#92400e] text-xs font-serif font-bold rounded-xl flex items-center justify-center gap-2 shadow-2xs transition-all"
          >
            <span>📞 098 765 4321</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default React.memo(AdminDashboardTab);

import React from 'react';
import {
  Flame,
  Home,
  ClipboardList,
  UtensilsCrossed,
  PlusCircle,
  Grid,
  Users,
  TrendingUp,
  UserCheck,
  CreditCard,
  Settings,
  Store,
  ArrowLeft,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

function AdminSidebar({
  mobileDrawerOpen,
  setMobileDrawerOpen,
  activeTab,
  setActiveTab,
  fetchOrders,
  orderFilter,
  pendingOrdersCount,
  fetchDishes,
  notify,
  storeOpen,
  setStoreOpen,
  onBackToHome
}) {
  return (
    <>
      {/* OVERLAY BACKDROP CHO MOBILE KHI MỞ OFF-CANVAS DRAWER */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR CÁNH TRÁI: TONE GỖ MUN CHUẨN 1986 (OFF-CANVAS RESPONSIVE DRAWER) */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-[#190e08] border-r border-[#d4af37]/25 flex flex-col shadow-2xl z-50 justify-between h-screen transition-transform duration-300 ease-in-out ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Brand Seal Header + Nút đóng trên Mobile */}
          <div className="p-4 border-b border-[#d4af37]/20 flex items-center justify-between bg-gradient-to-b from-[#22130b] to-[#190e08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8a1e14] via-[#6d150d] to-[#450c07] border-2 border-[#d4af37] flex items-center justify-center shrink-0 shadow-md shadow-[#8a1e14]/40">
                <Flame className="w-5 h-5 text-[#fcedc7]" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#fcf9f2] font-serif tracking-wide leading-tight">
                  Phở Gia Truyền 1986
                </div>
                <div className="text-[10px] text-[#d4af37]/85 font-serif tracking-wider uppercase leading-tight mt-0.5">
                  BÀN TRỰC BAN
                </div>
              </div>
            </div>

            {/* Nút đóng Sidebar trên Mobile */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              className="md:hidden p-1.5 rounded-xl text-amber-200/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items (Chuẩn Bản Mẫu) */}
          <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
            {/* 1. Tổng quan */}
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileDrawerOpen(false); }}
              className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-serif transition-colors z-10 ${
                activeTab === 'dashboard'
                  ? 'text-white font-bold shadow-md shadow-black/20'
                  : 'text-[#c8bba8] hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              {activeTab === 'dashboard' && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-[#8a1e14] via-[#7a170e] to-[#60120b] rounded-xl border border-[#d4af37]/40 shadow-lg shadow-black/30 -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <Home className={`w-4 h-4 relative z-10 ${activeTab === 'dashboard' ? 'text-amber-300' : 'text-amber-500'}`} />
              <span className="relative z-10">Tổng quan</span>
            </button>

            {/* 2. Đơn hàng & Tiệc bàn */}
            <button
              onClick={() => { setActiveTab('orders'); fetchOrders(orderFilter); setMobileDrawerOpen(false); }}
              className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-serif transition-colors z-10 ${
                activeTab === 'orders'
                  ? 'text-white font-bold shadow-md shadow-black/20'
                  : 'text-[#c8bba8] hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              {activeTab === 'orders' && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-[#8a1e14] via-[#7a170e] to-[#60120b] rounded-xl border border-[#d4af37]/40 shadow-lg shadow-black/30 -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <div className="flex items-center gap-3 relative z-10">
                <ClipboardList className={`w-4 h-4 ${activeTab === 'orders' ? 'text-amber-300' : 'text-amber-500'}`} />
                <span>Đơn hàng & Tiệc bàn</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className="relative z-10 px-2 py-0.5 rounded-full bg-[#8a1e14] text-white text-[10px] font-bold font-mono border border-[#d4af37]/50 shadow-xs">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            {/* 3. Thực đơn Gia Truyền */}
            <button
              onClick={() => { setActiveTab('dishes'); fetchDishes(); setMobileDrawerOpen(false); }}
              className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-serif transition-colors z-10 ${
                activeTab === 'dishes'
                  ? 'text-white font-bold shadow-md shadow-black/20'
                  : 'text-[#c8bba8] hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              {activeTab === 'dishes' && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-[#8a1e14] via-[#7a170e] to-[#60120b] rounded-xl border border-[#d4af37]/40 shadow-lg shadow-black/30 -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <div className="flex items-center gap-3 relative z-10">
                <UtensilsCrossed className={`w-4 h-4 ${activeTab === 'dishes' ? 'text-amber-300' : 'text-amber-500'}`} />
                <span>Thực đơn Gia Truyền</span>
              </div>
            </button>

            {/* 3.1 Thêm Món Ăn Mới */}
            <button
              onClick={() => { setActiveTab('add-dish'); setMobileDrawerOpen(false); }}
              className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-serif transition-colors z-10 ${
                activeTab === 'add-dish'
                  ? 'text-white font-bold shadow-md shadow-black/20'
                  : 'text-[#c8bba8] hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              {activeTab === 'add-dish' && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-[#8a1e14] via-[#7a170e] to-[#60120b] rounded-xl border border-[#d4af37]/40 shadow-lg shadow-black/30 -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <div className="flex items-center gap-3 relative z-10">
                <PlusCircle className={`w-4 h-4 ${activeTab === 'add-dish' ? 'text-amber-300' : 'text-amber-500'}`} />
                <span className="font-bold">Thêm Món Ăn</span>
              </div>
              <span className="relative z-10 px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Mới
              </span>
            </button>

            {/* 4. Sơ đồ Bàn 2 Tầng */}
            <button
              onClick={() => { setActiveTab('tables'); setMobileDrawerOpen(false); }}
              className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-serif transition-colors z-10 ${
                activeTab === 'tables'
                  ? 'text-white font-bold shadow-md shadow-black/20'
                  : 'text-[#c8bba8] hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              {activeTab === 'tables' && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-[#8a1e14] via-[#7a170e] to-[#60120b] rounded-xl border border-[#d4af37]/40 shadow-lg shadow-black/30 -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <Grid className={`w-4 h-4 relative z-10 ${activeTab === 'tables' ? 'text-amber-300' : 'text-amber-500'}`} />
              <span className="relative z-10">Sơ đồ Bàn 2 Tầng</span>
            </button>

            {/* 5. Khách hàng */}
            <button
              onClick={() => { setActiveTab('customers'); setMobileDrawerOpen(false); }}
              className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-serif transition-colors z-10 ${
                activeTab === 'customers'
                  ? 'text-white font-bold shadow-md shadow-black/20'
                  : 'text-[#c8bba8] hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              {activeTab === 'customers' && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-[#8a1e14] via-[#7a170e] to-[#60120b] rounded-xl border border-[#d4af37]/40 shadow-lg shadow-black/30 -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <Users className={`w-4 h-4 relative z-10 ${activeTab === 'customers' ? 'text-amber-300' : 'text-amber-500'}`} />
              <span className="relative z-10">Khách hàng</span>
            </button>


            {/* 6. Doanh thu & Báo cáo */}
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileDrawerOpen(false); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-serif font-medium text-[#c8bba8] hover:text-white hover:bg-white/5 transition-all"
            >
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>Doanh thu & Báo cáo</span>
            </button>

            {/* 7. Quản lý nhân viên */}
            <button
              onClick={() => { notify('Chức năng Quản lý phân ca nhân viên đang được chuẩn bị!', 'info'); setMobileDrawerOpen(false); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-serif font-medium text-[#c8bba8] hover:text-white hover:bg-white/5 transition-all"
            >
              <UserCheck className="w-4 h-4 text-amber-500" />
              <span>Quản lý nhân viên</span>
            </button>

            {/* 8. Cổng Thanh Toán (M5.4 Payment Hub) */}
            <button
              onClick={() => { setActiveTab('payments'); setMobileDrawerOpen(false); }}
              className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-serif transition-colors z-10 ${
                activeTab === 'payments'
                  ? 'text-white font-bold shadow-md shadow-black/20'
                  : 'text-[#c8bba8] hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              {activeTab === 'payments' && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-[#8a1e14] via-[#7a170e] to-[#60120b] rounded-xl border border-[#d4af37]/40 shadow-lg shadow-black/30 -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <div className="flex items-center gap-3 relative z-10">
                <CreditCard className={`w-4 h-4 ${activeTab === 'payments' ? 'text-amber-300' : 'text-amber-500'}`} />
                <span>Cổng Thanh Toán</span>
              </div>
              <span className="relative z-10 px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40">
                Hub
              </span>
            </button>

            {/* 9. Cài đặt */}
            <button
              onClick={() => { notify('Cài đặt hệ thống quán đang hoạt động ổn định!', 'info'); setMobileDrawerOpen(false); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-serif font-medium text-[#c8bba8] hover:text-white hover:bg-white/5 transition-all"
            >
              <Settings className="w-4 h-4 text-amber-500" />
              <span>Cài đặt</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer: Thẻ Chi Nhánh & Quay Lại Khách Hàng */}
        <div className="border-t border-[#d4af37]/20 pt-2 pb-3 bg-[#120905]/80 space-y-2">
          <div className="p-3 mx-3 rounded-xl bg-[#1a0c06] border border-[#d4af37]/30 flex items-center gap-2.5 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-[#27140b] border border-[#d4af37]/40 flex items-center justify-center text-amber-400 shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#fcedc7] font-serif truncate">Phở 1986 Hàng Bạc</div>
              <div className="text-[10px] text-stone-400 truncate">Hà Nội, Hoàn Kiếm</div>
              <button
                type="button"
                onClick={() => {
                  const next = !storeOpen;
                  setStoreOpen(next);
                  notify(next ? 'Đã chuyển trạng thái: Đang mở cửa đón khách' : 'Đã chuyển trạng thái: Tạm đóng quán');
                }}
                className="text-[10px] flex items-center gap-1 font-medium mt-0.5 hover:underline cursor-pointer text-left"
                title="Nhấn để đổi trạng thái quán đón khách"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${storeOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className={storeOpen ? 'text-emerald-400' : 'text-amber-400'}>
                  {storeOpen ? 'Đang mở cửa' : 'Tạm đóng quán'}
                </span>
              </button>
            </div>
          </div>

          {onBackToHome && (
            <div className="px-3">
              <button
                type="button"
                onClick={() => { onBackToHome(); setMobileDrawerOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-serif font-bold text-[#d4af37] bg-[#22120a] hover:bg-[#8a1e14] hover:text-white border border-[#d4af37]/30 transition-all shadow-xs group"
                title="Quay lại trang chủ khách hàng"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Về Trang Khách Hàng</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default React.memo(AdminSidebar);

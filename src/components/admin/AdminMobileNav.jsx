import React from 'react';
import {
  Home,
  ClipboardList,
  UtensilsCrossed,
  Grid,
  Menu
} from 'lucide-react';

function AdminMobileNav({
  activeTab,
  setActiveTab,
  fetchOrders,
  orderFilter,
  pendingOrdersCount,
  fetchDishes,
  setMobileDrawerOpen
}) {
  return (
    <nav
      aria-label="Thanh điều hướng di động quản trị"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#190e08]/95 backdrop-blur-md border-t border-[#d4af37]/30 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] px-2 py-1.5 pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* Tab 1: Tổng quan */}
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'dashboard' ? 'text-amber-300' : 'text-[#c8bba8] hover:text-white'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className={`text-[10px] font-serif ${activeTab === 'dashboard' ? 'font-bold' : 'font-medium'}`}>
            Tổng quan
          </span>
        </button>

        {/* Tab 2: Đơn hàng */}
        <button
          type="button"
          onClick={() => { setActiveTab('orders'); fetchOrders(orderFilter); }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
            activeTab === 'orders' ? 'text-amber-300' : 'text-[#c8bba8] hover:text-white'
          }`}
        >
          <div className="relative">
            <ClipboardList className="w-5 h-5 mb-0.5" />
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#8a1e14] text-white text-[9px] font-bold font-mono flex items-center justify-center border border-[#d4af37]/60">
                {pendingOrdersCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-serif ${activeTab === 'orders' ? 'font-bold' : 'font-medium'}`}>
            Đơn hàng
          </span>
        </button>

        {/* Tab 3: Thực đơn */}
        <button
          type="button"
          onClick={() => { setActiveTab('dishes'); fetchDishes(); }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'dishes' ? 'text-amber-300' : 'text-[#c8bba8] hover:text-white'
          }`}
        >
          <UtensilsCrossed className="w-5 h-5 mb-0.5" />
          <span className={`text-[10px] font-serif ${activeTab === 'dishes' ? 'font-bold' : 'font-medium'}`}>
            Thực đơn
          </span>
        </button>

        {/* Tab 4: Sơ đồ bàn */}
        <button
          type="button"
          onClick={() => setActiveTab('tables')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'tables' ? 'text-amber-300' : 'text-[#c8bba8] hover:text-white'
          }`}
        >
          <Grid className="w-5 h-5 mb-0.5" />
          <span className={`text-[10px] font-serif ${activeTab === 'tables' ? 'font-bold' : 'font-medium'}`}>
            Sơ đồ bàn
          </span>
        </button>

        {/* Tab 5: Mở Drawer / Menu phụ */}
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all text-[#c8bba8] hover:text-white"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-serif font-medium">Thêm...</span>
        </button>
      </div>
    </nav>
  );
}

export default React.memo(AdminMobileNav);

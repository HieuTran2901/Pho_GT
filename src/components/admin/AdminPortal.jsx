import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminPortalState } from './useAdminPortalState';

// Modular Admin Components
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import AdminMobileNav from './AdminMobileNav';
import AdminDashboardTab from './tabs/AdminDashboardTab';
import AdminOrdersTab from './tabs/AdminOrdersTab';
import AdminDishesTab from './tabs/AdminDishesTab';
import AdminAddDishTab from './tabs/AdminAddDishTab';
import AdminTablesTab from './tabs/AdminTablesTab';
import AdminPaymentHubTab from './tabs/AdminPaymentHubTab';
import AdminCustomersTab from './tabs/AdminCustomersTab';
import AdminDishModal from './modals/AdminDishModal';

export default function AdminPortal({ onBackToHome }) {
  const { user, logout } = useAuth();
  const s = useAdminPortalState();

  return (
    <div className="min-h-screen bg-[#faf6ee] text-[#24140b] flex font-sans relative overflow-x-hidden selection:bg-[#8a1e14] selection:text-white">
      {/* Floating Toast Notification */}
      <AnimatePresence>
        {s.notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-xl border shadow-2xl flex items-center gap-3 text-sm backdrop-blur-md ${
              s.notification.type === 'error'
                ? 'bg-rose-950/95 border-rose-600/80 text-rose-100 shadow-rose-950/50'
                : 'bg-[#1c120a]/95 border-[#d4af37] text-[#fcf9f2] shadow-[#8a1e14]/40 ring-1 ring-[#d4af37]/40'
            }`}
          >
            {s.notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#8a1e14] flex items-center justify-center text-[#d4af37] ring-1 ring-[#d4af37]/60">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="font-serif tracking-wide">{s.notification.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY BACKDROP CHO MOBILE KHI MỞ OFF-CANVAS DRAWER */}
      {s.mobileDrawerOpen && (
        <div
          onClick={() => s.setMobileDrawerOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR CÁNH TRÁI: TONE GỖ MUN CHUẨN 1986 */}
      <AdminSidebar
        activeTab={s.activeTab}
        setActiveTab={s.setActiveTab}
        orderCounts={s.orderCounts}
        pendingOrdersCount={s.orderCounts.pending}
        fetchOrders={s.fetchOrders}
        orderFilter={s.orderFilter}
        fetchDishes={s.fetchDishes}
        storeOpen={s.storeOpen}
        setStoreOpen={s.setStoreOpen}
        notify={s.notify}
        onBackToHome={onBackToHome}
        mobileDrawerOpen={s.mobileDrawerOpen}
        setMobileDrawerOpen={s.setMobileDrawerOpen}
      />

      {/* KHÔNG GIAN LÀM VIỆC CHÍNH */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#faf6ee] ml-0 md:ml-64">
        {/* HEADER TOP BAR */}
        <AdminHeader
          soundAlertEnabled={s.soundAlertEnabled}
          setSoundAlertEnabled={s.setSoundAlertEnabled}
          pendingOrdersCount={s.orderCounts.pending}
          setActiveTab={s.setActiveTab}
          setOrderFilter={s.setOrderFilter}
          notify={s.notify}
          user={user}
          logout={logout}
          setMobileDrawerOpen={s.setMobileDrawerOpen}
        />

        {/* NỘI DUNG CUỘN CHÍNH */}
        <main className="flex-1 overflow-y-auto px-3.5 pt-2.5 pb-24 sm:p-6 lg:p-7 space-y-4 sm:space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={s.activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* TAB 1: DASHBOARD */}
              {s.activeTab === 'dashboard' && (
                <AdminDashboardTab
                  stats={s.stats}
                  statsLoading={s.statsLoading}
                  fetchStats={s.fetchStats}
                  notify={s.notify}
                  setActiveTab={s.setActiveTab}
                  setOrderFilter={s.setOrderFilter}
                  pendingOrdersCount={s.orderCounts.pending}
                  dashboardPendingList={s.dashboardPendingList}
                  dashPendingViewMode={s.dashPendingViewMode}
                  setDashPendingViewMode={s.setDashPendingViewMode}
                  expandedDashOrderId={s.expandedDashOrderId}
                  setExpandedDashOrderId={s.setExpandedDashOrderId}
                  handleUpdateOrderStatus={s.handleUpdateOrderStatus}
                />
              )}

              {/* TAB 2: ORDERS */}
              {s.activeTab === 'orders' && (
                <AdminOrdersTab
                  ordersShiftRevenue={s.ordersShiftRevenue}
                  orderCounts={s.orderCounts}
                  orderViewMode={s.orderViewMode}
                  setOrderViewMode={s.setOrderViewMode}
                  orderSearch={s.orderSearch}
                  setOrderSearch={s.setOrderSearch}
                  fetchOrders={s.fetchOrders}
                  orderFilter={s.orderFilter}
                  setOrderFilter={s.setOrderFilter}
                  ordersLoading={s.ordersLoading}
                  filteredOrders={s.filteredOrders}
                  expandedOrderId={s.expandedOrderId}
                  setExpandedOrderId={s.setExpandedOrderId}
                  handleUpdateOrderStatus={s.handleUpdateOrderStatus}
                  notify={s.notify}
                  dishes={s.dishes}
                  tableExpandedOrderId={s.tableExpandedOrderId}
                  setTableExpandedOrderId={s.setTableExpandedOrderId}
                  selectedOrderIds={s.selectedOrderIds}
                  setSelectedOrderIds={s.setSelectedOrderIds}
                  toggleSelectOrder={s.toggleSelectOrder}
                  toggleSelectAllOrders={s.toggleSelectAllOrders}
                  handleBulkUpdateStatus={s.handleBulkUpdateStatus}
                />
              )}

              {/* TAB 3: DISHES */}
              {s.activeTab === 'dishes' && (
                <AdminDishesTab
                  dishes={s.dishes}
                  fetchDishes={s.fetchDishes}
                  dishesLoading={s.dishesLoading}
                  categories={s.categories}
                  dishCategoryFilter={s.dishCategoryFilter}
                  setDishCategoryFilter={s.setDishCategoryFilter}
                  dishSearch={s.dishSearch}
                  setDishSearch={s.setDishSearch}
                  dishViewMode={s.dishViewMode}
                  setDishViewMode={s.setDishViewMode}
                  openCreateDish={s.openCreateDish}
                  openEditDish={s.openEditDish}
                  handleDeleteDish={s.handleDeleteDish}
                  handleToggleDishAvailability={s.handleToggleDishAvailability}
                  filteredDishes={s.filteredDishes}
                />
              )}

              {/* TAB 4: ADD / EDIT DISH */}
              {s.activeTab === 'add-dish' && (
                <AdminAddDishTab
                  editingDish={s.editingDish}
                  dishForm={s.dishForm}
                  setDishForm={s.setDishForm}
                  categories={s.categories}
                  dishSaving={s.dishSaving}
                  handleSaveDish={s.handleSaveDish}
                  resetDishForm={s.resetDishForm}
                  setActiveTab={s.setActiveTab}
                  fetchDishes={s.fetchDishes}
                  showAdvancedDishFields={s.showAdvancedDishFields}
                  setShowAdvancedDishFields={s.setShowAdvancedDishFields}
                  mobileDishPreviewOpen={s.mobileDishPreviewOpen}
                  setMobileDishPreviewOpen={s.setMobileDishPreviewOpen}
                />
              )}

              {/* TAB 5: TABLES */}
              {s.activeTab === 'tables' && (
                <AdminTablesTab
                  orders={s.orders}
                  notify={s.notify}
                  setActiveTab={s.setActiveTab}
                  setOrderFilter={s.setOrderFilter}
                />
              )}

              {/* TAB 6: CỔNG THANH TOÁN (M5.4 PAYMENT HUB) */}
              {s.activeTab === 'payments' && (
                <AdminPaymentHubTab
                  notify={s.notify}
                />
              )}

              {/* TAB 7: QUẢN LÝ KHÁCH HÀNG */}
              {s.activeTab === 'customers' && (
                <AdminCustomersTab
                  notify={s.notify}
                />
              )}
            </motion.div>

          </AnimatePresence>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <AdminMobileNav
        activeTab={s.activeTab}
        setActiveTab={s.setActiveTab}
        orderCounts={s.orderCounts}
        pendingOrdersCount={s.orderCounts.pending}
        fetchOrders={s.fetchOrders}
        orderFilter={s.orderFilter}
        fetchDishes={s.fetchDishes}
        setMobileDrawerOpen={s.setMobileDrawerOpen}
      />

      {/* MODAL THÊM / SỬA MÓN ĂN NHANH */}
      <AdminDishModal
        dishModalOpen={s.dishModalOpen}
        setDishModalOpen={s.setDishModalOpen}
        editingDish={s.editingDish}
        dishForm={s.dishForm}
        setDishForm={s.setDishForm}
        categories={s.categories}
        dishSaving={s.dishSaving}
        handleSaveDish={s.handleSaveDish}
      />
    </div>
  );
}

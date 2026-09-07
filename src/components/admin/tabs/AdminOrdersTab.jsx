import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';
import AdminOrdersFilterBar from '../orders/AdminOrdersFilterBar';
import AdminOrdersCardsView from '../orders/AdminOrdersCardsView';
import AdminOrdersTableView from '../orders/AdminOrdersTableView';

function AdminOrdersTab({
  ordersShiftRevenue,
  orderCounts,
  orderViewMode,
  setOrderViewMode,
  orderSearch,
  setOrderSearch,
  fetchOrders,
  orderFilter,
  setOrderFilter,
  ordersLoading,
  filteredOrders,
  expandedOrderId,
  setExpandedOrderId,
  handleUpdateOrderStatus,
  notify,
  dishes,
  tableExpandedOrderId,
  setTableExpandedOrderId,
  selectedOrderIds,
  setSelectedOrderIds,
  toggleSelectOrder,
  toggleSelectAllOrders,
  handleBulkUpdateStatus
}) {
  return (
    <div className="flex flex-col gap-3 sm:gap-6 max-w-7xl mx-auto">
      {/* 1. Header, Switcher, Mini KPI & Filter Pills */}
      <AdminOrdersFilterBar
        ordersShiftRevenue={ordersShiftRevenue}
        orderCounts={orderCounts}
        orderViewMode={orderViewMode}
        setOrderViewMode={setOrderViewMode}
        orderSearch={orderSearch}
        setOrderSearch={setOrderSearch}
        fetchOrders={fetchOrders}
        orderFilter={orderFilter}
        setOrderFilter={setOrderFilter}
        ordersLoading={ordersLoading}
      />

      {/* 2. Main Order Views (Cards vs Table) */}
      <AnimatePresence mode="wait">
        {orderViewMode === 'cards' ? (
          <motion.div
            key={`order-cards-${orderFilter}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-stone-600 font-serif bg-[#fffdf9] border-2 border-amber-900/20 rounded-3xl shadow-sm">
                <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3 border border-amber-300">
                  <ClipboardList className="w-7 h-7" />
                </div>
                <div className="font-bold text-lg text-stone-900">
                  Không tìm thấy đơn hàng nào trong phân loại này
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  Hãy thử đổi bộ lọc hoặc kiểm tra lại từ khóa tìm kiếm
                </div>
              </div>
            ) : (
              <AdminOrdersCardsView
                filteredOrders={filteredOrders}
                expandedOrderId={expandedOrderId}
                setExpandedOrderId={setExpandedOrderId}
                handleUpdateOrderStatus={handleUpdateOrderStatus}
                notify={notify}
                dishes={dishes}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`order-table-${orderFilter}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            <AdminOrdersTableView
              filteredOrders={filteredOrders}
              tableExpandedOrderId={tableExpandedOrderId}
              setTableExpandedOrderId={setTableExpandedOrderId}
              selectedOrderIds={selectedOrderIds}
              setSelectedOrderIds={setSelectedOrderIds}
              toggleSelectOrder={toggleSelectOrder}
              toggleSelectAllOrders={toggleSelectAllOrders}
              handleBulkUpdateStatus={handleBulkUpdateStatus}
              handleUpdateOrderStatus={handleUpdateOrderStatus}
              notify={notify}
              dishes={dishes}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default React.memo(AdminOrdersTab);

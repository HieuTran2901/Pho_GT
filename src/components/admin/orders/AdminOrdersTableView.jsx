import React from 'react';
import AdminOrdersTableMobile from './AdminOrdersTableMobile';
import AdminOrdersTableDesktop from './AdminOrdersTableDesktop';

export default function AdminOrdersTableView({
  filteredOrders,
  tableExpandedOrderId,
  setTableExpandedOrderId,
  selectedOrderIds,
  setSelectedOrderIds,
  toggleSelectOrder,
  toggleSelectAllOrders,
  handleBulkUpdateStatus,
  handleUpdateOrderStatus,
  notify,
  dishes = []
}) {
  return (
    <div className="space-y-4">
      {/* 2A. TRÊN MOBILE: BẢNG KÊ TỐI ƯU VỪA KHÍT 100% (ZERO HORIZONTAL SCROLL) */}
      <AdminOrdersTableMobile
        filteredOrders={filteredOrders}
        tableExpandedOrderId={tableExpandedOrderId}
        setTableExpandedOrderId={setTableExpandedOrderId}
        handleUpdateOrderStatus={handleUpdateOrderStatus}
        notify={notify}
        dishes={dishes}
      />

      {/* 2B. TRÊN DESKTOP: BẢNG SỔ DÒNG KẾ TOÁN CAO CẤP */}
      <AdminOrdersTableDesktop
        filteredOrders={filteredOrders}
        selectedOrderIds={selectedOrderIds}
        setSelectedOrderIds={setSelectedOrderIds}
        toggleSelectOrder={toggleSelectOrder}
        toggleSelectAllOrders={toggleSelectAllOrders}
        handleBulkUpdateStatus={handleBulkUpdateStatus}
        handleUpdateOrderStatus={handleUpdateOrderStatus}
        notify={notify}
        dishes={dishes}
      />
    </div>
  );
}

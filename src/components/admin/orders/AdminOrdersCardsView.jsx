import React from 'react';
import AdminOrdersCardsMobile from './AdminOrdersCardsMobile';
import AdminOrdersCardsDesktop from './AdminOrdersCardsDesktop';

export default function AdminOrdersCardsView({
  filteredOrders,
  expandedOrderId,
  setExpandedOrderId,
  handleUpdateOrderStatus,
  notify,
  dishes = []
}) {
  return (
    <>
      {/* Mobile Compact Accordion Rows */}
      <AdminOrdersCardsMobile
        filteredOrders={filteredOrders}
        expandedOrderId={expandedOrderId}
        setExpandedOrderId={setExpandedOrderId}
        handleUpdateOrderStatus={handleUpdateOrderStatus}
        notify={notify}
        dishes={dishes}
      />

      {/* Desktop Rich Ticket Cards Grid */}
      <AdminOrdersCardsDesktop
        filteredOrders={filteredOrders}
        handleUpdateOrderStatus={handleUpdateOrderStatus}
        dishes={dishes}
      />
    </>
  );
}

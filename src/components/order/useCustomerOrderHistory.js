import { useState, useEffect, useCallback, useMemo } from 'react';
import { orderApi } from '../../services/orderApi';

/**
 * useCustomerOrderHistory
 * Quản lý trạng thái nạp dữ liệu, tìm kiếm, lọc theo trạng thái và đặt lại đơn hàng cho khách.
 */
export function useCustomerOrderHistory({ isOpen = false, onAddToCart, onToast } = {}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderApi.getOrderHistory();
      setOrders(data || []);
    } catch (err) {
      console.warn('[useCustomerOrderHistory] Lỗi nạp đơn:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động tải lại danh sách khi mở modal
  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen, fetchOrders]);

  const toggleExpandOrder = useCallback((orderId) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  }, []);

  // Xử lý 1-Click Đặt Lại Đơn Này
  const handleReorder = useCallback((order) => {
    if (!order?.items || order.items.length === 0) {
      if (onToast) onToast('Đơn hàng này không có danh sách món để gọi lại.');
      return;
    }

    if (onAddToCart) {
      order.items.forEach(item => {
        onAddToCart({
          id: item.dishId || item.id || Math.floor(Math.random() * 100000),
          name: item.name || item.dishName,
          price: item.unitPrice || 75000,
          quantity: item.quantity || 1,
          image: item.image || '/hero-pho.png'
        });
      });
    }

    if (onToast) {
      onToast(`Đã thêm ${order.items.length} món từ đơn ${order.orderCode} vào giỏ hàng của bạn!`);
    }
  }, [onAddToCart, onToast]);

  // Lọc và tìm kiếm danh sách đơn hàng
  const filteredOrders = useMemo(() => {
    return orders.filter(ord => {
      const matchStatus = statusFilter === 'ALL' || ord.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q ||
        ord.orderCode?.toLowerCase().includes(q) ||
        ord.note?.toLowerCase().includes(q) ||
        (ord.items && ord.items.some(i => i.name?.toLowerCase().includes(q)));
      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  // Đếm số lượng theo trạng thái trong 1 vòng lặp duy nhất O(N)
  const counts = useMemo(() => {
    const acc = { all: orders.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    for (let i = 0; i < orders.length; i++) {
      const s = orders[i].status;
      if (s === 'PENDING') acc.pending++;
      else if (s === 'CONFIRMED') acc.confirmed++;
      else if (s === 'COMPLETED') acc.completed++;
      else if (s === 'CANCELLED') acc.cancelled++;
    }
    return acc;
  }, [orders]);

  return {
    orders,
    loading,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    expandedOrderId,
    toggleExpandOrder,
    filteredOrders,
    counts,
    fetchOrders,
    handleReorder
  };
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { adminApi } from '../../../services/adminApi';

export function useAdminCustomers(notify) {
  const [customers, setCustomers] = useState([]);
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    lockedCustomers: 0,
    passwordLockedCustomers: 0,
    adminLockedCustomers: 0,
    vipCustomers: 0
  });
  const [loading, setLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');

  const [customerDetail, setCustomerDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [quickPointsTarget, setQuickPointsTarget] = useState(null); // Customer đang mở popup tặng điểm nhanh


  const debounceTimerRef = useRef(null);

  const fetchMetrics = useCallback(async () => {
    setMetricsLoading(true);
    try {
      const data = await adminApi.getCustomerMetrics();
      if (data) setMetrics(data);
    } catch {
      // Metrics fetch failure fallback silently
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  const fetchCustomers = useCallback(async (customParams = {}) => {
    setLoading(true);
    try {
      const params = {
        search: customParams.search !== undefined ? customParams.search : searchQuery,
        status: customParams.status !== undefined ? customParams.status : statusFilter,
        tier: customParams.tier !== undefined ? customParams.tier : tierFilter
      };
      const data = await adminApi.getCustomers(params);
      setCustomers(data || []);
    } catch (err) {
      notify?.(err.message || 'Không thể tải danh sách khách hàng', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, tierFilter, notify]);

  // Debounced search & filter trigger
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchCustomers();
    }, 280);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery, statusFilter, tierFilter, fetchCustomers]);

  // Initial fetch metrics
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const openDetail = useCallback(async (customerOrId) => {
    const customerId = (typeof customerOrId === 'object' && customerOrId !== null)
      ? customerOrId.id
      : customerOrId;
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const detail = await adminApi.getCustomerDetail(customerId);
      setCustomerDetail(detail);
    } catch (err) {
      notify?.(err.message || 'Không thể tải thông tin chi tiết khách hàng', 'error');
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }, [notify]);

  const closeDetail = useCallback(() => {
    setDetailModalOpen(false);
    setCustomerDetail(null);
  }, []);

  const handleStatusUpdate = useCallback(async (customerId, newStatus, reason = '') => {
    setActionLoading(true);
    try {
      const updated = await adminApi.updateCustomerStatus(customerId, { status: newStatus, reason });
      notify?.(
        newStatus === 'ACTIVE'
          ? 'Đã mở kích hoạt tài khoản thành công!'
          : 'Đã cập nhật trạng thái tài khoản sang ' + newStatus,
        'success'
      );
      // Cập nhật lại trong list
      setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...updated } : c));
      if (customerDetail && customerDetail.summary.id === customerId) {
        setCustomerDetail(prev => ({ ...prev, summary: { ...prev.summary, ...updated } }));
      }
      fetchMetrics();
    } catch (err) {
      notify?.(err.message || 'Cập nhật trạng thái thất bại', 'error');
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [customerDetail, fetchMetrics, notify]);

  const handlePointsAdjustment = useCallback(async (customerId, points, reason) => {
    setActionLoading(true);
    try {
      const updatedDetail = await adminApi.adjustCustomerPoints(customerId, { points, reason });
      notify?.(
        points >= 0
          ? `Đã cộng +${points} điểm tri ân cho khách hàng!`
          : `Đã khấu trừ ${points} điểm thành công!`,
        'success'
      );
      setCustomerDetail(updatedDetail);
      // Cập nhật lại summary trong list
      if (updatedDetail?.summary) {
        setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...updatedDetail.summary } : c));
      }
      fetchMetrics();
    } catch (err) {
      notify?.(err.message || 'Điều chỉnh điểm thất bại', 'error');
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [fetchMetrics, notify]);

  const handleUnlock = useCallback(async (customerId) => {
    setActionLoading(true);
    try {
      const updated = await adminApi.unlockCustomer(customerId);
      notify?.('Đã mở khóa khẩn cấp tài khoản khách hàng thành công!', 'success');
      setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...updated } : c));
      if (customerDetail && customerDetail.summary.id === customerId) {
        setCustomerDetail(prev => ({ ...prev, summary: { ...prev.summary, ...updated } }));
      }
      fetchMetrics();
    } catch (err) {
      notify?.(err.message || 'Mở khóa thất bại', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [customerDetail, fetchMetrics, notify]);

  const handleQuickPoints = useCallback(async (customer, points = 50, reason = 'Tặng điểm Tri Kỷ tại quầy') => {
    await handlePointsAdjustment(customer.id, points, reason);
    setQuickPointsTarget(null);
  }, [handlePointsAdjustment]);

  const handleBlacklistCustomer = useCallback(async (customerId, payload) => {
    setActionLoading(true);
    try {
      const updated = await adminApi.blacklistCustomer(customerId, payload);
      notify?.('Đã đưa vào danh sách cấm và kích hoạt phòng thủ đa tầng thành công!', 'success');
      setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...updated } : c));
      if (customerDetail && customerDetail.summary.id === customerId) {
        setCustomerDetail(prev => ({ ...prev, summary: { ...prev.summary, ...updated } }));
      }
      fetchMetrics();
      return updated;
    } catch (err) {
      notify?.(err.message || 'Thao tác cấm thất bại', 'error');
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [customerDetail, fetchMetrics, notify]);

  return {
    customers,
    metrics,
    loading,
    metricsLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    tierFilter,
    setTierFilter,
    viewMode,
    setViewMode,
    quickPointsTarget,
    setQuickPointsTarget,
    customerDetail,
    detailLoading,
    detailModalOpen,
    actionLoading,
    fetchCustomers,
    fetchMetrics,
    openDetail,
    closeDetail,
    handleStatusUpdate,
    handlePointsAdjustment,
    handleQuickPoints,
    handleUnlock,
    handleBlacklistCustomer
  };
}


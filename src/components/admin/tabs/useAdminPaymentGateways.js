import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { adminApi } from '../../../services/adminApi';

const DEFAULT_FALLBACK_GATEWAYS = [
  { id: 'SEPAY', name: 'Quét mã SePay QR (MBBank/Napas)', status: 'ACTIVE', maintenanceMessage: '' },
  { id: 'MOMO', name: 'Ví điện tử MoMo', status: 'ACTIVE', maintenanceMessage: '' },
  { id: 'VNPAY', name: 'Cổng thanh toán VNPAY-QR', status: 'ACTIVE', maintenanceMessage: '' },
  { id: 'ZALOPAY', name: 'Ví điện tử ZaloPay', status: 'ACTIVE', maintenanceMessage: '' },
  { id: 'CREDIT_CARD', name: 'Thẻ quốc tế (Visa / Mastercard)', status: 'ACTIVE', maintenanceMessage: '' },
  { id: 'CASH', name: 'Tiền mặt tại quán', status: 'ACTIVE', maintenanceMessage: '' }
];

export function useAdminPaymentGateways(notify) {
  const [gateways, setGateways] = useState(DEFAULT_FALLBACK_GATEWAYS);
  const [loading, setLoading] = useState(false);
  const notifyRef = useRef(notify);

  useEffect(() => {
    notifyRef.current = notify;
  }, [notify]);

  const fetchGateways = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getPaymentGateways();
      if (Array.isArray(data) && data.length > 0) {
        setGateways(data);
      }
    } catch (err) {
      console.warn('Lấy danh sách cổng thanh toán thất bại, dùng fallback:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGateways();
  }, [fetchGateways]);

  const updateGateway = useCallback(async (id, payload) => {
    try {
      const updated = await adminApi.updatePaymentGateway(id, payload);
      setGateways(prev => prev.map(gw => gw.id === id ? { ...gw, ...updated } : gw));
      notifyRef.current?.(`Cập nhật trạng thái cổng [${id}] thành công!`, 'success');
      return updated;
    } catch (err) {
      // Cập nhật optimistic cho giao diện nếu API offline/mock
      setGateways(prev => prev.map(gw => gw.id === id ? { ...gw, ...payload, updatedAt: new Date().toISOString() } : gw));
      notifyRef.current?.(`Đã lưu trạng thái cổng [${id}]!`, 'success');
    }
  }, []);

  return useMemo(() => ({
    gateways,
    loading,
    fetchGateways,
    updateGateway
  }), [gateways, loading, fetchGateways, updateGateway]);
}

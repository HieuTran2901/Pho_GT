import { useState, useEffect, useCallback, useMemo } from 'react';
import { orderApi } from '../../services/orderApi';

const DEFAULT_GATEWAYS = [
  { id: 'SEPAY', name: 'Quét mã SePay QR (MBBank/Napas)', status: 'ACTIVE', maintenanceMessage: '' },
  { id: 'MOMO', name: 'Ví điện tử MoMo', status: 'ACTIVE', maintenanceMessage: '' },
  { id: 'VNPAY', name: 'Cổng thanh toán VNPAY-QR', status: 'ACTIVE', maintenanceMessage: '' },
  { id: 'ZALOPAY', name: 'Ví điện tử ZaloPay', status: 'ACTIVE', maintenanceMessage: '' },
  { id: 'CREDIT_CARD', name: 'Thẻ quốc tế (Visa / Mastercard)', status: 'ACTIVE', maintenanceMessage: '' },
  { id: 'CASH', name: 'Tiền mặt tại quán', status: 'ACTIVE', maintenanceMessage: '' }
];

export function usePaymentGatewaysStatus(selectedPaymentMethod, setSelectedPaymentMethod) {
  const [gateways, setGateways] = useState(DEFAULT_GATEWAYS);
  const [loading, setLoading] = useState(false);

  const fetchGateways = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderApi.getPaymentGatewaysStatus();
      if (Array.isArray(data) && data.length > 0) {
        setGateways(data);
      }
    } catch (err) {
      console.warn('Lấy trạng thái cổng thanh toán thất bại:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGateways();
  }, [fetchGateways]);

  // Lookup map theo id
  const gatewayMap = useMemo(() => {
    const map = {};
    for (const gw of gateways) {
      map[gw.id.toUpperCase()] = gw;
    }
    return map;
  }, [gateways]);

  // Helper kiểm tra trạng thái bảo trì (MAINTENANCE)
  const isMaintenance = useCallback((method) => {
    if (!method) return false;
    let key = method.toUpperCase();
    if (key === 'VIETQR') key = 'SEPAY';
    if (key === 'POST_PAID_AT_STORE' || key === 'COD') key = 'CASH';
    const gw = gatewayMap[key];
    return gw ? gw.status === 'MAINTENANCE' : false;
  }, [gatewayMap]);

  // Helper kiểm tra trạng thái tắt (DISABLED) -> Ẩn hoàn toàn khỏi UI khách hàng
  const isDisabled = useCallback((method) => {
    if (!method) return false;
    let key = method.toUpperCase();
    if (key === 'VIETQR') key = 'SEPAY';
    if (key === 'POST_PAID_AT_STORE' || key === 'COD') key = 'CASH';
    const gw = gatewayMap[key];
    return gw ? gw.status === 'DISABLED' : false;
  }, [gatewayMap]);

  // Tự động chuyển lựa chọn sang cổng khả dụng nếu cổng đang chọn bị TẮT
  useEffect(() => {
    if (!selectedPaymentMethod || typeof setSelectedPaymentMethod !== 'function') return;
    let key = selectedPaymentMethod.toUpperCase();
    if (key === 'VIETQR') key = 'SEPAY';
    if (key === 'POST_PAID_AT_STORE' || key === 'COD') key = 'CASH';
    const gw = gatewayMap[key];
    if (gw && gw.status === 'DISABLED') {
      const cashGw = gatewayMap['CASH'];
      const sepayGw = gatewayMap['SEPAY'];
      if (key === 'SEPAY' && cashGw?.status !== 'DISABLED') {
        setSelectedPaymentMethod('POST_PAID_AT_STORE');
      } else if (key === 'CASH' && sepayGw?.status !== 'DISABLED') {
        setSelectedPaymentMethod('VIETQR');
      } else {
        const firstAvailable = gateways.find(g => g.status !== 'DISABLED');
        if (firstAvailable) {
          if (firstAvailable.id === 'SEPAY') setSelectedPaymentMethod('VIETQR');
          else if (firstAvailable.id === 'CASH') setSelectedPaymentMethod('POST_PAID_AT_STORE');
          else setSelectedPaymentMethod(firstAvailable.id);
        }
      }
    }
  }, [gatewayMap, gateways, selectedPaymentMethod, setSelectedPaymentMethod]);

  const getMaintenanceMessage = useCallback((method) => {
    if (!method) return '';
    let key = method.toUpperCase();
    if (key === 'VIETQR') key = 'SEPAY';
    if (key === 'POST_PAID_AT_STORE' || key === 'COD') key = 'CASH';
    return gatewayMap[key]?.maintenanceMessage || '';
  }, [gatewayMap]);

  return {
    gateways,
    gatewayMap,
    loading,
    isMaintenance,
    isDisabled,
    getMaintenanceMessage,
    refreshGateways: fetchGateways
  };
}

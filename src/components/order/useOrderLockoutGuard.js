import { useState, useEffect, useCallback } from 'react';
import { orderApi } from '../../services/orderApi';

/**
 * [RAVEN & URBAN] Hook quản lý chốt chặn tài khoản bị khóa trong luồng Đặt bàn & Thanh toán
 * - Pre-flight check tính hợp lệ trước khi chuyển bước
 * - Lắng nghe sự kiện toàn cục 'pho1986:account-locked'
 * - Cung cấp cơ chế phục hồi nhanh (Đổi SĐT)
 */
export function useOrderLockoutGuard({ onToast, onResetToStep1, onAccountLocked } = {}) {
  const [isOrderLocked, setIsOrderLocked] = useState(false);
  const [lockoutReason, setLockoutReason] = useState('');

  // Lắng nghe sự kiện tài khoản bị khóa toàn cục (Event-driven, 0 CPU / 0 Polling overhead)
  useEffect(() => {
    const handleAccountLocked = (e) => {
      const reason = e?.detail?.reason || 'Tài khoản hoặc số điện thoại này hiện đang bị tạm khóa dịch vụ.';
      setIsOrderLocked(true);
      setLockoutReason(reason);
      if (onAccountLocked) {
        onAccountLocked();
      }
      if (onToast) {
        onToast('Dạ, số điện thoại này đang tạm gián đoạn giao dịch theo quyết định của Quản trị viên Phở 1986.');
      }
    };

    window.addEventListener('pho1986:account-locked', handleAccountLocked);
    return () => {
      window.removeEventListener('pho1986:account-locked', handleAccountLocked);
    };
  }, [onToast, onAccountLocked]);

  // Pre-flight check trước khi chuyển từ Bước 1 sang Bước 2
  const checkOrderEligibility = useCallback(async (phone) => {
    try {
      await orderApi.checkEligibility(phone);
      setIsOrderLocked(false);
      setLockoutReason('');
      return true;
    } catch (err) {
      if (err.isLocked || err.status === 423) {
        const msg = err.message || 'Tài khoản hoặc số điện thoại này hiện đang bị tạm khóa.';
        setIsOrderLocked(true);
        setLockoutReason(msg);
        return false;
      }
      return true;
    }
  }, []);

  // Xử lý phục hồi nhanh 1-Click: Đổi số điện thoại đặt bàn
  const handleResetLockout = useCallback((clearPhoneCallback) => {
    setIsOrderLocked(false);
    setLockoutReason('');
    if (clearPhoneCallback) clearPhoneCallback();
    if (onResetToStep1) onResetToStep1();
  }, [onResetToStep1]);

  return {
    isOrderLocked,
    lockoutReason,
    setIsOrderLocked,
    setLockoutReason,
    checkOrderEligibility,
    handleResetLockout
  };
}

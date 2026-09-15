import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { loyaltyApi } from '../../services/loyaltyApi';
import { useAuth } from '../../context/AuthContext';
import { GIFT_TABS, DEFAULT_WELCOME_GIFTS } from './giftVaultConstants';

const getMyGiftsStorageKey = (currentUser) => {
  if (currentUser?.id) return `pho1986_gifts_usr_${currentUser.id}`;
  if (currentUser?.phone) return `pho1986_gifts_phone_${String(currentUser.phone).replace(/\s+/g, '')}`;
  return 'pho1986_gifts_guest';
};

export function useGiftVaultState({
  isOpen,
  user,
  cartItems = [],
  onToast,
  openAuthModal
}) {
  const { updateLoyaltyAccount, syncLoyaltySummary } = useAuth();
  const [activeTab, setActiveTab] = useState(GIFT_TABS.MY_GIFTS);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const [redeemingId, setRedeemingId] = useState(null);
  const [localPoints, setLocalPoints] = useState(null);

  const storageKey = useMemo(() => getMyGiftsStorageKey(user), [user]);
  const activeKeyRef = useRef(storageKey);

  // Quà của người dùng (nạp từ localStorage hoặc quà mặc định chào mừng)
  const [myGifts, setMyGifts] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_WELCOME_GIFTS;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_WELCOME_GIFTS;
  });

  // Tái đồng bộ quà tặng khi thay đổi tài khoản hoặc đăng nhập/đăng xuất
  useEffect(() => {
    if (activeKeyRef.current !== storageKey) {
      activeKeyRef.current = storageKey;
      try {
        const saved = localStorage.getItem(storageKey);
        setMyGifts(saved ? JSON.parse(saved) : DEFAULT_WELCOME_GIFTS);
      } catch {
        setMyGifts(DEFAULT_WELCOME_GIFTS);
      }
    }
  }, [storageKey]);

  // Lưu myGifts vào storage khi thay đổi (chỉ khi trùng khớp partition đang hoạt động)
  useEffect(() => {
    if (typeof window !== 'undefined' && storageKey && activeKeyRef.current === storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(myGifts));
      } catch {}
    }
  }, [myGifts, storageKey]);

  // Cập nhật localPoints khi user thay đổi
  useEffect(() => {
    if (user?.loyaltyAccount?.availablePoints !== undefined) {
      setLocalPoints(user.loyaltyAccount.availablePoints);
    }
  }, [user?.loyaltyAccount?.availablePoints]);

  // Điểm Tri Kỷ hiện có của người dùng (Ưu tiên localPoints realtime, fallback sang user.loyaltyAccount)
  const availablePoints = useMemo(() => {
    if (localPoints !== null) return localPoints;
    return user?.loyaltyAccount?.availablePoints ?? 120;
  }, [user, localPoints]);

  // Tải danh sách phần thưởng từ backend
  const fetchRewards = useCallback(async () => {
    setLoading(true);
    try {
      const rewards = await loyaltyApi.getAvailableRewards();
      if (Array.isArray(rewards) && rewards.length > 0) {
        setAvailableRewards(rewards);
      }
    } catch (err) {
      console.warn('[GiftVault] Không thể tải phần thưởng từ server, sử dụng dữ liệu mặc định:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải nhật ký điểm nếu đã đăng nhập (HttpOnly Cookie tự động đính kèm)
  const fetchLedger = useCallback(async () => {
    if (!user) return;
    try {
      const logs = await loyaltyApi.getLoyaltyLedger();
      if (Array.isArray(logs)) {
        setLedger(logs);
      }
    } catch (err) {
      console.warn('[GiftVault] Không thể tải nhật ký điểm:', err.message);
    }
  }, [user]);

  // Bảo toàn trạng thái USED / EXPIRED từ localStorage để tránh bị ghi đè thành ACTIVE
  const mergeWithLocalStatus = useCallback((baseGifts) => {
    if (!Array.isArray(baseGifts)) return baseGifts;
    try {
      if (typeof localStorage === 'undefined') return baseGifts;
      const saved = localStorage.getItem(storageKey);
      if (!saved) return baseGifts;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return baseGifts;

      const localMap = new Map();
      parsed.forEach((g) => {
        if (g.id) localMap.set(g.id, g);
        if (g.code) localMap.set(g.code, g);
      });

      return baseGifts.map((bg) => {
        const local = localMap.get(bg.id) || (bg.code ? localMap.get(bg.code) : null);
        if (local && (local.status === 'USED' || local.status === 'EXPIRED')) {
          return {
            ...bg,
            status: local.status,
            usedAt: local.usedAt || bg.usedAt,
            orderId: local.orderId || bg.orderId
          };
        }
        return bg;
      });
    } catch {
      return baseGifts;
    }
  }, [storageKey]);

  // Lắng nghe cập nhật khi voucher được sử dụng ở luồng đặt bàn
  useEffect(() => {
    const handleGiftVaultUpdated = (e) => {
      const { giftId, orderCode } = e?.detail || {};
      if (giftId) {
        setMyGifts((prev) => (prev || []).map((g) => {
          const match = g.id === giftId || g.code === giftId ||
            (typeof giftId === 'string' && giftId.startsWith('gift_') && g.id === giftId.slice(5)) ||
            (typeof g.id === 'string' && g.id.startsWith('gift_') && g.id.slice(5) === giftId);
          return match ? { ...g, status: 'USED', orderId: orderCode, usedAt: new Date().toISOString() } : g;
        }));
      }
    };
    window.addEventListener('pho1986:gift-vault-updated', handleGiftVaultUpdated);
    return () => window.removeEventListener('pho1986:gift-vault-updated', handleGiftVaultUpdated);
  }, []);

  // Tải ví quà tri kỷ thực tế từ Database
  const fetchMyGifts = useCallback(async () => {
    if (!user) {
      setMyGifts((prev) => mergeWithLocalStatus(prev && prev.length > 0 ? prev : DEFAULT_WELCOME_GIFTS));
      return;
    }
    try {
      const data = await loyaltyApi.getMyGifts();
      if (Array.isArray(data) && data.length > 0) {
        setMyGifts(mergeWithLocalStatus(data));
      } else {
        setMyGifts((prev) => mergeWithLocalStatus(prev && prev.length > 0 ? prev : DEFAULT_WELCOME_GIFTS));
      }
    } catch (err) {
      console.warn('[GiftVault] Không thể tải ví quà từ server:', err.message);
      setMyGifts((prev) => mergeWithLocalStatus(prev && prev.length > 0 ? prev : DEFAULT_WELCOME_GIFTS));
    }
  }, [user, mergeWithLocalStatus]);

  useEffect(() => {
    if (isOpen) {
      fetchRewards();
      fetchLedger();
      fetchMyGifts();
      if (user && syncLoyaltySummary) {
        syncLoyaltySummary().then((summary) => {
          if (summary?.account?.availablePoints !== undefined) {
            setLocalPoints(summary.account.availablePoints);
          }
        }).catch(() => {});
      }
    }
  }, [isOpen, user, fetchRewards, fetchLedger, fetchMyGifts, syncLoyaltySummary]);

  // Đổi điểm lấy quà
  const handleRedeemReward = useCallback(async (reward, skipTabSwitch = false) => {
    if (!user) {
      if (openAuthModal) {
        openAuthModal('login');
        if (onToast) onToast('Quý khách vui lòng đăng nhập để tích & đổi điểm Tri Kỷ nhé!');
      }
      return null;
    }

    if (availablePoints < (reward.pointsRequired || 0)) {
      if (onToast) onToast(`Bạn cần thêm ${(reward.pointsRequired || 0) - availablePoints} điểm nữa để đổi phần quà này!`);
      return null;
    }

    setRedeemingId(reward.id);
    try {
      const result = await loyaltyApi.redeemReward(reward.id);
      let createdGift = result?.issuedGift;

      // CẬP NHẬT ĐIỂM TRI KỶ REALTIME (0ms)
      if (result?.loyaltyAccount) {
        setLocalPoints(result.loyaltyAccount.availablePoints);
        if (updateLoyaltyAccount) {
          updateLoyaltyAccount(result.loyaltyAccount);
        }
        try {
          window.dispatchEvent(new CustomEvent('pho1986:loyalty-updated', { detail: result.loyaltyAccount }));
        } catch {}
      } else {
        setLocalPoints((prev) => Math.max(0, (prev !== null ? prev : availablePoints) - (reward.pointsRequired || 0)));
      }

      // Làm mới nhật ký điểm tức thì
      fetchLedger();

      if (createdGift) {
        setMyGifts(prev => [createdGift, ...prev.filter(g => g.id !== createdGift.id)]);
      } else {
        const newGift = {
          id: `redeemed_${reward.id}_${Date.now()}`,
          code: `TRIKY_${(reward.rewardType || 'REWARD').slice(0, 4)}_${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          title: reward.title,
          description: reward.description || 'Đổi thành công bằng điểm Tri Kỷ 1986.',
          category: reward.rewardType === 'FREE_ITEM' ? 'Món Tặng Kèm 0đ' : 'Phiếu Giảm Giá',
          rewardType: reward.rewardType || 'FREE_ITEM',
          dishId: reward.id,
          dishName: reward.title.replace(/^(01|Tặng 01)\s*/i, ''),
          discountValue: reward.discountValue || 15000,
          image: reward.title.includes('Quẩy')
            ? 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=300&q=80'
            : reward.title.includes('Trứng')
            ? 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=300&q=80'
            : 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=300&q=80',
          expiryText: 'Hạn dùng: 30 ngày',
          status: 'AVAILABLE',
          redeemedAt: new Date().toISOString()
        };
        createdGift = newGift;
        setMyGifts(prev => [newGift, ...prev]);
      }

      if (!skipTabSwitch) {
        setActiveTab(GIFT_TABS.MY_GIFTS);
        if (onToast) onToast(`Đổi thành công: "${reward.title}"! Đã thêm vào Kho quà của bạn.`);
      }
      return createdGift;
    } catch (err) {
      if (onToast) onToast(err.message || 'Đổi quà chưa thành công, vui lòng thử lại sau!');
      return null;
    } finally {
      setRedeemingId(null);
    }
  }, [user, availablePoints, openAuthModal, onToast, updateLoyaltyAccount, fetchLedger]);

  // Kiểm tra xem món quà này đã có trong giỏ hàng chưa
  const isGiftInCart = useCallback((gift) => {
    if (!Array.isArray(cartItems)) return false;
    return cartItems.some(item => item.isFreeGift && (item.giftId === gift.id || item.name === (gift.dishName || gift.title)));
  }, [cartItems]);

  return {
    activeTab,
    setActiveTab,
    myGifts,
    availableRewards,
    ledger,
    loading,
    redeemingId,
    availablePoints,
    handleRedeemReward,
    isGiftInCart
  };
}

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { loyaltyApi } from '../../services/loyaltyApi';
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
  const [activeTab, setActiveTab] = useState(GIFT_TABS.MY_GIFTS);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const [redeemingId, setRedeemingId] = useState(null);

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

  // Lấy token xác thực
  const token = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('pho1986_token') || localStorage.getItem('token');
  }, [user]);

  // Điểm Tri Kỷ hiện có của người dùng
  const availablePoints = useMemo(() => {
    return user?.loyaltyAccount?.availablePoints ?? 120;
  }, [user]);

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

  // Tải nhật ký điểm nếu đã đăng nhập
  const fetchLedger = useCallback(async () => {
    if (!token) return;
    try {
      const logs = await loyaltyApi.getLoyaltyLedger(token);
      if (Array.isArray(logs)) {
        setLedger(logs);
      }
    } catch (err) {
      console.warn('[GiftVault] Không thể tải nhật ký điểm:', err.message);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      fetchRewards();
      fetchLedger();
    }
  }, [isOpen, fetchRewards, fetchLedger]);

  // Đổi điểm lấy quà
  const handleRedeemReward = useCallback(async (reward) => {
    if (!user) {
      if (openAuthModal) {
        openAuthModal('login');
        if (onToast) onToast('Quý khách vui lòng đăng nhập để tích & đổi điểm Tri Kỷ nhé!');
      }
      return;
    }

    if (availablePoints < (reward.pointsRequired || 0)) {
      if (onToast) onToast(`Bạn cần thêm ${(reward.pointsRequired || 0) - availablePoints} điểm nữa để đổi phần quà này!`);
      return;
    }

    setRedeemingId(reward.id);
    try {
      if (token) {
        await loyaltyApi.redeemReward(reward.id, token);
      }

      // Tạo đối tượng quà mới đưa vào "Quà của tôi"
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
        status: 'ACTIVE',
        redeemedAt: new Date().toISOString()
      };

      setMyGifts(prev => [newGift, ...prev]);
      setActiveTab(GIFT_TABS.MY_GIFTS);

      if (onToast) onToast(`Đổi thành công: "${reward.title}"! Đã thêm vào Kho quà của bạn.`);
    } catch (err) {
      if (onToast) onToast(err.message || 'Đổi quà chưa thành công, vui lòng thử lại sau!');
    } finally {
      setRedeemingId(null);
    }
  }, [user, availablePoints, token, openAuthModal, onToast]);

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

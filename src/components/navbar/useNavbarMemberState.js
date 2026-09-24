import { useMemo, useCallback } from 'react';
import {
  TIER_CONFIG,
  BROTH_LABELS,
  ONION_LABELS,
  HERB_LABELS,
  CRULLER_LABELS
} from './navbarConstants';

export function useNavbarMemberState({
  user,
  onAddToCart,
  onOpenCart,
  onToast,
  setMobileMenuOpen,
  setMobileMemberSheetOpen
}) {
  // Memoized membership calculations
  const { tierInfo, totalPoints, availablePoints, pointsToNext, progressPercent, cardNumber } = useMemo(() => {
    const tierKey = user?.loyaltyAccount?.membershipTier || 'DONG';
    const info = TIER_CONFIG[tierKey] || TIER_CONFIG.DONG;
    const total = user?.loyaltyAccount?.totalPoints || 50;
    const available = user?.loyaltyAccount?.availablePoints || 50;
    const toNext = Math.max(0, info.target - total);
    const progress = Math.min(100, Math.round((total / info.target) * 100));
    const cardNum = user?.phone ? `#VIP-1986-${user.phone.replace(/\D/g, '').slice(-4) || '8888'}` : '#VIP-1986-8888';
    return {
      tierInfo: info,
      totalPoints: total,
      availablePoints: available,
      pointsToNext: toNext,
      progressPercent: progress,
      cardNumber: cardNum
    };
  }, [user]);

  // Dynamic taste summary for "GU PHỞ CỦA TÔI"
  const tasteSummary = useMemo(() => [
    user?.tasteProfile?.brothType ? (BROTH_LABELS[user.tasteProfile.brothType] || user.tasteProfile.brothType) : 'Nước đậm',
    user?.tasteProfile?.onionStyle ? (ONION_LABELS[user.tasteProfile.onionStyle] || user.tasteProfile.onionStyle) : 'Nhiều hành',
    user?.tasteProfile?.herbStyle ? (HERB_LABELS[user.tasteProfile.herbStyle] || user.tasteProfile.herbStyle) : 'Không rau mùi',
    user?.tasteProfile?.crullerPref ? (CRULLER_LABELS[user.tasteProfile.crullerPref] || user.tasteProfile.crullerPref) : 'Thêm quẩy'
  ].join(' • '), [user?.tasteProfile]);

  // Memoized favorite dish reference for 1-Click Quick Reorder
  const favoriteDish = useMemo(() => ({
    id: 'fav_pho_' + (user?.tasteProfile?.favoriteDishId || '1986'),
    name: user?.tasteProfile?.favoriteDishName || 'Phở Bò Tái Nạm Gầu Giòn 1986',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80',
    customNote: user?.tasteProfile?.customNote || 'Chuẩn vị truyền thống 1986 (Đã lưu)'
  }), [user?.tasteProfile?.favoriteDishId, user?.tasteProfile?.favoriteDishName, user?.tasteProfile?.customNote]);

  // 1-Click Quick Reorder handler
  const handleQuickReorder = useCallback(() => {
    if (onAddToCart) {
      onAddToCart(favoriteDish);
      if (setMobileMenuOpen) setMobileMenuOpen(false);
      if (setMobileMemberSheetOpen) setMobileMemberSheetOpen(false);
      if (onToast) onToast(`Đã thêm bát phở ruột vào giỏ hàng thành công!`);
    } else if (onOpenCart) {
      onOpenCart();
    }
  }, [favoriteDish, onAddToCart, onOpenCart, onToast, setMobileMenuOpen, setMobileMemberSheetOpen]);

  return {
    tierInfo,
    totalPoints,
    availablePoints,
    pointsToNext,
    progressPercent,
    cardNumber,
    tasteSummary,
    favoriteDish,
    handleQuickReorder
  };
}

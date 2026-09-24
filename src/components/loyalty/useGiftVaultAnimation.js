import { useState, useCallback } from 'react';
import { GIFT_TABS } from './giftVaultConstants';

export function useGiftVaultAnimation({ handleRedeemReward, setActiveTab, onToast }) {
  const [flyingRedeemedVoucher, setFlyingRedeemedVoucher] = useState(null);
  const [jiggleTab, setJiggleTab] = useState(null);
  const [newlyRedeemedId, setNewlyRedeemedId] = useState(null);

  const handleRedeemWithAnimation = useCallback(async (reward, coords) => {
    const redeemedGift = await handleRedeemReward(reward, Boolean(coords));
    if (!redeemedGift) return;

    if (coords && typeof window !== 'undefined') {
      const tabEl = document.getElementById('gift-vault-tab-MY_GIFTS');
      let endX = window.innerWidth / 2;
      let endY = 80;
      if (tabEl) {
        const rect = tabEl.getBoundingClientRect();
        endX = rect.left + rect.width / 2;
        endY = rect.top + rect.height / 2;
      }

      setFlyingRedeemedVoucher({
        id: Date.now() + Math.random(),
        giftId: redeemedGift.id,
        image: redeemedGift.image || reward.image,
        title: redeemedGift.title || reward.title,
        rewardType: redeemedGift.rewardType || reward.rewardType,
        discountValue: redeemedGift.discountValue || reward.discountValue,
        startX: coords.startX,
        startY: coords.startY,
        endX,
        endY
      });
    } else {
      setActiveTab(GIFT_TABS.MY_GIFTS);
    }
  }, [handleRedeemReward, setActiveTab]);

  const handleRedeemedFlightComplete = useCallback(() => {
    const flight = flyingRedeemedVoucher;
    setFlyingRedeemedVoucher(null);
    setJiggleTab(GIFT_TABS.MY_GIFTS);
    setTimeout(() => setJiggleTab(null), 800);

    setActiveTab(GIFT_TABS.MY_GIFTS);

    if (flight?.giftId) {
      setNewlyRedeemedId(flight.giftId);
      setTimeout(() => setNewlyRedeemedId(null), 3000);
    }

    if (onToast) {
      onToast(`✨ Đổi thành công: "${flight?.title || 'Phần quà'}" đã hạ cánh vào Kho Quà!`);
    }
  }, [flyingRedeemedVoucher, setActiveTab, onToast]);

  return {
    flyingRedeemedVoucher,
    jiggleTab,
    newlyRedeemedId,
    handleRedeemWithAnimation,
    handleRedeemedFlightComplete
  };
}

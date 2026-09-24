import { useState, useEffect, useMemo, useRef } from 'react';
import { useGiftVaultState } from './useGiftVaultState';
import { useGiftVaultAnimation } from './useGiftVaultAnimation';
import GiftVaultTabs from './GiftVaultTabs';
import GiftVaultLedgerTab from './GiftVaultLedgerTab';
import GiftVaultRedeemTab from './GiftVaultRedeemTab';
import GiftVaultHeader from './GiftVaultHeader';
import GiftVaultMyGiftsTab from './GiftVaultMyGiftsTab';
import GiftVaultFooter from './GiftVaultFooter';
import FlyingRedeemedVoucher from './FlyingRedeemedVoucher';
import { GIFT_TABS } from './giftVaultConstants';

export default function GiftVaultModal({
  isOpen,
  onClose,
  user,
  cartItems = [],
  onApplyGiftToCart,
  onToast,
  openAuthModal
}) {
  const {
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
  } = useGiftVaultState({
    isOpen,
    user,
    cartItems,
    onToast,
    openAuthModal
  });

  const {
    flyingRedeemedVoucher,
    jiggleTab,
    newlyRedeemedId,
    handleRedeemWithAnimation,
    handleRedeemedFlightComplete
  } = useGiftVaultAnimation({
    handleRedeemReward,
    setActiveTab,
    onToast
  });

  const handleApplyGift = (g, coords) => {
    if (onApplyGiftToCart) onApplyGiftToCart(g, coords);
    onClose();
  };

  const availableGifts = useMemo(() => (myGifts || []).filter(g => g.status !== 'USED' && g.status !== 'EXPIRED'), [myGifts]);
  const historyGifts = useMemo(() => (myGifts || []).filter(g => g.status === 'USED' || g.status === 'EXPIRED'), [myGifts]);

  const [rendered, setRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef(null);
  const touchStartYRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      setRendered(true);
      setIsClosing(false);
    } else if (rendered) {
      setIsClosing(true);
      closeTimerRef.current = setTimeout(() => {
        setRendered(false);
        setIsClosing(false);
      }, 250);
    }
    return () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); };
  }, [isOpen, rendered]);

  useEffect(() => {
    if (!rendered) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isClosing) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = orig;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [rendered, isClosing, onClose]);

  const handleTouchStart = (e) => { touchStartYRef.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    if (touchStartYRef.current === null) return;
    if (e.changedTouches[0].clientY - touchStartYRef.current > 60) onClose();
    touchStartYRef.current = null;
  };

  if (!rendered) return null;

  return (
    <div
      id="gift-vault-modal-dialog"
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs ${
        isClosing ? 'animate-gift-vault-backdrop-out' : 'animate-gift-vault-backdrop-in'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Kho Quà Tri Kỷ 1986"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Main Modal Box */}
      <div className={`relative w-full max-w-3xl max-h-[94vh] sm:max-h-[88vh] bg-[#140a07] border-t sm:border-2 border-amber-500/60 rounded-t-3xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_40px_rgba(212,175,55,0.2)] flex flex-col overflow-hidden z-10 text-stone-200 ${
        isClosing ? 'animate-gift-vault-slide-out' : 'animate-gift-vault-slide-in'
      }`}>
        {/* Mobile drag handle */}
        <div 
          className="sm:hidden w-full pt-2.5 pb-1 flex justify-center bg-[#1f0f0a] cursor-grab touch-none"
          onClick={onClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          title="Vuốt hoặc chạm để đóng"
        >
          <div className="w-10 h-1 rounded-full bg-white/30" />
        </div>

        {/* Header */}
        <GiftVaultHeader
          availablePoints={availablePoints}
          onClose={onClose}
        />

        {/* TABS CHUYỂN PHÂN MỤC */}
        <GiftVaultTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          jiggleTab={jiggleTab}
          counts={{
            [GIFT_TABS.MY_GIFTS]: availableGifts.length,
            [GIFT_TABS.REDEEM_STORE]: availableRewards.length
          }}
        />

        {/* NỘI DUNG CHÍNH (BODY) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: QUÀ CỦA TÔI */}
          {activeTab === GIFT_TABS.MY_GIFTS && (
            <GiftVaultMyGiftsTab
              availableGifts={availableGifts}
              historyGifts={historyGifts}
              isGiftInCart={isGiftInCart}
              newlyRedeemedId={newlyRedeemedId}
              onApplyGift={handleApplyGift}
              onGoToStore={() => setActiveTab(GIFT_TABS.REDEEM_STORE)}
            />
          )}

          {/* TAB 2: ĐỔI ĐIỂM TRI KỶ */}
          {activeTab === GIFT_TABS.REDEEM_STORE && (
            <GiftVaultRedeemTab
              availablePoints={availablePoints}
              availableRewards={availableRewards}
              loading={loading}
              redeemingId={redeemingId}
              onRedeem={handleRedeemWithAnimation}
            />
          )}

          {/* TAB 3: NHẬT KÝ ĐIỂM THƯỞNG */}
          {activeTab === GIFT_TABS.LEDGER && (
            <GiftVaultLedgerTab
              user={user}
              ledger={ledger}
              onClose={onClose}
              openAuthModal={openAuthModal}
            />
          )}
        </div>

        {/* Footer */}
        <GiftVaultFooter onClose={onClose} />
      </div>

      {/* FLYING REDEEMED VOUCHER ANIMATION */}
      {flyingRedeemedVoucher && (
        <FlyingRedeemedVoucher
          fly={flyingRedeemedVoucher}
          onComplete={handleRedeemedFlightComplete}
        />
      )}
    </div>
  );
}

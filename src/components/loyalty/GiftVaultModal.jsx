import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { X, ShieldCheck, Star } from 'lucide-react';
import { useGiftVaultState } from './useGiftVaultState';
import GiftVaultTabs from './GiftVaultTabs';
import GiftVoucherCard from './GiftVoucherCard';
import GiftWalletStack from './GiftWalletStack';
import CompactHeroBanner from './CompactHeroBanner';
import GiftFilterChips from './GiftFilterChips';
import GiftVaultLedgerTab from './GiftVaultLedgerTab';
import GiftVaultRedeemTab from './GiftVaultRedeemTab';
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

  const [giftStatusTab, setGiftStatusTab] = useState('AVAILABLE'); // 'AVAILABLE' | 'HISTORY'
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [flyingRedeemedVoucher, setFlyingRedeemedVoucher] = useState(null);
  const [jiggleTab, setJiggleTab] = useState(null);
  const [newlyRedeemedId, setNewlyRedeemedId] = useState(null);

  const handleApplyGift = useCallback((g, coords) => {
    if (onApplyGiftToCart) onApplyGiftToCart(g, coords);
    onClose();
  }, [onApplyGiftToCart, onClose]);

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
    setGiftStatusTab('AVAILABLE');

    if (flight?.giftId) {
      setNewlyRedeemedId(flight.giftId);
      setTimeout(() => setNewlyRedeemedId(null), 3000);
    }

    if (onToast) {
      onToast(`✨ Đổi thành công: "${flight?.title || 'Phần quà'}" đã hạ cánh vào Kho Quà!`);
    }
  }, [flyingRedeemedVoucher, setActiveTab, onToast]);

  const availableGifts = useMemo(() => (myGifts || []).filter(g => g.status !== 'USED' && g.status !== 'EXPIRED'), [myGifts]);
  const historyGifts = useMemo(() => (myGifts || []).filter(g => g.status === 'USED' || g.status === 'EXPIRED'), [myGifts]);

  const { heroGift, remainingGifts } = useMemo(() => {
    if (!availableGifts || availableGifts.length === 0) return { heroGift: null, remainingGifts: [] };
    const firstActiveFree = availableGifts.find(g => g.rewardType === 'FREE_ITEM' && !isGiftInCart(g));
    const hero = firstActiveFree || availableGifts[0];
    return { heroGift: hero, remainingGifts: availableGifts.filter(g => g.id !== hero.id) };
  }, [availableGifts, isGiftInCart]);

  const categories = useMemo(() => {
    if (!remainingGifts || remainingGifts.length === 0) return [];
    const freeCount = remainingGifts.filter(g => g.rewardType === 'FREE_ITEM').length;
    const discountCount = remainingGifts.filter(g => g.rewardType === 'DISCOUNT_CASH' || g.rewardType === 'DISCOUNT_PERCENT').length;
    const list = [{ id: 'ALL', label: 'Tất cả', count: remainingGifts.length }];
    if (freeCount > 0) list.push({ id: 'FREE_ITEM', label: 'Món 0đ', icon: '🎁', count: freeCount });
    if (discountCount > 0) list.push({ id: 'DISCOUNT', label: 'Giảm tiền', icon: '🏷️', count: discountCount });
    return list;
  }, [remainingGifts]);

  const filteredRemainingGifts = useMemo(() => {
    if (filterCategory === 'FREE_ITEM') return remainingGifts.filter(g => g.rewardType === 'FREE_ITEM');
    if (filterCategory === 'DISCOUNT') return remainingGifts.filter(g => g.rewardType === 'DISCOUNT_CASH' || g.rewardType === 'DISCOUNT_PERCENT');
    return remainingGifts;
  }, [remainingGifts, filterCategory]);

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
        <div className="relative p-4 sm:p-5 bg-gradient-to-r from-[#441710] via-[#2a0f09] to-[#1a0805] border-b border-amber-900/60 flex items-center justify-between overflow-hidden shrink-0">
          <div className="absolute right-0 top-0 bottom-0 w-2/3 pointer-events-none opacity-20 overflow-hidden">
            <svg viewBox="0 0 350 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
              <path d="M10 110 L45 75 L80 110 L120 65 L165 110 L205 55 L250 110 L290 70 L335 110" stroke="#d49e58" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M35 80 L35 140 M55 80 L55 140 M110 70 L110 140 M130 70 L130 140" stroke="#d49e58" strokeWidth="1" opacity="0.6" />
            </svg>
          </div>

          <div className="flex items-center gap-3.5 relative z-10 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#ffd97a] via-[#c88d2b] to-[#6a3c0a] p-0.5 shadow-xl shrink-0">
              <div className="w-full h-full rounded-2xl bg-[#1a0805] flex items-center justify-center text-2xl sm:text-3xl shadow-inner border border-amber-900/60">
                🎁
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-black text-lg sm:text-2xl text-[#fbf4eb] leading-tight truncate drop-shadow-sm">
                  Kho Quà Tri Kỷ 1986
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#8a1f18] text-amber-200 font-serif text-[10px] font-bold border border-red-500/50 shadow-xs hidden sm:inline-block">
                  Đặc quyền hội quán
                </span>
              </div>
              <p className="text-xs text-amber-300/90 font-serif mt-0.5 truncate">
                Phiếu thưởng ẩm thực phố cổ dành riêng cho thực khách thân thiết
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-amber-500/40 text-right shadow-inner hidden sm:block">
              <div className="text-[9px] font-serif text-amber-400 uppercase font-bold tracking-wider">Điểm Tri Kỷ</div>
              <div className="text-base font-mono font-black text-amber-300">
                {availablePoints} <span className="text-[10px] font-serif font-normal text-stone-400">điểm</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:rotate-90 cursor-pointer shadow-md"
              aria-label="Đóng hòm quà"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

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
          
          {/* ============================================================ */}
          {/* TAB 1: QUÀ CỦA TÔI (HERO SPOTLIGHT + DUAL TICKET GRID)         */}
          {/* ============================================================ */}
          {activeTab === GIFT_TABS.MY_GIFTS && (
            <div className="space-y-4">
              {myGifts.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-black/30 border border-amber-900/40">
                  <div className="w-16 h-16 rounded-full bg-stone-900 border border-amber-500/40 flex items-center justify-center mx-auto mb-3 text-3xl shadow-inner">
                    🎁
                  </div>
                  <h4 className="font-serif font-black text-base sm:text-lg text-amber-100">
                    Kho quà hiện đang trống
                  </h4>
                  <p className="text-xs text-stone-400 mt-1.5 max-w-sm mx-auto font-sans leading-relaxed">
                    Quý khách hãy ghé qua gian hàng đổi điểm hoặc thưởng thức thêm phở để tích lũy điểm Tri Kỷ nhé!
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab(GIFT_TABS.REDEEM_STORE)}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c88d2b] to-[#a06c1c] text-stone-950 font-serif font-bold text-xs shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition-all"
                  >
                    Khám phá gian hàng đổi điểm ngay
                  </button>
                </div>
              ) : (
                <>
                  {/* PHÂN ĐOẠN LỌC TRẠNG THÁI: SẴN SÀNG vs ĐÃ DÙNG */}
                  <div className="flex items-center gap-2 p-1 bg-black/40 rounded-xl border border-amber-900/40 text-xs">
                    {[
                      { id: 'AVAILABLE', label: '🎟️ Sẵn sàng dùng', count: availableGifts.length },
                      { id: 'HISTORY', label: '📜 Đã dùng & Hết hạn', count: historyGifts.length }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setGiftStatusTab(tab.id)}
                        className={`flex-1 py-1.5 px-2.5 rounded-lg font-serif font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                          giftStatusTab === tab.id
                            ? 'bg-gradient-to-r from-[#8a1f18] to-[#6a150c] text-amber-100 shadow-xs border border-amber-500/40'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <span>{tab.label}</span>
                        {tab.count > 0 && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                            giftStatusTab === tab.id ? 'bg-amber-400 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'
                          }`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* TAB CON 1: SẴN SÀNG SỬ DỤNG */}
                  {giftStatusTab === 'AVAILABLE' ? (
                    availableGifts.length === 0 ? (
                      <div className="text-center py-10 px-4 rounded-2xl bg-black/30 border border-amber-900/40">
                        <h4 className="font-serif font-black text-base text-amber-100">
                          Chưa có phiếu sẵn sàng dùng
                        </h4>
                        <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto font-sans leading-relaxed">
                          {historyGifts.length > 0
                            ? 'Các phiếu ưu đãi của quý khách đều đã được sử dụng hoặc hết hạn. Quý khách hãy xem tại mục "Đã dùng & Hết hạn" hoặc ghé gian hàng đổi điểm nhé!'
                            : 'Quý khách hãy ghé qua gian hàng đổi điểm hoặc thưởng thức thêm phở để nhận quà ẩm thực nhé!'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab(GIFT_TABS.REDEEM_STORE)}
                          className="mt-3.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c88d2b] to-[#a06c1c] text-stone-950 font-serif font-bold text-xs shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition-all"
                        >
                          Khám phá gian hàng đổi điểm ngay
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* HERO SPOTLIGHT */}
                        {heroGift && (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-amber-300 uppercase tracking-wider">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>Món Quà Tâm Điểm Chào Mừng</span>
                            </div>

                            <div className="sm:hidden">
                              <CompactHeroBanner
                                gift={heroGift}
                                isInCart={isGiftInCart(heroGift)}
                                onApply={handleApplyGift}
                              />
                            </div>

                            <div className="hidden sm:block">
                              <GiftVoucherCard
                                gift={heroGift}
                                mode="USE"
                                isHero={true}
                                isInCart={isGiftInCart(heroGift)}
                                isNewlyRedeemed={newlyRedeemedId === heroGift.id}
                                onApply={handleApplyGift}
                              />
                            </div>
                          </div>
                        )}

                        {/* DANH SÁCH VOUCHER CÒN LẠI */}
                        {remainingGifts.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-stone-400 uppercase tracking-wider">
                                <span>🏷️</span>
                                <span>Phiếu Ưu Đãi Khác ({filteredRemainingGifts.length})</span>
                              </div>
                            </div>

                            <GiftFilterChips
                              activeFilter={filterCategory}
                              onSelectFilter={setFilterCategory}
                              categories={categories}
                            />

                            <div className="sm:hidden">
                              <GiftWalletStack
                                gifts={filteredRemainingGifts}
                                mode="USE"
                                isGiftInCart={isGiftInCart}
                                newlyRedeemedId={newlyRedeemedId}
                                onApply={handleApplyGift}
                              />
                            </div>

                            <div className="hidden sm:grid sm:grid-cols-2 gap-3.5">
                              {filteredRemainingGifts.map((gift) => (
                                <GiftVoucherCard
                                  key={gift.id}
                                  gift={gift}
                                  mode="USE"
                                  isInCart={isGiftInCart(gift)}
                                  isNewlyRedeemed={newlyRedeemedId === gift.id}
                                  onApply={handleApplyGift}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )
                  ) : (
                    /* TAB CON 2: ĐÃ DÙNG & HẾT HẠN */
                    historyGifts.length === 0 ? (
                      <div className="text-center py-10 px-4 rounded-2xl bg-black/30 border border-amber-900/40">
                        <p className="text-xs text-stone-400 font-serif leading-relaxed">
                          Chưa có phiếu quà tặng nào đã sử dụng hoặc hết hạn.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-xs font-serif text-stone-400">
                          Phiếu ưu đãi đã được đóng dấu triện mộc ghi nhận sử dụng tại quán:
                        </div>

                        <div className="sm:hidden">
                          <GiftWalletStack
                            gifts={historyGifts}
                            mode="USE"
                            isGiftInCart={isGiftInCart}
                          />
                        </div>

                        <div className="hidden sm:grid sm:grid-cols-2 gap-3.5">
                          {historyGifts.map((gift) => (
                            <GiftVoucherCard
                              key={gift.id}
                              gift={gift}
                              mode="USE"
                              isInCart={false}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </>
              )}
            </div>
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
        <div className="p-3 sm:px-6 bg-[#0e0503] border-t border-amber-900/50 flex items-center justify-between text-[11px] text-stone-400 shrink-0">
          <div className="flex items-center gap-1.5 text-amber-400/90 font-serif">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Cam kết giữ gìn hương vị Phở Gia Truyền 1986</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-300 hover:text-white font-serif font-semibold cursor-pointer transition-colors"
          >
            Đóng lại
          </button>
        </div>
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

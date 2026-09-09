import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { X, Award, ShieldCheck, Star } from 'lucide-react';
import { useGiftVaultState } from './useGiftVaultState';
import GiftVaultTabs from './GiftVaultTabs';
import GiftVoucherCard from './GiftVoucherCard';
import GiftWalletStack from './GiftWalletStack';
import CompactHeroBanner from './CompactHeroBanner';
import GiftFilterChips from './GiftFilterChips';
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

  const [filterCategory, setFilterCategory] = useState('ALL');

  // Tách món quà tâm điểm (Hero Spotlight) và các ưu đãi còn lại
  const { heroGift, remainingGifts } = useMemo(() => {
    if (!myGifts || myGifts.length === 0) {
      return { heroGift: null, remainingGifts: [] };
    }
    // Ưu tiên món quà 0đ chưa dùng làm hero
    const firstActiveFree = myGifts.find(g => g.rewardType === 'FREE_ITEM' && !isGiftInCart(g));
    const hero = firstActiveFree || myGifts[0];
    const rest = myGifts.filter(g => g.id !== hero.id);
    return { heroGift: hero, remainingGifts: rest };
  }, [myGifts, isGiftInCart]);

  // Danh mục phân loại cho Filter Chips
  const categories = useMemo(() => {
    if (!remainingGifts || remainingGifts.length === 0) return [];
    const freeCount = remainingGifts.filter(g => g.rewardType === 'FREE_ITEM').length;
    const discountCount = remainingGifts.filter(g => g.rewardType === 'DISCOUNT_CASH' || g.rewardType === 'DISCOUNT_PERCENT').length;
    const list = [{ id: 'ALL', label: 'Tất cả', count: remainingGifts.length }];
    if (freeCount > 0) list.push({ id: 'FREE_ITEM', label: 'Món 0đ', icon: '🎁', count: freeCount });
    if (discountCount > 0) list.push({ id: 'DISCOUNT', label: 'Giảm tiền', icon: '🏷️', count: discountCount });
    return list;
  }, [remainingGifts]);

  // Lọc danh sách quà tặng theo chip
  const filteredRemainingGifts = useMemo(() => {
    if (filterCategory === 'FREE_ITEM') return remainingGifts.filter(g => g.rewardType === 'FREE_ITEM');
    if (filterCategory === 'DISCOUNT') return remainingGifts.filter(g => g.rewardType === 'DISCOUNT_CASH' || g.rewardType === 'DISCOUNT_PERCENT');
    return remainingGifts;
  }, [remainingGifts, filterCategory]);

  const [mounted, setMounted] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [touchStartY, setTouchStartY] = useState(null);
  const closeTimerRef = useRef(null);

  // Sync mounted state with isOpen prop for smooth entrance/exit
  useEffect(() => {
    if (isOpen) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setMounted(true);
      setIsClosing(false);
    } else if (mounted && !isClosing) {
      setIsClosing(true);
      closeTimerRef.current = setTimeout(() => {
        setMounted(false);
        setIsClosing(false);
        closeTimerRef.current = null;
      }, 250);
    }
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [isOpen, mounted, isClosing]);

  const triggerClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setMounted(false);
      setIsClosing(false);
      closeTimerRef.current = null;
      onClose();
    }, 250);
  }, [isClosing, onClose]);

  // Đóng bằng phím ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mounted && !isClosing) triggerClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mounted, isClosing, triggerClose]);

  // Khóa cuộn trang khi Modal mở
  useEffect(() => {
    if (mounted) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [mounted]);

  // Mobile Swipe down to close
  const handleTouchStart = (e) => setTouchStartY(e.touches[0].clientY);
  const handleTouchEnd = (e) => {
    if (touchStartY === null) return;
    if (e.changedTouches[0].clientY - touchStartY > 60) triggerClose();
    setTouchStartY(null);
  };

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs ${
        isClosing ? 'animate-gift-vault-backdrop-out' : 'animate-gift-vault-backdrop-in'
      }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={triggerClose} aria-hidden="true" />

      {/* Main Modal Box (Hòm Gấm Tri Kỷ 1986) */}
      <div className={`relative w-full max-w-3xl max-h-[94vh] sm:max-h-[88vh] bg-[#140a07] border-t sm:border-2 border-amber-500/60 rounded-t-3xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_40px_rgba(212,175,55,0.2)] flex flex-col overflow-hidden z-10 text-stone-200 ${
        isClosing ? 'animate-gift-vault-slide-out' : 'animate-gift-vault-slide-in'
      }`}>
        
        {/* DRAG HANDLE CHO MOBILE BOTTOM SHEET */}
        <div 
          className="sm:hidden w-full pt-2.5 pb-1 flex justify-center bg-[#1f0f0a] cursor-grab touch-none"
          onClick={triggerClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          title="Vuốt hoặc chạm để đóng"
        >
          <div className="w-10 h-1 rounded-full bg-white/30" />
        </div>

        {/* HEADER: HÒM GẤM TRI KỶ 1986 VỚI VIỀN VÀNG DÁT LỤA */}
        <div className="relative p-4 sm:p-5 bg-gradient-to-r from-[#441710] via-[#2a0f09] to-[#1a0805] border-b border-amber-900/60 flex items-center justify-between overflow-hidden shrink-0">
          {/* Họa tiết hoa văn phố cổ chìm */}
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

          {/* SỐ ĐIỂM TRI KỶ & NÚT ĐÓNG */}
          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-amber-500/40 text-right shadow-inner hidden sm:block">
              <div className="text-[9px] font-serif text-amber-400 uppercase font-bold tracking-wider">Điểm Tri Kỷ</div>
              <div className="text-base font-mono font-black text-amber-300">
                {availablePoints} <span className="text-[10px] font-serif font-normal text-stone-400">điểm</span>
              </div>
            </div>

            <button
              type="button"
              onClick={triggerClose}
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
          counts={{
            [GIFT_TABS.MY_GIFTS]: myGifts.length,
            [GIFT_TABS.REDEEM_STORE]: availableRewards.length
          }}
        />

        {/* NỘI DUNG CHÍNH (BODY) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* ============================================================ */}
          {/* TAB 1: QUÀ CỦA TÔI (HERO SPOTLIGHT + DUAL TICKET GRID)         */}
          {/* ============================================================ */}
          {activeTab === GIFT_TABS.MY_GIFTS && (
            <div className="space-y-5">
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
                  {/* PHẦN 1: HERO SPOTLIGHT CARD (MOBILE: COMPACT BANNER | DESKTOP: HERO CARD) */}
                  {heroGift && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-amber-300 uppercase tracking-wider">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>Món Quà Tâm Điểm Chào Mừng</span>
                      </div>

                      {/* MOBILE (SM:HIDDEN): DẢI LỤA COMPACT BANNER ~62PX */}
                      <div className="sm:hidden">
                        <CompactHeroBanner
                          gift={heroGift}
                          isInCart={isGiftInCart(heroGift)}
                          onApply={(g, coords) => {
                            if (onApplyGiftToCart) onApplyGiftToCart(g, coords);
                            onClose();
                          }}
                        />
                      </div>

                      {/* DESKTOP (HIDDEN SM:BLOCK): THẺ HERO RỘNG RÃI */}
                      <div className="hidden sm:block">
                        <GiftVoucherCard
                          gift={heroGift}
                          mode="USE"
                          isHero={true}
                          isInCart={isGiftInCart(heroGift)}
                          onApply={(g, coords) => {
                            if (onApplyGiftToCart) onApplyGiftToCart(g, coords);
                            onClose();
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* PHẦN 2: BỘ LỌC CHIP NHANH & DANH SÁCH VOUCHER */}
                  {remainingGifts.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-stone-400 uppercase tracking-wider">
                          <span>🏷️</span>
                          <span>Phiếu Ưu Đãi Khác ({filteredRemainingGifts.length})</span>
                        </div>
                      </div>

                      {/* CHIP PHÂN LOẠI NHANH (FILTER CHIPS) */}
                      <GiftFilterChips
                        activeFilter={filterCategory}
                        onSelectFilter={setFilterCategory}
                        categories={categories}
                      />

                      {/* GIAO DIỆN MOBILE: VÍ GẤM XẾP LỚP (APPLE WALLET STYLE) */}
                      <div className="sm:hidden">
                        <GiftWalletStack
                          gifts={filteredRemainingGifts}
                          mode="USE"
                          isGiftInCart={isGiftInCart}
                          onApply={(g, coords) => {
                            if (onApplyGiftToCart) onApplyGiftToCart(g, coords);
                            onClose();
                          }}
                        />
                      </div>

                      {/* GIAO DIỆN DESKTOP: LƯỚI VÉ 2 CỘT RỘNG RÃI */}
                      <div className="hidden sm:grid sm:grid-cols-2 gap-3.5">
                        {filteredRemainingGifts.map((gift) => (
                          <GiftVoucherCard
                            key={gift.id}
                            gift={gift}
                            mode="USE"
                            isInCart={isGiftInCart(gift)}
                            onApply={(g, coords) => {
                              if (onApplyGiftToCart) onApplyGiftToCart(g, coords);
                              onClose();
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: ĐỔI ĐIỂM TRI KỶ (GIAN HÀNG THƯỞNG 2 CỘT)              */}
          {/* ============================================================ */}
          {activeTab === GIFT_TABS.REDEEM_STORE && (
            <div className="space-y-4">
              {/* BANNER ĐIỂM TÍCH LŨY */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#2c150c] via-[#200e08] to-[#170805] border border-amber-500/40 flex items-center justify-between text-xs shadow-md">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-serif font-bold text-amber-100">Điểm Tri Kỷ khả dụng:</div>
                    <div className="text-[11px] text-stone-400 font-sans">Tích 1 điểm cho mỗi 1.000đ khi dùng phở</div>
                  </div>
                </div>
                <div className="font-mono font-black text-amber-300 text-base sm:text-lg shrink-0 pl-2">
                  {availablePoints} <span className="text-xs font-serif font-normal text-stone-400">điểm</span>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-stone-400 font-serif text-xs">
                  Đang tải danh sách phần thưởng từ gian hàng ẩm thực...
                </div>
              ) : availableRewards.length === 0 ? (
                <div className="text-center py-12 text-stone-400 font-serif text-xs">
                  Hiện chưa có phần thưởng mới. Quý khách vui lòng quay lại sau nhé!
                </div>
              ) : (
                <>
                  {/* MOBILE: VÍ ĐỔI ĐIỂM XẾP LỚP */}
                  <div className="sm:hidden">
                    <GiftWalletStack
                      gifts={availableRewards.map((reward) => ({
                        ...reward,
                        rewardType: reward.rewardType || 'FREE_ITEM',
                        image: reward.title.includes('Quẩy')
                          ? 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=300&q=80'
                          : reward.title.includes('Trứng')
                          ? 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=300&q=80'
                          : reward.title.includes('Voucher')
                          ? 'https://images.unsplash.com/photo-1576777647209-e8733d7b851d?auto=format&fit=crop&w=300&q=80'
                          : 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=300&q=80'
                      }))}
                      mode="REDEEM"
                      userPoints={availablePoints}
                      redeemingId={redeemingId}
                      onRedeem={handleRedeemReward}
                    />
                  </div>

                  {/* DESKTOP: LƯỚI ĐỔI ĐIỂM 2 CỘT */}
                  <div className="hidden sm:grid sm:grid-cols-2 gap-3 sm:gap-3.5">
                    {availableRewards.map((reward) => (
                      <GiftVoucherCard
                        key={reward.id}
                        gift={{
                          ...reward,
                          rewardType: reward.rewardType || 'FREE_ITEM',
                          image: reward.title.includes('Quẩy')
                            ? 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=300&q=80'
                            : reward.title.includes('Trứng')
                            ? 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=300&q=80'
                            : reward.title.includes('Voucher')
                            ? 'https://images.unsplash.com/photo-1576777647209-e8733d7b851d?auto=format&fit=crop&w=300&q=80'
                            : 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=300&q=80'
                        }}
                        mode="REDEEM"
                        userPoints={availablePoints}
                        isRedeeming={redeemingId === reward.id}
                        onRedeem={handleRedeemReward}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: NHẬT KÝ ĐIỂM THƯỞNG                                    */}
          {/* ============================================================ */}
          {activeTab === GIFT_TABS.LEDGER && (
            <div className="space-y-2.5">
              {!user ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-black/30 border border-amber-900/40">
                  <p className="text-xs text-stone-300 font-serif leading-relaxed">
                    Vui lòng đăng nhập tài khoản để theo dõi lịch sử tích điểm và đổi quà của bạn.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (openAuthModal) openAuthModal('login');
                    }}
                    className="mt-3.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#8a1f18] to-[#6a150c] text-amber-100 font-serif font-bold text-xs cursor-pointer shadow-md hover:brightness-110 active:scale-95 transition-all"
                  >
                    Đăng nhập tài khoản ngay
                  </button>
                </div>
              ) : ledger.length === 0 ? (
                <div className="text-center py-12 text-stone-400 font-serif text-xs rounded-2xl bg-black/30 border border-amber-900/30">
                  Chưa có giao dịch tích điểm nào được ghi nhận.
                </div>
              ) : (
                ledger.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-gradient-to-r from-black/50 to-stone-900/40 border border-amber-900/30 flex items-center justify-between text-xs shadow-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-serif font-bold text-stone-200 truncate">
                        {log.description || log.transactionType}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5 font-sans">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <div className={`font-mono font-bold text-sm shrink-0 ml-3 ${
                      (log.pointsChange || 0) >= 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {(log.pointsChange || 0) >= 0 ? `+${log.pointsChange}` : log.pointsChange} điểm
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* FOOTER BẢO CHỨNG TRUYỀN THỐNG */}
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
    </div>
  );
}

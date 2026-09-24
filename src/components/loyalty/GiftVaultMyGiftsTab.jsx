import { useState, useMemo, useEffect, memo } from 'react';
import { Star } from 'lucide-react';
import GiftVoucherCard from './GiftVoucherCard';
import GiftWalletStack from './GiftWalletStack';
import CompactHeroBanner from './CompactHeroBanner';
import GiftFilterChips from './GiftFilterChips';

function GiftVaultMyGiftsTab({
  availableGifts = [],
  historyGifts = [],
  isGiftInCart,
  newlyRedeemedId,
  onApplyGift,
  onGoToStore
}) {
  const [giftStatusTab, setGiftStatusTab] = useState('AVAILABLE'); // 'AVAILABLE' | 'HISTORY'
  const [filterCategory, setFilterCategory] = useState('ALL');

  useEffect(() => {
    if (newlyRedeemedId) {
      setGiftStatusTab('AVAILABLE');
    }
  }, [newlyRedeemedId]);

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

  const totalGiftsCount = availableGifts.length + historyGifts.length;

  if (totalGiftsCount === 0) {
    return (
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
          onClick={onGoToStore}
          className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c88d2b] to-[#a06c1c] text-stone-950 font-serif font-bold text-xs shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition-all"
        >
          Khám phá gian hàng đổi điểm ngay
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
              onClick={onGoToStore}
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
                    onApply={onApplyGift}
                  />
                </div>

                <div className="hidden sm:block">
                  <GiftVoucherCard
                    gift={heroGift}
                    mode="USE"
                    isHero={true}
                    isInCart={isGiftInCart(heroGift)}
                    isNewlyRedeemed={newlyRedeemedId === heroGift.id}
                    onApply={onApplyGift}
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
                    onApply={onApplyGift}
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
                      onApply={onApplyGift}
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
    </div>
  );
}

export default memo(GiftVaultMyGiftsTab);

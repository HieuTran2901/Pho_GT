import React, { useMemo } from 'react';
import { Award } from 'lucide-react';
import GiftVoucherCard from './GiftVoucherCard';
import GiftWalletStack from './GiftWalletStack';

const getRewardImage = (reward) => {
  if (reward.title?.includes('Quẩy')) {
    return 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=300&q=80';
  }
  if (reward.title?.includes('Trứng')) {
    return 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=300&q=80';
  }
  if (reward.title?.includes('Voucher')) {
    return 'https://images.unsplash.com/photo-1576777647209-e8733d7b851d?auto=format&fit=crop&w=300&q=80';
  }
  return 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=300&q=80';
};

/**
 * GiftVaultRedeemTab
 * Phở Gia Truyền 1986
 *
 * Tab đổi điểm Tri Kỷ lấy các quà tặng, voucher phở truyền thống.
 */
function GiftVaultRedeemTab({
  availablePoints = 0,
  availableRewards = [],
  loading = false,
  redeemingId = null,
  onRedeem
}) {
  const enrichedRewards = useMemo(() => {
    return (availableRewards || []).map((reward) => ({
      ...reward,
      rewardType: reward.rewardType || 'FREE_ITEM',
      image: getRewardImage(reward)
    }));
  }, [availableRewards]);

  return (
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
      ) : enrichedRewards.length === 0 ? (
        <div className="text-center py-12 text-stone-400 font-serif text-xs">
          Hiện chưa có phần thưởng mới. Quý khách vui lòng quay lại sau nhé!
        </div>
      ) : (
        <>
          {/* MOBILE: VÍ ĐỔI ĐIỂM XẾP LỚP */}
          <div className="sm:hidden">
            <GiftWalletStack
              gifts={enrichedRewards}
              mode="REDEEM"
              userPoints={availablePoints}
              redeemingId={redeemingId}
              onRedeem={onRedeem}
            />
          </div>

          {/* DESKTOP: LƯỚI ĐỔI ĐIỂM 2 CỘT */}
          <div className="hidden sm:grid sm:grid-cols-2 gap-3 sm:gap-3.5">
            {enrichedRewards.map((reward) => (
              <GiftVoucherCard
                key={reward.id}
                gift={reward}
                mode="REDEEM"
                userPoints={availablePoints}
                isRedeeming={redeemingId === reward.id}
                onRedeem={onRedeem}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default React.memo(GiftVaultRedeemTab);

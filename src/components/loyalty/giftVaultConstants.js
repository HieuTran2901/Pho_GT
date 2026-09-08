/**
 * [URBAN & RAVEN] Gift Vault Constants
 * Phở Gia Truyền 1986
 */

export const GIFT_TABS = {
  MY_GIFTS: 'MY_GIFTS',
  REDEEM_STORE: 'REDEEM_STORE',
  LEDGER: 'LEDGER'
};

export const TAB_DEFINITIONS = [
  { id: GIFT_TABS.MY_GIFTS, label: 'Quà Của Tôi', mobileLabel: 'Quà Của Tôi', icon: '🎁', subtitle: 'Sẵn sàng dùng' },
  { id: GIFT_TABS.REDEEM_STORE, label: 'Đổi Điểm Tri Kỷ', mobileLabel: 'Đổi Điểm', icon: '⭐', subtitle: 'Gian hàng thưởng' },
  { id: GIFT_TABS.LEDGER, label: 'Nhật Ký Điểm', mobileLabel: 'Nhật Ký', icon: '📜', subtitle: 'Lịch sử tích/tiêu' }
];

// Quà chào mừng mặc định dành cho khách hàng mới gia nhập hội quán 1986
export const DEFAULT_WELCOME_GIFTS = [
  {
    id: 'welcome_quai_gion_1986',
    code: 'TRIKY1986_QUAY',
    title: '01 Đĩa Quẩy Giòn Hoa Mai (3 chiếc)',
    description: 'Món quà khai tiệc trứ danh phố cổ, giòn xốp thơm ngậy khi nhúng nước dùng phở nóng.',
    category: 'Món Tặng Kèm 0đ',
    rewardType: 'FREE_ITEM',
    dishId: 'extra_quay_gion',
    dishName: 'Đĩa Quẩy Giòn Hoa Mai',
    discountValue: 15000,
    minOrderAmount: 50000,
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=300&q=80',
    expiryText: 'Hạn dùng: 30 ngày từ khi nhận',
    status: 'ACTIVE'
  },
  {
    id: 'welcome_trung_chan_1986',
    code: 'TRIKY1986_TRUNG',
    title: '01 Trứng Gà Ta Chần Nước Béo',
    description: 'Lòng đào béo ngậy được chần điêu luyện trong nồi nước dùng phở bò gia truyền 40 năm.',
    category: 'Món Tặng Kèm 0đ',
    rewardType: 'FREE_ITEM',
    dishId: 'extra_trung_chan',
    dishName: 'Trứng Gà Ta Chần Nước Béo',
    discountValue: 15000,
    minOrderAmount: 60000,
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=300&q=80',
    expiryText: 'Hạn dùng: 15 ngày từ khi nhận',
    status: 'ACTIVE'
  },
  {
    id: 'welcome_voucher_20k',
    code: 'TRIKY1986_VOUCHER20K',
    title: 'Voucher Giảm 20.000đ Bát Thứ Hai',
    description: 'Tri ân bạn bè cùng đi ăn phở. Giảm ngay 20.000đ khi gọi từ 2 bát phở bò bất kỳ.',
    category: 'Phiếu Giảm Giá',
    rewardType: 'DISCOUNT_CASH',
    discountValue: 20000,
    minOrderAmount: 130000,
    image: 'https://images.unsplash.com/photo-1576777647209-e8733d7b851d?auto=format&fit=crop&w=300&q=80',
    expiryText: 'Hạn dùng: Đến hết tháng',
    status: 'ACTIVE'
  }
];

export const REWARD_TYPE_BADGES = {
  FREE_ITEM: { label: 'Tặng Món 0đ', color: 'bg-[#6a150c] text-red-200 border-red-500/40' },
  DISCOUNT_CASH: { label: 'Giảm Trực Tiếp', color: 'bg-amber-950/80 text-amber-200 border-amber-500/40' },
  DISCOUNT_PERCENT: { label: 'Chiết Khấu %', color: 'bg-emerald-950/80 text-emerald-200 border-emerald-500/40' }
};

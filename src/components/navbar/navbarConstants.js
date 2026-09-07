import {
  Home,
  Utensils,
  Star,
  MessageSquareQuote,
  Bike
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'hero', label: 'TRANG CHỦ', icon: Home, href: '#hero' },
  { id: 'menu', label: 'THỰC ĐƠN', icon: Utensils, href: '#menu' },
  { id: 'story', label: 'BÍ QUYẾT 1986', icon: Star, href: '#story' },
  { id: 'reviews', label: 'THỰC KHÁCH NÓI GÌ', icon: MessageSquareQuote, href: '#reviews' },
  { id: 'order', label: 'ĐẶT BÀN & GIAO TẬN NƠI', icon: Bike, href: '#order' },
];

export const TIER_CONFIG = {
  DONG: {
    name: 'Khởi Vị',
    title: 'BẠN KHỞI VỊ',
    badge: 'Khởi Vị',
    icon: '🌱',
    target: 500,
    nextTier: 'Bạn Đũa',
    nextGift: 'Dĩa Quẩy Giòn Hoa Mai',
    giftPoints: 200,
    perk: 'Ghi nhớ khẩu vị ruột & Tặng 50đ Tri Kỷ',
  },
  BAC: {
    name: 'Bạn Đũa',
    title: 'BẠN ĐŨA QUEN QUÁN',
    badge: 'Bạn Đũa',
    icon: '🥢',
    target: 1000,
    nextTier: 'Tri Kỷ',
    nextGift: 'Trứng Chần Nước Béo & Trà Lài',
    giftPoints: 750,
    perk: 'Tặng quẩy giòn mỗi bát & Miễn phí trà thơm',
  },
  VANG: {
    name: 'Tri Kỷ',
    title: 'BẠN TRI KỶ HÀ THÀNH',
    badge: 'Tri Kỷ',
    icon: '⚜️',
    target: 2000,
    nextTier: 'Nghệ Nhân',
    nextGift: 'Phở Thố Đá Bào Ngư Thượng Hạng',
    giftPoints: 1500,
    perk: 'Ưu tiên xếp bàn góc phố & Tùy biến nước dùng',
  },
  KIM_CUONG: {
    name: 'Nghệ Nhân',
    title: 'NGHỆ NHÂN THƯỞNG VỊ 1986',
    badge: 'Thượng Khách',
    icon: '👑',
    target: 2000,
    nextTier: 'Nghệ Nhân',
    nextGift: 'Bảo Lưu Đặc Quyền Thượng Hạng',
    giftPoints: 2000,
    perk: 'Bàn danh dự bảo lưu & Thưởng phở Đệ Nhất',
  },
};

export const BROTH_LABELS = {
  BEO_NGAY: 'Nước béo ngậy',
  DAM_DA: 'Nước đậm',
  THANH: 'Nước thanh'
};

export const ONION_LABELS = {
  HANH_TRAN: 'Hành trần',
  NHIEU_HANH: 'Nhiều hành',
  IT_HANH: 'Ít hành',
  DAU_HANH: 'Đầu hành giòn'
};

export const HERB_LABELS = {
  DU_RAU: 'Đủ rau thơm',
  KHONG_RAU_MUI: 'Không rau mùi',
  KHONG_HANH_TAY: 'Không hành tây'
};

export const CRULLER_LABELS = {
  QUAY_GION: 'Thêm quẩy',
  QUAY_MEM: 'Quẩy mềm',
  KHONG_QUAY: 'Không quẩy'
};

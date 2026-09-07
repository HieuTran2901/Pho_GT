import React from 'react';
import {
  Beef,
  Wheat,
  Soup,
  Leaf,
  Sparkles,
  Flame,
  Utensils,
  Coffee,
  Star
} from 'lucide-react';

/* Mini icon selector for the 4 feature pills */
export function FeatureIcon({ type }) {
  switch (type) {
    case 'meat':
      return <Beef className="w-3.5 h-3.5" />;
    case 'noodle':
      return <Wheat className="w-3.5 h-3.5" />;
    case 'broth':
      return <Soup className="w-3.5 h-3.5" />;
    case 'herb':
    case 'leaf':
      return <Leaf className="w-3.5 h-3.5" />;
    case 'special':
      return <Sparkles className="w-3.5 h-3.5" />;
    case 'spice':
    case 'flame':
      return <Flame className="w-3.5 h-3.5" />;
    case 'chicken':
      return <Utensils className="w-3.5 h-3.5" />;
    case 'egg':
      return <Soup className="w-3.5 h-3.5" />;
    case 'bread':
      return <Utensils className="w-3.5 h-3.5" />;
    case 'tea':
    case 'flower':
      return <Coffee className="w-3.5 h-3.5" />;
    default:
      return <Sparkles className="w-3.5 h-3.5" />;
  }
}

/* Mini tag badge icon */
export function TagBadgeIcon({ icon }) {
  switch (icon) {
    case 'star':
      return <Star className="w-3 h-3 fill-current" />;
    case 'leaf':
      return <Leaf className="w-3 h-3 fill-current" />;
    case 'flame':
      return <Flame className="w-3 h-3 fill-current" />;
    case 'sparkles':
      return <Sparkles className="w-3 h-3 fill-current" />;
    default:
      return null;
  }
}

export const formatPrice = (price) => `${price.toLocaleString('vi-VN')}đ`;

/* Mobile Category Short Labels & Representative Emojis for thumb-friendly horizontal swiper */
export const CATEGORY_MOBILE_CONFIG = {
  all: { shortName: 'Tất Cả', icon: '🍲' },
  'pho-bo': { shortName: 'Phở Bò', icon: '🥩' },
  'pho-ga': { shortName: 'Phở Gà', icon: '🍗' },
  special: { shortName: 'Đặc Biệt', icon: '⭐' },
  sides: { shortName: 'Kèm & Nước', icon: '🥢' },
  favorites: { shortName: 'Yêu Thích', icon: null },
};

/* Heritage Sub-Header Configuration for ScrollSpy Section Grouping */
export const GROUP_HEADER_CONFIG = {
  'pho-bo': {
    badge: 'Bò Tơ Tuyển Chọn',
    title: 'Phở Bò Truyền Thống',
    icon: '🥩',
    subtitle: 'Nước dùng ninh tủy xương 24h quyện cùng thớ thịt bò tơ tươi mềm ngọt',
  },
  'special': {
    badge: 'Đặc Sản Hà Thành',
    title: 'Món Đặc Biệt & Sốt Vang',
    icon: '⭐',
    subtitle: 'Công thức thố đá núi lửa & rượu vang đỏ độc bản gia truyền 1986',
  },
  'pho-ga': {
    badge: 'Gà Đồi Thả Vườn',
    title: 'Phở Gà Đồi Ta',
    icon: '🍗',
    subtitle: 'Thịt chắc ngọt, da vàng giòn sần sật đượm hương lá chanh thái chỉ',
  },
  'sides': {
    badge: 'Kèm Vị Trọn Vẹn',
    title: 'Món Ăn Kèm & Thức Uống',
    icon: '🥢',
    subtitle: 'Quẩy giòn chiên phồng, trứng gà chần béo & trà sen Tây Hồ thanh tao',
  },
};

export const FOOD_GROUPS = [
  { id: 'pho-bo', name: 'Phở Bò Truyền Thống' },
  { id: 'special', name: 'Món Đặc Biệt' },
  { id: 'pho-ga', name: 'Phở Gà Đồi Ta' },
  { id: 'sides', name: 'Món Ăn Kèm & Nước' },
];

export const INITIAL_GROUP_LIMIT = 6;

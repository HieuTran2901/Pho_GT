/**
 * [URBAN & RAVEN] Hằng số & Cấu hình Phối cảnh 2.5D Isometric Diorama
 * Phở Gia Truyền 1986 — Sơ Đồ Bàn 2 Tầng
 */

export const DIORAMA_STATUS_CONFIG = {
  available: {
    key: 'available',
    label: 'Trống',
    dotColor: '#10b981', // green
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    dotClass: 'bg-emerald-400 shadow-[0_0_8px_#10b981]',
    podBorder: 'border-white/10 hover:border-emerald-500/50',
    glowClass: '',
  },
  occupied: {
    key: 'occupied',
    label: 'Đang dùng',
    dotColor: '#ef4444', // red
    badgeClass: 'bg-red-950/80 text-red-300 border-red-500/40',
    dotClass: 'bg-red-500 shadow-[0_0_8px_#ef4444]',
    podBorder: 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/70',
    glowClass: 'animate-pulse-glow',
  },
  reserved: {
    key: 'reserved',
    label: 'Đặt trước',
    dotColor: '#f59e0b', // yellow/amber
    badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    dotClass: 'bg-amber-400 shadow-[0_0_8px_#f59e0b]',
    podBorder: 'border-amber-500/50 hover:border-amber-400',
    glowClass: '',
  },
  maintenance: {
    key: 'maintenance',
    label: 'Khóa',
    dotColor: '#9ca3af', // gray
    badgeClass: 'bg-stone-900/80 text-stone-400 border-stone-600/40',
    dotClass: 'bg-stone-400 shadow-[0_0_6px_#9ca3af]',
    podBorder: 'border-stone-700/40 opacity-70',
    glowClass: '',
  },
};

export const FLOOR_CONFIGS = {
  1: {
    floorNumber: 1,
    title: 'Tầng 1',
    subtitle: 'Gian nồi Phở 90°C & Cửa chính Hàng Bạc',
    totalCountText: '12 bàn',
    rightBanner: {
      type: 'staircase',
      title: 'Lối lên Tầng 2 ↑',
      subtitle: 'Cầu thang gỗ lim cổ kính',
    },
    row1Ids: ['t1-01', 't1-02', 't1-03', 't1-04', 't1-05', 't1-06'],
    row2Ids: ['t1-07', 't1-08', 't1-09', 't1-10', 't1-11', 't1-12'],
  },
  2: {
    floorNumber: 2,
    title: 'Tầng 2',
    subtitle: 'Ban Công View Phố Cổ & Gian Tranh 1986',
    totalCountText: '10 bàn',
    rightBanner: {
      type: 'balcony',
      title: 'PHỞ 1986',
      subtitle: 'Hương vị Hà Nội xưa và nay',
    },
    row1Ids: ['t2-01', 't2-02', 't2-03', 't2-04', 't2-06'],
    row2Ids: ['t2-05', 't2-07', 't2-08', 't2-09', 't2-10'],
  },
};

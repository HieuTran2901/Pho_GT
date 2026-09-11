/**
 * [URBAN & RAVEN] Hằng số & Cấu hình Phối cảnh 2.5D Isometric Diorama
 * Phở Gia Truyền 1986 — Sơ Đồ Bàn 2 Tầng
 */

export const DIORAMA_STATUS_CONFIG = {
  available: {
    key: 'available',
    label: 'Trống',
    tagText: 'TRỐNG',
    dotColor: '#10b981', // green
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    dotClass: 'bg-emerald-400 shadow-[0_0_8px_#10b981]',
    pillClass: 'bg-stone-950/85 border-white/15 text-stone-200 group-hover:border-white/30',
    podClass: 'bg-gradient-to-b from-[#1c150f] via-[#140e09] to-[#0c0704] border border-[#3d2719] shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:border-emerald-500/70 hover:shadow-[0_6px_18px_rgba(16,185,129,0.2)]',
    tableSurfaceClass: 'bg-gradient-to-br from-[#4d321d] via-[#3d2514] to-[#2b190c] border border-[#7a4e2b]/60',
    glowClass: '',
  },
  occupied: {
    key: 'occupied',
    label: 'Đang dùng',
    tagText: 'ĐANG DÙNG',
    dotColor: '#ef4444', // red
    badgeClass: 'bg-red-950/80 text-red-300 border-red-500/40',
    dotClass: 'bg-red-500 shadow-[0_0_8px_#ef4444]',
    pillClass: 'bg-gradient-to-r from-red-950/90 to-[#2a0e08]/90 border-red-500/60 text-amber-200',
    podClass: 'bg-gradient-to-b from-[#2d1809] via-[#1a0f05] to-[#120a04] border-2 border-amber-400/90 shadow-[0_0_14px_rgba(245,158,11,0.5)] ring-1 ring-amber-300/70',
    tableSurfaceClass: 'bg-gradient-to-br from-[#8a4216] via-[#6d300d] to-[#451e08] border-2 border-amber-300/80 shadow-[0_0_10px_rgba(245,158,11,0.4)]',
    glowClass: 'animate-pulse-glow',
  },
  reserved: {
    key: 'reserved',
    label: 'Đặt trước',
    tagText: 'ĐẶT TRƯỚC',
    dotColor: '#f59e0b', // yellow/amber
    badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    dotClass: 'bg-amber-400 shadow-[0_0_8px_#f59e0b]',
    pillClass: 'bg-gradient-to-r from-amber-950/90 to-[#2c1808]/90 border-amber-500/60 text-amber-200',
    podClass: 'bg-gradient-to-b from-[#281b0a] via-[#1c1306] to-[#120b04] border-2 border-amber-500/80 shadow-[0_0_12px_rgba(212,175,55,0.4)] ring-1 ring-amber-400/50',
    tableSurfaceClass: 'bg-gradient-to-br from-[#734413] via-[#542d0a] to-[#361a05] border border-amber-400/70 shadow-[0_0_8px_rgba(245,158,11,0.35)]',
    glowClass: '',
  },
  maintenance: {
    key: 'maintenance',
    label: 'Tạm khóa',
    tagText: 'TẠM KHÓA',
    dotColor: '#9ca3af', // gray
    badgeClass: 'bg-stone-900/80 text-stone-400 border-stone-600/40',
    dotClass: 'bg-stone-400 shadow-[0_0_6px_#9ca3af]',
    pillClass: 'bg-stone-900/90 border-stone-700/60 text-stone-400',
    podClass: 'bg-gradient-to-b from-[#181412] via-[#110e0c] to-[#0a0807] border border-stone-600/50 opacity-65',
    tableSurfaceClass: 'bg-gradient-to-br from-[#2a2624] via-[#1f1c1a] to-[#141211] border border-stone-600/50',
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

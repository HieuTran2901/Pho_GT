export const DEFAULT_DASHBOARD_PENDING_ORDERS = [
  {
    id: 1,
    orderCode: '#PHO1986-HN-2234',
    tableNumber: 12,
    floor: 1,
    orderType: 'DINE_IN',
    guestName: 'Anh Nguyễn Văn Minh',
    guestPhone: '092 952 8509',
    finalAmount: 150000,
    paymentMethod: 'Thanh toán online (SEPAY)',
    orderTime: '2 phút trước',
    items: [
      { name: 'Phở bò tái lăn', quantity: 2 },
      { name: 'Nước chanh', quantity: 1 },
      { name: 'Nem rán', quantity: 1 }
    ],
    note: 'Nước dùng trong, nhiều hành hoa'
  },
  {
    id: 2,
    orderCode: '#PHO1986-HN-5866',
    tableNumber: 8,
    floor: 1,
    orderType: 'DINE_IN',
    guestName: 'Chị Trần Thị Mai',
    guestPhone: '098 765 4321',
    finalAmount: 150000,
    paymentMethod: 'Thanh toán online (MOMO)',
    orderTime: '5 phút trước',
    items: [
      { name: 'Phở bò tái', quantity: 1 },
      { name: 'Phở gà', quantity: 1 },
      { name: 'Trà đá', quantity: 1 }
    ],
    note: 'Ít bánh phở, thêm quẩy giòn'
  },
  {
    id: 3,
    orderCode: '#PHO1986-HN-9102',
    tableNumber: 5,
    floor: 2,
    orderType: 'DINE_IN',
    guestName: 'Bác Lê Hoàng Long',
    guestPhone: '091 234 5678',
    finalAmount: 185000,
    paymentMethod: 'Tiền mặt tại bàn',
    orderTime: '8 phút trước',
    items: [
      { name: 'Phở đặc biệt 1986', quantity: 2 },
      { name: 'Trà sen Tây Hồ', quantity: 2 }
    ],
    note: 'Khách quen, ngồi bàn cạnh ban công'
  },
  {
    id: 4,
    orderCode: '#PHO1986-HN-7719',
    tableNumber: null,
    orderType: 'DELIVERY',
    address: '45 Hàng Bạc, Hoàn Kiếm',
    guestName: 'Cô Hoàng Thu Thủy',
    guestPhone: '093 456 7890',
    finalAmount: 210000,
    paymentMethod: 'Chuyển khoản VietQR',
    orderTime: '12 phút trước',
    items: [
      { name: 'Phở thố đá núi lửa', quantity: 2 },
      { name: 'Quẩy giòn chiên phồng', quantity: 2 }
    ],
    note: 'Giao nhanh trước 12h trưa'
  }
];

export function getShiftInfo(currentTime) {
  const hour = currentTime.getHours();
  if (hour >= 6 && hour < 14) {
    return {
      name: 'Ca Sáng (Nồi Nước Dùng 1)',
      timeSpan: '06:00 – 14:00',
      badgeColor: 'text-amber-300 border-amber-500/40 bg-amber-950/40'
    };
  }
  if (hour >= 14 && hour < 17) {
    return {
      name: 'Ca Chiều (Tiếp Bếp & Sửa Soạn)',
      timeSpan: '14:00 – 17:00',
      badgeColor: 'text-stone-300 border-stone-600/40 bg-stone-900/60'
    };
  }
  if (hour >= 17 && hour < 23) {
    return {
      name: 'Ca Tối (Cao Điểm Khách Quen)',
      timeSpan: '17:00 – 23:00',
      badgeColor: 'text-orange-300 border-orange-500/50 bg-[#8a1e14]/40'
    };
  }
  return {
    name: 'Ca Đêm (Ninh Xương Gia Truyền)',
    timeSpan: '23:00 – 06:00',
    badgeColor: 'text-indigo-300 border-indigo-500/40 bg-indigo-950/40'
  };
}

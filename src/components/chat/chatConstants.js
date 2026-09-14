/**
 * CHATBOX CONSTANTS — TIỂU NHỊ PHỐ CŨ 1986
 * Tinh hoa ẩm thực Tràng An: Thao tác nhanh, gợi ý tao nhã, phong vị 1986
 */

export const INITIAL_GREETING = {
  id: 'welcome_1',
  role: 'assistant',
  content: 'Dạ em chào Bác ạ! Em là Tiểu Nhị quán Phở Gia Truyền 1986. Bác ghé chơi, em xin phép hầu chuyện và mời Bác thưởng thức những bát phở nước dùng ninh than củi 24 giờ thơm nức mũi ạ. Bác muốn dùng phở gì hôm nay?',
  time: 'Vừa xong',
  actionType: 'NONE'
};

export const QUICK_SUGGESTIONS = [
  {
    id: 'sug_1',
    icon: '🍲',
    label: 'Món Tinh Hoa 1986',
    desc: 'Khám phá bát phở tái lăn áp chảo & thực đơn gia truyền',
    query: 'Hôm nay quán có phở gì đặc sắc nhất vậy em?'
  },
  {
    id: 'sug_2',
    icon: '🥩',
    label: 'Bí Quyết Nước Dùng 24h',
    desc: 'Hương vị ninh xương than củi nguyên bản không mì chính',
    query: 'Nước dùng phở có dùng mì chính không em?'
  },
  {
    id: 'sug_3',
    icon: '🪑',
    label: 'Đặt Bàn Giữ Chỗ',
    desc: 'Chọn góc bàn ngói rêu ấm cúng chỉ trong 30 giây',
    query: 'Tôi muốn đặt bàn giữ chỗ trước'
  },
  {
    id: 'sug_4',
    icon: '🎟️',
    label: 'Tem Phiếu Ưu Đãi 20%',
    desc: 'Nhận mã quà tặng tri kỷ giảm 20% cho bữa tiệc phở',
    query: 'Quán có mã ưu đãi tem phiếu gì không em?'
  },
  {
    id: 'sug_5',
    icon: '🕒',
    label: 'Giờ Mở Cửa & Địa Chỉ',
    desc: 'Thời gian đón khách và chỉ đường đến số 1986 Phố Cổ',
    query: 'Quán mở cửa những giờ nào và ở đâu?'
  }
];

export const CLIENT_FALLBACK_ANSWERS = {
  tai_lan: {
    reply: 'Dạ bát Phở Bò Tái Lăn Áp Chảo (75.000đ) là món trứ danh của quán em ạ! Thịt bò tơ chao lửa lớn thơm lừng tỏi phi, nước dùng béo ngọt sóng sánh. Em gửi Bác thẻ món để Bác chọn thêm vào giỏ nhé!',
    actionType: 'DISH',
    actionPayload: {
      id: 'dish_tai_lan',
      name: 'Phở Bò Tái Lăn Áp Chảo 1986',
      price: 75000,
      image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80'
    }
  },
  booking: {
    reply: 'Dạ quán luôn dành sẵn những góc bàn gỗ mộc ấm cúng bên hiên ngói rêu phong. Bác bấm nút Đặt Bàn ngay dưới đây để chọn chỗ ưng ý chỉ trong 30 giây ạ!',
    actionType: 'BOOKING',
    actionPayload: { title: 'Đặt Bàn Trực Quan 1986' }
  },
  voucher: {
    reply: 'Dạ quán kính gửi Bác Tem Phiếu Tri Kỷ [PHO1986VIP] giảm 20% cho đơn từ 150.000đ. Bác có thể sao chép và dùng ngay khi thanh toán ạ!',
    actionType: 'VOUCHER',
    actionPayload: { code: 'PHO1986VIP', discount: 'GIẢM 20%' }
  }
};

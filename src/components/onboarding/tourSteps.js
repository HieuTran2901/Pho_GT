// Danh mục các trạm dẫn dắt trong Spotlight Tour Tiểu Nhị 1986 (Dual-Mode Architecture)
export const TOUR_STORAGE_KEY = 'pho1986_tour_completed';

export const TOUR_MODES = {
  HERITAGE: {
    id: 'heritage',
    badge: 'DI SẢN 1986',
    title: 'Dạo Quanh Quán Phở',
    subtitle: 'Nồi phở 24h, sa bàn 2 tầng phố cổ, kho quà tri kỷ & trợ lý AI',
    icon: 'Sparkles',
    estTime: '1 phút'
  },
  ORDERING: {
    id: 'ordering',
    badge: 'THỰC HÀNH',
    title: 'Hướng Dẫn Đặt Món & Thanh Toán',
    subtitle: 'Chọn phở chuẩn gu, thêm vào bàn, xem giỏ voucher & quét mã VietQR',
    icon: 'Soup',
    estTime: '1.5 phút'
  }
};

// 1. Chế độ A: Dạo Quanh Quán Phở (Heritage & Brand Tour - 4 trạm)
export const HERITAGE_TOUR_STEPS = [
  {
    id: 'heritage-broth',
    stepNumber: 1,
    badge: 'NỒI PHỞ NINH 24H',
    targetSelector: '#hero-story-banner-mobile, #hero-story-banner, [data-tour="hero-story-banner"], #hero',
    scrollSelector: '#hero',
    title: 'Kính Chào Bác Đến Phở Gia Truyền 1986!',
    mascotMessage:
      'Dạ thưa Bác! Nồi nước dùng nhà con được ninh từ 100% xương ống bò tươi suốt 24 giờ cùng quế chi, hoa hồi và gừng nướng hạ thổ. Từng bát phở dâng lên luôn sôi sục 90°C đậm đà phong vị kinh kỳ.',
    preferredPlacement: 'bottom',
    accentColor: '#d4af37'
  },
  {
    id: 'heritage-seatmap',
    stepNumber: 2,
    badge: 'SA BÀN 2 TẦNG',
    targetSelector: '#hero-book-table-btn-mobile, #hero-book-table-btn, [data-tour="hero-book-table-btn"], #order',
    scrollSelector: '#hero-book-table-btn-mobile, #hero-book-table-btn, #order',
    title: 'Đặt Bàn & Giữ Chỗ 15 Phút Chống Trùng',
    mascotMessage:
      'Nhà con có 2 tầng: Gian Bếp tầng 1 ấm cúng và Ban Công tầng 2 view ngắm trọn phố cổ Tạ Hiện. Bác có thể chọn đúng vị trí bàn VIP trước khi ghé quán, hệ thống giữ chỗ tức thời 15 phút!',
    preferredPlacement: 'bottom',
    accentColor: '#10b981'
  },
  {
    id: 'heritage-loyalty',
    stepNumber: 3,
    badge: 'BÁT PHỞ TRI KỶ',
    targetSelector: '#navbar-gift-vault-btn, [data-tour="navbar-gift-vault-btn"], #mobile-bottom-member-btn, #mobile-bottom-cart-btn, #navbar-cart-btn',
    scrollSelector: '#navbar-gift-vault-btn, #mobile-bottom-member-btn',
    title: 'Đặc Quyền Hội Viên & Kho Quà Tri Ân',
    mascotMessage:
      'Chỉ cần đăng ký SĐT khách quen, Bác sẽ được tặng ngay 50 điểm thưởng, đổi quẩy giòn miễn phí và tính năng 1-Click "Gọi lại bát phở ruột" cực kỳ tiện lợi mỗi khi ghé thăm.',
    preferredPlacement: 'bottom',
    accentColor: '#f59e0b'
  },
  {
    id: 'heritage-chat',
    stepNumber: 4,
    badge: 'TIỂU NHỊ 1986',
    targetSelector: '#heritage-chat-launcher, [data-tour="heritage-chat-launcher"]',
    scrollSelector: null,
    title: 'Con Luôn Túc Trực Hỗ Trợ Bác 24/7',
    mascotMessage:
      'Bất kể khi nào cần đổi món, tư vấn chỗ ngồi hay hỏi han câu chuyện di sản, con luôn túc trực ở góc này để phục vụ Bác chu đáo. Kính chúc Bác có một trải nghiệm ẩm thực trọn vị!',
    preferredPlacement: 'top',
    accentColor: '#06b6d4'
  }
];

// 2. Chế độ B: Hướng Dẫn Đặt Món & Thanh Toán (Ordering, Voucher & Payment Tour - 4 trạm)
export const ORDERING_TOUR_STEPS = [
  {
    id: 'order-pick-dish',
    stepNumber: 1,
    badge: 'CHỌN MÓN RUỘT',
    targetSelector: '#tour-first-dish-card, [data-tour="menu-dish-showcase"], #menu-dish-showcase, #menu',
    scrollSelector: '#tour-first-dish-card, #menu',
    title: 'Khám Phá Bát Phở Chuẩn Gu Của Bác',
    mascotMessage:
      'Dạ thưa Bác! Thực đơn nhà con có đủ thức phở kinh kỳ: Tái Lăn thơm nức cháy tỏi, Gầu Giòn sần sật, Bắp Hoa giòn ngọt. Bác có thể bấm xem chi tiết từng món và đọc bí quyết gia truyền trước khi chọn.',
    preferredPlacement: 'side',
    accentColor: '#96281b'
  },
  {
    id: 'order-add-cart',
    stepNumber: 2,
    badge: 'THÊM VÀO BÀN',
    targetSelector: '#tour-first-dish-add-btn, #tour-first-dish-add-btn-mobile, [data-tour="dish-add-btn"], #tour-first-dish-card',
    scrollSelector: '#tour-first-dish-add-btn, #tour-first-dish-card',
    title: 'Chạm Thử Để Thêm Món Vào Bàn',
    mascotMessage:
      'Sau khi chọn được món ưng ý, Bác hãy thử bấm nút "+ Thêm vào bàn" này. Từng tô phở nóng hổi sẽ bay theo quỹ đạo parabol đẹp mắt thẳng vào giỏ hàng ngay tức thì!',
    preferredPlacement: 'side',
    accentColor: '#10b981',
    isInteractive: true,
    expectedAction: 'ADD_TO_CART',
    actionHint: '👉 Bác thử bấm nút "+ Thêm vào bàn" này nhé!',
    praiseTitle: 'Làm tốt lắm Bác ơi! 🎉',
    praiseMessage:
      'Tuyệt vời quá Bác ơi! Bát Phở Bò Tái Lăn nóng hổi đã bay thẳng vào bàn ăn của Bác rồi. Giờ ta cùng xem giỏ hàng nhé!',
    autoAdvanceDelay: 1700
  },
  {
    id: 'order-cart-voucher',
    stepNumber: 3,
    badge: 'GIỎ HÀNG & VOUCHER',
    targetSelector: '#navbar-cart-btn, #mobile-bottom-cart-btn, [data-tour="navbar-gift-vault-btn"], #navbar-gift-vault-btn',
    scrollSelector: '#navbar-cart-btn, #mobile-bottom-cart-btn',
    title: 'Chạm Mở Giỏ Hàng & Xem Voucher',
    mascotMessage:
      'Giỏ hàng trên thanh menu (hoặc nút nổi dưới đáy màn hình) là nơi gom các món Bác đã chọn. Bác hãy bấm mở Giỏ hàng để kiểm tra các tô phở và quà tặng nhé!',
    preferredPlacement: 'bottom',
    accentColor: '#f59e0b',
    isInteractive: true,
    expectedAction: 'OPEN_CART',
    actionHint: '👉 Bác chạm mở Giỏ Hàng ở đây nhé!',
    praiseTitle: 'Giỏ hàng đã mở! ✨',
    praiseMessage:
      'Chuẩn chỉ luôn Bác ơi! Giờ Bác cùng xem lại từng tô phở và bấm nút Gửi Yêu Cầu ở đáy giỏ nhé!',
    autoAdvanceDelay: 1200
  },
  {
    id: 'order-checkout-cart',
    stepNumber: 4,
    badge: 'GỬI ĐẶT MÓN',
    targetSelector: '#cart-drawer-checkout-btn, [data-tour="cart-checkout-btn"]',
    scrollSelector: null,
    title: 'Gửi Yêu Cầu Đặt Món Ngay',
    mascotMessage:
      'Dạ thưa Bác! Sau khi kiểm tra giỏ hàng xong, Bác bấm nút "Gửi Yêu Cầu Đặt Món Ngay" này. Giỏ hàng sẽ tự động khép lại và đưa Bác xuống form nhận phở tức thì!',
    preferredPlacement: 'side',
    accentColor: '#96281b',
    isInteractive: true,
    expectedAction: 'CLICK_CHECKOUT',
    actionHint: '👉 Bác bấm nút "Gửi Yêu Cầu Đặt Món Ngay" này nhé!',
    praiseTitle: 'Đang chuyển xuống form nhận phở! 🚀',
    praiseMessage:
      'Tuyệt vời quá Bác ơi! Giỏ hàng đã chốt và tự động khép lại, đang đưa Bác xuống form điền thông tin ngay!',
    autoAdvanceDelay: 1400
  },
  {
    id: 'order-payment-qr',
    stepNumber: 5,
    badge: 'HOÀN TẤT ĐẶT PHỞ',
    targetSelector: '#order-form-card, #order',
    scrollSelector: '#order-form-card, #order',
    title: 'Điền Nhận Phở & Quét Mã VietQR Tự Động',
    mascotMessage:
      'Dạ thưa Bác, đây là bước cuối cùng! Giỏ hàng đã khép lại và cuộn tới form. Bác chỉ cần điền SĐT, chọn bàn hoặc địa chỉ nhận phở và quét VietQR 2 giây là hoàn thành!',
    preferredPlacement: 'bottom',
    accentColor: '#d4af37',
    isInteractive: true,
    expectedAction: 'SELECT_PAYMENT_OR_SUBMIT',
    actionHint: '👉 Bác bấm "Hoàn tất" để bắt đầu đặt phở thật nhé!',
    praiseTitle: 'Hoàn thành xuất sắc! 🏆',
    praiseMessage:
      'Bác đã nắm trọn vẹn toàn bộ quy trình đặt món của Phở Gia Truyền 1986. Tiểu Nhị kính chúc Bác một bữa ăn ngon miệng!',
    autoAdvanceDelay: 2000
  }
];

// Fallback tương thích ngược
export const TOUR_STEPS = HERITAGE_TOUR_STEPS;

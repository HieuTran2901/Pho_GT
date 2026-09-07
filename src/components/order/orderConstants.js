export const BRANCH_LABELS = {
  'hanoi-hangbac': '45 Hàng Bạc, Hoàn Kiếm, Hà Nội',
  'hanoi-lyquocsu': '10 Lý Quốc Sư, Hoàn Kiếm, Hà Nội',
  'hcm-quan1': '88 Pasteur, Quận 1, TP.HCM',
  'hcm-quan3': '152 Võ Thị Sáu, Quận 3, TP.HCM'
};

export const TASTE_PREFERENCES = [
  'Nhiều hành',
  'Nước béo',
  'Đầu hành giòn',
  'Hành trần',
  'Không mì chính',
  'Thêm quẩy giòn'
];

export const EXTENDED_PAYMENT_METHODS = [
  {
    id: 'SEPAY',
    name: 'Cổng SePay Checkout',
    subname: 'VietQR / Thẻ ATM',
    badge: 'SePay',
    badgeBg: 'bg-[#003c71]/25 border-[#003c71]/40 text-sky-300'
  },
  {
    id: 'MOMO',
    name: 'Ví MoMo',
    subname: '1-Chạm liên kết',
    badge: 'MoMo',
    badgeBg: 'bg-[#a50064]/25 border-[#a50064]/40 text-pink-300'
  },
  {
    id: 'VNPAY',
    name: 'VNPAY-QR',
    subname: '30+ Ngân hàng',
    badge: 'VNPAY',
    badgeBg: 'bg-[#005baa]/25 border-[#005baa]/40 text-blue-300'
  },
  {
    id: 'ZALOPAY',
    name: 'Ví ZaloPay',
    subname: 'Mở qua Zalo',
    badge: 'Zalo',
    badgeBg: 'bg-[#0068ff]/25 border-[#0068ff]/40 text-cyan-300'
  },
  {
    id: 'CREDIT_CARD',
    name: 'Thẻ Quốc Tế',
    subname: 'Visa / Master',
    isCard: true,
    badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300'
  }
];

export const PAYMENT_GUIDANCE = {
  VIETQR: 'Quý khách chọn VietQR: Được ưu tiên xếp bàn đẹp & tặng kèm đĩa quẩy nóng giòn.',
  POST_PAID_AT_STORE: 'Quý khách chọn Trả sau tại quán: Bàn được giữ miễn phí 30 phút, thanh toán tại quầy.',
  COD: 'Quý khách chọn Tiền mặt khi nhận phở: Kiểm tra bát phở nóng 90°C rồi mới thanh toán cho shipper.',
  SEPAY: 'Quý khách chọn Cổng SePay: Quét mã VietQR tự động khớp đơn hoặc thanh toán qua cổng trực tuyến SePay.',
  MOMO: 'Quý khách chọn Ví MoMo: Tự động chuyển hướng xác nhận thanh toán an toàn 1-chạm qua ứng dụng MoMo.',
  VNPAY: 'Quý khách chọn VNPAY-QR: Hỗ trợ quét mã VNPAY qua 30+ ứng dụng ngân hàng và ví điện tử.',
  ZALOPAY: 'Quý khách chọn Ví ZaloPay: Xác nhận thanh toán trực tiếp qua ví ZaloPay hoặc ứng dụng Zalo.',
  CREDIT_CARD: 'Quý khách chọn Thẻ Quốc Tế: Hỗ trợ thẻ tín dụng/ghi nợ Visa, Mastercard bảo mật chuẩn OTP 3D-Secure.'
};

export const PAYMENT_CTA_LABELS = {
  VIETQR: 'Mở Mã Quét VietQR Tiếp Theo →',
  POST_PAID_AT_STORE: 'Xác Nhận Giữ Chỗ Tại Quán →',
  COD: 'Xác Nhận Đặt Giao Phở (COD) →',
  SEPAY: 'Mở Cổng Thanh Toán SePay →',
  MOMO: 'Thanh Toán Qua Ví MoMo →',
  VNPAY: 'Mở Cổng VNPAY-QR →',
  ZALOPAY: 'Thanh Toán Qua ZaloPay →',
  CREDIT_CARD: 'Thanh Toán Bằng Thẻ Quốc Tế →'
};

const SESSION_STORAGE_KEY_PREFIX = 'pho1986_order_';
export const SESSION_LATEST_KEY = 'pho1986_latest_order_code';

export const INITIAL_FORM_DATA = {
  orderType: 'dine-in',
  customerName: '',
  phone: '',
  branch: 'hanoi-hangbac',
  guestCount: '2',
  date: '',
  time: '',
  address: '',
  note: ''
};

export const saveOrderSession = (code, data) => {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    sessionStorage.setItem(`${SESSION_STORAGE_KEY_PREFIX}${code}`, JSON.stringify(data));
    sessionStorage.setItem(SESSION_LATEST_KEY, code);
  } catch (err) {
    console.warn('[OrderSection] sessionStorage save error:', err);
  }
};

export const getOrderSession = (code) => {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;
  try {
    const key = code ? `${SESSION_STORAGE_KEY_PREFIX}${code}` : null;
    const direct = key ? sessionStorage.getItem(key) : null;
    if (direct) return JSON.parse(direct);
    const latestCode = sessionStorage.getItem(SESSION_LATEST_KEY);
    if (latestCode) {
      const latest = sessionStorage.getItem(`${SESSION_STORAGE_KEY_PREFIX}${latestCode}`);
      if (latest) return JSON.parse(latest);
    }
  } catch (err) {
    console.warn('[OrderSection] sessionStorage load error:', err);
  }
  return null;
};


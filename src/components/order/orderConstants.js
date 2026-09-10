import { orderApi } from '../../services/orderApi';

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

export const QUICK_TIME_SLOTS = [
  { time: '11:30', period: 'Trưa nay', label: 'Trưa 11:30' },
  { time: '12:00', period: 'Trưa nay', label: 'Trưa 12:00' },
  { time: '18:30', period: 'Tối nay', label: 'Tối 18:30' },
  { time: '19:30', period: 'Tối nay', label: 'Tối 19:30' }
];

export const EXTENDED_PAYMENT_METHODS = [
  {
    id: 'MOMO',
    name: 'Ví MoMo',
    shortName: 'MoMo',
    subname: '1-Chạm liên kết',
    badge: 'MoMo',
    badgeBg: 'bg-[#a50064]/25 border-[#a50064]/40 text-pink-300'
  },
  {
    id: 'VNPAY',
    name: 'VNPAY-QR',
    shortName: 'VNPAY',
    subname: '30+ Ngân hàng',
    badge: 'VNPAY',
    badgeBg: 'bg-[#005baa]/25 border-[#005baa]/40 text-blue-300'
  },
  {
    id: 'ZALOPAY',
    name: 'Ví ZaloPay',
    shortName: 'ZaloPay',
    subname: 'Mở qua Zalo',
    badge: 'Zalo',
    badgeBg: 'bg-[#0068ff]/25 border-[#0068ff]/40 text-cyan-300'
  },
  {
    id: 'CREDIT_CARD',
    name: 'Thẻ Quốc Tế',
    shortName: 'Thẻ QT',
    subname: 'Visa / Master',
    isCard: true,
    badge: 'Card',
    badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300'
  },
  {
    id: 'SEPAY',
    name: 'Cổng SePay Checkout',
    shortName: 'SePay',
    subname: 'VietQR / Thẻ ATM',
    badge: 'SePay',
    badgeBg: 'bg-[#003c71]/25 border-[#003c71]/40 text-sky-300'
  }
];

export const BRAND_STYLES = {
  MOMO: {
    activeBorder: 'border-[#d82d8b]',
    activeBg: 'bg-[#d82d8b]/15',
    activeGlow: 'shadow-[0_0_14px_rgba(216,45,139,0.4)] ring-1 ring-[#d82d8b]',
    activeText: 'text-[#ff66b2]',
    badgeBg: 'bg-[#a50064]/35 border-[#a50064]/60 text-pink-200',
    bannerStyle: 'bg-[#a50064]/15 border-[#a50064]/30 text-pink-200'
  },
  VNPAY: {
    activeBorder: 'border-[#005baa]',
    activeBg: 'bg-[#005baa]/15',
    activeGlow: 'shadow-[0_0_14px_rgba(0,91,170,0.4)] ring-1 ring-[#005baa]',
    activeText: 'text-[#4ea8de]',
    badgeBg: 'bg-[#005baa]/35 border-[#005baa]/60 text-blue-200',
    bannerStyle: 'bg-[#005baa]/15 border-[#005baa]/30 text-blue-200'
  },
  ZALOPAY: {
    activeBorder: 'border-[#008fe5]',
    activeBg: 'bg-[#008fe5]/15',
    activeGlow: 'shadow-[0_0_14px_rgba(0,143,229,0.4)] ring-1 ring-[#008fe5]',
    activeText: 'text-[#38bdf8]',
    badgeBg: 'bg-[#0068ff]/35 border-[#0068ff]/60 text-cyan-200',
    bannerStyle: 'bg-[#0068ff]/15 border-[#0068ff]/30 text-cyan-200'
  },
  CREDIT_CARD: {
    activeBorder: 'border-amber-400',
    activeBg: 'bg-amber-500/15',
    activeGlow: 'shadow-[0_0_14px_rgba(251,191,36,0.4)] ring-1 ring-amber-400',
    activeText: 'text-amber-300',
    badgeBg: 'bg-amber-500/30 border-amber-500/60 text-amber-200',
    bannerStyle: 'bg-amber-500/15 border-amber-500/30 text-amber-200'
  },
  SEPAY: {
    activeBorder: 'border-sky-400',
    activeBg: 'bg-sky-500/15',
    activeGlow: 'shadow-[0_0_14px_rgba(56,189,248,0.4)] ring-1 ring-sky-400',
    activeText: 'text-sky-300',
    badgeBg: 'bg-[#003c71]/40 border-sky-400/50 text-sky-200',
    bannerStyle: 'bg-sky-500/15 border-sky-500/30 text-sky-200'
  }
};

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
  VIETQR: 'Mở Quét Mã VietQR →',
  POST_PAID_AT_STORE: 'Xác Nhận Giữ Chỗ Tại Quán →',
  COD: 'Xác Nhận Đặt Giao Phở (COD) →',
  SEPAY: 'Thanh Toán Qua SePay →',
  MOMO: 'Thanh Toán Qua Ví MoMo →',
  VNPAY: 'Mở Cổng VNPAY-QR →',
  ZALOPAY: 'Thanh Toán Qua ZaloPay →',
  CREDIT_CARD: 'Thanh Toán Thẻ Quốc Tế →'
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

export const saveCustomerHistoryOrder = ({
  bookingCode,
  formData,
  selectedPaymentMethod,
  orderAmount,
  selectedTable,
  targetAddress,
  cartItems = []
}) => {
  try {
    const items = (cartItems && cartItems.length > 0)
      ? cartItems.map((it, idx) => ({
          id: it.id || idx + 1,
          name: it.name || 'Bát phở gia truyền',
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.price) || 0,
          image: it.image || null,
          broth: it.broth || null,
          onion: it.onion || null,
          herb: it.herb || null,
          cruller: it.cruller || null
        }))
      : [
          {
            id: 1,
            name: 'Bát phở gia truyền theo bàn',
            quantity: Number(formData?.guestCount) || 2,
            unitPrice: Math.round(orderAmount / (Number(formData?.guestCount) || 2))
          }
        ];

    orderApi.saveLocalOrder({
      id: bookingCode,
      orderCode: bookingCode,
      tableNumber: selectedTable?.number || null,
      floor: selectedTable?.floor || 1,
      orderType: selectedTable ? 'DINE_IN' : 'DELIVERY',
      deliveryAddressText: targetAddress || formData?.address,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      paymentMethod: selectedPaymentMethod,
      paymentStatus: selectedPaymentMethod === 'COD' ? 'UNPAID' : 'PAID',
      totalAmount: orderAmount,
      finalAmount: orderAmount,
      guestName: formData?.customerName,
      guestPhone: formData?.phone,
      note: formData?.note,
      items
    });
  } catch (e) {
    console.warn('[orderConstants] saveCustomerHistoryOrder error:', e);
  }
};



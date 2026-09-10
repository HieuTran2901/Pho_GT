import { ShoppingBag, Calendar, CreditCard, CheckCircle2, Clock, XCircle } from 'lucide-react';

const STATUS_BADGES = {
  COMPLETED: { label: 'Hoàn thành', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  CONFIRMED: { label: 'Đã nhận', bg: 'bg-blue-100 text-blue-800 border-blue-300' },
  PREPARING: { label: 'Đang nấu', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
  PENDING: { label: 'Chờ duyệt', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  CANCELLED: { label: 'Đã hủy', bg: 'bg-rose-100 text-rose-800 border-rose-300' }
};

const PAYMENT_BADGES = {
  PAID: { label: 'Đã trả', icon: CheckCircle2, color: 'text-emerald-700' },
  PENDING: { label: 'Chưa trả', icon: Clock, color: 'text-amber-600' },
  FAILED: { label: 'Lỗi', icon: XCircle, color: 'text-rose-600' }
};

export default function CustomerOrdersTab({ orders = [] }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="py-10 text-center text-[#8c7a6b] animate-fadeIn">
        <ShoppingBag className="w-8 h-8 mx-auto text-[#d4af37]/40 mb-1.5" />
        <h5 className="font-serif font-bold text-[#22130b] text-xs">Chưa có lịch sử đơn hàng</h5>
        <p className="text-[11px] text-[#7a6e5d] mt-0.5">
          Thực khách chưa phát sinh đơn phở tại quán.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-fadeIn">
      <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
        {orders.map((o) => {
          const statusInfo = STATUS_BADGES[o.status] || {
            label: o.status || 'Đang xử lý',
            bg: 'bg-stone-100 text-stone-800 border-stone-300'
          };
          const payInfo = PAYMENT_BADGES[o.paymentStatus] || PAYMENT_BADGES.PAID;
          const PayIcon = payInfo.icon;

          return (
            <div
              key={o.id || o.orderCode}
              className="p-2.5 rounded-lg bg-white border border-[#d4af37]/20 shadow-2xs hover:border-[#d4af37]/60 hover:-translate-y-0.5 transition-all duration-150 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono font-bold text-xs text-[#22130b] tracking-wider">
                  #{o.orderCode || (o.id ? o.id.substring(0, 8).toUpperCase() : 'PHO')}
                </span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-serif font-bold border ${statusInfo.bg}`}>
                  {statusInfo.label}
                </span>
                <span className="text-[10px] text-[#8c7a6b] font-mono hidden sm:inline">
                  {o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : ''}
                </span>
                <span className="text-[10px] text-stone-500 font-serif">
                  • {o.itemCount ? `${o.itemCount} món` : '1 món'}
                </span>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 text-right">
                <span className={`text-[10px] flex items-center gap-0.5 font-serif ${payInfo.color}`}>
                  <PayIcon className="w-3 h-3" />
                  <span className="hidden sm:inline">{o.paymentMethod || 'Tiền mặt'}</span>
                </span>
                <span className="text-xs font-bold font-mono text-[#8a1e14]">
                  {(o.finalAmount || 0).toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

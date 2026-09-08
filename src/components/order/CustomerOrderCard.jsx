import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Flame,
  FileText,
  UtensilsCrossed,
  CreditCard,
  Banknote,
  Copy,
  Check
} from 'lucide-react';
import CustomerOrderThumbnailStack from './CustomerOrderThumbnailStack';
import CustomerOrderItemRow from './CustomerOrderItemRow';
import { formatOrderTimeAgo } from '../../utils/dishImageHelper';

export function getStatusBadge(status) {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Chờ Báo Bếp',
        color: 'bg-amber-500/15 text-amber-900 border-amber-400/60',
        icon: Flame,
      };
    case 'CONFIRMED':
      return {
        label: 'Đang Nấu & Phục Vụ',
        color: 'bg-emerald-500/15 text-emerald-900 border-emerald-400/60',
        icon: Clock,
      };
    case 'COMPLETED':
      return {
        label: 'Đã Hoàn Tất',
        color: 'bg-[#8a1e14]/10 text-[#8a1e14] border-[#8a1e14]/40',
        icon: CheckCircle2,
      };
    case 'CANCELLED':
      return {
        label: 'Đã Hủy',
        color: 'bg-stone-500/15 text-stone-700 border-stone-300',
        icon: AlertCircle,
      };
    default:
      return {
        label: status || 'Đang xử lý',
        color: 'bg-stone-500/15 text-stone-700 border-stone-300',
        icon: Clock,
      };
  }
}

function CustomerOrderCard({
  order,
  isExpanded,
  onToggleExpand,
  onReorder,
  onToast
}) {
  const [copied, setCopied] = useState(false);
  const badge = getStatusBadge(order.status);
  const BadgeIcon = badge.icon;
  const items = order.items || [];
  const itemCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);

  // Món chính và các món phụ
  const primaryItem = items[0] || { name: 'Phở Gia Truyền 1986', quantity: 1 };
  const secondaryItems = items.slice(1);

  // Huy hiệu thanh toán
  const isOnlinePayment = Boolean(
    order.paymentMethod && 
    (order.paymentMethod.toUpperCase().includes('SEPAY') || 
     order.paymentMethod.toUpperCase().includes('VIETQR') || 
     order.paymentMethod.toUpperCase().includes('ONLINE') ||
     order.paymentMethod.toUpperCase().includes('MOMO'))
  );

  const handleCopyOrderCode = (e) => {
    e.stopPropagation();
    if (order.orderCode && navigator.clipboard) {
      navigator.clipboard.writeText(order.orderCode);
      setCopied(true);
      if (onToast) onToast(`Đã sao chép mã đơn ${order.orderCode}`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      id={`order-card-${order.id || order.orderCode}`}
      className="bg-[#fffdfa] rounded-2xl border border-[#e5d8c5] shadow-xs hover:shadow-md transition-all overflow-hidden font-sans"
    >
      {/* HEADER THÂN THIỆN: Bữa phở tại quán / Giao tận nơi • Thời gian thân thiện + Huy hiệu trạng thái */}
      <div className="p-2.5 sm:p-3.5 bg-gradient-to-r from-[#faf5eb] via-[#fffdf9] to-[#fbf3e4] border-b border-[#ebdcc7] flex items-center justify-between gap-1.5 sm:gap-2.5">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs min-w-0">
          <span className="font-serif font-bold text-stone-800 truncate shrink-0">
            <span className="hidden sm:inline">{order.tableNumber ? '🍽️ Bữa phở tại quán' : '🛵 Đơn phở giao tận nơi'}</span>
            <span className="sm:hidden">{order.tableNumber ? '🍽️ Tại quán' : '🛵 Giao tận nơi'}</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-stone-300 shrink-0" />
          <span className="text-[10px] sm:text-[11px] text-stone-500 font-sans flex items-center gap-1 truncate">
            <Clock className="w-3 h-3 text-stone-400 shrink-0" />
            <span className="truncate">{formatOrderTimeAgo(order.createdAt)}</span>
          </span>
        </div>

        <span className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border shrink-0 whitespace-nowrap ${badge.color}`}>
          <BadgeIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span>{badge.label}</span>
        </span>
      </div>

      {/* BODY TRỰC QUAN: Ảnh món Stack + Thông tin tinh giản bằng Chip Tags + Giá tiền */}
      <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* CỘT 1: THUMBNAIL ẢNH MÓN CHÍNH HOẶC STACK ẢNH */}
          <CustomerOrderThumbnailStack order={order} />

          {/* CỘT 2: TÊN MÓN VÀ CÁC CHIP TRỰC QUAN */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-serif font-bold text-sm sm:text-base text-stone-900 leading-snug truncate">
                  {primaryItem.quantity > 1 ? `${primaryItem.quantity}x ` : ''}{primaryItem.name}
                </h4>
                {secondaryItems.length > 0 && (
                  <p className="text-[11px] text-stone-500 truncate mt-0.5">
                    + {secondaryItems.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                )}
              </div>

              {/* TỔNG TIỀN NỔI BẬT */}
              <div className="text-right shrink-0">
                <div className="text-sm sm:text-base font-serif font-black text-[#8a1e14] tracking-tight">
                  {(order.finalAmount || order.totalAmount || 0).toLocaleString('vi-VN')}đ
                </div>
                <div className="text-[10px] text-stone-400 font-sans">
                  {itemCount} món ăn
                </div>
              </div>
            </div>

            {/* DẢI CHIP TAGS: BÀN ĂN / GIAO HÀNG + THANH TOÁN + GHI CHÚ */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              {/* Tag Bàn / Mang về */}
              {order.tableNumber ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200/80 text-[#8a1e14] text-[11px] font-medium">
                  <UtensilsCrossed className="w-3 h-3" />
                  <span>Bàn {order.tableNumber} (Tầng {order.floor || 1})</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-[11px] font-medium">
                  <span>🛵 Mang về</span>
                </span>
              )}

              {/* Tag Phương thức thanh toán */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-medium">
                {isOnlinePayment ? (
                  <>
                    <CreditCard className="w-3 h-3 text-emerald-600" />
                    <span>{order.paymentMethod || 'Online'}</span>
                  </>
                ) : (
                  <>
                    <Banknote className="w-3 h-3 text-stone-600" />
                    <span>Tiền mặt</span>
                  </>
                )}
              </span>

              {/* Tag Ghi chú nếu có */}
              {order.note && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50/60 border border-amber-200/60 text-stone-700 text-[11px] italic truncate max-w-[200px]" title={order.note}>
                  💬 "{order.note}"
                </span>
              )}
            </div>

            {/* Địa chỉ giao hàng nếu có */}
            {order.deliveryAddressText && (
              <div className="mt-2 p-1.5 rounded-lg bg-[#faf5ed] border border-[#ede0cd] text-[11px] text-stone-600 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#8a1e14] shrink-0" />
                <span className="truncate">Giao đến: {order.deliveryAddressText}</span>
              </div>
            )}
          </div>
        </div>

        {/* VÙNG MỞ RỘNG: TỪNG MÓN CÓ ẢNH THUMBNAIL (CustomerOrderItemRow) */}
        {isExpanded && (
          <div className="pt-3 border-t border-stone-200/80 space-y-2 animate-fadeIn">
            <div className="text-xs font-serif font-bold text-stone-800 flex items-center justify-between">
              <span>Bát phở & thức uống đã chọn ({items.length} món):</span>
              <span className="text-[11px] font-sans font-normal text-stone-500">Kèm hình ảnh thực tế</span>
            </div>
            <div className="space-y-1.5">
              {items.map((it, idx) => (
                <CustomerOrderItemRow key={idx} item={it} />
              ))}
            </div>

            {/* DÒNG MÃ TRA CỨU BIÊN NHẬN KÍN ĐÁO KHI CẦN ĐỐI SOÁT */}
            <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] font-mono text-stone-400">
              <span className="flex items-center gap-1">
                <span>Mã tra cứu biên nhận:</span>
                <strong className="text-stone-600 font-semibold">{order.orderCode}</strong>
              </span>
              <button
                type="button"
                onClick={handleCopyOrderCode}
                className="text-[#8a1e14] hover:underline flex items-center gap-1 cursor-pointer font-sans"
                title="Sao chép mã đơn để đọc cho nhân viên khi cần hỗ trợ"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span className={copied ? 'text-emerald-700 font-bold' : ''}>{copied ? 'Đã sao chép' : 'Sao chép mã'}</span>
              </button>
            </div>
          </div>
        )}

        {/* CÁC NÚT THAO TÁC CỦA THẺ */}
        <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between gap-2 flex-wrap">
          {/* Nút Xem Chi Tiết / Thu Gọn */}
          <button
            type="button"
            id={`expand-btn-${order.id || order.orderCode}`}
            onClick={onToggleExpand}
            className="text-xs font-serif text-stone-600 hover:text-[#8a1e14] flex items-center gap-1 transition-colors py-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-stone-400" />
            <span>{isExpanded ? 'Thu gọn chi tiết' : `Xem chi tiết bát gọi (${items.length})`}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Nút 1-Click Đặt Lại Đơn Này */}
          <button
            type="button"
            id={`reorder-btn-${order.id || order.orderCode}`}
            onClick={() => onReorder(order)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-[#8a1e14] to-[#a32217] hover:from-[#73150f] hover:to-[#8a1e14] text-[#fdf8f0] text-xs font-serif font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            title="Thêm toàn bộ món trong đơn này vào giỏ hàng"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
            <span>Đặt Lại Đơn Này</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(CustomerOrderCard);

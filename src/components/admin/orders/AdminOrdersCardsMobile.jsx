import React from 'react';
import {
  Phone,
  MapPin,
  Utensils,
  Flame,
  Check,
  X,
  Printer,
  ChevronDown
} from 'lucide-react';
import { formatOrderTime, getDishThumbnail, LazyDishImage } from '../adminConstants';

export default function AdminOrdersCardsMobile({
  filteredOrders,
  expandedOrderId,
  setExpandedOrderId,
  handleUpdateOrderStatus,
  notify,
  dishes = []
}) {
  return (
    <div className="sm:hidden space-y-2.5">
      {filteredOrders.map((order) => {
        const isExpanded = expandedOrderId === order.id;
        const t = formatOrderTime(order.createdAt);
        const isDineIn =
          !order.deliveryAddressText ||
          order.deliveryAddressText.toLowerCase().includes('tại quán') ||
          order.deliveryAddressText.toLowerCase().includes('bàn');
        const tableMatch =
          order.deliveryAddressText?.match(/bàn\s*(\d+)/i) ||
          order.notes?.match(/bàn\s*(\d+)/i);
        const tableNum = order.tableNumber || (tableMatch ? tableMatch[1] : null);

        return (
          <div
            key={`mobile-row-${order.id}`}
            className={`bg-white border-2 rounded-2xl transition-all shadow-2xs overflow-hidden ${
              order.status === 'PENDING'
                ? 'border-rose-300 border-l-4 border-l-rose-600 bg-gradient-to-r from-rose-50/20 to-white'
                : order.status === 'CONFIRMED'
                ? 'border-amber-300 border-l-4 border-l-amber-600 bg-gradient-to-r from-amber-50/20 to-white'
                : order.status === 'COMPLETED'
                ? 'border-emerald-200 border-l-4 border-l-emerald-600'
                : 'border-stone-200 border-l-4 border-l-stone-400'
            }`}
          >
            {/* Thanh Tóm Tắt Dòng Chính (~64px, chạm để mở rộng) */}
            <div
              onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
              className="p-3 flex items-center justify-between gap-2.5 cursor-pointer select-none active:bg-amber-50/60"
            >
              {/* Cột 1: Bàn / Loại đơn + Mã số ngắn gọn */}
              <div className="shrink-0">
                {isDineIn ? (
                  <div className="w-12 h-12 rounded-xl bg-[#fffbeb] border border-[#fde68a] flex flex-col items-center justify-center shadow-2xs">
                    <span className="text-[11px] font-serif font-black text-[#851614] leading-none">
                      {tableNum ? `Bàn ${tableNum}` : 'Tại Quán'}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-stone-600 leading-none mt-1">
                      #{order.orderCode ? order.orderCode.replace(/^#?PHO1986-HN-?/i, '') : order.id}
                    </span>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-orange-100/90 border border-orange-300 flex flex-col items-center justify-center shadow-2xs text-orange-900">
                    <div className="flex items-center gap-0.5 leading-none">
                      <span className="text-xs">🛵</span>
                      <span className="text-[9px] font-bold uppercase tracking-tighter">Ship</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-orange-950 leading-none mt-1">
                      #{order.orderCode ? order.orderCode.replace(/^#?PHO1986-HN-?/i, '') : order.id}
                    </span>
                  </div>
                )}
              </div>

              {/* Cột 2: Tên món đầy đủ & Khách hàng */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="text-xs font-bold text-stone-900 font-serif leading-snug">
                  {order.items && order.items.length > 0
                    ? order.items.map((it) => `${it.quantity}x ${it.dishName || it.name}`).join(' • ')
                    : 'Phở Gia Truyền 1986'}
                </div>
                <div className="text-[11px] text-stone-500 font-sans flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="font-medium text-stone-800">
                    {order.guestName || order.user?.fullName || 'Khách vãng lai'}
                  </span>
                  <span className="text-stone-300">•</span>
                  <span className="text-stone-500">{t.time}</span>
                  {order.notes && (
                    <>
                      <span className="text-stone-300">•</span>
                      <span className="text-amber-800 font-medium italic">"{order.notes}"</span>
                    </>
                  )}
                </div>
              </div>

              {/* Cột 3: Giá tiền + Nút 1-Chạm + Chevron */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-serif font-black text-[#8a1e14] tracking-tight whitespace-nowrap">
                    {order.finalAmount?.toLocaleString('vi-VN')}đ
                  </div>
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold leading-tight ${
                      order.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {order.paymentStatus === 'PAID' ? 'Đã trả' : 'Chưa'}
                  </span>
                </div>

                {/* Nút 1-Chạm Thao Tác Nhanh */}
                {order.status === 'PENDING' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateOrderStatus(order.id, 'CONFIRMED');
                      notify(`Đã báo bếp nổi lửa cho đơn #${order.orderCode}!`);
                    }}
                    className="px-2.5 py-1.5 bg-[#8a1e14] hover:bg-[#70170e] text-white text-xs font-serif font-bold rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1 shrink-0"
                    title="Báo bếp nổi lửa"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-300 fill-current animate-pulse" />
                    <span className="hidden xs:inline">Nổi Lửa</span>
                  </button>
                )}
                {order.status === 'CONFIRMED' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateOrderStatus(order.id, 'COMPLETED');
                      notify(`Đã hoàn tất ra món cho đơn #${order.orderCode}!`);
                    }}
                    className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-serif font-bold rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1 shrink-0"
                    title="Hoàn tất ra món"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-200" />
                    <span className="hidden xs:inline">Ra Món</span>
                  </button>
                )}
                {order.status === 'COMPLETED' && (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                )}

                {/* Mũi tên Accordion */}
                <div
                  className={`p-1 text-stone-400 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 text-stone-700' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Vùng Chi Tiết Mở Rộng (Accordion Dropdown) */}
            {isExpanded && (
              <div className="p-3.5 bg-[#fffdfa] border-t border-amber-900/15 space-y-3">
                {/* Thông tin Khách & Địa chỉ */}
                <div className="p-2.5 rounded-xl bg-[#faf5ed] border border-[#ebdcc7] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-stone-900">
                      <Phone className="w-3.5 h-3.5 text-[#8a1e14]" />
                      <span>{order.guestPhone || order.user?.phone || 'Chưa có SĐT'}</span>
                    </div>
                    <div className="text-stone-500 font-mono text-[11px]">
                      {t.ago} ({t.time})
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 text-stone-700">
                    <MapPin className="w-3.5 h-3.5 text-[#8a1e14] shrink-0 mt-0.5" />
                    <span>{order.deliveryAddressText || 'Dùng tại quán (Số 45 Hàng Bạc, Hoàn Kiếm, Hà Nội)'}</span>
                  </div>
                </div>

                {/* Danh sách món ăn có ảnh */}
                <div className="space-y-2">
                  <div className="text-[11px] font-serif font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                    <Utensils className="w-3 h-3 text-[#8a1e14]" />
                    <span>Chi tiết món ăn:</span>
                  </div>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((it, itIdx) => {
                      const img = getDishThumbnail(it.dishName || it.name, it.dishId, dishes);
                      return (
                        <div
                          key={itIdx}
                          className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-stone-200 shadow-2xs"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-amber-600/20 shrink-0 bg-stone-100">
                            <LazyDishImage src={img} alt={it.dishName || it.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-stone-900 leading-snug">
                              {it.dishName || it.name}
                            </div>
                            <div className="text-[11px] text-stone-500 font-mono">
                              {(it.unitPrice || it.price)?.toLocaleString('vi-VN')}đ
                            </div>
                          </div>
                          <div className="w-6 h-6 rounded-md bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center shrink-0">
                            x{it.quantity}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-stone-200 shadow-2xs">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-amber-600/20 shrink-0 bg-stone-100">
                        <img
                          src="https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=300&q=80"
                          alt="Phở Gia Truyền 1986"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-stone-900 leading-snug">
                          Phở Gia Truyền 1986 (Đặc Sản Bếp Nấu)
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono">
                          {order.finalAmount ? order.finalAmount.toLocaleString('vi-VN') + 'đ' : '150.000đ'}
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-md bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center shrink-0">
                        x1
                      </div>
                    </div>
                  )}
                </div>

                {/* Ghi chú bếp */}
                {order.notes && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border-l-3 border-[#8a1e14] border border-amber-200 text-xs text-[#3d2417] flex items-center gap-2">
                    <span className="shrink-0">📝</span>
                    <span>Lưu ý bếp: <strong>"{order.notes}"</strong></span>
                  </div>
                )}

                {/* Visual Stepper mobile */}
                <div className="p-2 rounded-xl bg-[#f4ead9]/50 border border-amber-900/10">
                  <div className="flex items-center justify-between text-[11px] font-serif font-bold text-stone-700">
                    <span className={order.status !== 'CANCELLED' ? 'text-[#8a1e14]' : 'text-stone-400'}>1. Quầy Nhận</span>
                    <span className={order.status === 'CONFIRMED' || order.status === 'COMPLETED' ? 'text-[#8a1e14]' : 'text-stone-400'}>2. Bếp Nấu</span>
                    <span className={order.status === 'COMPLETED' ? 'text-emerald-800' : 'text-stone-400'}>3. Ra Món</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mt-1">
                    <div className={`h-1.5 rounded-full ${order.status !== 'CANCELLED' ? 'bg-[#8a1e14]' : 'bg-stone-200'}`} />
                    <div className={`h-1.5 rounded-full ${order.status === 'CONFIRMED' || order.status === 'COMPLETED' ? 'bg-[#8a1e14]' : 'bg-stone-200'}`} />
                    <div className={`h-1.5 rounded-full ${order.status === 'COMPLETED' ? 'bg-emerald-600' : 'bg-stone-200'}`} />
                  </div>
                </div>

                {/* Cụm nút hành động đầy đủ */}
                <div className="flex items-center gap-2 pt-2 border-t border-amber-900/10 justify-end">
                  <button
                    type="button"
                    onClick={() => notify(`Đang in phiếu lệnh bếp cho đơn #${order.orderCode}...`)}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-serif font-bold flex items-center gap-1.5 border border-stone-300 shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-stone-600" />
                    <span>In Vé</span>
                  </button>

                  {order.status === 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateOrderStatus(order.id, 'CONFIRMED');
                        notify(`Đã báo bếp nổi lửa cho đơn #${order.orderCode}!`);
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-[#8a1e14] to-[#70170e] text-white rounded-xl text-xs font-serif font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Flame className="w-3.5 h-3.5 text-amber-300" />
                      <span>Báo Bếp Nổi Lửa</span>
                    </button>
                  )}

                  {order.status === 'CONFIRMED' && (
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateOrderStatus(order.id, 'COMPLETED');
                        notify(`Đã hoàn tất đơn #${order.orderCode}!`);
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-[#145a32] to-[#196f3d] text-white rounded-xl text-xs font-serif font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Ra Món Xong</span>
                    </button>
                  )}

                  {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}
                      className="p-2 text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-300 shadow-2xs"
                      title="Hủy đơn"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

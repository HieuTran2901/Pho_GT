import React from 'react';
import {
  ClipboardList,
  Clock,
  Phone,
  MapPin,
  Utensils,
  Flame,
  Check,
  Printer
} from 'lucide-react';
import { formatOrderTime, getDishThumbnail, LazyDishImage } from '../adminConstants';

export default function AdminOrdersTableMobile({
  filteredOrders,
  tableExpandedOrderId,
  setTableExpandedOrderId,
  handleUpdateOrderStatus,
  notify,
  dishes = []
}) {
  if (filteredOrders.length === 0) {
    return (
      <div className="bg-[#fffdf9] border-2 border-amber-900/25 rounded-2xl p-8 text-center text-stone-600 font-serif shadow-md">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2 border border-amber-200">
          <ClipboardList className="w-6 h-6" />
        </div>
        <div className="font-bold text-sm text-stone-800">Không có đơn hàng nào trong mục này</div>
      </div>
    );
  }

  return (
    <div className="bg-[#fffdf9] border-2 border-amber-900/25 rounded-2xl overflow-hidden shadow-lg divide-y divide-amber-900/10">
      {/* Tiêu đề Bảng Kê Mobile */}
      <div className="bg-gradient-to-r from-[#2a160d] via-[#381e13] to-[#2a160d] px-3.5 py-2.5 text-[#f5e6c8] font-serif uppercase tracking-wider text-[10px] font-black flex items-center justify-between border-b-2 border-[#d4af37]/40 shadow-xs">
        <span className="w-[28%]">Đơn & Kênh</span>
        <span className="w-[42%] text-left">Món & Khách</span>
        <span className="w-[30%] text-right">Tiền & Bếp</span>
      </div>

      {filteredOrders.map((order, idx) => {
        const t = formatOrderTime(order.createdAt);
        const isDineIn =
          !order.deliveryAddressText ||
          order.deliveryAddressText.toLowerCase().includes('tại quán') ||
          order.deliveryAddressText.toLowerCase().includes('bàn');
        const shortCode = order.orderCode?.replace(/^#?PHO1986-HN-?/i, '') || order.orderCode;
        const isExpanded = tableExpandedOrderId === order.id;

        const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
        const firstDishName = firstItem ? (firstItem.dishName || firstItem.name) : 'Phở Gia Truyền 1986';
        const firstDishQty = firstItem ? firstItem.quantity : 1;
        const extraCount = order.items && order.items.length > 1 ? order.items.length - 1 : 0;

        return (
          <div
            key={order.id}
            className={`transition-colors ${idx % 2 === 0 ? 'bg-[#fffdfa]' : 'bg-[#faf4e8]/50'} ${
              isExpanded ? 'bg-amber-50/70 ring-1 ring-[#8a1e14]/20' : ''
            }`}
          >
            {/* Dòng tóm lược 3 cột vừa khít 100% */}
            <div
              onClick={() => setTableExpandedOrderId(isExpanded ? null : order.id)}
              className="p-3 flex items-center justify-between gap-1.5 cursor-pointer active:bg-amber-100/60 select-none"
            >
              {/* Cột 1: Đơn & Kênh (~28%) */}
              <div className="w-[28%] shrink-0 space-y-1">
                <div className="flex items-center gap-1">
                  {isDineIn ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-serif font-black bg-emerald-700 text-white shadow-2xs">
                      🍲 Tại Quán
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-serif font-black bg-amber-500 text-stone-950 shadow-2xs">
                      🛵 Ship
                    </span>
                  )}
                </div>
                <div className="font-mono font-black text-xs text-[#8a1e14] tracking-tight">
                  #{shortCode}
                </div>
                <div className="text-[10px] text-stone-500 font-mono flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5 text-amber-800 shrink-0" />
                  <span>{t.time}</span>
                </div>
              </div>

              {/* Cột 2: Món & Khách (~42%) */}
              <div className="w-[42%] min-w-0 pr-1">
                <div className="font-serif font-black text-xs text-stone-950 leading-snug break-words">
                  {firstDishName}
                  <span className="inline-block ml-1 font-mono font-black text-[11px] text-[#8a1e14]">
                    x{firstDishQty}
                  </span>
                  {extraCount > 0 && (
                    <span className="text-[10px] text-amber-800 font-bold ml-1">
                      +{extraCount} món
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-stone-600 font-sans mt-0.5">
                  {order.guestName || order.user?.fullName || 'Khách vãng lai'}
                </div>
                {order.notes && (
                  <div className="text-[10px] text-amber-900 font-medium italic mt-0.5">
                    "{order.notes}"
                  </div>
                )}
              </div>

              {/* Cột 3: Tiền & Bếp (~30%) */}
              <div className="w-[30%] shrink-0 flex flex-col items-end justify-center">
                <div className="text-xs font-serif font-black text-[#8a1e14] tracking-tight whitespace-nowrap">
                  {order.finalAmount?.toLocaleString('vi-VN')}đ
                </div>
                <div className="mt-1">
                  {order.status === 'PENDING' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateOrderStatus(order.id, 'CONFIRMED');
                        notify(`Đã báo bếp nổi lửa cho đơn #${order.orderCode}!`);
                      }}
                      className="px-2 py-1 bg-[#8a1e14] hover:bg-[#a12419] text-white text-[10px] font-serif font-bold rounded-lg shadow-xs flex items-center gap-1 active:scale-95"
                    >
                      <Flame className="w-3 h-3 text-amber-300 fill-current animate-pulse" />
                      <span>Báo Bếp</span>
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
                      className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-serif font-bold rounded-lg shadow-xs flex items-center gap-1 active:scale-95"
                    >
                      <Check className="w-3 h-3 text-emerald-200" />
                      <span>Ra Món</span>
                    </button>
                  )}
                  {order.status === 'COMPLETED' && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-serif font-bold bg-emerald-100 text-emerald-800">
                      <Check className="w-3 h-3" />
                      <span>Xong</span>
                    </span>
                  )}
                  {order.status === 'CANCELLED' && (
                    <span className="text-[10px] font-serif font-medium text-stone-400">
                      Đã hủy
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Chi tiết mở rộng Accordion trên Mobile */}
            {isExpanded && (
              <div className="p-3 bg-[#fffdfa] border-t border-amber-900/15 space-y-2.5">
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

                {/* Danh sách món chi tiết */}
                <div className="space-y-1.5">
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
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-amber-600/20 shrink-0 bg-stone-100">
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
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-amber-600/20 shrink-0 bg-stone-100">
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

                {/* Hành động */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-900/10">
                  <button
                    type="button"
                    onClick={() => notify(`Đang in phiếu lệnh bếp cho đơn #${order.orderCode}...`)}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-serif font-bold flex items-center gap-1 border border-stone-300"
                  >
                    <Printer className="w-3 h-3" />
                    <span>In Vé</span>
                  </button>
                  {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}
                      className="px-3 py-1.5 text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-300 shadow-2xs text-xs font-serif font-bold"
                    >
                      Hủy Đơn
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

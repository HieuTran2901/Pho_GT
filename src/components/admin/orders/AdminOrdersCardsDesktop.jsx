import React from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  MapPin,
  Clock,
  Utensils,
  Flame,
  Check,
  X
} from 'lucide-react';
import { formatOrderTime, getDishThumbnail, LazyDishImage } from '../adminConstants';

export default function AdminOrdersCardsDesktop({
  filteredOrders,
  handleUpdateOrderStatus,
  dishes = []
}) {
  return (
    <div className="hidden sm:grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {filteredOrders.map((order) => {
        const t = formatOrderTime(order.createdAt);
        const isDineIn =
          !order.deliveryAddressText ||
          order.deliveryAddressText.toLowerCase().includes('tại quán') ||
          order.deliveryAddressText.toLowerCase().includes('bàn');

        return (
          <motion.div
            key={order.id}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="bg-white border-2 border-amber-900/35 hover:border-[#8a1e14] rounded-3xl p-5 shadow-lg shadow-amber-950/8 hover:shadow-2xl transition-all relative flex flex-col justify-between overflow-hidden group"
          >
            <div>
              {/* 1. Header Thẻ Phiếu Bếp */}
              <div className="flex items-center justify-between pb-3.5 border-b-2 border-amber-900/15">
                <div>
                  {isDineIn ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-serif font-extrabold bg-emerald-700 text-white shadow-xs">
                      <span>🍲 Dùng Tại Quán</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-serif font-extrabold bg-amber-500 text-stone-950 border border-amber-600 shadow-xs">
                      <span>🛵 Giao Tận Nơi</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm bg-stone-100 text-[#8a1e14] px-3 py-1 rounded-lg border-2 border-dashed border-[#8a1e14]/60 tracking-wider shadow-2xs">
                    #{order.orderCode}
                  </span>
                </div>
              </div>

              {/* 2. Thực Khách & Nơi Phục Vụ */}
              <div className="py-3.5 border-b-2 border-amber-900/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8a1e14] to-[#a83226] text-white flex items-center justify-center font-serif font-black text-sm shadow-md shrink-0 border-2 border-amber-300">
                      {(order.guestName || order.user?.fullName || 'K').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-black text-stone-950 font-serif text-base leading-tight">
                        {order.guestName || order.user?.fullName || 'Khách vãng lai'}
                      </div>
                      <div className="text-stone-900 font-mono text-xs font-bold flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-[#8a1e14] shrink-0" />
                        <span>{order.guestPhone || order.user?.phone || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs text-stone-900">
                    <div className="flex items-center gap-1 justify-end font-bold text-stone-900">
                      <Clock className="w-3.5 h-3.5 text-amber-800" />
                      <span>{t.time}</span>
                    </div>
                    <span className="text-[11px] text-stone-600 font-medium font-serif">{t.ago}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-stone-900 font-medium pt-1">
                  <MapPin className="w-4 h-4 text-[#8a1e14] shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed">
                    {order.deliveryAddressText || 'Dùng tại quán (Số 45 Hàng Bạc, Hoàn Kiếm, Hà Nội)'}
                  </span>
                </div>
              </div>

              {/* 3. Danh Sách Món Ăn Bếp Nấu */}
              <div className="py-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-extrabold text-stone-950 uppercase tracking-wide flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-[#8a1e14]" />
                    Món Phở Đã Gọi ({order.items ? order.items.length : 0})
                  </span>
                  <span className="text-xs font-serif font-bold text-stone-700">Khẩu phần</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((it, itIdx) => {
                      const img = getDishThumbnail(it.dishName || it.name, it.dishId, dishes);
                      return (
                        <div
                          key={itIdx}
                          className="flex items-center gap-3 p-2.5 bg-[#fdfbf7] hover:bg-[#fff9ef] border-2 border-stone-200/90 rounded-2xl transition-colors shadow-2xs group/item"
                        >
                          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-800/30 shrink-0 bg-stone-100 shadow-xs">
                            <LazyDishImage src={img} alt={it.dishName || it.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-serif font-bold text-sm text-stone-950 truncate leading-snug">
                              {it.dishName || it.name}
                            </div>
                            <div className="text-xs text-stone-700 font-mono font-medium">
                              {(it.unitPrice || it.price)?.toLocaleString('vi-VN')}đ / phần
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 font-black text-sm flex items-center justify-center border border-amber-600 shadow-2xs shrink-0">
                            x{it.quantity}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center gap-3 p-2.5 bg-[#fdfbf7] border-2 border-stone-200/90 rounded-2xl shadow-2xs">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-800/30 shrink-0 bg-stone-100 shadow-xs">
                        <img
                          src="https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=300&q=80"
                          alt="Phở Gia Truyền 1986"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-serif font-bold text-sm text-stone-950 leading-snug">
                          Phở Gia Truyền 1986
                        </div>
                        <div className="text-xs text-stone-700 font-bold mt-0.5">Tô tiêu chuẩn</div>
                        <div className="text-sm font-serif font-black text-[#8a1e14] mt-0.5">
                          {order.finalAmount ? order.finalAmount.toLocaleString('vi-VN') + 'đ' : '150.000đ'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lưu ý bếp */}
                {order.notes && (
                  <div className="p-3 bg-amber-100/90 border-l-4 border-amber-600 rounded-r-2xl text-xs text-stone-950 font-serif leading-relaxed flex items-start gap-2 shadow-2xs">
                    <span className="font-black text-amber-950 shrink-0">📝 Lưu ý bếp:</span>
                    <span className="font-bold italic text-stone-950">"{order.notes}"</span>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Footer Thẻ: Visual Stepper + Tổng Tiền + Nút Hành Động */}
            <div className="pt-3.5 border-t-2 border-amber-900/15 space-y-3.5">
              {/* Visual Stepper */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-serif font-black uppercase tracking-wider text-stone-700">
                  <span className={order.status !== 'CANCELLED' ? 'text-[#8a1e14]' : 'text-stone-400'}>1. Quầy Nhận</span>
                  <span className={order.status === 'CONFIRMED' || order.status === 'COMPLETED' ? 'text-[#8a1e14]' : 'text-stone-400'}>2. Bếp Nổi Lửa</span>
                  <span className={order.status === 'COMPLETED' ? 'text-emerald-800' : 'text-stone-400'}>3. Ra Món</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className={`h-2 rounded-full ${order.status !== 'CANCELLED' ? 'bg-[#8a1e14]' : 'bg-stone-200'}`} />
                  <div className={`h-2 rounded-full ${order.status === 'CONFIRMED' || order.status === 'COMPLETED' ? 'bg-[#8a1e14]' : 'bg-stone-200'}`} />
                  <div className={`h-2 rounded-full ${order.status === 'COMPLETED' ? 'bg-emerald-600' : 'bg-stone-200'}`} />
                </div>
              </div>

              {/* Hóa đơn & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <div className="text-[11px] text-stone-700 font-serif font-bold uppercase tracking-wider">Tổng hóa đơn</div>
                  <div className="text-xl sm:text-2xl font-black font-serif text-[#8a1e14] leading-tight">
                    {order.finalAmount?.toLocaleString('vi-VN')}đ
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-black font-mono tracking-wide ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-amber-400 text-stone-950 border border-amber-600 shadow-2xs'
                      }`}
                    >
                      {order.paymentStatus === 'PAID' ? 'ĐÃ TRẢ' : 'CHƯA TRẢ'}
                    </span>
                    <span className="text-xs text-stone-700 font-mono font-bold">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Cụm nút Bếp to bản */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {order.status === 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateOrderStatus(order.id, 'CONFIRMED')}
                      className="flex-1 sm:flex-initial justify-center px-4 py-3 bg-gradient-to-r from-[#8a1e14] to-[#70170e] hover:from-[#a12419] hover:to-[#8a1e14] text-white rounded-2xl text-xs sm:text-sm font-serif font-black shadow-md shadow-[#8a1e14]/35 transition-all active:scale-95 flex items-center gap-2 border-2 border-[#d4af37]/50 min-h-[44px]"
                      title="Tiếp nhận đơn và báo bếp nổi lửa"
                    >
                      <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span>Báo Bếp Nổi Lửa</span>
                    </button>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                      className="flex-1 sm:flex-initial justify-center px-4 py-3 bg-gradient-to-r from-[#145a32] to-[#196f3d] hover:from-[#196f3d] hover:to-[#1e8449] text-white rounded-2xl text-xs sm:text-sm font-serif font-black transition-all active:scale-95 shadow-md shadow-emerald-950/25 flex items-center gap-2 border-2 border-emerald-400/50 min-h-[44px]"
                      title="Hoàn tất phục vụ ra món"
                    >
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span>Ra Món Xong</span>
                    </button>
                  )}
                  {order.status === 'COMPLETED' && (
                    <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-950 border-2 border-emerald-400 text-xs font-serif font-black flex items-center gap-1.5 shadow-2xs min-h-[44px]">
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>Đã Hoàn Tất</span>
                    </span>
                  )}
                  {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}
                      className="p-2.5 text-stone-600 hover:text-rose-700 hover:bg-rose-50 rounded-2xl transition-colors border-2 border-stone-300 shadow-2xs min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Hủy đơn hàng"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

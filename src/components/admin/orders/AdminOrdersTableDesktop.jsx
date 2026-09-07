import React from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Clock,
  Phone,
  MapPin,
  Flame,
  Check,
  Printer
} from 'lucide-react';
import { formatOrderTime, getDishThumbnail, LazyDishImage } from '../adminConstants';

export default function AdminOrdersTableDesktop({
  filteredOrders,
  selectedOrderIds,
  setSelectedOrderIds,
  toggleSelectOrder,
  toggleSelectAllOrders,
  handleBulkUpdateStatus,
  handleUpdateOrderStatus,
  notify,
  dishes = []
}) {
  return (
    <div className="hidden sm:block space-y-3.5">
      {/* Floating Bulk Action Bar */}
      {selectedOrderIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-gradient-to-r from-[#2a160d] via-[#451f12] to-[#2a160d] border-2 border-[#d4af37]/60 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between flex-wrap gap-3"
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-serif font-bold text-sm text-amber-200">
              Đang chọn: <strong className="text-white text-base">{selectedOrderIds.length}</strong> / {filteredOrders.length} đơn hàng
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleBulkUpdateStatus('CONFIRMED', 'Bếp Đang Nấu')}
              className="px-3.5 py-1.5 bg-gradient-to-r from-[#8a1e14] to-[#a8281d] hover:from-[#a8281d] hover:to-[#8a1e14] text-white rounded-xl text-xs font-serif font-bold flex items-center gap-1.5 shadow-md active:scale-95 border border-amber-400/40"
            >
              <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Báo Bếp Hàng Loạt ({selectedOrderIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => notify(`Đang phát lệnh in hàng loạt cho ${selectedOrderIds.length} phiếu bếp...`)}
              className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-stone-900 rounded-xl text-xs font-serif font-bold flex items-center gap-1.5 shadow-md active:scale-95 border border-amber-300"
            >
              <Printer className="w-3.5 h-3.5 text-[#8a1e14]" />
              <span>In Hàng Loạt ({selectedOrderIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedOrderIds([])}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl text-xs font-serif font-medium transition-colors"
            >
              Bỏ chọn
            </button>
          </div>
        </motion.div>
      )}

      <div className="bg-[#fffdf9] border-2 border-amber-900/25 rounded-2xl overflow-hidden shadow-xl shadow-amber-950/10 ring-1 ring-amber-900/10">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs table-auto">
            <thead className="bg-gradient-to-r from-[#2a160d] via-[#381e13] to-[#2a160d] border-b-2 border-[#d4af37]/50 text-[#f5e6c8] font-serif uppercase tracking-wider text-[11px] shadow-sm">
              <tr>
                <th className="py-3.5 px-3 w-[4%] text-center">
                  <input
                    type="checkbox"
                    checked={selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length}
                    onChange={toggleSelectAllOrders}
                    className="w-4 h-4 rounded accent-[#8a1e14] cursor-pointer"
                    title="Chọn tất cả đơn hàng"
                  />
                </th>
                <th className="py-3.5 px-3 w-[16%] whitespace-nowrap">Mã Đơn & Kênh</th>
                <th className="py-3.5 px-4 w-[26%]">Thực Khách & Nơi Phục Vụ</th>
                <th className="py-3.5 px-4 w-[26%]">Món Ăn & Lưu Ý Bếp</th>
                <th className="py-3.5 px-4 w-[14%]">Hóa Đơn & Tiến Độ</th>
                <th className="py-3.5 px-4 w-[14%] text-right">Điều Phối</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/10">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-stone-600 font-serif bg-[#faf5ec]">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3 border border-amber-200">
                      <ClipboardList className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-base text-stone-800">
                      Không tìm thấy đơn hàng nào trong phân loại này
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, idx) => {
                  const t = formatOrderTime(order.createdAt);
                  const isDineIn =
                    !order.deliveryAddressText ||
                    order.deliveryAddressText.toLowerCase().includes('tại quán') ||
                    order.deliveryAddressText.toLowerCase().includes('bàn');

                  return (
                    <tr
                      key={order.id}
                      className={`transition-all hover:bg-[#f5e7cf]/90 border-l-4 hover:border-l-[#8a1e14] ${
                        idx % 2 === 0 ? 'bg-[#fffdfa]' : 'bg-[#faf4e8]/60'
                      }`}
                    >
                      {/* Checkbox Cột Chọn */}
                      <td className="p-3 text-center align-top">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(order.id)}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="w-4 h-4 rounded accent-[#8a1e14] cursor-pointer mt-1"
                        />
                      </td>

                      {/* Cột 1: Mã Đơn & Kênh */}
                      <td className="p-3 align-top whitespace-nowrap">
                        <div className="space-y-1.5">
                          <span className="font-mono font-bold text-xs bg-[#fff4f0] text-[#8a1e14] px-2.5 py-1 rounded border border-dashed border-[#8a1e14]/50 tracking-wider shadow-2xs whitespace-nowrap inline-block">
                            #{order.orderCode}
                          </span>
                          <div className="flex items-center gap-1 text-stone-700 font-mono text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span className="font-semibold">{t.time}</span>
                            <span className="text-stone-500 font-sans text-[10px]">({t.ago})</span>
                          </div>
                          <div>
                            {isDineIn ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-serif font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                                🍲 Tại Quán
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-serif font-bold bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs">
                                🛵 Giao Tận Nơi
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Thực Khách & Nơi Phục Vụ */}
                      <td className="p-4 align-top">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8a1e14] to-[#c88d44] text-white flex items-center justify-center font-serif font-bold text-xs shadow-2xs shrink-0 border border-[#d4af37]/40">
                              {(order.guestName || order.user?.fullName || 'K').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-stone-900 font-serif text-sm leading-tight">
                                {order.guestName || order.user?.fullName || 'Khách vãng lai'}
                              </div>
                              <div className="text-stone-600 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                                <span>{order.guestPhone || order.user?.phone || '—'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-1.5 text-stone-800 text-xs font-serif leading-relaxed break-words">
                            <MapPin className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                            <span>{order.deliveryAddressText || 'Dùng tại quán (Số 45 Hàng Bạc, Hoàn Kiếm, Hà Nội)'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Cột 3: Món Ăn & Lưu Ý Bếp */}
                      <td className="p-4 align-top">
                        <div className="space-y-2">
                          <div className="space-y-1">
                            {order.items && order.items.length > 0 ? (
                              order.items.map((it, itemIdx) => {
                                const img = getDishThumbnail(it.dishName, it.dishId, dishes);
                                return (
                                  <div
                                    key={itemIdx}
                                    className="flex items-center gap-2 text-xs text-stone-900"
                                  >
                                    <div className="w-7 h-7 rounded-lg overflow-hidden border border-amber-900/20 shrink-0 bg-stone-100">
                                      <LazyDishImage
                                        src={img}
                                        alt={it.dishName}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <span className="font-serif font-medium break-words pr-1">{it.dishName}</span>
                                    <span className="font-mono font-bold text-amber-900 shrink-0">x{it.quantity}</span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-xs text-stone-700 font-serif">
                                Phở Gia Truyền 1986
                              </div>
                            )}
                          </div>

                          {order.notes && (
                            <div className="text-[11px] text-amber-950 italic p-1.5 rounded-md bg-amber-100/70 border-l-2 border-[#8a1e14]">
                              📝 {order.notes}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Cột 4: Hóa Đơn & Tiến Độ */}
                      <td className="p-4 align-top">
                        <div className="space-y-1.5">
                          <div className="font-bold text-[#8a1e14] font-serif text-base tracking-tight">
                            {order.finalAmount?.toLocaleString('vi-VN')}đ
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide ${
                              order.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}>
                              {order.paymentStatus === 'PAID' ? 'ĐÃ TRẢ' : 'CHƯA TRẢ'}
                            </span>
                            <span className="text-[10px] text-stone-600 font-mono">
                              {order.paymentMethod}
                            </span>
                          </div>
                          <div>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-serif ${
                              order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                              order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                              order.status === 'CANCELLED' ? 'bg-stone-200 text-stone-700 border border-stone-300' :
                              'bg-rose-100 text-rose-900 border border-rose-300'
                            }`}>
                              {order.status === 'PENDING' ? 'CHỜ BÁO BẾP' :
                               order.status === 'CONFIRMED' ? 'BẾP ĐANG NẤU' :
                               order.status === 'COMPLETED' ? 'HOÀN TẤT' : 'ĐÃ HỦY'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cột 5: Điều Phối */}
                      <td className="p-4 align-top text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => notify(`Đang in phiếu lệnh bếp cho đơn #${order.orderCode}...`)}
                              className="p-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-lg transition-colors shadow-2xs"
                              title="In vé"
                            >
                              <Printer className="w-3.5 h-3.5 text-stone-700" />
                            </button>

                            {order.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStatus(order.id, 'CONFIRMED')}
                                className="px-3 py-1 bg-gradient-to-r from-[#8a1e14] to-[#70170e] hover:from-[#a12419] hover:to-[#8a1e14] text-white rounded-xl text-xs font-serif font-bold shadow-xs active:scale-95 flex items-center gap-1"
                              >
                                <Flame className="w-3 h-3 text-amber-300" />
                                <span>Báo Bếp</span>
                              </button>
                            )}
                            {order.status === 'CONFIRMED' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                                className="px-3 py-1 bg-gradient-to-r from-[#145a32] to-[#196f3d] hover:from-[#196f3d] hover:to-[#1e8449] text-white rounded-xl text-xs font-serif font-bold active:scale-95 shadow-xs flex items-center gap-1"
                              >
                                <Check className="w-3 h-3 text-emerald-200" />
                                <span>Ra Món</span>
                              </button>
                            )}
                            {order.status === 'COMPLETED' && (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-serif font-bold inline-flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Xong</span>
                              </span>
                            )}
                          </div>

                          {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}
                              className="px-2 py-0.5 text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 text-xs font-serif transition-colors"
                            >
                              Hủy đơn
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

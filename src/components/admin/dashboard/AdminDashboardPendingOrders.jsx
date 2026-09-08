import React from 'react';
import {
  Flame,
  Clock,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Phone,
  Eye,
  Printer,
  Check
} from 'lucide-react';
import { useHorizontalDragScroll } from './useHorizontalDragScroll';

function AdminDashboardPendingOrders({
  dashboardPendingList,
  dashPendingViewMode,
  setDashPendingViewMode,
  expandedDashOrderId,
  setExpandedDashOrderId,
  handleUpdateOrderStatus,
  notify,
  setActiveTab,
  setOrderFilter
}) {
  const {
    containerProps,
    isDragging,
    canScrollLeft,
    canScrollRight,
    scrollProgress,
    scrollStep,
  } = useHorizontalDragScroll({ step: 374 });
  return (
    <div id="pending-orders-section" className="space-y-3 sm:space-y-4">
      {/* TIÊU ĐỀ KHU VỰC VÉ BẾP & THANH CÔNG CỤ CHUYỂN CHẾ ĐỘ */}
      <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-[#7a1815] to-[#8c1e19] border border-[#d4af37]/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-[#fef3c7] text-[#851614] flex items-center justify-center shrink-0 shadow-xs">
            <Flame className="w-6 h-6 fill-current text-[#851614]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold font-serif text-white tracking-wide">
                Đơn Mới Cần Tiếp Nhận & Báo Bếp
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#67100e] text-[#fde68a] text-[11px] font-serif border border-[#962520]">
                <Clock className="w-3 h-3" />
                <span>{dashboardPendingList.length} đơn</span>
              </span>
            </div>
            <p className="text-xs text-[#fcd3cf] font-sans mt-0.5">
              Đơn đã thanh toán online hoặc đặt món đang chờ nhà bếp nổi lửa chần bánh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Bộ Chuyển Đổi Chế Độ Xem Ngay Tại Khung (Compact Rows vs Swipe Carousel) */}
          <div className="flex items-center bg-[#5c100e] p-1 rounded-xl border border-[#962520] shadow-2xs">
            <button
              type="button"
              onClick={() => setDashPendingViewMode('compact')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 transition-all ${
                dashPendingViewMode === 'compact'
                  ? 'bg-white text-[#851614] shadow-xs'
                  : 'text-amber-200/80 hover:text-white'
              }`}
              title="Chế độ dòng tinh gọn — hiển thị Top 3 đơn khẩn cấp không cuộn dài trang"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Dòng Gọn (Top 3)</span>
            </button>
            <button
              type="button"
              onClick={() => setDashPendingViewMode('carousel')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 transition-all ${
                dashPendingViewMode === 'carousel'
                  ? 'bg-white text-[#851614] shadow-xs'
                  : 'text-amber-200/80 hover:text-white'
              }`}
              title="Chế độ băng chuyền vuốt ngang — xem từng thẻ bằng ngón cái"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Lướt Ngang</span>
            </button>
          </div>

          {/* Cặp Nút Điều Hướng Trái / Phải Cho Băng Chuyền Desktop (Khi ở chế độ Carousel) */}
          {dashPendingViewMode === 'carousel' && (
            <div className="hidden sm:flex items-center gap-1 bg-[#5c100e] p-1 rounded-xl border border-[#962520] shadow-2xs">
              <button
                type="button"
                onClick={() => scrollStep('left')}
                disabled={!canScrollLeft}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed text-amber-200 hover:text-white hover:bg-white/10 active:scale-95"
                title="Lướt sang trái"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollStep('right')}
                disabled={!canScrollRight}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed text-amber-200 hover:text-white hover:bg-white/10 active:scale-95"
                title="Lướt sang phải"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Nút Xem Tất Cả Đơn */}
          <button
            type="button"
            onClick={() => { setActiveTab('orders'); setOrderFilter('PENDING'); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-stone-100 text-[#851614] text-xs font-serif font-bold shadow-sm transition-all"
          >
            <span>Sổ đơn ({dashboardPendingList.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* NẾU KHÔNG CÓ ĐƠN CHỜ TIẾP NHẬN */}
      {dashboardPendingList.length === 0 ? (
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 text-center text-stone-600 font-serif shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2.5 border border-emerald-200 shadow-2xs">
            <Check className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="font-bold text-sm sm:text-base text-stone-900">
            Tất cả đơn mới đã được tiếp nhận & báo bếp!
          </div>
          <div className="text-xs text-stone-500 mt-1 font-sans">
            Bếp đang vận hành ổn định. Đơn hàng mới phát sinh sẽ lập tức hiển thị tại đây.
          </div>
        </div>
      ) : (
        <>
          {/* CHẾ ĐỘ 1: KHAY DÒNG TINH GỌN 1-CHẠM (COMPACT ROWS - TOP 3 KHẨN CẤP NHẤT) */}
          {dashPendingViewMode === 'compact' && (
            <div className="space-y-2.5">
              {dashboardPendingList.slice(0, 3).map((order) => {
                const isExpanded = expandedDashOrderId === order.id;
                return (
                  <div
                    key={order.id}
                    className="bg-white hover:bg-[#fffdfa] border border-stone-300/80 border-l-4 border-l-[#851614] rounded-2xl shadow-2xs transition-all overflow-hidden"
                  >
                {/* Thanh Tóm Tắt Dòng Chính (Main Compact Strip) */}
                <div
                  onClick={() => setExpandedDashOrderId(isExpanded ? null : order.id)}
                  className="p-3 sm:p-3.5 flex items-center justify-between gap-2.5 sm:gap-3.5 cursor-pointer select-none"
                >
                  {/* Cột 1: Bàn / Loại đơn trực quan */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {order.tableNumber ? (
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#fffbeb] border border-[#fde68a] flex flex-col items-center justify-center shadow-2xs">
                        <span className="text-[12px] font-serif font-black text-[#851614] leading-none">
                          B{order.tableNumber}
                        </span>
                        <span className="text-[9px] text-stone-500 font-sans leading-none mt-0.5">
                          T{order.floor || 1}
                        </span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-orange-100/80 border border-orange-300 flex flex-col items-center justify-center shadow-2xs text-orange-900">
                        <span className="text-xs">🛵</span>
                        <span className="text-[8px] font-bold leading-none uppercase tracking-tighter mt-0.5">
                          Ship
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Cột 2: Tóm tắt món & Thực khách */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-bold text-stone-900 font-serif truncate">
                      {order.items.map((it) => `${it.quantity}x ${it.name}`).join(' • ')}
                    </div>
                    <div className="text-[11px] text-stone-500 font-sans flex items-center gap-2 mt-0.5 truncate">
                      <span className="truncate">{order.guestName}</span>
                      <span className="text-stone-300">•</span>
                      <span className="text-[#851614] font-medium shrink-0">{order.orderTime}</span>
                    </div>
                  </div>

                  {/* Cột 3: Giá tiền + Nút Nổi Lửa 1-Chạm + Nút Mở Rộng */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-serif font-black text-[#851614] tracking-tight">
                        {order.finalAmount.toLocaleString('vi-VN')}đ
                      </div>
                      <div className="text-[9px] text-stone-400 font-sans hidden xs:block">
                        {order.orderCode}
                      </div>
                    </div>

                    {/* Nút 1-Chạm Báo Bếp Nổi Lửa Ngay Tại Dòng */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateOrderStatus(order.id, 'CONFIRMED');
                        notify(`Đã phát lệnh nổi lửa báo bếp cho ${order.tableNumber ? 'Bàn ' + order.tableNumber : order.orderCode}!`);
                      }}
                      className="px-2.5 sm:px-3 py-2 bg-[#851614] hover:bg-[#701210] text-white text-[11px] sm:text-xs font-serif font-bold rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 shrink-0"
                      title="Phát lệnh nổi lửa báo bếp ngay lập tức"
                    >
                      <Flame className="w-3.5 h-3.5 text-amber-300 fill-current animate-pulse" />
                      <span className="hidden xs:inline">Báo Bếp</span>
                    </button>

                    {/* Nút Mở Rộng Accordion */}
                    <div className={`p-1 text-stone-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-stone-700' : ''}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Vùng Mở Rộng Chi Tiết (Accordion Content) */}
                {isExpanded && (
                  <div className="p-3.5 sm:p-4 bg-[#fffdfa] border-t border-stone-200/80 space-y-3">
                    {/* Danh Sách Món Gọi Đầy Đủ */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="text-stone-400 font-serif italic mr-1">🥢 Chi tiết món:</span>
                      {order.items.map((it, itIdx) => (
                        <div
                          key={itIdx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#faf5ed] border border-[#ebdcc7] shadow-2xs"
                        >
                          <span className="w-4 h-4 rounded-full bg-[#851614] text-white text-[10px] font-bold font-mono flex items-center justify-center shrink-0">
                            {it.quantity}
                          </span>
                          <span className="font-sans font-medium text-[#3d2417]">{it.name}</span>
                        </div>
                      ))}
                    </div>

                    {/* Ghi Chú Khẩu Vị Của Khách */}
                    {order.note && (
                      <div className="p-2.5 rounded-xl bg-[#faf5ed] border-l-3 border-[#851614] border border-[#ebdcc7] text-xs text-[#3d2417] flex items-center gap-2">
                        <span className="text-amber-800 shrink-0">📝</span>
                        <span>Lưu ý: <strong>"{order.note}"</strong></span>
                      </div>
                    )}

                    {/* Hàng Phụ: Số Điện Thoại & Nút In Bill */}
                    <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
                      <div className="flex items-center gap-2 text-xs text-stone-600 font-sans">
                        <span className="font-mono text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-[#851614]" />
                          {order.guestPhone}
                        </span>
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {order.paymentMethod}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('orders')}
                          className="h-8 px-2.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-xl border border-stone-300 shadow-2xs flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-stone-500" />
                          <span>Xem đơn</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => notify(`Đang in phiếu lệnh bếp cho ${order.tableNumber ? 'Bàn ' + order.tableNumber : order.orderCode}...`)}
                          className="h-8 px-2.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-xl border border-stone-300 shadow-2xs flex items-center gap-1.5 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5 text-stone-500" />
                          <span>In bill</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Thanh Kêu Gọi Hành Động Dẫn Vào Bếp Đầy Đủ */}
          <button
            type="button"
            onClick={() => { setActiveTab('orders'); setOrderFilter('PENDING'); }}
            className="w-full py-3 px-4 rounded-2xl bg-[#faf5ec] hover:bg-[#f4ebd9] border-2 border-dashed border-[#d4af37]/60 text-[#851614] font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-all group mt-1"
          >
            <Flame className="w-4 h-4 text-[#851614] group-hover:scale-110 transition-transform" />
            <span>
              Xem tiếp {dashboardPendingList.length > 3 ? dashboardPendingList.length - 3 : 0} đơn đang chờ tại Quầy Bếp (Tổng {dashboardPendingList.length} đơn)
            </span>
            <ChevronRight className="w-4 h-4 text-[#851614] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* CHẾ ĐỘ 2: BĂNG CHUYỀN VÉ BẾP VUỐT NGANG (HORIZONTAL SWIPE CAROUSEL) */}
      {dashPendingViewMode === 'carousel' && (
        <div className="space-y-2">
          <div
            {...containerProps}
            className={`flex overflow-x-auto gap-3.5 pb-2 pt-1 -mx-1 px-1 select-none cursor-grab active:cursor-grabbing ${
              isDragging ? 'snap-none' : 'snap-x snap-mandatory'
            }`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {dashboardPendingList.map((order) => (
              <div
                key={order.id}
                className="w-[86vw] sm:w-[360px] shrink-0 snap-start p-4 sm:p-5 bg-white hover:bg-[#fffdfa] border border-stone-300/80 border-l-4 border-l-[#851614] rounded-2xl shadow-2xs flex flex-col justify-between space-y-3.5"
              >
                {/* Row 1: Các Tag Trạng Thái */}
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-bold text-xs bg-[#fef2f2] text-[#851614] px-2 py-0.5 rounded border border-[#fecaca]">
                      {order.orderCode}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] text-[10px] font-medium">
                      <Clock className="w-2.5 h-2.5 text-[#b91c1c]" />
                      <span>Chờ Báo Bếp</span>
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400 font-sans flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>{order.orderTime}</span>
                  </div>
                </div>

                {/* Row 2: Grid Chi Tiết Bàn, Khách, Tổng Tiền */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2.5">
                    {order.tableNumber ? (
                      <div className="w-11 h-11 rounded-xl bg-[#fffbeb] border border-[#fde68a] flex flex-col items-center justify-center shrink-0 shadow-2xs">
                        <span className="text-sm font-serif font-bold text-[#851614]">Bàn {order.tableNumber}</span>
                        <span className="text-[10px] text-stone-500 font-sans">Tầng {order.floor || 1}</span>
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-orange-100/80 border border-orange-300 flex flex-col items-center justify-center shrink-0 shadow-2xs text-orange-900">
                        <span className="text-sm">🛵</span>
                        <span className="text-[9px] font-bold uppercase">Giao hàng</span>
                      </div>
                    )}
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-stone-900 font-serif">
                        {order.guestName}
                      </div>
                      <div className="text-[11px] font-mono text-stone-500">
                        {order.guestPhone}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-stone-500 font-sans">Tổng tiền</div>
                    <div className="text-lg font-bold text-[#8a1e14] font-serif">
                      {order.finalAmount.toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                </div>

                {/* Row 3: Danh Sách Món Gọi */}
                <div className="pt-2 border-t border-stone-200/80 flex items-center gap-1.5 flex-wrap text-xs">
                  <span className="text-stone-400 font-serif italic text-xs mr-0.5">🥢 Món:</span>
                  {order.items.map((it, itIdx) => (
                    <div
                      key={itIdx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#faf5ed] border border-[#ebdcc7] text-[11px]"
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-[#851614] text-white text-[9px] font-bold font-mono flex items-center justify-center shrink-0">
                        {it.quantity}
                      </span>
                      <span className="font-sans font-medium text-[#3d2417]">{it.name}</span>
                    </div>
                  ))}
                </div>

                {/* Row 4: Nút Bấm Thao Tác Bếp */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateOrderStatus(order.id, 'CONFIRMED');
                      notify(`Đã phát lệnh báo bếp cho ${order.tableNumber ? 'Bàn ' + order.tableNumber : order.orderCode}!`);
                    }}
                    className="w-full py-2.5 bg-[#851614] hover:bg-[#701210] text-white text-xs font-serif font-bold rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <Flame className="w-4 h-4 text-amber-300 fill-current animate-pulse" />
                    <span>Tiếp nhận & Báo Bếp</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                </div>
              </div>
            ))}

            {/* Thẻ Cuối Cùng Của Băng Chuyền: Kêu gọi sang Sổ Bếp */}
            <div
              onClick={() => { setActiveTab('orders'); setOrderFilter('PENDING'); }}
              className="w-[200px] sm:w-[220px] shrink-0 snap-start p-5 rounded-2xl bg-gradient-to-b from-[#24130a] to-[#190e08] border-2 border-dashed border-[#d4af37]/60 text-amber-200 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#d4af37] transition-all shadow-md group"
            >
              <div className="w-12 h-12 rounded-full bg-[#8a1e14] border border-[#d4af37]/40 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6 text-amber-300 animate-pulse" />
              </div>
              <div className="font-serif font-bold text-sm text-[#fcf9f2]">
                Xem Toàn Bộ
              </div>
              <div className="text-[11px] text-amber-300/80 font-sans mt-0.5">
                {dashboardPendingList.length} Đơn Chờ Báo Bếp
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-xs text-amber-300 font-serif font-bold group-hover:translate-x-1 transition-transform">
                <span>Vào Sổ Đơn</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Thanh Chỉ Báo Tiến Trình Cuộn & Mẹo Thao Tác Chuột Desktop */}
          <div className="hidden sm:flex items-center justify-between px-2 pt-0.5 text-[11px] text-stone-500 font-sans">
            <span className="flex items-center gap-1.5 text-stone-600">
              <span>🖱️</span>
              <span>Kéo thả chuột, lăn con lăn hoặc dùng nút mũi tên để lướt</span>
            </span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#851614] to-[#d4af37] transition-all duration-150 rounded-full"
                  style={{ width: `${Math.max(12, scrollProgress)}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-stone-600 font-medium">
                {Math.round(scrollProgress)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )}
</div>
  );
}

export default React.memo(AdminDashboardPendingOrders);

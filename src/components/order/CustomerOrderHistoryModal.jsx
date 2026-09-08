import React from 'react';
import {
  X,
  ScrollText,
  RefreshCw,
  Search,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Utensils
} from 'lucide-react';
import { useCustomerOrderHistory } from './useCustomerOrderHistory';
import CustomerOrderCard from './CustomerOrderCard';

export default function CustomerOrderHistoryModal({
  isOpen,
  onClose,
  onAddToCart,
  onToast,
  onNavigateToMenu
}) {
  const {
    loading,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    expandedOrderId,
    toggleExpandOrder,
    filteredOrders,
    counts,
    fetchOrders,
    handleReorder
  } = useCustomerOrderHistory({ isOpen, onAddToCart, onToast });

  if (!isOpen) return null;

  const filterTabs = [
    { id: 'ALL', label: 'Tất cả', count: counts.all },
    { id: 'PENDING', label: 'Chờ báo bếp', count: counts.pending, icon: Flame },
    { id: 'CONFIRMED', label: 'Đang nấu', count: counts.confirmed, icon: Clock },
    { id: 'COMPLETED', label: 'Hoàn tất', count: counts.completed, icon: CheckCircle2 },
    { id: 'CANCELLED', label: 'Đã hủy', count: counts.cancelled, icon: AlertCircle },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Modal Window: Bottom Sheet on Mobile, Centered Modal on Desktop */}
      <div 
        id="customer-order-history-modal"
        className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] bg-[#faf5eb] border-t sm:border border-[#d4af37]/60 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden font-serif z-10 animate-slideUp sm:animate-none"
      >
        {/* DRAG HANDLE PILL CHO MOBILE BOTTOM SHEET */}
        <div className="sm:hidden w-full pt-2.5 pb-1 flex justify-center bg-[#24130a] cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1 rounded-full bg-white/30" />
        </div>
        
        {/* MODAL HEADER */}
        <div className="p-3 sm:p-5 bg-gradient-to-r from-[#24130a] via-[#351a0c] to-[#1c0d06] text-[#fcf9f2] border-b border-[#d4af37]/40 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#8a1e14] to-[#5a100a] border border-[#d4af37]/50 flex items-center justify-center text-[#fde047] shadow-inner shrink-0">
              <ScrollText className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-lg font-bold tracking-wide truncate">
                  Sổ Lịch Sử Đơn Hàng
                </h2>
                <span className="px-2 py-0.2 rounded-full bg-white/10 text-amber-300 text-[10px] sm:text-[11px] font-mono border border-white/15 shrink-0">
                  {counts.all} đơn
                </span>
              </div>
              <p className="hidden sm:block text-xs text-[#d6c7b2] font-sans mt-0.5">
                Theo dõi các lượt ghé quán & gọi bát phở gia truyền của bạn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={fetchOrders}
              disabled={loading}
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 transition-colors cursor-pointer"
              title="Cập nhật lại danh sách"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              type="button"
              id="close-order-history-modal-btn"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* THANH TÌM KIẾM & BỘ LỌC TRẠNG THÁI */}
        <div className="p-3 sm:p-4 bg-[#f3ece0] border-b border-[#e5d8c5] space-y-2.5 shrink-0 font-sans">
          {/* Ô Tìm Kiếm Nhanh */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="order-history-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã đơn (#PHO-...), tên món ăn, ghi chú khẩu vị..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-[#dacbb7] rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#8a1e14] transition-colors shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dải Tab Lọc Trạng Thái Ngang */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {filterTabs.map((tab) => {
              const active = statusFilter === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`filter-tab-${tab.id}`}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-serif text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    active
                      ? 'bg-[#8a1e14] text-white shadow-xs'
                      : 'bg-white/80 hover:bg-white text-stone-700 border border-[#e2d4c0]'
                  }`}
                >
                  {TabIcon && <TabIcon className={`w-3 h-3 ${active ? 'text-amber-300' : 'text-stone-500'}`} />}
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    active ? 'bg-white/20 text-[#fde047]' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* NỘI DUNG DANH SÁCH ĐƠN HÀNG (SCROLLABLE CONTAINER) */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3">
          {loading && filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-stone-500 font-sans space-y-3">
              <RefreshCw className="w-7 h-7 text-[#8a1e14] animate-spin mx-auto" />
              <div className="text-xs">Đang nạp dữ liệu lịch sử gọi món của bạn...</div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-10 px-4 text-center text-stone-600 bg-white rounded-3xl border border-dashed border-[#d4af37]/60 shadow-2xs space-y-3.5 my-4">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#d4af37]/60 shadow-md mx-auto bg-amber-50">
                <img
                  src="https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80"
                  alt="Bát phở gia truyền 1986"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-[#8a1e14] text-[9px] font-bold text-amber-200">
                  1986
                </div>
              </div>
              <div>
                <div className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                  {searchQuery ? 'Không tìm thấy đơn hàng phù hợp' : 'Chưa có đơn phở nào được lưu'}
                </div>
                <div className="text-xs text-stone-500 mt-1 font-sans max-w-sm mx-auto leading-relaxed">
                  {searchQuery
                    ? `Không tìm thấy đơn phở nào khớp với từ khóa "${searchQuery}". Quý khách vui lòng thử tìm theo tên món khác hoặc mã đơn.`
                    : 'Quý khách chưa lưu lại bát phở nào. Hãy để Phở Gia Truyền 1986 phục vụ bạn bát phở nóng hổi đầu tiên hôm nay!'}
                </div>
              </div>

              {onNavigateToMenu && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToMenu();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#8a1e14] to-[#a32217] hover:from-[#73150f] hover:to-[#8a1e14] text-white text-xs font-serif font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Utensils className="w-3.5 h-3.5 text-amber-300" />
                  <span>Khám Phá Thực Đơn Ngay</span>
                </button>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <CustomerOrderCard
                key={order.id || order.orderCode}
                order={order}
                isExpanded={expandedOrderId === (order.id || order.orderCode)}
                onToggleExpand={() => toggleExpandOrder(order.id || order.orderCode)}
                onReorder={handleReorder}
                onToast={onToast}
              />
            ))
          )}
        </div>

        {/* MODAL FOOTER TRỢ GIÚP */}
        <div className="p-3 sm:p-3.5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-3.5 bg-[#f0e8dc] border-t border-[#e2d5c2] flex items-center justify-between text-xs text-stone-600 font-sans shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-stone-700">
            <span>📞 Hỗ trợ nhanh đơn hàng:</span>
            <a href="tel:0987654321" className="font-mono font-bold text-[#8a1e14] hover:underline flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>098 765 4321</span>
            </a>
          </div>

          <div className="text-[11px] text-stone-500 italic font-serif">
            Phở Gia Truyền 1986 — Giữ trọn hương vị truyền thống
          </div>
        </div>

      </div>
    </div>
  );
}

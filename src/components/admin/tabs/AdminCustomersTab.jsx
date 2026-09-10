import {
  Search,
  RotateCcw,
  LayoutGrid,
  List,
  AlertTriangle,
  X,
  Phone,
  Eye,
  Unlock,
  Gift,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useAdminCustomers } from './useAdminCustomers';
import AdminCustomerCard from '../customers/AdminCustomerCard';
import AdminCustomerQuickPointsModal from '../customers/AdminCustomerQuickPointsModal';
import AdminCustomerDetailModal from '../modals/AdminCustomerDetailModal';

const TIER_BADGES = {
  KIM_CUONG: { name: 'Kim Cương', color: 'bg-cyan-500/15 text-cyan-900 border-cyan-500/40' },
  VANG: { name: 'Hạng Vàng', color: 'bg-amber-400/25 text-amber-900 border-amber-500/50' },
  BAC: { name: 'Hạng Bạc', color: 'bg-slate-200 text-slate-800 border-slate-400' },
  DONG: { name: 'Hạng Đồng', color: 'bg-amber-900/10 text-amber-900 border-amber-800/25' }
};

export default function AdminCustomersTab({ notify }) {
  const { user: currentUser } = useAuth();
  const {
    customers,
    metrics,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    tierFilter,
    setTierFilter,
    viewMode,
    setViewMode,
    quickPointsTarget,
    setQuickPointsTarget,
    customerDetail,
    detailLoading,
    detailModalOpen,
    actionLoading,
    fetchCustomers,
    fetchMetrics,
    openDetail,
    closeDetail,
    handleStatusUpdate,
    handlePointsAdjustment,
    handleQuickPoints,
    handleUnlock,
    handleBlacklistCustomer
  } = useAdminCustomers(notify);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. HEADER CHÍNH: SỔ TAY KHÁCH QUEN & NÚT CHUYỂN VIEW */}
      <div className="bg-gradient-to-r from-[#22130b] via-[#1c1009] to-[#2a170e] p-4 sm:p-5 rounded-2xl border-2 border-[#d4af37]/35 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🍜</span>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#fcf9f2] tracking-wide">
              Sổ Tay Khách Quen 1986
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#8a1e14] border border-[#d4af37]/50 text-amber-200">
              {metrics.totalCustomers} thực khách
            </span>
          </div>
          <p className="text-xs text-amber-200/80 font-serif mt-1">
            Ghi nhớ bát phở ruột, thói quen ăn uống & chăm sóc điểm thưởng tri ân
          </p>
        </div>

        {/* NÚT CHUYỂN ĐỔI CHẾ ĐỘ HIỂN THỊ */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/30 border border-[#d4af37]/30 self-stretch sm:self-auto justify-center">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all ${
              viewMode === 'cards'
                ? 'bg-[#8a1e14] text-white shadow-xs border border-[#d4af37]/40'
                : 'text-amber-200/70 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Sổ Thẻ Khách Quen</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-[#8a1e14] text-white shadow-xs border border-[#d4af37]/40'
                : 'text-amber-200/70 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Bảng Danh Bạ Gọn</span>
          </button>
        </div>
      </div>

      {/* 2. BANNER CẢNH BÁO KHẨN CẤP NẾU CÓ KHÁCH BỊ KHÓA DO QUÊN MẬT KHẨU TẠI QUÁN */}
      {metrics.passwordLockedCustomers > 0 ? (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-900/95 via-rose-950 to-[#2a170e] border-2 border-amber-500/70 text-white shadow-lg flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-600/80 border border-amber-300 flex items-center justify-center shrink-0 text-base">
              🔑
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-serif font-bold text-amber-100">
                Có {metrics.passwordLockedCustomers} thực khách đang bị tạm khóa tài khoản (do quên mật khẩu)
              </h4>
              <p className="text-[11px] text-amber-200/90 font-serif">
                Chủ quán có thể bấm lọc "Quên MK tại bàn" bên dưới để hỗ trợ khách mở khóa tức thì tại bàn!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('LOCKED_PASSWORD')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#22130b] font-serif text-xs font-bold shrink-0 transition-all shadow-md"
          >
            Mở khóa tại bàn
          </button>
        </div>
      ) : metrics.adminLockedCustomers > 0 ? (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900 border border-rose-600/40 text-white shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-900/80 border border-rose-500/50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-300" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-serif font-bold text-rose-100">
                Có {metrics.adminLockedCustomers} tài khoản bị khóa kỷ luật / xử lý vi phạm bởi Quản trị viên
              </h4>
              <p className="text-[11px] text-rose-200/70 font-serif">
                Tài khoản vi phạm quy chế hoặc có hành vi bất thường, yêu cầu kiểm tra kỹ trước khi kích hoạt lại.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('LOCKED_ADMIN')}
            className="px-3 py-1.5 rounded-xl bg-rose-800/80 hover:bg-rose-700 text-rose-100 border border-rose-500/50 font-serif text-xs font-semibold shrink-0 transition-colors shadow-xs"
          >
            Xem tài khoản vi phạm
          </button>
        </div>
      ) : null}

      {/* 3. BỘ LỌC NHANH DẠNG TAB ẤM CÚNG (QUÁN ĂN NGÔN NGỮ) */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl font-serif text-xs font-bold transition-all ${
            statusFilter === 'ALL'
              ? 'bg-[#8a1e14] text-white shadow-xs border border-[#d4af37]/40'
              : 'bg-white text-[#4a3525] border border-[#d4af37]/25 hover:bg-[#faf6ee]'
          }`}
        >
          Tất cả thực khách ({metrics.totalCustomers})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('ACTIVE')}
          className={`px-3.5 py-1.5 rounded-xl font-serif text-xs font-bold transition-all flex items-center gap-1.5 ${
            statusFilter === 'ACTIVE'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>Đang hoạt động ({metrics.activeCustomers})</span>
        </button>

        {/* TAB 1: KHÁCH QUÊN MẬT KHẨU (CẦN MỞ TẠI BÀN) */}
        <button
          type="button"
          onClick={() => setStatusFilter('LOCKED_PASSWORD')}
          className={`px-3.5 py-1.5 rounded-xl font-serif text-xs font-bold transition-all flex items-center gap-1.5 ${
            statusFilter === 'LOCKED_PASSWORD'
              ? 'bg-amber-600 text-white shadow-xs'
              : (metrics.passwordLockedCustomers > 0)
                ? 'bg-amber-50 text-amber-900 border-2 border-amber-400 hover:bg-amber-100'
                : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50'
          }`}
        >
          <span>🔑</span>
          <span>Quên MK tại bàn ({metrics.passwordLockedCustomers || 0})</span>
        </button>

        {/* TAB 2: KHÓA BỞI ADMIN / VI PHẠM */}
        <button
          type="button"
          onClick={() => setStatusFilter('LOCKED_ADMIN')}
          className={`px-3.5 py-1.5 rounded-xl font-serif text-xs font-bold transition-all flex items-center gap-1.5 ${
            statusFilter === 'LOCKED_ADMIN'
              ? 'bg-rose-800 text-white shadow-xs'
              : (metrics.adminLockedCustomers > 0)
                ? 'bg-rose-50 text-rose-900 border border-rose-300 hover:bg-rose-100'
                : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50'
          }`}
        >
          <span>🚫</span>
          <span>Khóa vi phạm ({metrics.adminLockedCustomers || 0})</span>
        </button>

        {metrics.vipCustomers > 0 && (
          <button
            type="button"
            onClick={() => setTierFilter('VANG')}
            className={`px-3.5 py-1.5 rounded-xl font-serif text-xs font-bold transition-all flex items-center gap-1.5 ${
              tierFilter === 'VANG' || tierFilter === 'KIM_CUONG'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-50'
            }`}
          >
            <span>👑 Tri Kỷ & VIP ({metrics.vipCustomers})</span>
          </button>
        )}
      </div>

      {/* 4. THANH TÌM KIẾM THEO SĐT / TÊN & LỌC HẠNG */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-[#d4af37]/25 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8c7a6b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm nhanh theo Số điện thoại (098...) hoặc Họ tên khách..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-[#d4af37]/35 bg-[#faf6ee] text-xs sm:text-sm text-[#22130b] placeholder-[#8c7a6b] focus:outline-hidden focus:border-[#8a1e14]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Lọc Hạng */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-[#d4af37]/35 bg-[#faf6ee] text-xs font-serif text-[#22130b] focus:outline-hidden focus:border-[#8a1e14]"
          >
            <option value="ALL">Tất cả hạng quán</option>
            <option value="DONG">🥢 Hạng Đồng (Khách quen)</option>
            <option value="BAC">🥈 Hạng Bạc (Khách thân)</option>
            <option value="VANG">👑 Hạng Vàng (Tri Kỷ)</option>
            <option value="KIM_CUONG">💎 Kim Cương (Thượng khách)</option>
          </select>

          {/* Nút Làm mới */}
          <button
            type="button"
            onClick={() => { fetchCustomers(); fetchMetrics(); }}
            className="p-2 rounded-xl bg-[#faf6ee] hover:bg-amber-100/60 border border-[#d4af37]/35 text-[#4a3525] transition-colors"
            title="Làm mới danh sách"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 5. VÙNG NỘI DUNG HIỂN THỊ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#7a6e5d] bg-white rounded-2xl border border-[#d4af37]/20">
          <div className="w-9 h-9 border-3 border-[#8a1e14] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-serif font-bold text-[#22130b]">Đang lật sổ tay khách quen...</p>
          <p className="text-xs text-[#8c7a6b] mt-0.5">Nạp bát phở ruột và điểm tích lũy</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[#d4af37]/20">
          <div className="w-12 h-12 rounded-full bg-[#faf5ea] border border-[#d4af37]/30 flex items-center justify-center mx-auto mb-3 text-2xl">
            🍲
          </div>
          <p className="text-base font-serif font-bold text-[#22130b]">Không tìm thấy khách hàng nào</p>
          <p className="text-xs text-[#8c7a6b] mt-1">
            Thử tìm kiếm với số điện thoại khác hoặc đổi bộ lọc trạng thái.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* CHẾ ĐỘ 1: SỔ THẺ KHÁCH QUEN (GRID CARDS) */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
          {customers.map((c) => (
            <AdminCustomerCard
              key={c.id}
              customer={c}
              currentUser={currentUser}
              onOpenDetail={openDetail}
              onQuickPoints={(cust) => setQuickPointsTarget(cust)}
              onUnlock={handleUnlock}
              actionLoading={actionLoading}
            />

          ))}
        </div>
      ) : (
        /* CHẾ ĐỘ 2: BẢNG DANH BẠ GỌN (COMPACT TABLE) */
        <div className="rounded-2xl bg-white border border-[#d4af37]/25 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#22130b] text-[#fcf9f2] text-[11px] font-serif uppercase tracking-wider border-b border-[#d4af37]/30">
                  <th className="py-3 px-4">Thực Khách</th>
                  <th className="py-3 px-3">Hạng Quán</th>
                  <th className="py-3 px-3">Bát Phở Ruột & Khẩu Vị</th>
                  <th className="py-3 px-3">Điểm Tích Lũy</th>
                  <th className="py-3 px-3">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4af37]/15 text-xs text-[#22130b]">
                {customers.map((c) => {
                  const tier = TIER_BADGES[c.membershipTier] || TIER_BADGES.DONG;
                  const isLocked = c.status === 'LOCKED';
                  return (
                    <tr key={c.id} className="hover:bg-[#faf6ee] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-serif font-bold text-[#22130b]">{c.fullName}</div>
                        <div className="text-[11px] text-[#8c7a6b] font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-amber-700" /> {c.phone}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-serif font-bold text-[10px] border ${tier.color}`}>
                          {tier.name}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-serif text-[#8a1e14] font-medium truncate max-w-45">
                          {c.favoriteDishName || 'Tùy chọn đa dạng'}
                        </div>
                        <div className="text-[10px] text-[#8c7a6b] mt-0.5">
                          {c.brothType ? `Vị: ${c.brothType}` : 'Chưa lưu khẩu vị'}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-[#8a1e14]">{c.availablePoints || 0} pts</span>
                        <div className="text-[10px] text-[#8c7a6b] font-mono">
                          {(c.totalSpent || 0).toLocaleString('vi-VN')}đ
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-serif text-[10px] font-bold">
                            Tạm khóa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-serif text-[10px] font-bold">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Bình thường
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isLocked && (
                            <button
                              type="button"
                              onClick={() => handleUnlock(c.id)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-serif text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                              title="Mở khóa khẩn cấp"
                            >
                              <Unlock className="w-3 h-3" /> Mở khóa
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setQuickPointsTarget(c)}
                            className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-600/30 text-[#60120b] font-serif text-xs font-bold transition-all flex items-center gap-1"
                            title="Tặng 50 điểm"
                          >
                            <Gift className="w-3 h-3 text-amber-700" /> +50đ
                          </button>
                          <button
                            type="button"
                            onClick={() => openDetail(c.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#faf6ee] hover:bg-[#8a1e14] hover:text-white border border-[#d4af37]/40 text-[#22130b] font-serif text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. MODAL CHI TIẾT KHÁCH HÀNG */}
      <AdminCustomerDetailModal
        isOpen={detailModalOpen}
        onClose={closeDetail}
        detail={customerDetail}
        loading={detailLoading}
        onStatusUpdate={handleStatusUpdate}
        onPointsAdjustment={handlePointsAdjustment}
        onUnlock={handleUnlock}
        onBlacklist={handleBlacklistCustomer}
        actionLoading={actionLoading}
        currentUser={currentUser}
      />


      {/* 7. POPUP TẶNG ĐIỂM TRI ÂN NHANH 1-CHẠM */}
      <AdminCustomerQuickPointsModal
        customer={quickPointsTarget}
        isOpen={!!quickPointsTarget}
        onClose={() => setQuickPointsTarget(null)}
        onSubmit={handleQuickPoints}
        loading={actionLoading}
      />
    </div>
  );
}

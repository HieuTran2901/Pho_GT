import { useEffect } from 'react';
import { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Soup,
  Coins,
  ShieldAlert,
  ShoppingBag,
  Lock
} from 'lucide-react';
import CustomerTasteTab from './customer/CustomerTasteTab';
import CustomerOrdersTab from './customer/CustomerOrdersTab';
import CustomerLoyaltyTab from './customer/CustomerLoyaltyTab';
import CustomerActionsTab from './customer/CustomerActionsTab';

const TIER_CONFIG = {
  DONG: { name: 'Hạng Đồng', color: 'bg-amber-800/15 text-amber-900 border-amber-700/30' },
  BAC: { name: 'Hạng Bạc', color: 'bg-slate-200 text-slate-800 border-slate-400' },
  VANG: { name: 'Hạng Vàng', color: 'bg-amber-400/20 text-amber-700 border-amber-500/50' },
  KIM_CUONG: { name: 'Kim Cương', color: 'bg-cyan-500/15 text-cyan-800 border-cyan-500/40' }
};

export default function AdminCustomerDetailModal({
  isOpen,
  onClose,
  detail,
  loading,
  onStatusUpdate,
  onPointsAdjustment,
  onUnlock,
  onBlacklist,
  actionLoading,
  currentUser
}) {
  const [activeTab, setActiveTab] = useState('taste'); // 'taste' | 'orders' | 'loyalty' | 'actions'

  // Đóng modal bằng phím ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const summary = detail?.summary;
  const taste = detail?.tasteProfile;
  const txs = detail?.loyaltyTransactions || [];
  const orders = detail?.recentOrders || [];

  const isSelfOrAdmin = Boolean(
    summary && (
      summary.role === 'ADMIN' ||
      (currentUser && (currentUser.id === summary.id || currentUser.phone === summary.phone))
    )
  );

  const tierInfo = TIER_CONFIG[summary?.membershipTier] || TIER_CONFIG.DONG;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#fcf9f2] rounded-2xl border-2 border-[#d4af37]/40 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] transition-all">
        {/* HEADER GỌN GÀNG, SANG TRỌNG 5 SAO */}
        <div className="bg-gradient-to-r from-[#22130b] via-[#190e08] to-[#2a170e] px-4 py-3.5 text-white flex items-center justify-between border-b border-[#d4af37]/35">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#8a1e14] border-2 border-[#d4af37] flex items-center justify-center text-amber-200 text-base font-bold font-serif shadow-md shrink-0">
              {summary?.fullName ? summary.fullName.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-serif font-bold text-[#fcf9f2] truncate">
                  {summary?.fullName || 'Khách hàng'}
                </h3>
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-serif font-bold border shrink-0 ${tierInfo.color}`}>
                  {tierInfo.name}
                </span>
                {summary?.status === 'LOCKED' && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-900/80 text-rose-200 border border-rose-500/60 flex items-center gap-0.5 font-serif shrink-0">
                    <Lock className="w-2.5 h-2.5" /> Khóa
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5 text-[11px] text-amber-200/80 font-mono mt-0.5">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-amber-400" /> {summary?.phone}
                </span>
                {summary?.email && (
                  <span className="hidden sm:flex items-center gap-1 truncate text-amber-200/60">
                    <Mail className="w-3 h-3 text-amber-400" /> {summary.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-amber-200/80 hover:text-white transition-all hover:rotate-90 duration-200 shrink-0"
            title="Đóng (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 TAB ĐIỀU HƯỚNG GỌN GÀNG - HIỆU ỨNG CHUYỂN MƯỢT */}
        <div className="flex border-b border-[#d4af37]/20 bg-[#efe7d3]/50 px-3 pt-1.5 gap-1 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('taste')}
            className={`flex items-center gap-1.5 pb-2 px-2.5 font-serif font-semibold border-b-2 transition-all duration-150 whitespace-nowrap active:scale-95 ${
              activeTab === 'taste'
                ? 'border-[#8a1e14] text-[#8a1e14]'
                : 'border-transparent text-[#7a6e5d] hover:text-[#22130b]'
            }`}
          >
            <Soup className="w-3.5 h-3.5" />
            <span>Khẩu Vị</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 pb-2 px-2.5 font-serif font-semibold border-b-2 transition-all duration-150 whitespace-nowrap active:scale-95 ${
              activeTab === 'orders'
                ? 'border-[#8a1e14] text-[#8a1e14]'
                : 'border-transparent text-[#7a6e5d] hover:text-[#22130b]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Đơn Hàng</span>
            {orders.length > 0 && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#8a1e14]/15 text-[#8a1e14] font-mono font-bold">
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('loyalty')}
            className={`flex items-center gap-1.5 pb-2 px-2.5 font-serif font-semibold border-b-2 transition-all duration-150 whitespace-nowrap active:scale-95 ${
              activeTab === 'loyalty'
                ? 'border-[#8a1e14] text-[#8a1e14]'
                : 'border-transparent text-[#7a6e5d] hover:text-[#22130b]'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Điểm Thưởng</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-900 font-mono font-bold">
              {summary?.availablePoints || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`flex items-center gap-1.5 pb-2 px-2.5 font-serif font-semibold border-b-2 transition-all duration-150 whitespace-nowrap active:scale-95 ${
              activeTab === 'actions'
                ? 'border-[#8a1e14] text-[#8a1e14]'
                : 'border-transparent text-[#7a6e5d] hover:text-[#22130b]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>An Ninh</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-3.5 sm:p-4 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-[#7a6e5d]">
              <div className="w-6 h-6 border-2 border-[#8a1e14] border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs font-serif">Đang nạp hồ sơ...</p>
            </div>
          ) : (
            <>
              {activeTab === 'taste' && <CustomerTasteTab taste={taste} />}
              {activeTab === 'orders' && <CustomerOrdersTab orders={orders} />}
              {activeTab === 'loyalty' && <CustomerLoyaltyTab summary={summary} transactions={txs} />}
              {activeTab === 'actions' && (
                <CustomerActionsTab
                  summary={summary}
                  isSelfOrAdmin={isSelfOrAdmin}
                  actionLoading={actionLoading}
                  onStatusUpdate={onStatusUpdate}
                  onPointsAdjustment={onPointsAdjustment}
                  onUnlock={onUnlock}
                  onBlacklist={onBlacklist}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

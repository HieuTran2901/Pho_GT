import { useEffect, useState } from 'react';
import {
  X,
  User,
  Phone,
  Lock,
  Shield,
  Calendar,
  Receipt,
  Tag,
  Check
} from 'lucide-react';
import CustomerActionsTab from './customer/CustomerActionsTab';
import CustomerInfoTab from './customer/CustomerInfoTab';
import CustomerHistoryTab from './customer/CustomerHistoryTab';
import CustomerNotesTab from './customer/CustomerNotesTab';

const TIER_CONFIG = {
  DONG: { name: 'Hạng Đồng', color: 'bg-amber-50 text-amber-800 border-amber-200/80' },
  BAC: { name: 'Hạng Bạc', color: 'bg-slate-50 text-slate-700 border-slate-200/80' },
  VANG: { name: 'Hạng Vàng', color: 'bg-amber-50 text-amber-900 border-amber-300' },
  KIM_CUONG: { name: 'Kim Cương', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' }
};

const SIDEBAR_TABS = [
  { id: 'actions', label: 'Khóa tài khoản', icon: Calendar },
  { id: 'info', label: 'Thông tin khách hàng', icon: User },
  { id: 'history', label: 'Lịch sử giao dịch', icon: Receipt },
  { id: 'notes', label: 'Ghi chú & Tags', icon: Tag }
];

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
  const [activeTab, setActiveTab] = useState('actions');

  // Đóng modal bằng phím ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset tab về 'actions' khi mở modal mới
  useEffect(() => {
    if (isOpen) {
      setActiveTab('actions');
    }
  }, [isOpen]);

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
  const isLocked = summary?.status === 'LOCKED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-[28px] border border-stone-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all">
        {/* 1. HEADER MODAL TRẮNG TINH TẾ */}
        <div className="px-6 py-4 bg-white border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar chữ cái đầu với nền đỏ sẫm */}
            <div className="w-12 h-12 rounded-full bg-[#8a1e14] flex items-center justify-center text-white text-lg font-serif font-bold shadow-xs shrink-0">
              {summary?.fullName ? summary.fullName.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
            </div>

            {/* Tên & Badges */}
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-stone-900 truncate font-sans">
                  {summary?.fullName || 'Khách hàng'}
                </h3>

                {/* Badge Hạng Thành Viên */}
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border flex items-center gap-1 shrink-0 ${tierInfo.color}`}>
                  <Shield className="w-3 h-3 text-amber-700" />
                  <span>{tierInfo.name}</span>
                </span>

                {/* Badge Khóa Tài Khoản */}
                {isLocked && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-[#e11d48] border border-rose-200/80 flex items-center gap-1 font-medium shrink-0">
                    <Lock className="w-3 h-3" />
                    <span>Khóa</span>
                  </span>
                )}
              </div>

              {/* SĐT */}
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-sans mt-0.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>{summary?.phone || 'Chưa có SĐT'}</span>
              </div>
            </div>
          </div>

          {/* Nút Đóng (X) */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all shrink-0 cursor-pointer"
            title="Đóng (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. BODY 2 CỘT: SIDEBAR TABS VÀ VÙNG NỘI DUNG */}
        <div className="flex flex-col sm:flex-row flex-1 min-h-0 divide-y sm:divide-y-0 sm:divide-x divide-stone-100 overflow-hidden">
          {/* Cột trái: 4 Tabs Dọc */}
          <div className="w-full sm:w-60 shrink-0 p-4 space-y-1.5 bg-white overflow-x-auto sm:overflow-x-visible">
            <div className="flex sm:flex-col gap-1.5">
              {SIDEBAR_TABS.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 rounded-2xl text-sm transition-all flex items-center gap-3 cursor-pointer text-left whitespace-nowrap sm:whitespace-normal ${
                      isActive
                        ? 'bg-[#fff1f2] text-[#e11d48] font-medium'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50 font-normal'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#e11d48]' : 'text-stone-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cột phải: Vùng Nội Dung */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-white max-h-[68vh]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-stone-400">
                <div className="w-8 h-8 border-3 border-[#0a5c43] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs font-medium text-stone-600">Đang nạp hồ sơ khách hàng...</p>
              </div>
            ) : (
              <>
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
                {activeTab === 'info' && (
                  <CustomerInfoTab summary={summary} taste={taste} />
                )}
                {activeTab === 'history' && (
                  <CustomerHistoryTab orders={orders} transactions={txs} />
                )}
                {activeTab === 'notes' && (
                  <CustomerNotesTab taste={taste} summary={summary} />
                )}
              </>
            )}
          </div>
        </div>

        {/* 3. FOOTER MODAL */}
        <div className="border-t border-stone-100 px-6 py-4 bg-white flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium transition-all cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#0a5c43] hover:bg-[#084e37] text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </div>
    </div>
  );
}

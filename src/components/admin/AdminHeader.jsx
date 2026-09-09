import React, { useState, useEffect, useMemo } from 'react';
import {
  Menu,
  Calendar,
  Clock,
  Volume2,
  VolumeX,
  Bell,
  LogOut,
  Users
} from 'lucide-react';
import { getShiftInfo } from './adminMockData';

function AdminHeader({
  setMobileDrawerOpen,
  soundAlertEnabled,
  setSoundAlertEnabled,
  notify,
  pendingOrdersCount,
  setActiveTab,
  setOrderFilter,
  user,
  logout
}) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const shiftInfo = useMemo(() => getShiftInfo(currentTime), [currentTime]);
  return (
    <header className="px-3 sm:px-6 py-2.5 sm:py-4 bg-[#faf6ee] border-b border-stone-200/90 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-2xs">
      {/* Cụm Hamburger (Mobile) + Thương Hiệu Di Sản (Mobile) / Lời Chào Bếp Trưởng (Desktop) */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
        {/* Nút Hamburger mở Drawer trên Mobile */}
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="md:hidden w-10 h-10 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300/80 shadow-2xs flex items-center justify-center transition-colors shrink-0"
          aria-label="Mở menu quản trị"
        >
          <Menu className="w-5 h-5 text-[#8a1e14]" />
        </button>

        {/* Mobile: Thẻ Thương Hiệu Di Sản Tinh Gọn (< sm) */}
        <div className="flex sm:hidden items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8a1e14] to-[#6d130a] text-amber-200 border border-amber-400/40 flex items-center justify-center font-serif font-black text-xs shrink-0 shadow-xs">
            1986
          </div>
          <div className="min-w-0">
            <h1 className="text-xs font-bold text-stone-900 font-serif tracking-tight truncate">
              Phở Gia Truyền 1986
            </h1>
            <div className="flex items-center gap-1 text-[10px] text-stone-500 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate">{shiftInfo ? shiftInfo.name : 'Đang mở cửa'}</span>
            </div>
          </div>
        </div>

        {/* Desktop: Lời chào Bếp Trưởng Thân Thiện (sm:flex) */}
        <div className="hidden sm:flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#fed7aa] border-2 border-[#d97706]/40 shrink-0 flex items-center justify-center shadow-xs overflow-hidden">
            <svg viewBox="0 0 64 64" className="w-full h-full">
              <circle cx="32" cy="32" r="32" fill="#fef3c7" />
              <path d="M14 64 C14 46, 50 46, 50 64 Z" fill="#ffffff" stroke="#92400e" strokeWidth="1.5" />
              <path d="M25 47 L32 54 L39 47 L32 45 Z" fill="#b91c1c" />
              <circle cx="32" cy="35" r="13" fill="#fed7aa" />
              <circle cx="28" cy="33" r="1.5" fill="#451a03" />
              <circle cx="36" cy="33" r="1.5" fill="#451a03" />
              <path d="M26 37 Q32 35, 32 38 Q32 35, 38 37 Q35 40, 32 39 Q29 40, 26 37 Z" fill="#78350f" />
              <path d="M29 41 Q32 44, 35 41" fill="none" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M21 23 C19 19, 21 13, 27 14 C28 9, 36 9, 37 14 C43 13, 45 19, 43 23 Z" fill="#ffffff" stroke="#b45309" strokeWidth="1.2" />
              <rect x="21" y="22" width="22" height="5" rx="1.5" fill="#ffffff" stroke="#b45309" strokeWidth="1.2" />
            </svg>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-stone-900 font-serif tracking-wide leading-tight">
              Xin chào, Anh/Chị Chủ Quán!
            </h1>
            <p className="text-xs text-stone-500 font-sans mt-0.5">
              Chúc quán luôn đông khách và kinh doanh thuận lợi!
            </p>
          </div>
        </div>
      </div>

      {/* Ngày tháng, Giờ & Ca trực di sản */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden lg:flex items-center gap-3.5 text-xs font-sans text-stone-600 relative">
          {/* Ca trực badge */}
          {shiftInfo && (
            <div className={`px-2.5 py-1 rounded-full border text-[11px] font-serif font-medium flex items-center gap-1.5 ${shiftInfo.badgeColor}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              <span>{shiftInfo.name}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-stone-600">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-medium">
              {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-mono font-bold text-stone-800 text-sm">
              {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          {/* Cành thảo mộc thủy mặc trang trí */}
          <div className="w-16 h-8 opacity-25 text-[#78350f] pointer-events-none">
            <svg viewBox="0 0 100 45" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M5 30 Q35 22, 70 18 T95 8" />
              <path d="M30 24 Q36 17, 46 20 Q40 26, 30 24" fill="currentColor" fillOpacity="0.3" />
              <path d="M52 21 Q60 12, 70 16 Q63 23, 52 21" fill="currentColor" fillOpacity="0.3" />
              <path d="M72 17 Q80 9, 90 14 Q82 20, 72 17" fill="currentColor" fillOpacity="0.3" />
            </svg>
          </div>
        </div>

        {/* Cụm Nút Thao Tác Vận Hành (Mobile: 2 nút 40px thoải mái, Desktop: đầy đủ kèm profile) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Nút bật/tắt chuông âm thanh */}
          <button
            type="button"
            onClick={() => {
              const next = !soundAlertEnabled;
              setSoundAlertEnabled(next);
              notify(next ? 'Đã bật chuông báo âm thanh đơn mới' : 'Đã tắt chuông báo âm thanh');
            }}
            className={`w-10 h-10 rounded-xl border shadow-2xs transition-all flex items-center justify-center shrink-0 ${
              soundAlertEnabled
                ? 'bg-white hover:bg-stone-100 border-stone-300 text-stone-700'
                : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-400'
            }`}
            title={soundAlertEnabled ? 'Âm thanh thông báo: Đang Bật' : 'Âm thanh thông báo: Đã Tắt'}
            aria-label="Bật tắt âm thanh thông báo đơn mới"
          >
            {soundAlertEnabled ? <Volume2 className="w-5 h-5 sm:w-4 sm:h-4 text-stone-700" /> : <VolumeX className="w-5 h-5 sm:w-4 sm:h-4 text-stone-400" />}
          </button>

          {/* Nút chuông thông báo đơn hàng mới */}
          <button
            type="button"
            onClick={() => { setActiveTab('orders'); setOrderFilter('PENDING'); }}
            className="relative w-10 h-10 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 shadow-2xs transition-all flex items-center justify-center shrink-0"
            title={`Có ${pendingOrdersCount} đơn đang chờ tiếp nhận`}
            aria-label="Xem đơn hàng mới chờ tiếp nhận"
          >
            <Bell className="w-5 h-5 sm:w-4 sm:h-4 text-stone-700" />
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#8a1e14] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono border-2 border-[#faf6ee] shadow-xs">
              {pendingOrdersCount}
            </span>
          </button>

          {/* Admin Profile & Logout (Desktop duy nhất - Mobile đặt trong Sidebar Drawer an toàn) */}
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-stone-300/80">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8a1e14] to-[#c0392b] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-stone-800 leading-tight">
                {user?.fullName || 'Quản Trị Viên 1986'}
              </div>
              <div className="text-[10px] text-stone-400 font-sans">
                {user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN' ? 'Chủ quán' : 'Nhân viên trực'}
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
              title="Đăng xuất khỏi hệ thống"
              aria-label="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default React.memo(AdminHeader);

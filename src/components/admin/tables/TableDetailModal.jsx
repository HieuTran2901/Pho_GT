import React, { useState } from 'react';
import { X, Flame, Users, Clock, Phone, DollarSign, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatVND } from '../adminConstants';
import { DIORAMA_STATUS_CONFIG } from './dioramaConstants';

/**
 * [RAVEN & URBAN] Modal Chi Tiết & Điều Phối Bàn Ăn
 * Cho phép Quản trị viên xem thông tin đơn hàng đang phục vụ hoặc chuyển đổi trạng thái bàn.
 */
function TableDetailModal({
  table,
  isOpen,
  onClose,
  onViewOrder,
  onUpdateStatus,
  isUpdating = false
}) {
  if (!isOpen || !table) return null;

  const isOccupied = table.status === 'occupied';
  const statusCfg = DIORAMA_STATUS_CONFIG[table.status] || DIORAMA_STATUS_CONFIG.available;

  const handleStatusChange = (newStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(table.id, newStatus);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md bg-gradient-to-b from-[#22160f] via-[#180f0a] to-[#100a06] border-2 border-[#d4af37]/40 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden text-white animate-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-amber-900/20 bg-[#160d08]/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: statusCfg.dotColor }}
            />
            <h3 className="font-serif font-bold text-lg text-[#fcedc7]">
              {table.name} — Tầng {table.floor}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung thông tin bàn */}
        <div className="p-6 space-y-4 text-sm">
          {/* Thông số cơ bản */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs">
            <div className="space-y-1">
              <span className="text-stone-400">Phân khu:</span>
              <p className="font-serif font-bold text-amber-200">{table.zoneName || 'Phở 1986'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-stone-400">Sức chứa tối đa:</span>
              <p className="font-serif font-bold text-amber-200">{table.capacity} chỗ ngồi</p>
            </div>
          </div>

          {/* Nếu bàn đang có khách */}
          {isOccupied ? (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-red-950/50 to-[#220d07]/60 border border-red-500/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-red-500/20">
                <span className="flex items-center gap-1.5 text-xs font-bold text-red-300">
                  <Flame className="w-3.5 h-3.5 text-red-400 fill-current animate-pulse" />
                  Đang dùng bữa tại bàn
                </span>
                <span className="font-mono text-xs font-bold text-amber-300">
                  {table.activeOrderCode || '#PHO-ORDER'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-400">Thực khách:</span>
                  <span className="font-bold text-stone-200">{table.activeGuestName || 'Khách tại bàn'}</span>
                </div>
                {table.activeGuestPhone && (
                  <div className="flex justify-between">
                    <span className="text-stone-400">Số điện thoại:</span>
                    <span className="font-mono text-stone-300">{table.activeGuestPhone}</span>
                  </div>
                )}
                {table.activeAmount ? (
                  <div className="flex justify-between pt-1 border-t border-white/5 font-bold">
                    <span className="text-stone-300">Tổng tạm tính:</span>
                    <span className="font-mono text-amber-400 text-sm">{formatVND(table.activeAmount)}</span>
                  </div>
                ) : null}
              </div>

              {/* Nút xem đơn hàng */}
              <button
                onClick={() => {
                  if (onViewOrder) onViewOrder(table);
                  onClose();
                }}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#8a1e14] to-[#6d150d] hover:from-[#a02217] hover:to-[#7f1910] text-amber-100 font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Xem Chi Tiết Đơn Hàng</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2 text-center">
              <div className="w-9 h-9 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-xs font-serif font-bold text-emerald-300">
                Bàn đang sẵn sàng đón tiếp thực khách
              </p>
              <p className="text-[11px] text-stone-400 font-sans">
                {table.desc || 'Vị trí ấm cúng, đậm đà không khí Phở truyền thống.'}
              </p>
            </div>
          )}

          {/* Điều chỉnh trạng thái bàn dành cho Quản lý */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-xs text-stone-400 font-medium block">
              Điều chỉnh trạng thái bàn nhanh:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleStatusChange('AVAILABLE')}
                disabled={isUpdating || table.status === 'available'}
                className="py-1.5 px-2 rounded-xl text-xs font-serif border border-emerald-500/40 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 disabled:opacity-40 transition-colors"
              >
                Sẵn sàng
              </button>
              <button
                onClick={() => handleStatusChange('RESERVED')}
                disabled={isUpdating || table.status === 'reserved'}
                className="py-1.5 px-2 rounded-xl text-xs font-serif border border-amber-500/40 bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 disabled:opacity-40 transition-colors"
              >
                Đặt trước
              </button>
              <button
                onClick={() => handleStatusChange('MAINTENANCE')}
                disabled={isUpdating || table.status === 'maintenance'}
                className="py-1.5 px-2 rounded-xl text-xs font-serif border border-stone-600/40 bg-stone-900/50 hover:bg-stone-800/60 text-stone-400 disabled:opacity-40 transition-colors"
              >
                Tạm khóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(TableDetailModal);

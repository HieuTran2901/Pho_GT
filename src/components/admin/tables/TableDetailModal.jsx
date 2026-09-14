import React, { useState, useMemo } from 'react';
import {
  X,
  Flame,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  UserX,
  RotateCcw
} from 'lucide-react';
import { formatVND } from '../adminConstants';
import { DIORAMA_STATUS_CONFIG } from './dioramaConstants';

/**
 * [RAVEN & URBAN] Modal Chi Tiết & Điều Phối Bàn Ăn
 * Cho phép Quản trị viên xem thông tin đơn hàng đang phục vụ, đổi bàn cho khách hoặc chuyển đổi trạng thái bàn.
 */
function TableDetailModal({
  table,
  isOpen,
  onClose,
  onViewOrder,
  onUpdateStatus,
  isUpdating = false,
  allTables = []
}) {
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictActionType, setConflictActionType] = useState('RESOLVE_FOR_AVAILABLE'); // 'RESOLVE_FOR_AVAILABLE' | 'LOCK_WITH_ORDER' | 'CONFIRM_UNLOCK_MAINTENANCE'
  const [selectedTargetTableId, setSelectedTargetTableId] = useState('');

  const availableTables = useMemo(() => {
    if (!table) return [];
    return (allTables || []).filter(
      (t) => t.id !== table.id && t.status === 'available'
    );
  }, [allTables, table]);

  // Tự động chọn bàn đích đầu tiên nếu có
  React.useEffect(() => {
    if (availableTables.length > 0 && !selectedTargetTableId) {
      setSelectedTargetTableId(availableTables[0].id);
    }
  }, [availableTables, selectedTargetTableId]);

  // Reset dialog khi table thay đổi hoặc đóng modal
  React.useEffect(() => {
    setShowConflictDialog(false);
    setSelectedTargetTableId('');
    setConflictActionType('RESOLVE_FOR_AVAILABLE');
  }, [table?.id, isOpen]);

  if (!isOpen || !table) return null;

  const isOccupied = table.status === 'occupied' || Boolean(table.activeOrderCode);
  const isPaid = table.activePaymentStatus === 'PAID';
  const statusCfg = DIORAMA_STATUS_CONFIG[table.status] || DIORAMA_STATUS_CONFIG.available;

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'AVAILABLE') {
      if (table.activeOrderCode) {
        setConflictActionType('RESOLVE_FOR_AVAILABLE');
        setShowConflictDialog(true);
        return;
      }
      if (table.status === 'maintenance') {
        setConflictActionType('CONFIRM_UNLOCK_MAINTENANCE');
        setShowConflictDialog(true);
        return;
      }
    }

    if (newStatus === 'MAINTENANCE' && table.activeOrderCode) {
      setConflictActionType('LOCK_WITH_ORDER');
      setShowConflictDialog(true);
      return;
    }

    if (onUpdateStatus) {
      onUpdateStatus(table.id, newStatus);
    }
  };

  const handleExecuteResolution = (resolution) => {
    if (!onUpdateStatus) return;

    if (conflictActionType === 'LOCK_WITH_ORDER') {
      if (resolution === 'MOVE_TABLE') {
        if (!selectedTargetTableId) return;
        onUpdateStatus(table.id, 'MAINTENANCE', {
          resolution: 'MOVE_TABLE',
          targetTableId: selectedTargetTableId
        });
      }
    } else if (conflictActionType === 'CONFIRM_UNLOCK_MAINTENANCE') {
      onUpdateStatus(table.id, 'AVAILABLE');
    } else {
      // RESOLVE_FOR_AVAILABLE
      if (resolution === 'MOVE_TABLE') {
        if (!selectedTargetTableId) return;
        onUpdateStatus(table.id, 'AVAILABLE', {
          resolution: 'MOVE_TABLE',
          targetTableId: selectedTargetTableId
        });
      } else if (resolution === 'COMPLETE') {
        onUpdateStatus(table.id, 'AVAILABLE', { resolution: 'COMPLETE' });
      } else if (resolution === 'CANCEL') {
        onUpdateStatus(table.id, 'AVAILABLE', { resolution: 'CANCEL' });
      }
    }
    setShowConflictDialog(false);
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
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${statusCfg.badgeClass}`}>
              {statusCfg.label}
            </span>
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
          {showConflictDialog ? (
            conflictActionType === 'CONFIRM_UNLOCK_MAINTENANCE' ? (
              /* Kịch bản 1: Xác nhận mở lại bàn bảo trì */
              <div className="p-4 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/50 space-y-3 animate-sheet-up">
                <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/20 text-emerald-200">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="font-serif font-bold text-sm text-emerald-200">
                      Xác Nhận Mở Lại Bàn Sẵn Sàng
                    </h4>
                    <p className="text-[11px] text-stone-300">
                      Bàn đang tạm khóa bảo trì. Bạn xác nhận bàn đã hoàn tất vệ sinh, kiểm tra và sẵn sàng đón khách mới?
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowConflictDialog(false)}
                    className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 font-serif text-xs transition-colors"
                  >
                    Vẫn Tạm Khóa
                  </button>
                  <button
                    onClick={() => handleExecuteResolution('CONFIRM_UNLOCK')}
                    disabled={isUpdating}
                    className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-serif font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Xác Nhận Mở Bàn Sẵn Sàng →
                  </button>
                </div>
              </div>
            ) : conflictActionType === 'LOCK_WITH_ORDER' ? (
              /* Kịch bản 2: Tạm khóa bàn đang có đơn hàng */
              <div className="p-4 rounded-2xl bg-rose-950/40 border-2 border-rose-500/50 space-y-3 animate-sheet-up">
                <div className="flex items-center gap-2 pb-2 border-b border-rose-500/20 text-rose-200">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
                  <div>
                    <h4 className="font-serif font-bold text-sm text-rose-100">
                      Không Thể Khóa Bàn Đang Có Khách!
                    </h4>
                    <p className="text-[11px] text-rose-300/80">
                      Bàn đang có đơn #{table.activeOrderCode} ({table.activeGuestName}). Vui lòng chuyển đơn sang bàn khác trước khi tạm khóa để bảo trì.
                    </p>
                  </div>
                </div>

                {availableTables.length > 0 ? (
                  <div className="p-2.5 rounded-xl bg-black/50 border border-amber-500/30 space-y-2">
                    <label className="text-xs text-amber-200 font-serif font-bold block">
                      Chọn bàn trống để chuyển khách sang:
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedTargetTableId}
                        onChange={(e) => setSelectedTargetTableId(e.target.value)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-stone-900 border border-amber-500/40 text-xs text-amber-200 font-sans focus:outline-none"
                      >
                        {availableTables.map((t) => (
                          <option key={t.id} value={t.id} className="bg-stone-900 text-white">
                            {t.name} (T{t.floor} • {t.capacity} chỗ • {t.zoneName})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleExecuteResolution('MOVE_TABLE')}
                        disabled={isUpdating || !selectedTargetTableId}
                        className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-serif font-bold text-xs shadow-sm transition-all"
                      >
                        Chuyển & Khóa Bàn
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-black/40 text-xs text-rose-300 italic">
                    ⚠️ Hiện không còn bàn trống nào khác để chuyển khách. Không thể tạm khóa bàn này lúc này!
                  </div>
                )}

                <div className="flex items-center justify-end pt-1">
                  <button
                    onClick={() => setShowConflictDialog(false)}
                    className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 font-serif text-xs transition-colors"
                  >
                    Đóng (Giữ nguyên)
                  </button>
                </div>
              </div>
            ) : (
              /* Kịch bản 3: Giải phóng bàn đang có đơn hàng sang Sẵn sàng */
              <div className="p-4 rounded-2xl bg-amber-950/40 border-2 border-amber-500/50 space-y-3 animate-sheet-up">
                <div className="flex items-center gap-2 pb-2 border-b border-amber-500/20 text-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
                  <div>
                    <h4 className="font-serif font-bold text-sm text-amber-100">
                      Cảnh Báo: Bàn Đang Có Đơn Hàng!
                    </h4>
                    <p className="text-[11px] text-amber-300/80">
                      {isPaid ? 'Đơn này ĐÃ THANH TOÁN. Hãy chọn phương án xử lý phù hợp:' : 'Đơn hàng đang chờ phục vụ. Hãy chọn phương án xử lý:'}
                    </p>
                  </div>
                </div>

                {/* Thông tin vắn tắt đơn */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Đơn hàng:</span>
                    <span className="font-mono font-bold text-amber-300">#{table.activeOrderCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Thực khách:</span>
                    <span className="font-bold text-stone-200">{table.activeGuestName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Thanh toán:</span>
                    <span className={`font-bold ${isPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isPaid ? '✅ Đã thanh toán (100%)' : '⏳ Chưa thanh toán'}
                    </span>
                  </div>
                </div>

                {/* Lựa chọn 3 phương án */}
                <div className="space-y-2">
                  {/* Phương án 1: Đổi sang bàn khác */}
                  <div className="p-2.5 rounded-xl bg-stone-900/80 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-serif font-bold text-amber-200 flex items-center gap-1.5">
                        <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                        1. Chuyển sang bàn trống khác (Khuyến nghị)
                      </span>
                    </div>
                    {availableTables.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedTargetTableId}
                          onChange={(e) => setSelectedTargetTableId(e.target.value)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-black/60 border border-amber-500/40 text-xs text-amber-200 font-sans focus:outline-none"
                        >
                          {availableTables.map((t) => (
                            <option key={t.id} value={t.id} className="bg-stone-900 text-white">
                              {t.name} (T{t.floor} • {t.capacity} chỗ • {t.zoneName})
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleExecuteResolution('MOVE_TABLE')}
                          disabled={isUpdating || !selectedTargetTableId}
                          className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-serif font-bold text-xs shadow-sm transition-all"
                        >
                          Chuyển
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-stone-400 italic">Hiện không còn bàn nào khác đang sẵn sàng.</p>
                    )}
                  </div>

                  {/* Phương án 2: Khách đã ăn xong ra về */}
                  <button
                    onClick={() => handleExecuteResolution('COMPLETE')}
                    disabled={isUpdating}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-500/40 text-emerald-200 font-serif font-bold text-xs flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      2. Khách đã dùng bữa xong ra về
                    </span>
                    <span className="text-[10px] text-emerald-400/80 font-sans font-normal">(Hoàn tất đơn & Dọn bàn)</span>
                  </button>

                  {/* Phương án 3: Khách hủy đơn hoặc không đến */}
                  <button
                    onClick={() => handleExecuteResolution('CANCEL')}
                    disabled={isUpdating}
                    className="w-full py-2 px-3 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 font-serif font-bold text-xs flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <UserX className="w-3.5 h-3.5 text-rose-400" />
                      3. Khách hủy đơn / Vắng mặt
                    </span>
                    <span className="text-[10px] text-rose-400/80 font-sans font-normal">(Hủy đơn & Nhả bàn)</span>
                  </button>
                </div>

                {/* Nút hủy bỏ / Quay lại */}
                <div className="pt-2 flex items-center justify-end">
                  <button
                    onClick={() => setShowConflictDialog(false)}
                    className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 font-serif text-xs transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Giữ nguyên bàn</span>
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400 font-medium">
                  Điều chỉnh trạng thái bàn nhanh:
                </span>
                {isOccupied && (
                  <span className="text-[10px] text-amber-400/90 font-mono">
                    {isPaid ? '⚠️ Có đơn đã thanh toán' : '(Đổi trạng thái sẽ giải phóng bàn)'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleStatusChange('AVAILABLE')}
                  disabled={isUpdating || table.status === 'available'}
                  className={`py-2 px-2 rounded-xl text-xs font-serif border transition-all ${
                    table.status === 'available'
                      ? 'border-emerald-400 bg-emerald-900/70 text-white ring-2 ring-emerald-500/50 font-bold'
                      : 'border-emerald-500/40 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 disabled:opacity-40'
                  }`}
                >
                  Sẵn sàng
                </button>
                <button
                  onClick={() => handleStatusChange('RESERVED')}
                  disabled={isUpdating || table.status === 'reserved'}
                  className={`py-2 px-2 rounded-xl text-xs font-serif border transition-all ${
                    table.status === 'reserved'
                      ? 'border-amber-400 bg-amber-900/70 text-white ring-2 ring-amber-500/50 font-bold'
                      : 'border-amber-500/40 bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 disabled:opacity-40'
                  }`}
                >
                  Đặt trước
                </button>
                <button
                  onClick={() => handleStatusChange('MAINTENANCE')}
                  disabled={isUpdating || table.status === 'maintenance'}
                  className={`py-2 px-2 rounded-xl text-xs font-serif border transition-all ${
                    table.status === 'maintenance'
                      ? 'border-amber-400 bg-amber-900/80 text-white ring-2 ring-amber-500/50 font-bold'
                      : 'border-amber-600/40 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 disabled:opacity-40'
                  }`}
                >
                  Tạm khóa 🔒
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(TableDetailModal);

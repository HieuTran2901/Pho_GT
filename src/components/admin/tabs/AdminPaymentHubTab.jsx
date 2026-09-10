import React, { useState, useMemo, useCallback } from 'react';
import { ShieldCheck, RotateCcw } from 'lucide-react';
import { useAdminPaymentGateways } from './useAdminPaymentGateways';
import AdminPaymentGatewayCard from './AdminPaymentGatewayCard';

export default function AdminPaymentHubTab({
  gateways: propGateways,
  gatewaysLoading: propLoading,
  onUpdateGateway: propUpdateGateway,
  onRefresh: propRefresh,
  notify
}) {
  const hookState = useAdminPaymentGateways(notify);

  const gateways = propGateways || hookState.gateways;
  const gatewaysLoading = propLoading !== undefined ? propLoading : hookState.loading;
  const onUpdateGateway = propUpdateGateway || hookState.updateGateway;
  const onRefresh = propRefresh || hookState.fetchGateways;

  const [editingStates, setEditingStates] = useState({});
  const [savingId, setSavingId] = useState(null);

  const handleStatusChange = useCallback((id, newStatus) => {
    setEditingStates(prev => {
      const current = prev[id] || {};
      return {
        ...prev,
        [id]: {
          ...current,
          status: newStatus
        }
      };
    });
  }, []);

  const handleMessageChange = useCallback((id, message) => {
    setEditingStates(prev => {
      const current = prev[id] || {};
      return {
        ...prev,
        [id]: {
          ...current,
          maintenanceMessage: message
        }
      };
    });
  }, []);

  const handleSave = useCallback(async (gw) => {
    const draft = editingStates[gw.id] || {};
    const effectiveStatus = draft.status || gw.status || 'ACTIVE';
    const effectiveMessage = draft.maintenanceMessage ?? gw.maintenanceMessage ?? '';

    setSavingId(gw.id);
    try {
      await onUpdateGateway(gw.id, {
        status: effectiveStatus,
        maintenanceMessage: effectiveMessage
      });
      // Xóa draft state sau khi lưu thành công
      setEditingStates(prev => {
        const next = { ...prev };
        delete next[gw.id];
        return next;
      });
    } catch (err) {
      notify?.(err.message || 'Cập nhật cổng thanh toán thất bại', 'error');
    } finally {
      setSavingId(null);
    }
  }, [onUpdateGateway, editingStates, notify]);

  const statusCounts = useMemo(() => {
    let active = 0;
    let maintenance = 0;
    let disabled = 0;

    (gateways || []).forEach((gw) => {
      const st = editingStates[gw.id]?.status || gw.status || 'ACTIVE';
      if (st === 'ACTIVE') active += 1;
      else if (st === 'MAINTENANCE') maintenance += 1;
      else if (st === 'DISABLED') disabled += 1;
    });

    return { active, maintenance, disabled, total: (gateways || []).length };
  }, [gateways, editingStates]);

  return (
    <div className="space-y-6">
      {/* Tiêu đề Khay Sơn Mài Tinh Gọn & Bảng Trạng Thái Nhanh (Phương án 2) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl bg-gradient-to-r from-[#22130b] via-[#2a170d] to-[#1c0f08] border border-[#d4af37]/30 shadow-lg">
        {/* Nhóm tiêu đề tinh giản */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#8a1e14] to-[#50100a] border border-[#d4af37]/40 flex items-center justify-center shadow-md shadow-[#8a1e14]/30 shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#fcedc7]" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold font-serif text-[#fcf9f2] tracking-wide">
              Cổng Thanh Toán
            </h2>
            <span className="hidden md:inline-block text-[11px] text-[#d4af37]/60 font-serif border-l border-[#d4af37]/25 pl-2">
              Điều khiển thời gian thực
            </span>
          </div>
        </div>

        {/* Cụm Live Status Capsules (Chỉ số thời gian thực) */}
        <div className="flex items-center gap-1.5 sm:gap-2 order-3 sm:order-2 w-full sm:w-auto justify-start sm:justify-center pt-1 sm:pt-0 border-t border-white/5 sm:border-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-serif font-semibold bg-emerald-950/50 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span>{statusCounts.active} Đang bật</span>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-serif font-semibold border ${
            statusCounts.maintenance > 0
              ? 'bg-amber-950/70 text-amber-300 border-amber-400/60 ring-1 ring-amber-400/40 shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse'
              : 'bg-amber-950/30 text-amber-300/60 border-amber-500/20'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>{statusCounts.maintenance} Bảo trì</span>
          </div>

          {statusCounts.disabled > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-serif font-semibold bg-zinc-900/60 text-zinc-400 border border-zinc-700/50">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span>{statusCounts.disabled} Tắt</span>
            </div>
          )}
        </div>

        {/* Nút Làm mới gọn gàng */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={gatewaysLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif font-bold text-amber-200 bg-white/5 hover:bg-white/10 border border-[#d4af37]/30 transition-all cursor-pointer disabled:opacity-50 shrink-0 order-2 sm:order-3 ml-auto sm:ml-0"
          title="Làm mới danh sách cổng thanh toán"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${gatewaysLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {/* Lưới các cổng thanh toán */}
      {gatewaysLoading && gateways.length === 0 ? (
        <div className="p-12 text-center text-amber-200/60 font-serif text-sm">
          Đang tải dữ liệu cổng thanh toán...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {gateways.map((gw) => {
            const draft = editingStates[gw.id];
            const currentStatus = draft?.status || gw.status || 'ACTIVE';
            const currentMessage = draft?.maintenanceMessage ?? gw.maintenanceMessage ?? '';
            const isModified = Boolean(draft);
            const isSaving = savingId === gw.id;

            return (
              <AdminPaymentGatewayCard
                key={gw.id}
                gw={gw}
                status={currentStatus}
                maintenanceMessage={currentMessage}
                isModified={isModified}
                isSaving={isSaving}
                onStatusChange={handleStatusChange}
                onMessageChange={handleMessageChange}
                onSave={handleSave}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

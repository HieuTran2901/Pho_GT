import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Coffee, Layers, Flame, CheckCircle2, RefreshCw, Sparkles, Filter, Users, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatVND } from '../adminConstants';
import { tableApi } from '../../../services/tableApi';
import { MOCK_TABLES } from '../../seatmap/mockTables';

function AdminTablesTab({
  orders = [],
  notify,
  setActiveTab,
  setOrderFilter
}) {
  const [tables, setTables] = useState(MOCK_TABLES);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, AVAILABLE, OCCUPIED, VIP

  // Tải danh sách bàn realtime từ backend
  const fetchLiveTables = useCallback(async (showToast = false) => {
    setIsLoading(true);
    try {
      const data = await tableApi.getTables();
      if (data && Array.isArray(data) && data.length > 0) {
        setTables(data);
        setLastRefreshed(new Date());
        if (showToast && notify) {
          notify('Đã đồng bộ trạng thái 22 bàn di sản realtime!', 'success');
        }
      }
    } catch (err) {
      console.warn('[AdminTablesTab] Lỗi tải bàn realtime:', err);
      if (showToast && notify) {
        notify('Không thể kết nối máy chủ bàn, hiển thị trạng thái hiện tại.', 'warning');
      }
    } finally {
      setIsLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchLiveTables(false);
    // Tự động làm mới mỗi 15 giây
    const interval = setInterval(() => {
      fetchLiveTables(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchLiveTables]);

  // Ghép nối thêm với mảng orders cục bộ nếu có đơn mới chưa kịp flush vào DB
  const mergedTables = useMemo(() => {
    const activeLocalOrders = (orders || []).filter(
      (o) => o && (o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'COOKING')
    );

    return tables.map((tb) => {
      // Nếu backend đã báo occupied thì giữ nguyên
      if (tb.status === 'occupied' && tb.activeOrderCode) {
        return tb;
      }

      // Kiểm tra có đơn hàng nội bộ nào khớp với bàn này không
      const matchedLocal = activeLocalOrders.find((ord) => {
        if (!ord.tableNumber) return false;
        const oNum = String(ord.tableNumber).trim().toLowerCase();
        const tbId = String(tb.id).toLowerCase();
        const tbName = String(tb.name).toLowerCase();
        return oNum === tbId || oNum === tbName || oNum === tbName.replace('bàn ', '').replace('vip-', '');
      });

      if (matchedLocal) {
        return {
          ...tb,
          status: 'occupied',
          activeOrderCode: matchedLocal.orderCode,
          activeGuestName: matchedLocal.guestName || (matchedLocal.user ? matchedLocal.user.fullName : 'Khách tại bàn'),
          activeGuestPhone: matchedLocal.guestPhone || '',
          activeAmount: matchedLocal.finalAmount || matchedLocal.totalAmount,
          activeStatus: matchedLocal.status
        };
      }

      return tb;
    });
  }, [tables, orders]);

  // Bộ lọc danh sách
  const filteredTables = useMemo(() => {
    return mergedTables.filter((t) => {
      if (statusFilter === 'AVAILABLE') return t.status === 'available';
      if (statusFilter === 'OCCUPIED') return t.status === 'occupied';
      if (statusFilter === 'VIP') return t.isVip;
      return true;
    });
  }, [mergedTables, statusFilter]);

  const floor1Tables = useMemo(() => filteredTables.filter((t) => t.floor === 1), [filteredTables]);
  const floor2Tables = useMemo(() => filteredTables.filter((t) => t.floor === 2), [filteredTables]);

  // KPI tổng quan
  const totalOccupied = useMemo(() => mergedTables.filter((t) => t.status === 'occupied').length, [mergedTables]);
  const totalAvailable = useMemo(() => mergedTables.filter((t) => t.status === 'available').length, [mergedTables]);
  const totalVip = useMemo(() => mergedTables.filter((t) => t.isVip).length, [mergedTables]);

  const handleTableClick = (table) => {
    if (table.status === 'occupied' && table.activeOrderCode) {
      if (setActiveTab) {
        setActiveTab('orders');
        if (setOrderFilter) setOrderFilter('ALL');
      }
      if (notify) {
        notify(`Chuyển đến đơn hàng ${table.activeOrderCode} của ${table.name}!`, 'info');
      }
    } else {
      if (notify) {
        notify(`${table.name} (${table.capacity} chỗ - ${table.zoneName || 'Phở 1986'}) đang trống sẵn sàng đón khách!`, 'info');
      }
    }
  };

  const renderTableCard = (table) => {
    const isOccupied = table.status === 'occupied';
    const isVip = !!table.isVip;

    return (
      <motion.div
        key={table.id}
        whileHover={{ y: -3, scale: 1.02, transition: { duration: 0.15 } }}
        onClick={() => handleTableClick(table)}
        className={`relative p-3.5 rounded-2xl text-center shadow-xs group transition-all cursor-pointer border flex flex-col justify-between min-h-[140px] ${
          isOccupied
            ? 'bg-amber-50/95 border-[#8a1e14]/50 shadow-[#8a1e14]/10 ring-1 ring-[#8a1e14]/20'
            : isVip
            ? 'bg-[#fdfaf3] border-amber-400/60 hover:border-amber-500 hover:bg-amber-50/50'
            : 'bg-[#fcfaf7] border-emerald-500/40 hover:border-emerald-600 hover:bg-emerald-50/40'
        }`}
        title={isOccupied ? `Bàn có khách: ${table.activeGuestName || table.activeOrderCode}. Bấm xem đơn.` : 'Bàn trống'}
      >
        {isVip && (
          <span className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-800 border border-amber-500/30">
            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
            VIP
          </span>
        )}

        <div>
          <div className="flex justify-center mb-1.5">
            {isOccupied ? (
              <div className="w-8 h-8 rounded-full bg-[#8a1e14] text-amber-200 flex items-center justify-center shadow-xs">
                <Flame className="w-4 h-4 fill-current animate-pulse text-amber-300" />
              </div>
            ) : table.floor === 2 ? (
              <div className="w-8 h-8 rounded-full bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
                <Layers className="w-4 h-4 text-emerald-700" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
                <Coffee className="w-4 h-4 text-emerald-700" />
              </div>
            )}
          </div>

          <div className="text-xs font-bold font-serif text-stone-900">{table.name}</div>
          <div className="text-[10px] text-stone-500 font-sans mt-0.5 flex items-center justify-center gap-1">
            <Users className="w-2.5 h-2.5 text-stone-400" />
            <span>{table.capacity} chỗ</span>
            {table.zoneName && (
              <span className="truncate max-w-[80px] text-[9px] text-stone-400 hidden sm:inline">
                • {table.zoneName}
              </span>
            )}
          </div>
        </div>

        {isOccupied ? (
          <div className="mt-2 pt-2 border-t border-amber-900/10 space-y-0.5">
            <div className="text-[10px] text-[#8a1e14] font-serif font-bold flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8a1e14] animate-ping" />
              <span>Đang có khách</span>
            </div>
            <div className="text-[10px] font-mono font-bold text-stone-800 truncate" title={table.activeGuestName}>
              {table.activeGuestName || table.activeOrderCode}
            </div>
            {table.activeAmount ? (
              <div className="text-[10px] font-mono text-amber-900 font-bold">
                {formatVND(table.activeAmount)}
              </div>
            ) : null}
            {table.activeOrderCode && (
              <div className="text-[9px] text-stone-500 font-mono truncate">
                {table.activeOrderCode}
              </div>
            )}
          </div>
        ) : (
          <div className="text-[10px] text-emerald-700 font-mono mt-2 flex items-center justify-center gap-1 font-bold pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Sẵn sàng</span>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & KPI Thống kê Bàn Trực Quan */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-amber-900/15">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#1c120c] tracking-tight">
              Giám Sát Sơ Đồ Bàn 2 Tầng Realtime
            </h2>
            <button
              onClick={() => fetchLiveTables(true)}
              disabled={isLoading}
              className="p-1.5 rounded-lg border border-amber-900/20 bg-stone-50 hover:bg-amber-100/50 text-stone-600 transition-colors disabled:opacity-50"
              title="Làm mới dữ liệu từ CSDL"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
            </button>
          </div>
          <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
            <span>22 bàn di sản Phở 1986 — Đồng bộ trực tiếp với hệ thống đơn hàng backend</span>
            <span className="text-stone-400">•</span>
            <span className="text-[11px] text-stone-400">
              Cập nhật lúc: {lastRefreshed.toLocaleTimeString('vi-VN')}
            </span>
          </p>
        </div>

        {/* Filter & Counters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-serif font-bold">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              statusFilter === 'ALL'
                ? 'bg-stone-800 text-white border-stone-800 shadow-2xs'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            Tất cả ({mergedTables.length})
          </button>
          <button
            onClick={() => setStatusFilter('AVAILABLE')}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
              statusFilter === 'AVAILABLE'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/70'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Còn trống ({totalAvailable})</span>
          </button>
          <button
            onClick={() => setStatusFilter('OCCUPIED')}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
              statusFilter === 'OCCUPIED'
                ? 'bg-[#8a1e14] text-white border-[#8a1e14] shadow-2xs'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100/70'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#8a1e14] fill-current" />
            <span>Có khách ({totalOccupied})</span>
          </button>
          <button
            onClick={() => setStatusFilter('VIP')}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
              statusFilter === 'VIP'
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                : 'bg-amber-50/60 text-amber-800 border-amber-200 hover:bg-amber-100/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>VIP ({totalVip})</span>
          </button>
        </div>
      </div>

      {/* TẦNG 1 */}
      {(statusFilter === 'ALL' || floor1Tables.length > 0) && (
        <div className="p-5 sm:p-6 bg-white border border-stone-200/90 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8a1e14]" />
              <span className="font-serif font-bold text-stone-900 text-base">
                Tầng 1 — Gian Nồi Phở 90°C & Cửa Chính Hàng Bạc
              </span>
            </div>
            <span className="text-xs text-stone-700 font-mono font-bold bg-stone-100 px-2.5 py-1 rounded border border-stone-200">
              {floor1Tables.length} BÀN HIỂN THỊ
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 pt-2">
            {floor1Tables.map((tb) => renderTableCard(tb))}
          </div>
        </div>
      )}

      {/* TẦNG 2 */}
      {(statusFilter === 'ALL' || floor2Tables.length > 0) && (
        <div className="p-5 sm:p-6 bg-white border border-stone-200/90 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />
              <span className="font-serif font-bold text-stone-900 text-base">
                Tầng 2 — Ban Công View Phố Cổ & Gian Tranh 1986
              </span>
            </div>
            <span className="text-xs text-stone-700 font-mono font-bold bg-stone-100 px-2.5 py-1 rounded border border-stone-200">
              {floor2Tables.length} BÀN HIỂN THỊ
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 pt-2">
            {floor2Tables.map((tb) => renderTableCard(tb))}
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(AdminTablesTab);

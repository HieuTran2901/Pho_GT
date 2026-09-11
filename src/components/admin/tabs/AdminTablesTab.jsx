import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, RefreshCw, Sparkles, Quote } from 'lucide-react';
import DioramaFloorTray from '../tables/DioramaFloorTray';
import TableDetailModal from '../tables/TableDetailModal';
import { tableApi } from '../../../services/tableApi';
import { MOCK_TABLES } from '../../seatmap/mockTables';
import { DIORAMA_STATUS_CONFIG } from '../tables/dioramaConstants';

/**
 * [URBAN & RAVEN] Giám Sát Sơ Đồ Bàn 2 Tầng — Phối Cảnh 2.5D Isometric Diorama
 * Chuẩn phong cách di sản Phở Gia Truyền 1986 với sa bàn nổi đèn vàng ấm áp và đồng bộ CSDL realtime.
 */
function AdminTablesTab({
  orders = [],
  notify,
  setActiveTab,
  setOrderFilter
}) {
  const [tables, setTables] = useState(MOCK_TABLES);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Tải danh sách bàn realtime từ backend
  const fetchLiveTables = useCallback(async (showToast = false) => {
    setIsLoading(true);
    try {
      const data = await tableApi.getTables();
      if (data && Array.isArray(data) && data.length > 0) {
        setTables(data);
        if (showToast && notify) {
          notify('Đã đồng bộ sơ đồ 22 bàn di sản realtime!', 'success');
        }
      }
    } catch (err) {
      console.warn('[AdminTablesTab] Lỗi tải bàn realtime:', err);
      if (showToast && notify) {
        notify('Không thể kết nối máy chủ bàn, hiển thị dữ liệu lưu cục bộ.', 'warning');
      }
    } finally {
      setIsLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchLiveTables(false);
    const interval = setInterval(() => {
      fetchLiveTables(false);
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchLiveTables]);

  // Ghép nối với mảng đơn hàng local nếu có đơn mới chưa kịp flush
  const mergedTables = useMemo(() => {
    const activeLocalOrders = (orders || []).filter(
      (o) => o && (o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'COOKING')
    );

    return tables.map((tb) => {
      // Ưu tiên tôn trọng trạng thái Quản trị viên vừa chủ động chỉ định (AVAILABLE, RESERVED, MAINTENANCE)
      if (tb.status === 'available' || tb.status === 'reserved' || tb.status === 'maintenance') {
        return tb;
      }

      if (tb.status === 'occupied' && tb.activeOrderCode) {
        return tb;
      }

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

  const floor1Tables = useMemo(() => mergedTables.filter((t) => t.floor === 1), [mergedTables]);
  const floor2Tables = useMemo(() => mergedTables.filter((t) => t.floor === 2), [mergedTables]);

  // Xử lý khi bấm vào 1 bàn
  const handleSelectTable = useCallback((table) => {
    setSelectedTable(table);
    setIsDetailModalOpen(true);
  }, []);

  // Chuyển sang xem đơn hàng của bàn
  const handleViewOrder = useCallback((table) => {
    if (setActiveTab) {
      setActiveTab('orders');
      if (setOrderFilter) setOrderFilter('ALL');
    }
    if (notify) {
      notify(`Đang mở đơn hàng ${table.activeOrderCode} của ${table.name}`, 'info');
    }
  }, [setActiveTab, setOrderFilter, notify]);

  // Cập nhật trạng thái bàn với Optimistic UI Update tức thời
  const handleUpdateStatus = useCallback(async (tableId, newStatus) => {
    setIsUpdatingStatus(true);
    const normalizedStatus = String(newStatus).toLowerCase();

    // 1. Cập nhật lạc quan (Optimistic Update) ngay tức thì trên giao diện (0ms delay)
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            status: normalizedStatus,
            activeOrderCode: normalizedStatus === 'available' ? null : t.activeOrderCode,
            activeGuestName: normalizedStatus === 'available' ? null : t.activeGuestName,
            activeGuestPhone: normalizedStatus === 'available' ? null : t.activeGuestPhone,
            activeAmount: normalizedStatus === 'available' ? null : t.activeAmount,
          };
        }
        return t;
      })
    );

    // Cập nhật ngay modal chi tiết đang mở
    setSelectedTable((prev) => (prev && prev.id === tableId ? { ...prev, status: normalizedStatus } : prev));

    try {
      await tableApi.updateTableStatus(tableId, newStatus);
      await fetchLiveTables(false);
      if (notify) {
        notify(`Đã đổi trạng thái bàn sang ${newStatus}!`, 'success');
      }
      setIsDetailModalOpen(false);
    } catch (err) {
      console.error('[AdminTablesTab] Cập nhật bàn lỗi:', err);
      if (notify) {
        notify(err.message || 'Cập nhật trạng thái bàn thất bại', 'error');
      }
      // Revert lại state đúng từ server nếu thất bại
      await fetchLiveTables(false);
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [fetchLiveTables, notify]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* 1. HEADER DI SẢN: BIỂN HIỆU KHẮC GỖ + TRÍCH DẪN + BẢNG CHÚ GIẢI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Biển Hiệu Thư Pháp "Sơ đồ bàn" với viền hoa văn mạ đồng */}
        <div className="lg:col-span-4 xl:col-span-4">
          <div className="relative p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#2a170d] via-[#1a0e07] to-[#100804] border-2 border-[#d4af37]/60 shadow-[0_10px_25px_rgba(0,0,0,0.6)] flex items-center justify-between">
            {/* 4 Góc hoa văn mạ đồng cổ điển */}
            <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#d4af37]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#d4af37]" />
            <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#d4af37]" />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#d4af37]" />

            <div className="space-y-0.5">
              <h1 className="font-serif italic font-extrabold text-2xl sm:text-3xl text-[#fcedc7] tracking-wider leading-none drop-shadow-md">
                Sơ đồ bàn
              </h1>
              <p className="text-[10px] font-mono tracking-widest text-[#d4af37] uppercase font-bold">
                — Khám Phá Không Gian Nhà Hàng —
              </p>
              <p className="text-[10px] font-serif text-stone-400 italic">
                Phở Gia Truyền 1986
              </p>
            </div>

            <button
              onClick={() => fetchLiveTables(true)}
              disabled={isLoading}
              className="p-2 rounded-xl bg-black/40 border border-[#d4af37]/30 text-amber-300 hover:text-amber-200 hover:bg-black/60 transition-all disabled:opacity-50"
              title="Đồng bộ lại CSDL"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Trích Dẫn Tri Kỷ Ở Giữa */}
        <div className="lg:col-span-4 xl:col-span-4 hidden md:flex flex-col items-center text-center px-2">
          <div className="relative">
            <Quote className="w-5 h-5 text-amber-800/40 absolute -top-2.5 -left-4 pointer-events-none" />
            <p className="font-serif italic text-xs sm:text-sm font-bold text-[#3d2417] leading-relaxed max-w-sm">
              “Một bát phở ngon, bắt đầu từ một không gian ấm cúng.”
            </p>
            <span className="block text-[11px] font-serif font-bold text-[#8a1e14] mt-1 tracking-wider">
              — Phở Gia Truyền 1986 —
            </span>
          </div>
        </div>

        {/* Bộ Đếm Bàn & Bảng Chú Giải Trạng Thái 4 Màu */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-wrap sm:flex-nowrap items-center justify-end gap-3">
          {/* Capsule Tổng Bàn: 22 */}
          <div className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#24160e] to-[#140b06] border border-[#d4af37]/45 shadow-md flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-stone-400 font-sans block leading-none">Tổng số bàn</span>
              <span className="font-serif font-bold text-lg text-white leading-none">22</span>
            </div>
          </div>

          {/* Bảng chú giải 4 màu (Trống, Đang dùng, Đặt trước, Khóa) */}
          <div className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#24160e] to-[#140b06] border border-[#d4af37]/45 shadow-md flex items-center gap-3 text-xs font-serif font-medium">
            <div className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
              <span className="text-[11px] font-bold">Trống</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-300">
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
              <span className="text-[11px] font-bold">Đang dùng</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
              <span className="text-[11px] font-bold">Đặt trước</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-400">
              <span className="w-2 h-2 rounded-full bg-stone-400" />
              <span className="text-[11px] font-bold">Khóa</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KHAY SA BÀN NỔI 2.5D: TẦNG 1 (12 BÀN) */}
      <DioramaFloorTray
        floorNumber={1}
        tables={floor1Tables}
        onSelectTable={handleSelectTable}
        selectedTableId={selectedTable?.id}
      />

      {/* 3. KHAY SA BÀN NỔI 2.5D: TẦNG 2 (10 BÀN) */}
      <DioramaFloorTray
        floorNumber={2}
        tables={floor2Tables}
        onSelectTable={handleSelectTable}
        selectedTableId={selectedTable?.id}
      />

      {/* 4. MODAL CHI TIẾT & ĐIỀU PHỐI BÀN */}
      <TableDetailModal
        table={selectedTable}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onViewOrder={handleViewOrder}
        onUpdateStatus={handleUpdateStatus}
        isUpdating={isUpdatingStatus}
      />
    </div>
  );
}

export default React.memo(AdminTablesTab);

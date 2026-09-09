import React, { useMemo } from 'react';
import { Coffee, Layers, Flame, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatVND } from '../adminConstants';

const FLOOR_1_TABLES = [
  { num: 1, name: 'Bàn 01', capacity: 2 },
  { num: 2, name: 'Bàn 02', capacity: 2 },
  { num: 3, name: 'Bàn 03', capacity: 4 },
  { num: 4, name: 'Bàn 04', capacity: 4 },
  { num: 5, name: 'Bàn 05 (VIP)', capacity: 6 },
  { num: 6, name: 'Bàn 06', capacity: 4 },
];

const FLOOR_2_TABLES = [
  { num: 7, name: 'Ban Công 01', capacity: 4 },
  { num: 8, name: 'Ban Công 02', capacity: 4 },
  { num: 9, name: 'Gian Tranh VIP', capacity: 6 },
  { num: 10, name: 'Gian Tranh 02', capacity: 2 },
];

function AdminTablesTab({
  orders = [],
  notify,
  setActiveTab,
  setOrderFilter
}) {
  // Tìm đơn hàng đang hoạt động (chưa hoàn tất hoặc huỷ) tại từng bàn
  const tableOrderMap = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      if (o.status === 'PENDING' || o.status === 'CONFIRMED') {
        if (o.tableNumber) {
          map[o.tableNumber] = o;
        }
      }
    });
    return map;
  }, [orders]);

  const totalOccupied = Object.keys(tableOrderMap).length;
  const totalTables = FLOOR_1_TABLES.length + FLOOR_2_TABLES.length;
  const totalAvailable = totalTables - totalOccupied;

  const handleTableClick = (table, activeOrder) => {
    if (activeOrder) {
      if (setActiveTab) {
        setActiveTab('orders');
        if (setOrderFilter) setOrderFilter(activeOrder.status || 'ALL');
      }
      if (notify) {
        notify(`Chuyển đến đơn hàng #${activeOrder.orderCode} của ${table.name}!`);
      }
    } else {
      if (notify) {
        notify(`${table.name} (${table.capacity} chỗ) hiện đang trống, sẵn sàng xếp khách!`, 'info');
      }
    }
  };

  const renderTableCard = (table, isFloor2 = false) => {
    const activeOrder = tableOrderMap[table.num];
    const isOccupied = !!activeOrder;

    return (
      <motion.div
        key={table.num}
        whileHover={{ y: -3, scale: 1.02, transition: { duration: 0.15 } }}
        onClick={() => handleTableClick(table, activeOrder)}
        className={`p-4 rounded-xl text-center shadow-2xs group transition-all cursor-pointer border ${
          isOccupied
            ? 'bg-amber-50/90 border-[#8a1e14]/50 shadow-[#8a1e14]/10 ring-1 ring-[#8a1e14]/20'
            : 'bg-[#fcfaf7] border-emerald-500/50 hover:border-emerald-600 hover:bg-emerald-50/40'
        }`}
        title={isOccupied ? `Bàn đang có khách: ${activeOrder.guestName || activeOrder.orderCode}. Bấm để xem đơn.` : 'Bàn đang trống'}
      >
        <div className="flex justify-center mb-1.5">
          {isOccupied ? (
            <div className="w-8 h-8 rounded-full bg-[#8a1e14] text-amber-200 flex items-center justify-center shadow-xs">
              <Flame className="w-4 h-4 fill-current animate-pulse text-amber-300" />
            </div>
          ) : isFloor2 ? (
            <div className="w-8 h-8 rounded-full bg-emerald-100/70 text-emerald-800 flex items-center justify-center">
              <Layers className="w-4 h-4 text-emerald-700" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-100/70 text-emerald-800 flex items-center justify-center">
              <Coffee className="w-4 h-4 text-emerald-700" />
            </div>
          )}
        </div>

        <div className="text-xs font-bold font-serif text-stone-900">{table.name}</div>
        <div className="text-[10px] text-stone-500 font-sans mt-0.5">{table.capacity} chỗ ngồi</div>

        {isOccupied ? (
          <div className="mt-2 pt-2 border-t border-amber-900/10 space-y-1">
            <div className="text-[10px] text-[#8a1e14] font-serif font-bold flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8a1e14] animate-ping" />
              <span>Đang dùng bữa</span>
            </div>
            <div className="text-[10px] font-mono font-bold text-stone-800 truncate">
              {activeOrder.guestName || activeOrder.orderCode}
            </div>
            <div className="text-[10px] font-mono text-amber-900 font-bold">
              {formatVND(activeOrder.finalAmount)}
            </div>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-900/15">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#1c120c] tracking-tight">
            Giám Sát Sơ Đồ Chỗ Ngồi 2 Tầng
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Mô phỏng vị trí bàn thực tế tại trụ sở số 45 Hàng Bạc — Cập nhật trực tiếp theo trạng thái đơn
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-serif font-bold">
          <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{totalAvailable}/{totalTables} Bàn Trống</span>
          </span>
          {totalOccupied > 0 && (
            <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#8a1e14] fill-current" />
              <span>{totalOccupied} Bàn Có Khách</span>
            </span>
          )}
        </div>
      </div>

      {/* Tầng 1 */}
      <div className="p-5 sm:p-6 bg-white border border-stone-200/90 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8a1e14]" />
            <span className="font-serif font-bold text-stone-900 text-base">
              Tầng 1 — Gian Nồi Phở 90°C & Cửa Chính Hàng Bạc
            </span>
          </div>
          <span className="text-xs text-stone-700 font-mono font-bold bg-stone-100 px-2.5 py-1 rounded border border-stone-200">
            {FLOOR_1_TABLES.length} BÀN TIÊU CHUẨN
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 pt-2">
          {FLOOR_1_TABLES.map(tb => renderTableCard(tb, false))}
        </div>
      </div>

      {/* Tầng 2 */}
      <div className="p-5 sm:p-6 bg-white border border-stone-200/90 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />
            <span className="font-serif font-bold text-stone-900 text-base">
              Tầng 2 — Ban Công View Phố Cổ & Gian Tranh 1986
            </span>
          </div>
          <span className="text-xs text-stone-700 font-mono font-bold bg-stone-100 px-2.5 py-1 rounded border border-stone-200">
            {FLOOR_2_TABLES.length} BÀN BAN CÔNG & VIP
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
          {FLOOR_2_TABLES.map(tb => renderTableCard(tb, true))}
        </div>
      </div>
    </div>
  );
}

export default React.memo(AdminTablesTab);

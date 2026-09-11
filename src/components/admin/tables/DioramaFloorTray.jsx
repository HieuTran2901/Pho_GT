import React, { useMemo } from 'react';
import { Layers, ArrowUpRight, Flame, Sparkles } from 'lucide-react';
import DioramaTablePod from './DioramaTablePod';
import { FLOOR_CONFIGS } from './dioramaConstants';

/**
 * [URBAN] Khung Sa Bàn Nổi 2.5D Diorama Tray (Tầng 1 / Tầng 2)
 * Bao gồm cột thông tin di sản bên trái, ma trận bàn 2.5D ở giữa với hành lang thông thoáng, và cầu thang / ban công bên phải.
 */
function DioramaFloorTray({
  floorNumber = 1,
  tables = [],
  onSelectTable,
  selectedTableId
}) {
  const floorCfg = FLOOR_CONFIGS[floorNumber] || FLOOR_CONFIGS[1];

  // Map nhanh từ id -> table object
  const tableMap = useMemo(() => {
    const map = new Map();
    tables.forEach((t) => map.set(t.id, t));
    return map;
  }, [tables]);

  const row1Tables = useMemo(() => {
    return floorCfg.row1Ids.map((id) => tableMap.get(id)).filter(Boolean);
  }, [floorCfg.row1Ids, tableMap]);

  const row2Tables = useMemo(() => {
    return floorCfg.row2Ids.map((id) => tableMap.get(id)).filter(Boolean);
  }, [floorCfg.row2Ids, tableMap]);

  const isFloor2 = floorNumber === 2;

  return (
    <div className="relative rounded-[28px] sm:rounded-[36px] bg-gradient-to-b from-[#1c120c]/98 via-[#130b06]/98 to-[#0b0604] border-2 border-[#d4af37]/35 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden p-3.5 sm:p-5 lg:p-5">
      {/* Hiệu ứng viền phát quang sàn gỗ ấm 90°C */}
      <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-black/60 pointer-events-none" />
      <div className="absolute -top-24 left-1/4 w-96 h-48 bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col xl:flex-row gap-3.5 sm:gap-4 lg:gap-4 items-stretch">
        {/* CỘT TRÁI: THÔNG TIN DI SẢN PHÂN KHU TẦNG (TINH GỌN) */}
        <div className="w-full xl:w-[155px] 2xl:w-[170px] shrink-0 flex flex-col justify-between p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-[#24170f]/90 via-[#180e09]/90 to-[#0e0704]/90 border border-[#d4af37]/25 shadow-inner">
          <div className="space-y-2.5">
            {/* Huy hiệu tầng + Icon */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#8a1e14] to-[#450e09] border border-amber-400/50 flex items-center justify-center text-amber-200 shadow-md shadow-[#8a1e14]/40 shrink-0">
                <Layers className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#fcedc7] tracking-wide flex items-center gap-1.5">
                  <span>{floorCfg.title}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                </h3>
                <span className="inline-block px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {floorCfg.totalCountText}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-stone-300 font-serif leading-relaxed line-clamp-2">
              {floorCfg.subtitle}
            </p>
          </div>

          {/* Ký họa phố cổ Hà Nội thu nhỏ */}
          <div className="mt-3 pt-2.5 border-t border-[#d4af37]/15 flex items-center justify-between text-stone-400">
            <div className="space-y-0.5">
              <div className="text-[9px] font-mono text-amber-300/80 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-2 h-2 text-amber-400" />
                <span>Di sản</span>
              </div>
              <div className="text-[10px] font-serif text-stone-300 truncate">
                {floorNumber === 1 ? 'Nồi phở 90°C' : 'View phố đêm'}
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400/90 shadow-xs">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* CỘT GIỮA: SÀN GỖ SA BÀN 2.5D ISOMETRIC VỚI HÀNH LANG RỘNG RÃI */}
        <div className="flex-1 flex flex-col justify-between gap-5 sm:gap-6 lg:gap-7 p-3 sm:p-4 lg:p-4 rounded-3xl bg-[#0a0503]/98 border border-[#d4af37]/25 shadow-[inset_0_4px_25px_rgba(0,0,0,0.8)] overflow-x-auto">
          {/* Hàng 1 (Tầng 1: 6 bàn; Tầng 2: 5 bàn) */}
          <div
            className={`grid gap-3 sm:gap-3.5 lg:gap-4 min-w-[650px] ${
              isFloor2
                ? 'grid-cols-5'
                : 'grid-cols-6'
            }`}
          >
            {row1Tables.map((table) => (
              <DioramaTablePod
                key={table.id}
                table={table}
                onSelectTable={onSelectTable}
                isSelected={selectedTableId === table.id}
              />
            ))}
          </div>

          {/* Lối đi hành lang trung tâm tạo độ thở và tách biệt 2 hàng bàn */}
          <div className="relative w-full flex items-center justify-center my-0.5 pointer-events-none min-w-[650px]">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#d4af37]/25 to-transparent" />
            <span className="absolute px-3 py-0.5 rounded-full bg-[#180e08] border border-[#d4af37]/20 text-[9px] font-mono tracking-widest text-[#d4af37]/70 uppercase">
              {floorNumber === 1 ? '— Lối Đi Gian Bếp —' : '— Lối Đi Ban Công —'}
            </span>
          </div>

          {/* Hàng 2 (Tầng 1: 6 bàn; Tầng 2: 5 bàn) */}
          <div
            className={`grid gap-3 sm:gap-3.5 lg:gap-4 min-w-[650px] ${
              isFloor2
                ? 'grid-cols-5'
                : 'grid-cols-6'
            }`}
          >
            {row2Tables.map((table) => (
              <DioramaTablePod
                key={table.id}
                table={table}
                onSelectTable={onSelectTable}
                isSelected={selectedTableId === table.id}
              />
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: CẦU THANG GỖ (TẦNG 1) HOẶC BAN CÔNG ĐÈN LỒNG (TẦNG 2) (TINH GỌN) */}
        <div className="w-full xl:w-[95px] 2xl:w-[105px] shrink-0 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-b from-[#22150d]/80 via-[#160d08]/80 to-[#0c0603]/80 border border-[#d4af37]/20 flex flex-col justify-between items-center text-center">
          {floorNumber === 1 ? (
            <>
              {/* Cầu thang gỗ lim nối Tầng 1 lên Tầng 2 */}
              <div className="w-full space-y-2">
                <div className="flex items-center justify-center gap-1 text-[11px] font-serif font-bold text-amber-300">
                  <span>{floorCfg.rightBanner.title}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                </div>
                {/* Bậc thang gỗ 2.5D cách điệu */}
                <div className="w-full space-y-1.5 py-1 px-2 bg-black/40 rounded-xl border border-white/5">
                  <div className="h-1.5 bg-gradient-to-r from-amber-700/60 to-amber-900/60 rounded-full" />
                  <div className="h-1.5 bg-gradient-to-r from-amber-600/70 to-amber-800/70 rounded-full" />
                  <div className="h-1.5 bg-gradient-to-r from-amber-500/80 to-amber-700/80 rounded-full" />
                  <div className="h-1.5 bg-gradient-to-r from-amber-400/90 to-amber-600/90 rounded-full" />
                </div>
              </div>

              <div className="text-[10px] text-stone-400 font-sans mt-2">
                Cầu thang lim cổ kính
              </div>
            </>
          ) : (
            <>
              {/* Ban công đèn lồng phố cổ & Biển hiệu PHỞ 1986 */}
              <div className="w-full space-y-2">
                <div className="px-2 py-1 rounded-lg bg-[#8a1e14]/90 border border-amber-400/50 shadow-md text-amber-200 font-serif font-bold text-xs tracking-wider">
                  PHỞ 1986
                </div>
                {/* Đèn lồng phát sáng vàng cổ điển */}
                <div className="flex items-center justify-center gap-2 py-1">
                  <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b] animate-pulse" />
                  <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse" />
                </div>
              </div>

              <div className="text-[10px] text-amber-300/80 font-serif italic mt-1">
                Hương vị Hà Nội xưa và nay
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(DioramaFloorTray);

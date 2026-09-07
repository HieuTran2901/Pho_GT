import React from 'react';
import { Flame, DoorOpen, Wind } from 'lucide-react';
import TableCard from './TableCard';

export default function SeatMapFloorView({
  seatMapFloor,
  floorSlideDirection,
  currentFloorTables,
  tempTable,
  partySize,
  setTempTable,
  handleSwitchFloor
}) {
  return (
    <div className="p-2 sm:p-5 overflow-y-auto flex-1 space-y-2.5 sm:space-y-3 bg-[#16100c]/60">
      <div className="p-2 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#1d1612] border border-amber-900/30 sm:border-amber-900/40 relative overflow-hidden shadow-inner">
        <div
          key={seatMapFloor}
          className={floorSlideDirection === 'up' ? 'animate-floor-up' : 'animate-floor-down'}
        >
          {seatMapFloor === '1' ? (
            <div className="space-y-3">
              {/* Spatial Navigation Ribbon */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-950/40 via-amber-950/25 to-stone-900 border border-red-500/30 text-[11px]">
                <span className="flex items-center gap-1.5 text-amber-200 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  <span>Gian Nồi Phở 90°C</span>
                </span>
                <span className="text-stone-400 text-[10px] flex items-center gap-1">
                  <DoorOpen className="w-3 h-3 text-amber-400" />
                  <span>Cửa chính Hàng Bạc</span>
                </span>
              </div>

              {/* Floor 1 Tables */}
              <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2 sm:gap-3.5 pt-0.5">
                {currentFloorTables.map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    isSelected={tempTable?.id === table.id}
                    isAvailable={table.status === 'available'}
                    isHolding={table.status === 'holding'}
                    isUnderCapacity={table.capacity < partySize}
                    partySize={partySize}
                    onSelect={setTempTable}
                  />
                ))}
              </div>

              {/* Bottom Landmark: Wooden Stairs to Floor 2 */}
              <div className="pt-2 border-t border-dashed border-white/10 flex items-center justify-between text-[11px] text-stone-400">
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-400">🪜</span>
                  <span>Cầu thang gỗ lim lên Tầng 2</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleSwitchFloor('2')}
                  className="text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
                >
                  Lên Tầng 2 (Ban công ngắm phố) →
                </button>
              </div>
            </div>
          ) : (
            /* Floor 2: Balcony Street View */
            <div className="space-y-3">
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-sky-950/25 to-stone-900 border border-emerald-500/30 text-[11px]">
                <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <Wind className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ban Công View Phố Cổ</span>
                </span>
                <span className="text-stone-400 text-[10px]">Gió mát ngã tư Tạ Hiện</span>
              </div>

              {/* Floor 2 Tables */}
              <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2 sm:gap-3.5 pt-0.5">
                {currentFloorTables.map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    isSelected={tempTable?.id === table.id}
                    isAvailable={table.status === 'available'}
                    isHolding={table.status === 'holding'}
                    isUnderCapacity={table.capacity < partySize}
                    partySize={partySize}
                    onSelect={setTempTable}
                  />
                ))}
              </div>

              {/* Bottom Landmark: Heritage Paintings Corner */}
              <div className="pt-2 border-t border-dashed border-white/10 flex items-center justify-between text-[11px] text-stone-400">
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-400">🖼️</span>
                  <span>Gian tranh phố cổ Hà Nội 1986</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleSwitchFloor('1')}
                  className="text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
                >
                  ← Xuống Tầng 1 (Khu bếp phở)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Armchair, Sparkles } from 'lucide-react';

export default function SeatMapInspectorDock({
  tempTable,
  partySize,
  onConfirmTable,
  setTempTable,
  triggerClose
}) {
  return (
    <div
      className="p-3 sm:p-4 border-t border-amber-500/30 bg-stone-950/95 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 shadow-2xl relative z-10"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {tempTable ? (
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
            <Armchair className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-left">
            <div className="text-sm font-serif font-bold text-white flex items-center gap-2">
              <span>{tempTable.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-bold border ${
                tempTable.capacity < partySize
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {tempTable.capacity} khách
              </span>
            </div>
            {tempTable.capacity < partySize ? (
              <div className="text-[11px] text-rose-300 font-bold">
                ⚠️ Bàn chỉ có {tempTable.capacity} chỗ (đoàn bạn có {partySize} khách). Vui lòng chọn bàn lớn hơn!
              </div>
            ) : (
              <>
                <div className="text-[11px] text-amber-300/90 font-medium">{tempTable.zoneName}</div>
                <div className="text-[10px] text-stone-400 line-clamp-1">{tempTable.desc}</div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 text-xs text-stone-400 w-full sm:w-auto text-left">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Chạm vào bàn bất kỳ trên sơ đồ để xem view & giữ chỗ trước.</span>
        </div>
      )}

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
        <button
          type="button"
          onClick={() => {
            onConfirmTable(null);
            setTempTable(null);
            triggerClose();
          }}
          className="flex-1 sm:flex-initial py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 font-semibold text-xs transition-colors cursor-pointer text-center"
        >
          Để Quán Xếp
        </button>
        <button
          type="button"
          disabled={Boolean(tempTable && tempTable.capacity < partySize)}
          onClick={() => {
            if (tempTable && tempTable.capacity >= partySize) {
              onConfirmTable(tempTable);
              triggerClose();
            } else if (!tempTable) {
              triggerClose();
            }
          }}
          className={`flex-2 sm:flex-initial py-2.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-1.5 ${
            tempTable && tempTable.capacity < partySize
              ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
              : 'bg-gradient-to-r from-brand-red to-amber-600 hover:from-brand-redhover cursor-pointer active:scale-98'
          }`}
        >
          <span>
            {tempTable
              ? tempTable.capacity < partySize
                ? 'Bàn Không Đủ Chỗ'
                : `Xác Nhận Giữ ${tempTable.name} →`
              : 'Đóng Sơ Đồ'}
          </span>
        </button>
      </div>
    </div>
  );
}

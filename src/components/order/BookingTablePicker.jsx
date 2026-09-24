import { useState, useCallback, memo } from 'react';
import { Armchair, Sparkles, AlertCircle, Shuffle, MapPin, Compass } from 'lucide-react';

function BookingTablePicker({
  selectedTable,
  guestCount,
  tableLockWarning,
  onSelectRandomTable,
  onOpenSeatMap
}) {
  const [isShuffling, setIsShuffling] = useState(false);

  const onQuickRandomTable = useCallback(async (e) => {
    if (e) e.stopPropagation();
    if (isShuffling) return;
    setIsShuffling(true);
    if (onSelectRandomTable) {
      await onSelectRandomTable();
    }
    setTimeout(() => setIsShuffling(false), 350);
  }, [onSelectRandomTable, isShuffling]);

  return (
    <div className="rounded-2xl border border-amber-600/35 bg-gradient-to-br from-amber-950/40 via-stone-900/60 to-black/50 p-3 sm:p-3.5 space-y-2.5 shadow-md">
      {/* Header Bar: Nhãn + Trạng thái */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-serif font-bold text-amber-200">
          <Armchair className="w-3.5 h-3.5 text-amber-400" />
          <span>Vị Trí Bàn Ăn Tại Quán</span>
          <span className="text-red-400" title="Bắt buộc có vị trí bàn">*</span>
        </div>
        {selectedTable ? (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Đã xếp vị trí
          </span>
        ) : (
          <span className="text-[10px] text-amber-400/90 italic font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Bắt buộc có bàn</span>
          </span>
        )}
      </div>

      {/* Cảnh báo Bàn bị khóa trong thời gian thực */}
      {tableLockWarning && (
        <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/60 text-red-200 text-xs flex items-start gap-2 shadow-inner animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-snug">
            <span className="font-bold text-amber-300">Thông báo điều phối bàn: </span>
            <span className="text-[11px] text-red-100">{tableLockWarning}</span>
          </div>
        </div>
      )}

      {/* Body Box: Đã chọn bàn vs Chưa chọn bàn */}
      {selectedTable ? (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9b2a1f] to-[#731911] text-amber-200 border border-amber-400/40 flex items-center justify-center font-serif font-bold text-xs shrink-0 shadow-xs">
              {selectedTable.floor ? `T${selectedTable.floor}` : '🍜'}
            </div>
            <div className="min-w-0 text-left">
              <div className="text-xs font-bold text-amber-100 truncate flex items-center gap-1.5">
                <span>{selectedTable.name}</span>
                {selectedTable.isVip && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-400 text-stone-950 text-[9px] font-bold uppercase">VIP</span>
                )}
              </div>
              <div className="text-[10px] text-stone-300 truncate">
                {selectedTable.zoneName || 'Khu gian chính'} • Tối đa {selectedTable.capacity || 4} khách
              </div>
            </div>
          </div>

          {/* 2 Nút thao tác nhanh: Đổi ngẫu nhiên khác & Xem sơ đồ */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onQuickRandomTable}
              disabled={isShuffling}
              className={`px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 ${
                isShuffling ? 'opacity-60 cursor-wait' : ''
              }`}
              title="Đổi sang bàn ngẫu nhiên khác"
            >
              <Shuffle className={`w-3 h-3 text-amber-300 ${isShuffling ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline sm:inline">Đổi ngẫu nhiên</span>
            </button>
            <button
              type="button"
              onClick={onOpenSeatMap}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-stone-200 text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Mở sơ đồ bàn 3D để tự chọn"
            >
              <MapPin className="w-3 h-3 text-stone-300" />
              <span>Sơ đồ</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Nút 1: XẾP BÀN NGẪU NHIÊN (NHANH TỨC THÌ) */}
            <button
              type="button"
              onClick={onQuickRandomTable}
              disabled={isShuffling}
              className={`w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-serif font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 group ring-1 ring-amber-300/60 ${
                isShuffling ? 'opacity-60 cursor-wait' : ''
              }`}
            >
              <Shuffle className={`w-3.5 h-3.5 transition-transform duration-300 ${isShuffling ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span>Chọn Bàn Ngẫu Nhiên</span>
              <span className="text-[9.5px] bg-black/25 text-stone-950 px-1.5 py-0.2 rounded font-mono font-black uppercase tracking-tight">Nhanh</span>
            </button>

            {/* Nút 2: TỰ CHỌN TRÊN SƠ ĐỒ 3D */}
            <button
              type="button"
              onClick={onOpenSeatMap}
              className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-amber-500/40 text-amber-200 font-serif font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 group"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Xem Sơ Đồ Chọn Chỗ</span>
            </button>
          </div>
          <p className="text-[10.5px] text-stone-400 text-center italic">
            💡 Bấm <strong>"Chọn Bàn Ngẫu Nhiên"</strong> để hệ thống tự động bốc bàn trống đẹp nhất cho {guestCount} khách mà không cần mở sơ đồ.
          </p>
        </div>
      )}
    </div>
  );
}

export default memo(BookingTablePicker);

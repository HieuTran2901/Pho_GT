import React from 'react';
import { Crown, Armchair, Check } from 'lucide-react';

const TableCard = React.memo(function TableCard({
  table,
  isSelected,
  isAvailable,
  isHolding,
  isUnderCapacity,
  partySize,
  onSelect
}) {
  const shortZone = (table.zoneName || '')
    .replace('Cạnh Bếp Nước Dùng 90°C', 'Cạnh Bếp 90°C')
    .replace('Cửa Vào Tầng 1', 'Lối Cửa Vào')
    .replace('Gian Cổ Kính Tầng 1', 'Gian Cổ Kính')
    .replace('Cạnh Cửa Sổ Phố Cổ', 'Cửa Sổ Phố')
    .replace('Khu Vực Trung Tâm', 'Khu Trung Tâm')
    .replace('Phòng Riêng Tri Kỷ 1986', 'Phòng VIP 1986')
    .replace('Ban Công Tầng 2', 'Ban Công')
    .replace('Ban Công View Phố Cổ Đi Bộ', 'Ban Công Phố')
    .replace('Ban Công VIP Phố Cổ', 'Ban Công VIP')
    .replace('Gian Tranh Cổ Tầng 2', 'Gian Tranh Cổ')
    .replace('Gian Tranh Phố Hà Nội', 'Gian Tranh Cổ')
    .replace('Phòng VIP Trúc Lâm', 'VIP Trúc Lâm')
    .replace('Phòng VIP Hoàng Gia Tầng 2', 'VIP Hoàng Gia')
    .replace('Gian Thư Họa Hà Thành', 'Gian Thư Họa')
    .replace('Khu Thưởng Trà & Đọc Sách', 'Khu Thưởng Trà')
    .replace('Ban Công Góc Phố', 'Ban Công Góc');

  return (
    <>
      {/* 1. MOBILE LAYOUT (< sm): Full-Width Horizontal Heritage Room Card */}
      <div
        onClick={() => isAvailable && onSelect(table)}
        className={`sm:hidden p-2.5 rounded-2xl border transition-all relative flex items-center justify-between gap-2.5 select-none cursor-pointer active:scale-[0.99] ${
          isSelected
            ? 'bg-gradient-to-r from-amber-500/20 via-amber-950/40 to-stone-900 border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/10'
            : isAvailable
            ? table.isVip
              ? 'bg-gradient-to-r from-purple-950/30 via-stone-900 to-stone-900 border-purple-500/30 active:border-purple-400'
              : 'bg-white/5 border-white/10 active:border-amber-400/50 active:bg-white/10'
            : isHolding
            ? 'bg-amber-500/5 border-amber-500/20 opacity-55 cursor-not-allowed'
            : 'bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed'
        }`}
      >
        {/* Left: 2D Spatial Geometry & Capacity Badge Box */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border shadow-inner transition-colors ${
              isSelected
                ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                : isAvailable
                ? table.isVip
                  ? 'bg-purple-950/50 border-purple-400/50 text-purple-200'
                  : 'bg-white/10 border-white/15 text-stone-200'
                : 'bg-stone-800/80 border-stone-700 text-stone-500'
            }`}
          >
            {table.isVip ? (
              <Crown className="w-4 h-4 text-amber-400 mb-0.5" />
            ) : (
              <Armchair className="w-4 h-4 text-amber-300/80 mb-0.5" />
            )}
            <span className="text-[9px] font-bold tracking-tight">
              {table.capacity} chỗ
            </span>
          </div>

          {/* Center: Table Name, Zone Badge & Full Description */}
          <div className="min-w-0 flex-1 text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`font-serif font-bold text-sm flex items-center gap-1 ${
                  table.isVip ? 'text-purple-200' : isSelected ? 'text-amber-200' : 'text-white'
                }`}
              >
                {table.name}
              </span>

              {/* Zone Tag */}
              <span
                className={`text-[10px] font-medium px-1.5 py-0.2 rounded-md truncate max-w-[150px] ${
                  isUnderCapacity
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
                    : isSelected
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/30'
                    : table.isVip
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-white/10 text-stone-300 border border-white/5'
                }`}
              >
                {isUnderCapacity ? `Thiếu chỗ (<${partySize})` : shortZone}
              </span>
            </div>

            <p className="text-[11px] text-stone-400 truncate mt-0.5 leading-tight">
              {table.desc}
            </p>
          </div>
        </div>

        {/* Right: Radio Selection Button / Status Indicator */}
        <div className="shrink-0 flex items-center justify-center pl-1">
          {isSelected ? (
            <div className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-md shadow-amber-500/40 ring-2 ring-amber-400/50">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          ) : isAvailable ? (
            <div className="w-5 h-5 rounded-full border-2 border-white/25 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20" />
            </div>
          ) : isHolding ? (
            <span className="text-[9px] text-amber-400/90 font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 whitespace-nowrap">
              Giữ chỗ
            </span>
          ) : table.status === 'maintenance' ? (
            <span className="text-[9px] text-stone-400 font-semibold px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 whitespace-nowrap">
              Tạm khóa
            </span>
          ) : (
            <span className="text-[9px] text-stone-500 font-semibold px-1.5 py-0.5 rounded bg-white/5 whitespace-nowrap">
              Đã kín
            </span>
          )}
        </div>
      </div>

      {/* 2. DESKTOP LAYOUT (sm:): Modern Blueprint Grid Tile with Spatial 2D Geometry */}
      <div
        onClick={() => isAvailable && onSelect(table)}
        className={`hidden sm:flex sm:flex-col sm:justify-between p-3.5 rounded-2xl border text-center transition-all relative select-none cursor-pointer group ${
          isSelected
            ? 'bg-gradient-to-b from-amber-500/25 via-amber-950/40 to-stone-950 border-amber-400 ring-2 ring-amber-400/60 shadow-xl shadow-amber-500/20 scale-[1.02]'
            : isAvailable
            ? table.isVip
              ? 'bg-gradient-to-b from-purple-950/20 to-stone-900 border-purple-500/30 hover:border-purple-400/60 hover:bg-purple-950/30'
              : 'bg-white/5 border-white/10 hover:border-emerald-400/60 hover:bg-emerald-950/20'
            : isHolding
            ? 'bg-amber-500/5 border-amber-500/20 opacity-55 cursor-not-allowed'
            : 'bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed'
        }`}
      >
        {/* Top Row: Table Name + LED Status Dot */}
        <div className="flex items-center justify-between mb-1">
          <span className={`font-serif font-bold text-xs sm:text-sm flex items-center gap-1 ${
            table.isVip ? 'text-purple-200' : isSelected ? 'text-amber-200' : 'text-white'
          }`}>
            {table.isVip && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
            <span>{table.name}</span>
          </span>

          <div className="flex items-center gap-1 shrink-0">
            {isSelected ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Chọn</span>
              </span>
            ) : isAvailable ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/30" title="Còn trống" />
            ) : isHolding ? (
              <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-500/30" title="Đang giữ" />
            ) : table.status === 'maintenance' ? (
              <span className="text-[9px] text-stone-400 font-semibold px-1 py-0.2 rounded bg-stone-800 border border-stone-700" title="Tạm khóa">Khóa</span>
            ) : (
              <span className="text-[9px] text-stone-500 font-semibold" title="Đã có khách">Kín</span>
            )}
          </div>
        </div>

        {/* Center 2D Geometry Tailored to Capacity */}
        <div className="h-14 sm:h-15 flex items-center justify-center relative my-1">
          {table.capacity === 2 ? (
            /* Circular 2-Seater Table */
            <div className="relative inline-flex items-center justify-center">
              <div
                className={`w-4 h-1.5 rounded-full absolute -top-1.5 left-1/2 -translate-x-1/2 transition-colors ${
                  isSelected
                    ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                    : isAvailable
                    ? 'bg-emerald-500/60'
                    : 'bg-stone-700'
                }`}
              />
              <div
                className={`w-11 h-11 rounded-full border flex items-center justify-center text-[10px] font-bold shadow-inner transition-colors ${
                  isSelected
                    ? 'bg-amber-500/30 border-amber-400 text-amber-200 ring-1 ring-amber-400/50'
                    : isAvailable
                    ? 'bg-white/10 border-white/20 text-stone-300 group-hover:border-emerald-400'
                    : 'bg-stone-800 border-stone-700 text-stone-500'
                }`}
              >
                2 chỗ
              </div>
              <div
                className={`w-4 h-1.5 rounded-full absolute -bottom-1.5 left-1/2 -translate-x-1/2 transition-colors ${
                  isSelected
                    ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                    : isAvailable
                    ? 'bg-emerald-500/60'
                    : 'bg-stone-700'
                }`}
              />
            </div>
          ) : table.capacity === 4 ? (
            /* Rounded Square 4-Seater Table */
            <div className="relative inline-flex items-center justify-center">
              <div
                className={`w-4 h-1.5 rounded-full absolute -top-1.5 left-1/2 -translate-x-1/2 transition-colors ${
                  isSelected
                    ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                    : isAvailable
                    ? 'bg-emerald-500/60'
                    : 'bg-stone-700'
                }`}
              />
              <div
                className={`w-4 h-1.5 rounded-full absolute -bottom-1.5 left-1/2 -translate-x-1/2 transition-colors ${
                  isSelected
                    ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                    : isAvailable
                    ? 'bg-emerald-500/60'
                    : 'bg-stone-700'
                }`}
              />
              <div
                className={`w-1.5 h-4 rounded-full absolute -left-1.5 top-1/2 -translate-y-1/2 transition-colors ${
                  isSelected
                    ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                    : isAvailable
                    ? 'bg-emerald-500/60'
                    : 'bg-stone-700'
                }`}
              />
              <div
                className={`w-1.5 h-4 rounded-full absolute -right-1.5 top-1/2 -translate-y-1/2 transition-colors ${
                  isSelected
                    ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                    : isAvailable
                    ? 'bg-emerald-500/60'
                    : 'bg-stone-700'
                }`}
              />
              <div
                className={`w-13 h-11 rounded-xl border flex items-center justify-center text-[10px] font-bold shadow-inner transition-colors ${
                  isSelected
                    ? 'bg-amber-500/30 border-amber-400 text-amber-200 ring-1 ring-amber-400/50'
                    : isAvailable
                    ? 'bg-white/10 border-white/20 text-stone-300 group-hover:border-emerald-400'
                    : 'bg-stone-800 border-stone-700 text-stone-500'
                }`}
              >
                4 chỗ
              </div>
            </div>
          ) : (
            /* VIP Grand Table (6 - 8 seats) */
            <div className="relative inline-flex items-center justify-center">
              <div
                className={`w-3.5 h-1.5 rounded-full absolute -top-1.5 left-4 transition-colors ${
                  isSelected
                    ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                    : isAvailable
                    ? 'bg-purple-400/80'
                    : 'bg-stone-700'
                }`}
              />
              <div
                className={`w-3.5 h-1.5 rounded-full absolute -top-1.5 right-4 transition-colors ${
                  isSelected
                    ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                    : isAvailable
                    ? 'bg-purple-400/80'
                    : 'bg-stone-700'
                }`}
              />
              <div
                className={`w-3.5 h-1.5 rounded-full absolute -bottom-1.5 left-4 transition-colors ${
                  isSelected
                    ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                    : isAvailable
                    ? 'bg-purple-400/80'
                    : 'bg-stone-700'
                }`}
              />
              <div
                className={`w-3.5 h-1.5 rounded-full absolute -bottom-1.5 right-4 transition-colors ${
                  isSelected
                    ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                    : isAvailable
                    ? 'bg-purple-400/80'
                    : 'bg-stone-700'
                }`}
              />
              <div
                className={`w-1.5 h-3.5 rounded-full absolute -left-1.5 top-1/2 -translate-y-1/2 transition-colors ${
                  isSelected
                    ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                    : isAvailable
                    ? 'bg-purple-400/80'
                    : 'bg-stone-700'
                }`}
              />
              <div
                className={`w-1.5 h-3.5 rounded-full absolute -right-1.5 top-1/2 -translate-y-1/2 transition-colors ${
                  isSelected
                    ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                    : isAvailable
                    ? 'bg-purple-400/80'
                    : 'bg-stone-700'
                }`}
              />
              <div
                className={`w-20 sm:w-22 h-10 rounded-2xl border flex items-center justify-center text-[10px] font-bold shadow-md transition-colors ${
                  isSelected
                    ? 'bg-amber-500/30 border-amber-400 text-amber-200 ring-1 ring-amber-400/50'
                    : isAvailable
                    ? 'bg-purple-950/40 border-purple-400/50 text-purple-200 group-hover:border-purple-300'
                    : 'bg-stone-800 border-stone-700 text-stone-500'
                }`}
              >
                <Crown className="w-3 h-3 mr-1 text-amber-400" />
                <span>{table.capacity} chỗ</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Compact Zone Tag */}
        <div className="mt-1 text-center">
          <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-md truncate max-w-full ${
            isUnderCapacity
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : isSelected
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : table.isVip
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'bg-white/5 text-stone-400'
          }`}>
            {isUnderCapacity ? `Thiếu chỗ (<${partySize})` : shortZone}
          </span>
        </div>
      </div>
    </>
  );
});

export default TableCard;

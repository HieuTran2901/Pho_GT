import React from 'react';
import { Crown, Flame, Users, Sparkles, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { DIORAMA_STATUS_CONFIG } from './dioramaConstants';

/**
 * [URBAN] Buồng bàn 2.5D Isometric Diorama Pod
 * Phỏng dựng sa bàn thu nhỏ: bàn gỗ lim, ghế tựa, chậu cây bonsai, hiệu ứng đèn vàng ấm cúng.
 */
function DioramaTablePod({
  table,
  onSelectTable,
  isSelected = false
}) {
  if (!table) return null;

  const isOccupied = table.status === 'occupied';
  const isReserved = table.status === 'reserved';
  const isMaintenance = table.status === 'maintenance';
  const isVip = !!table.isVip;
  const statusCfg = DIORAMA_STATUS_CONFIG[table.status] || DIORAMA_STATUS_CONFIG.available;

  // Bàn tròn cho 2 chỗ hoặc VIP, bàn chữ nhật cho 4 chỗ trở lên
  const isRoundTable = table.capacity <= 2 || isVip;

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelectTable(table)}
      className={`relative group cursor-pointer select-none rounded-2xl p-2 sm:p-2.5 transition-all duration-300 flex flex-col justify-between aspect-[1.12/1] min-h-[105px] sm:min-h-[120px] overflow-hidden ${
        isSelected
          ? 'bg-gradient-to-b from-[#1f1914] to-[#140f0b] border-2 border-amber-400 shadow-lg ring-2 ring-amber-400/50'
          : isVip && !isOccupied
          ? 'bg-gradient-to-b from-[#24180e] to-[#120b07] border border-amber-500/60 shadow-[0_4px_14px_rgba(212,175,55,0.25)] hover:border-amber-400'
          : statusCfg.podClass
      }`}
    >
      {/* Hiệu ứng chùm đèn ấm chiếu từ trần xuống */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          isOccupied
            ? 'bg-radial from-amber-400/20 via-amber-600/10 to-transparent opacity-100'
            : isReserved
            ? 'bg-radial from-amber-500/15 via-transparent to-transparent opacity-80'
            : isVip
            ? 'bg-radial from-amber-400/15 via-transparent to-transparent opacity-80'
            : isMaintenance
            ? 'bg-black/30 opacity-60'
            : 'bg-radial from-white/5 to-transparent opacity-40 group-hover:opacity-80'
        }`}
      />

      {/* Cây cảnh Bonsai Mini trang trí 2 góc vách ngăn */}
      <div className="absolute top-1 left-1.5 w-3 h-3 rounded-full bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center pointer-events-none shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600/80 blur-[0.5px]" />
      </div>
      <div className="absolute top-1 right-1.5 w-3 h-3 rounded-full bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center pointer-events-none shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600/80 blur-[0.5px]" />
      </div>

      {/* Huy hiệu VIP và Trạng thái góc trên phải */}
      <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1">
        {isVip && (
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/30 border border-amber-400/60 shadow-xs backdrop-blur-xs">
            <Crown className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
            <span className="text-[8px] font-bold text-amber-200 tracking-wider font-mono">VIP</span>
          </div>
        )}
        {statusCfg.tagText && (
          <span className="px-1.5 py-0.5 rounded-full text-[8px] font-mono font-bold tracking-tight bg-black/60 border border-white/10 text-stone-300 uppercase shadow-xs">
            {statusCfg.tagText}
          </span>
        )}
      </div>

      {/* Sa bàn Bàn Ăn Gỗ Lim 2.5D (Miniature Wooden Table & Chairs) */}
      <div className="relative flex-1 flex items-center justify-center my-0.5">
        {/* Ghế trên & dưới */}
        <div className="absolute top-0 w-5 sm:w-6 h-1.5 rounded-full bg-[#3d2617] border border-[#5a3922] shadow-xs" />
        <div className="absolute bottom-0 w-5 sm:w-6 h-1.5 rounded-full bg-[#3d2617] border border-[#5a3922] shadow-xs" />

        {/* Ghế 2 bên (giữ trong phạm vi lề trong của buồng bàn) */}
        {table.capacity >= 4 && (
          <>
            <div className="absolute left-0.5 w-1.5 h-4 sm:h-5 rounded-full bg-[#3d2617] border border-[#5a3922] shadow-xs" />
            <div className="absolute right-0.5 w-1.5 h-4 sm:h-5 rounded-full bg-[#3d2617] border border-[#5a3922] shadow-xs" />
          </>
        )}

        {/* Mặt bàn gỗ lim 2.5D */}
        <div
          className={`relative z-10 flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105 ${
            isRoundTable
              ? 'w-9 h-9 sm:w-11 sm:h-11 rounded-full'
              : 'w-11 sm:w-13 h-7 sm:h-8 rounded-lg'
          } ${statusCfg.tableSurfaceClass || ''}`}
        >
          {/* Bát phở / Tách trà / Ổ khóa trên mặt bàn */}
          {isOccupied ? (
            <div className="relative flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-200/90 border border-amber-400 flex items-center justify-center shadow-xs">
                <Flame className="w-2.5 h-2.5 text-[#8a1e14] fill-current animate-pulse" />
              </div>
              <span className="absolute -top-1.5 w-1.5 h-1.5 rounded-full bg-white/40 blur-[1px] animate-ping" />
            </div>
          ) : isReserved ? (
            <div className="w-3.5 h-3.5 rounded-full bg-amber-500/40 border border-amber-400/60 flex items-center justify-center shadow-xs">
              <Sparkles className="w-2 h-2 text-amber-300" />
            </div>
          ) : isMaintenance ? (
            <div className="w-3.5 h-3.5 rounded-full bg-stone-800/80 border border-stone-600/60 flex items-center justify-center shadow-xs">
              <Lock className="w-2 h-2 text-stone-300" />
            </div>
          ) : isVip ? (
            <div className="w-3.5 h-3.5 rounded-full bg-amber-500/30 border border-amber-400/50 flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-amber-300" />
            </div>
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-amber-100/30 border border-amber-300/30" />
          )}
        </div>
      </div>

      {/* Capsule Nhãn Tên Bàn & Sức Chứa (Bottom Name Pill) */}
      <div className="relative z-10 w-full mt-0.5">
        <div
          className={`px-2 py-1 rounded-xl flex items-center justify-between gap-1 border shadow-xs transition-colors ${
            statusCfg.pillClass || 'bg-stone-950/80 border-white/15 text-stone-200'
          }`}
        >
          {/* Chấm tròn trạng thái + Tên bàn đầy đủ */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${statusCfg.dotClass} ${
                isOccupied ? 'animate-pulse' : ''
              }`}
              style={{ backgroundColor: statusCfg.dotColor }}
            />
            <span className="text-[11px] sm:text-xs font-serif font-bold text-white truncate leading-none">
              {table.name}
            </span>
          </div>

          {/* Sức chứa người */}
          <div className="flex items-center text-[10px] text-stone-400 font-sans font-medium shrink-0">
            <Users className="w-2.5 h-2.5 text-stone-400 mr-0.5" />
            <span>{table.capacity}</span>
          </div>
        </div>

        {/* Thông tin đơn hàng tóm tắt khi bàn Đang Dùng */}
        {isOccupied && table.activeGuestName && (
          <div className="mt-0.5 px-1 flex items-center justify-between text-[9px] font-mono text-amber-300/90 truncate">
            <span className="truncate max-w-[65%]">{table.activeGuestName}</span>
            {table.activeAmount ? (
              <span className="font-bold text-amber-400 shrink-0">
                {Math.round(table.activeAmount / 1000)}k
              </span>
            ) : null}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default React.memo(DioramaTablePod);

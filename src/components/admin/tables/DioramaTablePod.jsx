import React from 'react';
import { Crown, Flame, Users, Sparkles } from 'lucide-react';
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
  const isVip = !!table.isVip;
  const statusCfg = DIORAMA_STATUS_CONFIG[table.status] || DIORAMA_STATUS_CONFIG.available;

  // Bàn tròn cho 2 chỗ hoặc VIP, bàn chữ nhật cho 4 chỗ trở lên
  const isRoundTable = table.capacity <= 2 || isVip;

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelectTable(table)}
      className={`relative group cursor-pointer select-none rounded-2xl p-2.5 transition-all duration-300 flex flex-col justify-between aspect-[1.15/1] min-h-[110px] sm:min-h-[125px] overflow-hidden ${
        isOccupied
          ? 'bg-gradient-to-b from-[#2d1809] via-[#1a0f05] to-[#120a04] border-2 border-amber-400/90 shadow-[0_0_28px_rgba(245,158,11,0.6)] ring-1 ring-amber-300/70'
          : isVip
          ? 'bg-gradient-to-b from-[#24180e] to-[#120b07] border border-amber-500/60 shadow-[0_6px_18px_rgba(212,175,55,0.2)] hover:border-amber-400'
          : isSelected
          ? 'bg-gradient-to-b from-[#1f1914] to-[#140f0b] border-2 border-amber-400 shadow-md'
          : 'bg-gradient-to-b from-[#1e1610] via-[#140e09] to-[#0d0805] border border-[#3d2719] shadow-[0_6px_16px_rgba(0,0,0,0.6)] hover:border-emerald-500/60 hover:shadow-[0_8px_22px_rgba(0,0,0,0.8)] hover:bg-[#241a13]'
      }`}
    >
      {/* Hiệu ứng chùm đèn ấm chiếu từ trần xuống (Ambient Ceiling Spotlight) */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          isOccupied
            ? 'bg-radial from-amber-400/25 via-amber-600/10 to-transparent opacity-100'
            : isVip
            ? 'bg-radial from-amber-400/15 via-transparent to-transparent opacity-80'
            : 'bg-radial from-white/5 to-transparent opacity-40 group-hover:opacity-80'
        }`}
      />

      {/* Cây cảnh Bonsai Mini trang trí 2 góc vách ngăn (Miniature Foliage) */}
      <div className="absolute top-1 left-1.5 w-3.5 h-3.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center pointer-events-none shadow-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-600/80 blur-[0.5px]" />
      </div>
      <div className="absolute top-1 right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center pointer-events-none shadow-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-600/80 blur-[0.5px]" />
      </div>

      {/* Huy hiệu VIP góc trên phải nếu là bàn VIP */}
      {isVip && (
        <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/30 border border-amber-400/60 shadow-xs backdrop-blur-xs">
          <Crown className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
          <span className="text-[8px] font-bold text-amber-200 tracking-wider font-mono">VIP</span>
        </div>
      )}

      {/* Sa bàn Bàn Ăn Gỗ Lim 2.5D (Miniature Wooden Table & Chairs) */}
      <div className="relative flex-1 flex items-center justify-center my-1">
        {/* Ghế trên & dưới */}
        <div className="absolute -top-1 w-5 sm:w-6 h-1.5 rounded-full bg-[#3d2617] border border-[#5a3922] shadow-xs" />
        <div className="absolute -bottom-1 w-5 sm:w-6 h-1.5 rounded-full bg-[#3d2617] border border-[#5a3922] shadow-xs" />

        {/* Ghế 2 bên (nếu bàn từ 4 chỗ trở lên) */}
        {table.capacity >= 4 && (
          <>
            <div className="absolute -left-1 w-1.5 h-5 sm:h-6 rounded-full bg-[#3d2617] border border-[#5a3922] shadow-xs" />
            <div className="absolute -right-1 w-1.5 h-5 sm:h-6 rounded-full bg-[#3d2617] border border-[#5a3922] shadow-xs" />
          </>
        )}

        {/* Mặt bàn gỗ lim 2.5D */}
        <div
          className={`relative z-10 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105 ${
            isRoundTable
              ? 'w-10 h-10 sm:w-12 sm:h-12 rounded-full'
              : 'w-12 sm:w-14 h-8 sm:h-9 rounded-lg'
          } ${
            isOccupied
              ? 'bg-gradient-to-br from-[#8a4216] via-[#6d300d] to-[#451e08] border-2 border-amber-300/80 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
              : isVip
              ? 'bg-gradient-to-br from-[#663e18] via-[#4d2c0e] to-[#361e08] border border-amber-400/50'
              : 'bg-gradient-to-br from-[#4d321d] via-[#3d2514] to-[#2b190c] border border-[#7a4e2b]/60'
          }`}
        >
          {/* Bát phở / Tách trà bốc khói trên mặt bàn */}
          {isOccupied ? (
            <div className="relative flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-amber-200/90 border border-amber-400 flex items-center justify-center shadow-xs">
                <Flame className="w-2.5 h-2.5 text-[#8a1e14] fill-current animate-pulse" />
              </div>
              <span className="absolute -top-2 w-1.5 h-2 rounded-full bg-white/40 blur-[1px] animate-ping" />
            </div>
          ) : isVip ? (
            <div className="w-3.5 h-3.5 rounded-full bg-amber-500/40 border border-amber-400/60 flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-amber-300" />
            </div>
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-amber-100/30 border border-amber-300/30" />
          )}
        </div>
      </div>

      {/* Capsule Nhãn Tên Bàn & Trạng Thái (Bottom Name Pill) */}
      <div className="relative z-10 w-full mt-1">
        <div
          className={`px-2 py-1 rounded-xl flex items-center justify-between gap-1 border shadow-xs transition-colors ${
            isOccupied
              ? 'bg-gradient-to-r from-red-950/90 to-[#2a0e08]/90 border-red-500/50 text-amber-200'
              : isVip
              ? 'bg-stone-900/90 border-amber-500/40 text-amber-200'
              : 'bg-stone-950/80 border-white/15 text-stone-200 group-hover:border-white/30'
          }`}
        >
          {/* Chấm tròn trạng thái */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${statusCfg.dotClass} ${
                isOccupied ? 'animate-pulse' : ''
              }`}
              style={{ backgroundColor: statusCfg.dotColor }}
            />
            <span className="text-[11px] font-serif font-bold truncate leading-none">
              {table.name}
            </span>
          </div>

          {/* Sức chứa người */}
          <div className="flex items-center gap-0.5 text-[9px] text-stone-400 font-sans font-medium shrink-0">
            <Users className="w-2.5 h-2.5 text-stone-400" />
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

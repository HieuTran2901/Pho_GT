import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import SteamEffect from '../SteamEffect';
import { PhoBowlMiniIcon } from './ChatMessageItem';

function ChatLauncher({ onClick, isOpen }) {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  if (isOpen) return null;

  return (
    <div className="flex flex-col items-end gap-2.5 select-none">
      {/* Tooltip Chào Mời Tao Nhã Phong Vị Kinh Kỳ */}
      {showTooltip && (
        <div className="relative px-4 py-2.5 rounded-2xl bg-gradient-to-br from-[#122b21] via-[#0d2119] to-[#081711] border border-[#d4af37]/70 shadow-[0_10px_25px_rgba(0,0,0,0.6)] text-stone-100 text-xs font-serif flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-[240px]">
          <div className="flex-1 leading-snug">
            <span className="font-bold text-[#fae29c]">Tiểu Nhị 1986:</span> Bác muốn dùng phở gì hôm nay ạ?
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-emerald-300/60 hover:text-amber-200 p-0.5 cursor-pointer"
            title="Đóng lời chào"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {/* Mũi tên trỏ xuống launcher */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[#081711] border-r border-b border-[#d4af37]/70 rotate-45" />
        </div>
      )}

      {/* Floating Action Button: Huân chương Ngọc Bích viền vàng & Bát phở tỏa khói */}
      <button
        id="heritage-chat-launcher"
        onClick={() => {
          setShowTooltip(false);
          onClick();
        }}
        className="group relative w-14 h-14 rounded-full bg-gradient-to-br from-[#133024] via-[#0b2118] to-[#05110c] border-2 border-[#d4af37] p-1 shadow-[0_8px_25px_rgba(0,0,0,0.7),0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_12px_32px_rgba(212,175,55,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
        aria-label="Trò chuyện với Tiểu Nhị 1986"
      >
        {/* Steam Effect rising up from the bowl */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 pointer-events-none opacity-85">
          <SteamEffect />
        </div>

        {/* Inner Emerald Center with Steaming Pho Bowl Icon */}
        <div className="w-full h-full rounded-full bg-[#0d261c] border border-[#d4af37]/50 flex items-center justify-center group-hover:bg-[#123627] transition-colors">
          <PhoBowlMiniIcon className="w-6 h-6 text-[#fae29c] group-hover:scale-110 transition-transform drop-shadow" />
        </div>

        {/* 1986 Imperial Red Seal Badge */}
        <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-red-800 border border-red-300 text-[9px] font-mono font-black text-amber-100 shadow-md">
          1986
        </div>

        {/* Pulse Aura Ring */}
        <span className="absolute inset-0 rounded-full border border-[#d4af37]/50 animate-ping pointer-events-none [animation-duration:3s]" />
      </button>
    </div>
  );
}

export default React.memo(ChatLauncher);

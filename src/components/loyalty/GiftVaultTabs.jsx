import React from 'react';
import { TAB_DEFINITIONS } from './giftVaultConstants';

function GiftVaultTabs({ activeTab, onSelectTab, counts = {} }) {
  return (
    <div className="border-b border-amber-900/50 bg-[#160a07] px-2 sm:px-6">
      <div className="grid grid-cols-3 sm:flex sm:justify-start gap-1 sm:gap-2">
        {TAB_DEFINITIONS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = counts[tab.id];

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative py-2.5 sm:py-3 px-1 sm:px-4 font-serif text-[11px] sm:text-sm font-bold flex items-center justify-center sm:justify-start gap-1 sm:gap-2 transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-amber-300'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span className="text-sm sm:text-base leading-none">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden truncate">{tab.mobileLabel || tab.label}</span>
              {typeof count === 'number' && count > 0 && (
                <span className={`px-1 sm:px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-mono font-bold leading-tight shrink-0 ${
                  isActive
                    ? 'bg-amber-400 text-stone-950 shadow-sm'
                    : 'bg-stone-800 text-stone-300'
                }`}>
                  {count}
                </span>
              )}

              {/* ĐƯỜNG CHỈ VÀNG DƯỚI TAB ĐANG CHỌN */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(GiftVaultTabs);

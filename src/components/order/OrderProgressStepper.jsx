import React from 'react';
import { Sparkles, Check } from 'lucide-react';

function OrderProgressStepper({ step, handleBackToStep1 }) {
  return (
    <div className="flex items-center justify-between mb-3.5 sm:mb-5 pb-2.5 sm:pb-3 border-b border-amber-900/30 text-xs px-0.5 sm:px-1 select-none">
      {/* STEP 1: Thông tin */}
      {step > 1 ? (
        <button
          type="button"
          onClick={handleBackToStep1}
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group transition-transform active:scale-95"
          title="Quay lại bước 1: Thông tin"
          aria-label="Quay lại bước 1: Thông tin"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-600 group-hover:bg-emerald-500 border border-emerald-400/50 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all animate-orb-flip">
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
            </span>
          </div>
          <span className="text-emerald-400 group-hover:text-emerald-300 font-semibold text-[11px] sm:text-xs transition-colors">
            1. Thông tin
          </span>
        </button>
      ) : (
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative flex items-center justify-center">
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-brand-red to-amber-700 text-white font-black text-[10px] sm:text-xs flex items-center justify-center ring-2 ring-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-radial-gold-pulse">
              1
            </span>
          </div>
          <span className="text-amber-300 font-bold text-[11px] sm:text-xs tracking-tight flex items-center gap-1">
            <span>1. Thông tin</span>
            <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse hidden sm:inline" />
          </span>
        </div>
      )}

      {/* CONNECTOR 1: Flow Beam */}
      <div className="h-1 sm:h-1.5 flex-1 mx-2 sm:mx-3 bg-stone-800/90 border border-stone-700/50 rounded-full overflow-hidden relative">
        <div
          className={`h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 transition-all duration-700 ease-out ${
            step >= 2 ? 'w-full shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'w-0'
          }`}
        />
        {step >= 2 && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent w-1/2 animate-gold-beam pointer-events-none" />
        )}
      </div>

      {/* STEP 2: Thanh toán */}
      {step === 2 ? (
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative flex items-center justify-center">
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-brand-red to-amber-700 text-white font-black text-[10px] sm:text-xs flex items-center justify-center ring-2 ring-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.6)] animate-radial-gold-pulse animate-orb-flip">
              2
            </span>
          </div>
          <span className="text-amber-200 font-bold text-[11px] sm:text-xs tracking-tight flex items-center gap-1">
            <span>2. Thanh toán</span>
            <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse hidden sm:inline" />
          </span>
        </div>
      ) : step > 2 ? (
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative flex items-center justify-center">
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-600 border border-emerald-400/50 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-orb-flip">
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
            </span>
          </div>
          <span className="text-emerald-400 font-semibold text-[11px] sm:text-xs">
            2. Thanh toán
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 sm:gap-2 opacity-65">
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-stone-900 border border-stone-700 text-stone-500 text-[10px] sm:text-xs font-semibold flex items-center justify-center">
            2
          </span>
          <span className="text-stone-400 font-medium text-[11px] sm:text-xs">
            2. Thanh toán
          </span>
        </div>
      )}

      {/* CONNECTOR 2: Flow Beam */}
      <div className="h-1 sm:h-1.5 flex-1 mx-2 sm:mx-3 bg-stone-800/90 border border-stone-700/50 rounded-full overflow-hidden relative">
        <div
          className={`h-full bg-gradient-to-r from-amber-500 via-yellow-300 to-emerald-400 transition-all duration-700 ease-out ${
            step >= 3 ? 'w-full shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'w-0'
          }`}
        />
        {step >= 3 && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent w-1/2 animate-gold-beam pointer-events-none" />
        )}
      </div>

      {/* STEP 3: Hoàn tất */}
      {step === 3 ? (
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative flex items-center justify-center">
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-brand-red to-amber-700 text-white font-black text-[10px] sm:text-xs flex items-center justify-center ring-2 ring-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.6)] animate-radial-gold-pulse animate-orb-flip">
              3
            </span>
          </div>
          <span className="text-amber-200 font-bold text-[11px] sm:text-xs tracking-tight flex items-center gap-1">
            <span>3. Hoàn tất</span>
            <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse hidden sm:inline" />
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 sm:gap-2 opacity-50">
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-stone-900 border border-stone-700 text-stone-500 text-[10px] sm:text-xs font-semibold flex items-center justify-center">
            3
          </span>
          <span className="text-stone-500 font-medium text-[11px] sm:text-xs">
            3. Hoàn tất
          </span>
        </div>
      )}
    </div>
  );
}

export default React.memo(OrderProgressStepper);

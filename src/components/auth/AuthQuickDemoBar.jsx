import { memo } from 'react';
import { Sparkles, Heart } from 'lucide-react';

function AuthQuickDemoBar({ onQuickDemo }) {
  return (
    <div className="mt-4 pt-3 border-t border-[#e8ddc9]">
      <div className="text-[10px] text-stone-500 font-serif uppercase tracking-widest text-center mb-2">
        Hoặc trải nghiệm nhanh:
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onQuickDemo('member')}
          className="flex-1 py-1.5 px-2 rounded-lg bg-[#f4ebd9] hover:bg-[#ede0c8] text-[#8a1e14] text-[11px] font-serif font-semibold border border-[#d6c7ac] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span>Khách Quen Demo</span>
        </button>
        <button
          type="button"
          onClick={() => onQuickDemo('new')}
          className="flex-1 py-1.5 px-2 rounded-lg bg-[#f4ebd9] hover:bg-[#ede0c8] text-[#2b1810] text-[11px] font-serif font-semibold border border-[#d6c7ac] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Heart className="w-3 h-3 text-red-500" />
          <span>Khách Mới Demo</span>
        </button>
      </div>
    </div>
  );
}

export default memo(AuthQuickDemoBar);

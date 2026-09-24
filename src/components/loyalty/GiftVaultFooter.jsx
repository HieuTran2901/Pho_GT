import { memo } from 'react';
import { ShieldCheck } from 'lucide-react';

function GiftVaultFooter({ onClose }) {
  return (
    <div className="p-3 sm:px-6 bg-[#0e0503] border-t border-amber-900/50 flex items-center justify-between text-[11px] text-stone-400 shrink-0">
      <div className="flex items-center gap-1.5 text-amber-400/90 font-serif">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
        <span>Cam kết giữ gìn hương vị Phở Gia Truyền 1986</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-stone-300 hover:text-white font-serif font-semibold cursor-pointer transition-colors"
      >
        Đóng lại
      </button>
    </div>
  );
}

export default memo(GiftVaultFooter);

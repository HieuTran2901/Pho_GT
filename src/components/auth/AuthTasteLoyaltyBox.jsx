import React, { memo } from 'react';
import { Gift, CheckCircle2 } from 'lucide-react';

function AuthTasteLoyaltyBox({ saveTasteProfile, setSaveTasteProfile }) {
  return (
    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/70 border border-dashed border-amber-400/80 my-2">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full bg-amber-500/15 text-[#8a1e14] flex items-center justify-center shrink-0 mt-0.5">
          <Gift className="w-4 h-4" />
        </div>
        <div className="text-[11px] text-[#4a3528] leading-snug">
          <div className="font-serif font-bold text-[#8a1e14] text-xs">Đặc quyền Bát Phở Tri Kỷ 1986</div>
          <div className="mt-1 flex items-center gap-1.5 text-stone-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Tặng ngay <strong>50 điểm Tri Kỷ</strong> để đổi quẩy giòn</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-stone-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>1-Click <strong>"Gọi lại bát quen"</strong> chuẩn vị ruột</span>
          </div>
        </div>
      </div>
      <label className="flex items-center gap-2 mt-2 pt-2 border-t border-amber-300/40 cursor-pointer">
        <input 
          type="checkbox" 
          checked={saveTasteProfile} 
          onChange={(e) => setSaveTasteProfile(e.target.checked)} 
          className="w-3.5 h-3.5 accent-[#8a1e14] rounded" 
        />
        <span className="text-[11px] text-stone-700 font-medium">Tự động ghi nhớ Gu Ăn Phở của tôi cho lần gọi sau</span>
      </label>
    </div>
  );
}

export default memo(AuthTasteLoyaltyBox);

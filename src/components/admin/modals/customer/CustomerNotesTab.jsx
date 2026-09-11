import { Tag, FileText, Sparkles } from 'lucide-react';

const BROTH_MAP = {
  THANH: 'Thanh tao ninh xương',
  DAM_DA: 'Đậm đà quế hồi',
  BEO_NGAY: 'Béo ngậy mỡ gầu'
};

const ONION_MAP = {
  NHIEU_HANH: 'Nhiều hành hoa',
  IT_HANH: 'Ít hành hoa',
  HANH_TRAN: 'Hành củ trần tái',
  DAU_HANH: 'Đầu hành chẻ sợi'
};

const CRULLER_MAP = {
  QUAY_GION: 'Quẩy giòn rụm',
  QUAY_MEM: 'Quẩy mềm',
  KHONG_QUAY: 'Không quẩy'
};

export default function CustomerNotesTab({ taste, summary }) {
  const spicyLevel = taste?.spicyLevel ?? 1;

  return (
    <div className="space-y-4 animate-fadeIn text-xs">
      {/* 1. THẺ LỜI DẶN & GHI CHÚ ĐẦU BẾP */}
      <div className="p-5 rounded-2xl border border-stone-200/80 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
          <FileText className="w-4 h-4 text-stone-700" />
          <span>Ghi chú phục vụ & khẩu vị</span>
        </div>

        {taste?.customNote ? (
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-stone-800 text-xs italic">
            "{taste.customNote}"
          </div>
        ) : (
          <p className="text-stone-400 italic">Chưa có ghi chú đặc biệt cho khách hàng này.</p>
        )}
      </div>

      {/* 2. TAGS KHÁCH HÀNG */}
      <div className="p-5 rounded-2xl border border-stone-200/80 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
          <Tag className="w-4 h-4 text-stone-700" />
          <span>Nhãn phân loại (Tags)</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-medium text-xs">
            🍜 Khách Quen 1986
          </span>
          {summary?.membershipTier === 'VANG' || summary?.membershipTier === 'KIM_CUONG' ? (
            <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-medium text-xs">
              👑 Thượng Khách VIP
            </span>
          ) : null}
          {taste?.brothType && (
            <span className="px-3 py-1 rounded-xl bg-stone-100 text-stone-700 border border-stone-200 text-xs">
              Vị: {BROTH_MAP[taste.brothType] || taste.brothType}
            </span>
          )}
          {taste?.onionStyle && (
            <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
              {ONION_MAP[taste.onionStyle] || taste.onionStyle}
            </span>
          )}
          {spicyLevel > 0 && (
            <span className="px-3 py-1 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 text-xs">
              🌶️ Cay cấp {spicyLevel}
            </span>
          )}
        </div>
      </div>

      {/* 3. CHI TIẾT KHẨU VỊ */}
      <div className="p-5 rounded-2xl border border-stone-200/80 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
          <Sparkles className="w-4 h-4 text-stone-700" />
          <span>Thói quen thưởng thức</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-stone-400 block text-[10px]">Nước dùng</span>
            <span className="font-bold text-stone-800">{BROTH_MAP[taste?.brothType] || 'Đậm đà quế hồi'}</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-stone-400 block text-[10px]">Hành hoa</span>
            <span className="font-bold text-stone-800">{ONION_MAP[taste?.onionStyle] || 'Nhiều hành hoa'}</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-stone-400 block text-[10px]">Quẩy kèm</span>
            <span className="font-bold text-stone-800">{CRULLER_MAP[taste?.crullerPref] || 'Quẩy giòn rụm'}</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-stone-400 block text-[10px]">Mức cay</span>
            <span className="font-bold text-stone-800">{spicyLevel === 0 ? 'Không cay' : `Cấp ${spicyLevel}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

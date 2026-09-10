import { useState } from 'react';
import { X, Gift, Sparkles } from 'lucide-react';

const REASON_PRESETS = [
  'Tri ân khách quen ăn tại quán',
  'Quà mừng sinh nhật thực khách',
  'Bồi hoàn phục vụ chậm trễ',
  'Khuyến mãi đặc biệt ca trực'
];

export default function AdminCustomerQuickPointsModal({
  customer,
  isOpen,
  onClose,
  onSubmit,
  loading
}) {
  const [points, setPoints] = useState(50);
  const [reason, setReason] = useState(REASON_PRESETS[0]);

  if (!isOpen || !customer) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(customer, points, reason || 'Tặng điểm Tri Kỷ tại quầy');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#fcf9f2] rounded-2xl border-2 border-[#d4af37]/40 shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#22130b] via-[#190e08] to-[#2a170e] p-4 text-white flex items-center justify-between border-b border-[#d4af37]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-[#fcf9f2]">
                Tặng Điểm Tri Ân Cho Khách
              </h3>
              <p className="text-[11px] text-amber-200/80">
                {customer.fullName} ({customer.phone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-amber-200/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          {/* MỨC ĐIỂM CHỌN NHANH */}
          <div>
            <label className="block text-[#7a6e5d] font-serif font-bold mb-1.5">
              Chọn mức điểm tặng nhanh:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[20, 50, 100].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setPoints(val)}
                  className={`py-2 px-3 rounded-xl font-mono text-sm font-bold border transition-all ${
                    points === val
                      ? 'bg-[#8a1e14] text-white border-[#8a1e14] shadow-xs'
                      : 'bg-white text-[#22130b] border-[#d4af37]/30 hover:border-[#8a1e14]/50'
                  }`}
                >
                  +{val} điểm
                </button>
              ))}
            </div>
          </div>

          {/* LÝ DO TẶNG ĐIỂM */}
          <div>
            <label className="block text-[#7a6e5d] font-serif font-bold mb-1.5">
              Lý do tặng điểm:
            </label>
            <div className="space-y-1.5">
              {REASON_PRESETS.map((preset) => (
                <label
                  key={preset}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#d4af37]/20 cursor-pointer hover:bg-amber-50/50"
                >
                  <input
                    type="radio"
                    name="reasonPreset"
                    checked={reason === preset}
                    onChange={() => setReason(preset)}
                    className="accent-[#8a1e14]"
                  />
                  <span className="text-[#22130b]">{preset}</span>
                </label>
              ))}
            </div>
          </div>

          {/* THÔNG TIN SAU KHI TẶNG */}
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between font-serif text-[11px]">
            <span className="text-[#8a1e14] font-bold">Số dư mới sau khi tặng:</span>
            <span className="font-mono font-bold text-sm text-[#8a1e14]">
              {(customer.availablePoints || 0) + points} điểm
            </span>
          </div>

          {/* NÚT THAO TÁC */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#d4af37]/30 text-[#4a3525] font-serif font-medium hover:bg-gray-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-[#8a1e14] hover:bg-[#70150d] text-white font-serif font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Xác nhận tặng điểm</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

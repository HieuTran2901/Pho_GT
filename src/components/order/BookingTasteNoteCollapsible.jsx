import { useState, memo } from 'react';
import { ChevronDown } from 'lucide-react';
import { TASTE_PREFERENCES } from './orderConstants';

function BookingTasteNoteCollapsible({
  selectedTasteSet,
  onToggleTaste,
  note,
  onInputChange
}) {
  const [isTasteExpanded, setIsTasteExpanded] = useState(() => {
    return Boolean(note && note.trim().length > 0);
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden transition-all shadow-inner">
      <button
        type="button"
        onClick={() => setIsTasteExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors cursor-pointer text-left"
        aria-expanded={isTasteExpanded}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm shrink-0">🍜</span>
          <span className="text-xs font-semibold text-stone-200 whitespace-nowrap">
            Khẩu vị & ghi chú
          </span>
          {selectedTasteSet.size > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 shrink-0">
              {selectedTasteSet.size} món
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold shrink-0 ml-2">
          <span>{isTasteExpanded ? 'Thu gọn' : '+ Tùy chỉnh'}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isTasteExpanded ? 'rotate-180 text-amber-300' : 'text-amber-400'
            }`}
          />
        </div>
      </button>

      {/* Collapsible content */}
      {isTasteExpanded && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-white/10 space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-medium text-stone-400">Chọn nhanh khẩu vị phở:</span>
            <span className="text-[10px] text-amber-300/80 italic">Đặc trưng 1986</span>
          </div>

          {/* Taste Chips */}
          <div className="flex flex-wrap gap-1.5">
            {TASTE_PREFERENCES.map((pref) => {
              const isSelected = selectedTasteSet.has(pref);
              return (
                <button
                  key={pref}
                  type="button"
                  onClick={() => onToggleTaste(pref)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-semibold'
                      : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                  }`}
                >
                  + {pref}
                </button>
              );
            })}
          </div>

          <textarea
            rows="2"
            name="note"
            placeholder="Ghi chú thêm: bàn gần cửa sổ, ăn cay, xin thêm ớt chưng..."
            value={note}
            onChange={onInputChange}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-stone-500 text-base sm:text-sm focus:outline-none focus:border-amber-400 resize-none transition-colors"
          ></textarea>
        </div>
      )}
    </div>
  );
}

export default memo(BookingTasteNoteCollapsible);

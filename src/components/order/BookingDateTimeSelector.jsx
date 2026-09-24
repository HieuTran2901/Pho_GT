import { useCallback, memo } from 'react';
import { Clock } from 'lucide-react';
import { QUICK_TIME_SLOTS } from './orderConstants';

function BookingDateTimeSelector({
  date,
  time,
  todayDateStr,
  onInputChange
}) {
  const handleSelectQuickTime = useCallback((timeVal) => {
    if (!date && todayDateStr) {
      onInputChange({ target: { name: 'date', value: todayDateStr } });
    }
    onInputChange({ target: { name: 'time', value: timeVal } });
  }, [date, todayDateStr, onInputChange]);

  return (
    <div className="space-y-4">
      {/* Date and Time (2-column row, optimized for mobile typography & calendar spacing) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1 sm:mb-1.5">
            Ngày dùng bữa *
          </label>
          <input
            type="date"
            name="date"
            min={todayDateStr}
            required
            value={date}
            onChange={onInputChange}
            className="w-full px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs sm:text-sm font-medium tracking-tight focus:outline-none focus:border-amber-400 transition-colors [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-75 [&::-webkit-calendar-picker-indicator]:scale-90"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1 sm:mb-1.5">
            Khung giờ dự kiến *
          </label>
          <input
            type="time"
            name="time"
            required
            value={time}
            onChange={onInputChange}
            className="w-full px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs sm:text-sm font-medium tracking-tight focus:outline-none focus:border-amber-400 transition-colors [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-75 [&::-webkit-calendar-picker-indicator]:scale-90"
          />
        </div>
      </div>

      {/* Quick Peak-Hour Time Chips (1-Chạm Chọn Nhanh Giờ Ăn Phở) */}
      <div className="space-y-1.5 -mt-0.5">
        <div className="flex items-center justify-between text-[11px] px-0.5">
          <span className="text-stone-400 font-sans flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-medium text-stone-300">Khung giờ đông khách:</span>
          </span>
          <span className="text-[10px] text-amber-400/90 font-sans">
            {date ? 'Chạm chọn giờ' : 'Tự điền hôm nay'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {QUICK_TIME_SLOTS.map((slot) => {
            const isSelected = time === slot.time;
            return (
              <button
                key={slot.time}
                type="button"
                onClick={() => handleSelectQuickTime(slot.time)}
                className={`py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500/25 to-amber-600/25 border-amber-400 text-amber-200 font-bold shadow-xs'
                    : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-xs font-bold font-mono leading-tight">{slot.time}</div>
                <div className="text-[9px] text-stone-400 mt-0.5 leading-tight">{slot.period}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default memo(BookingDateTimeSelector);

import React, { useState, useCallback } from 'react';
import { Send, Clock, ChevronDown } from 'lucide-react';
import { TASTE_PREFERENCES, QUICK_TIME_SLOTS } from './orderConstants';

function OrderStep1Booking({
  formData,
  handleInputChange,
  handleSetOrderType,
  handleSetGuestCount,
  todayDateStr,
  selectedTable,
  setIsSeatMapOpen,
  selectedTasteSet,
  handleToggleTaste,
  isLoading,
  handleSubmit,
  direction
}) {
  const [isTasteExpanded, setIsTasteExpanded] = useState(() => {
    return Boolean(formData.note && formData.note.trim().length > 0);
  });

  const handleSelectQuickTime = useCallback((timeVal) => {
    if (!formData.date && todayDateStr) {
      handleInputChange({ target: { name: 'date', value: todayDateStr } });
    }
    handleInputChange({ target: { name: 'time', value: timeVal } });
  }, [formData.date, todayDateStr, handleInputChange]);

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${direction === 'backward' ? 'animate-step-backward' : ''}`}>
      {/* Order Type Segmented Switcher */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-black/40 border border-white/10 mb-4 text-xs sm:text-sm font-semibold">
        <button
          type="button"
          onClick={() => handleSetOrderType('dine-in')}
          className={`py-2 sm:py-2.5 rounded-lg transition-all ${
            formData.orderType === 'dine-in'
              ? 'bg-brand-red text-white shadow-sm font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Đặt Bàn Tại Quán
        </button>
        <button
          type="button"
          onClick={() => handleSetOrderType('delivery')}
          className={`py-2 sm:py-2.5 rounded-lg transition-all ${
            formData.orderType === 'delivery'
              ? 'bg-brand-red text-white shadow-sm font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Giao Phở Tận Nơi
        </button>
      </div>

      {/* Customer Name & Phone (2 columns on mobile & desktop) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1 sm:mb-1.5">
            Họ và tên *
          </label>
          <input
            type="text"
            name="customerName"
            autoComplete="name"
            required
            placeholder="Nguyễn Văn A"
            value={formData.customerName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-stone-500 text-base sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1 sm:mb-1.5">
            Số điện thoại *
          </label>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            required
            placeholder="0912 345 678"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-stone-500 text-base sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
      </div>

      {/* Branch & Guests (or Address) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1.5">
            Cơ sở phục vụ *
          </label>
          <select
            name="branch"
            value={formData.branch}
            onChange={handleInputChange}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#2e1d15] border border-white/15 text-white text-base sm:text-sm focus:outline-none focus:border-amber-400 transition-colors [color-scheme:dark]"
          >
            <option value="hanoi-hangbac">Hà Nội: 45 Hàng Bạc, Hoàn Kiếm (Cơ sở gốc 1986)</option>
            <option value="hanoi-lyquocsu">Hà Nội: 10 Lý Quốc Sư, Hoàn Kiếm</option>
            <option value="hcm-quan1">TP.HCM: 88 Pasteur, Quận 1</option>
            <option value="hcm-quan3">TP.HCM: 152 Võ Thị Sáu, Quận 3</option>
          </select>
        </div>

        {formData.orderType === 'dine-in' ? (
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Số lượng khách *
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { val: '1', label: '1 người' },
                { val: '2', label: '2 người' },
                { val: '4', label: '3 - 4' },
                { val: '8', label: 'Từ 5+' }
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => handleSetGuestCount(item.val)}
                  className={`py-2 rounded-lg border text-xs font-medium transition-all ${
                    formData.guestCount === item.val
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                      : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Địa chỉ nhận hàng *
            </label>
            <input
              type="text"
              name="address"
              autoComplete="street-address"
              required
              placeholder="Số nhà, tên đường, phường/xã..."
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-stone-500 text-base sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
        )}
      </div>

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
            value={formData.date}
            onChange={handleInputChange}
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
            value={formData.time}
            onChange={handleInputChange}
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
            {formData.date ? 'Chạm chọn giờ' : 'Tự điền hôm nay'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {QUICK_TIME_SLOTS.map((slot) => {
            const isSelected = formData.time === slot.time;
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

      {/* Live Pulse Capsule Bar (~28px height) */}
      {formData.orderType === 'dine-in' && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsSeatMapOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsSeatMapOpen(true);
            }
          }}
          className="group flex items-center justify-between px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-white/5 to-emerald-500/10 border border-amber-500/30 hover:border-amber-400 hover:bg-white/10 transition-all cursor-pointer shadow-xs active:scale-98"
        >
          <div className="flex items-center gap-2 min-w-0">
            {selectedTable ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                <div className="text-[11px] truncate flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">✨ Đã giữ:</span>
                  <span className="font-semibold text-white">{selectedTable.name}</span>
                  <span className="text-stone-300 hidden sm:inline">({selectedTable.zoneName})</span>
                </div>
              </>
            ) : (
              <>
                <div className="relative flex items-center justify-center shrink-0 w-2 h-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <div className="text-[11px] text-stone-300 flex items-center gap-1 min-w-0">
                  <span className="text-emerald-400 font-semibold shrink-0">
                    {formData.time ? `${formData.time} •` : 'Trực tuyến:'}
                  </span>
                  <span className="text-stone-200">Còn 8 bàn (có ban công)</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2 text-[11px] font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
            <span>{selectedTable ? 'Đổi bàn' : 'Chọn chỗ'}</span>
            <span className="text-[10px] transition-transform group-hover:translate-x-0.5">→</span>
          </div>
        </div>
      )}

      {/* Progressive Disclosure: Taste Preferences & Notes */}
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
                    onClick={() => handleToggleTaste(pref)}
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
              value={formData.note}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-stone-500 text-base sm:text-sm focus:outline-none focus:border-amber-400 resize-none transition-colors"
            ></textarea>
          </div>
        )}
      </div>

      {/* Submit Button with Mobile Safe-Zone Clearance (pb-24 sm:pb-0) */}
      <div className="pt-2 pb-24 sm:pb-0">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-red to-amber-600 hover:from-brand-redhover hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Đang Xử Lý Yêu Cầu...</span>
            </span>
          ) : (
            <>
              <Send className="w-4 h-4 text-white" />
              <span>
                {formData.orderType === 'dine-in' ? 'Xác Nhận Đặt Bàn Tại Quán' : 'Xác Nhận Đặt Giao Phở'}
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default React.memo(OrderStep1Booking);

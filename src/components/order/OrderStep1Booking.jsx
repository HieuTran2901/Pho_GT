import { useState, useCallback, memo } from 'react';
import { Send, Clock, ChevronDown, RotateCcw, Armchair, Shuffle, Compass, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { TASTE_PREFERENCES, QUICK_TIME_SLOTS } from './orderConstants';
import OrderLockoutBanner from './OrderLockoutBanner';

function OrderStep1Booking({
  formData,
  handleInputChange,
  handleSetOrderType,
  handleSetGuestCount,
  todayDateStr,
  selectedTable,
  setIsSeatMapOpen,
  handleSelectRandomTable,
  selectedTasteSet,
  handleToggleTaste,
  isLoading,
  handleSubmit,
  direction,
  tableLockWarning,
  isOrderLocked,
  lockoutReason,
  handleResetLockout
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

  const [isShuffling, setIsShuffling] = useState(false);

  const onQuickRandomTable = useCallback(async (e) => {
    if (e) e.stopPropagation();
    if (isShuffling) return;
    setIsShuffling(true);
    if (handleSelectRandomTable) {
      await handleSelectRandomTable();
    }
    setTimeout(() => setIsShuffling(false), 350);
  }, [handleSelectRandomTable, isShuffling]);

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

      {/* Heritage Table Booking Controller (Phương án 3: Bắt buộc có bàn kèm nút Xếp bàn ngẫu nhiên nhanh) */}
      {formData.orderType === 'dine-in' && (
        <div className="rounded-2xl border border-amber-600/35 bg-gradient-to-br from-amber-950/40 via-stone-900/60 to-black/50 p-3 sm:p-3.5 space-y-2.5 shadow-md">
          {/* Header Bar: Nhãn + Trạng thái */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-serif font-bold text-amber-200">
              <Armchair className="w-3.5 h-3.5 text-amber-400" />
              <span>Vị Trí Bàn Ăn Tại Quán</span>
              <span className="text-red-400" title="Bắt buộc có vị trí bàn">*</span>
            </div>
            {selectedTable ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Đã xếp vị trí
              </span>
            ) : (
              <span className="text-[10px] text-amber-400/90 italic font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span>Bắt buộc có bàn</span>
              </span>
            )}
          </div>

          {/* Cảnh báo Bàn bị khóa trong thời gian thực */}
          {tableLockWarning && (
            <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/60 text-red-200 text-xs flex items-start gap-2 shadow-inner animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">
                <span className="font-bold text-amber-300">Thông báo điều phối bàn: </span>
                <span className="text-[11px] text-red-100">{tableLockWarning}</span>
              </div>
            </div>
          )}

          {/* Body Box: Đã chọn bàn vs Chưa chọn bàn */}
          {selectedTable ? (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9b2a1f] to-[#731911] text-amber-200 border border-amber-400/40 flex items-center justify-center font-serif font-bold text-xs shrink-0 shadow-xs">
                  {selectedTable.floor ? `T${selectedTable.floor}` : '🍜'}
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-xs font-bold text-amber-100 truncate flex items-center gap-1.5">
                    <span>{selectedTable.name}</span>
                    {selectedTable.isVip && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-400 text-stone-950 text-[9px] font-bold uppercase">VIP</span>
                    )}
                  </div>
                  <div className="text-[10px] text-stone-300 truncate">
                    {selectedTable.zoneName || 'Khu gian chính'} • Tối đa {selectedTable.capacity || 4} khách
                  </div>
                </div>
              </div>

              {/* 2 Nút thao tác nhanh: Đổi ngẫu nhiên khác & Xem sơ đồ */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={onQuickRandomTable}
                  disabled={isShuffling}
                  className={`px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 ${
                    isShuffling ? 'opacity-60 cursor-wait' : ''
                  }`}
                  title="Đổi sang bàn ngẫu nhiên khác"
                >
                  <Shuffle className={`w-3 h-3 text-amber-300 ${isShuffling ? 'animate-spin' : ''}`} />
                  <span className="hidden xs:inline sm:inline">Đổi ngẫu nhiên</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSeatMapOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-stone-200 text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Mở sơ đồ bàn 3D để tự chọn"
                >
                  <MapPin className="w-3 h-3 text-stone-300" />
                  <span>Sơ đồ</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Nút 1: XẾP BÀN NGẪU NHIÊN (NHANH TỨC THÌ) */}
                <button
                  type="button"
                  onClick={onQuickRandomTable}
                  disabled={isShuffling}
                  className={`w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-serif font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 group ring-1 ring-amber-300/60 ${
                    isShuffling ? 'opacity-60 cursor-wait' : ''
                  }`}
                >
                  <Shuffle className={`w-3.5 h-3.5 transition-transform duration-300 ${isShuffling ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                  <span>Chọn Bàn Ngẫu Nhiên</span>
                  <span className="text-[9.5px] bg-black/25 text-stone-950 px-1.5 py-0.2 rounded font-mono font-black uppercase tracking-tight">Nhanh</span>
                </button>

                {/* Nút 2: TỰ CHỌN TRÊN SƠ ĐỒ 3D */}
                <button
                  type="button"
                  onClick={() => setIsSeatMapOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-amber-500/40 text-amber-200 font-serif font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 group"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Xem Sơ Đồ Chọn Chỗ</span>
                </button>
              </div>
              <p className="text-[10.5px] text-stone-400 text-center italic">
                💡 Bấm <strong>"Chọn Bàn Ngẫu Nhiên"</strong> để hệ thống tự động bốc bàn trống đẹp nhất cho {formData.guestCount} khách mà không cần mở sơ đồ.
              </p>
            </div>
          )}
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

      {/* [URBAN & RAVEN] Banner Niêm Phong Đặt Bàn khi SĐT hoặc tài khoản bị khóa */}
      {isOrderLocked && (
        <OrderLockoutBanner
          reason={lockoutReason}
          onChangePhone={() => handleResetLockout(() => handleInputChange({ target: { name: 'phone', value: '' } }))}
        />
      )}

      {/* Submit Button with Mobile Safe-Zone Clearance (pb-24 sm:pb-0) */}
      <div className="pt-2 pb-24 sm:pb-0">
        {isOrderLocked ? (
          <button
            type="button"
            onClick={() => handleResetLockout(() => handleInputChange({ target: { name: 'phone', value: '' } }))}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-red-800 hover:brightness-110 text-amber-100 font-serif font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-400/40"
          >
            <RotateCcw className="w-4 h-4 text-amber-200" />
            <span>SỐ NÀY ĐANG TẠM KHÓA • BẤM ĐỂ ĐỔI SỐ KHÁC</span>
          </button>
        ) : (
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
        )}
      </div>
    </form>
  );
}

export default memo(OrderStep1Booking);

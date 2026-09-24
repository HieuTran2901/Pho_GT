import { memo } from 'react';
import { Send, RotateCcw } from 'lucide-react';
import OrderLockoutBanner from './OrderLockoutBanner';
import BookingPartyInfo from './BookingPartyInfo';
import BookingTablePicker from './BookingTablePicker';
import BookingDateTimeSelector from './BookingDateTimeSelector';
import BookingTasteNoteCollapsible from './BookingTasteNoteCollapsible';

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
  handleResetLockout,
  mainDishWarning,
  onExploreMenu
}) {
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

      {/* Branch & Guests (or Delivery Address) */}
      <BookingPartyInfo
        orderType={formData.orderType}
        branch={formData.branch}
        guestCount={formData.guestCount}
        address={formData.address}
        onInputChange={handleInputChange}
        onSetGuestCount={handleSetGuestCount}
      />

      {/* Date and Time Selector */}
      <BookingDateTimeSelector
        date={formData.date}
        time={formData.time}
        todayDateStr={todayDateStr}
        onInputChange={handleInputChange}
      />

      {/* Heritage Table Booking Controller */}
      {formData.orderType === 'dine-in' && (
        <BookingTablePicker
          selectedTable={selectedTable}
          guestCount={formData.guestCount}
          tableLockWarning={tableLockWarning}
          onSelectRandomTable={handleSelectRandomTable}
          onOpenSeatMap={() => setIsSeatMapOpen(true)}
        />
      )}

      {/* Progressive Disclosure: Taste Preferences & Notes */}
      <BookingTasteNoteCollapsible
        selectedTasteSet={selectedTasteSet}
        onToggleTaste={handleToggleTaste}
        note={formData.note}
        onInputChange={handleInputChange}
      />

      {/* Banner Niêm Phong Đặt Bàn khi SĐT hoặc tài khoản bị khóa */}
      {isOrderLocked && (
        <OrderLockoutBanner
          reason={lockoutReason}
          onChangePhone={() => handleResetLockout(() => handleInputChange({ target: { name: 'phone', value: '' } }))}
        />
      )}

      {/* Submit Button with Mobile Safe-Zone Clearance (pb-24 sm:pb-0) */}
      <div className="pt-2 pb-24 sm:pb-0">
        {mainDishWarning && (
          <div className="mb-3 p-2.5 sm:p-3 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 flex items-center justify-between gap-2.5 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">🍜</span>
              <span className="text-xs font-serif leading-snug">
                {mainDishWarning}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onExploreMenu) onExploreMenu();
                else {
                  const el = document.getElementById('menu');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 hover:text-amber-100 text-[11px] font-serif font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
            >
              Chọn Phở Ngay →
            </button>
          </div>
        )}

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

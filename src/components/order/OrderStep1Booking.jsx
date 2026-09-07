import React from 'react';
import { Send } from 'lucide-react';
import { TASTE_PREFERENCES } from './orderConstants';

export default function OrderStep1Booking({
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

      {/* Customer Name & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1.5">
            Họ và tên quý khách *
          </label>
          <input
            type="text"
            name="customerName"
            autoComplete="name"
            required
            placeholder="Ví dụ: Nguyễn Văn A"
            value={formData.customerName}
            onChange={handleInputChange}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-stone-500 text-base sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1.5">
            Số điện thoại liên hệ *
          </label>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            required
            placeholder="Ví dụ: 0912 345 678"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-stone-500 text-base sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
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

      {/* Date and Time (2-column row) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1.5">
            Ngày dùng bữa *
          </label>
          <input
            type="date"
            name="date"
            min={todayDateStr}
            required
            value={formData.date}
            onChange={handleInputChange}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-base sm:text-sm focus:outline-none focus:border-amber-400 transition-colors [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1.5">
            Khung giờ dự kiến *
          </label>
          <input
            type="time"
            name="time"
            required
            value={formData.time}
            onChange={handleInputChange}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-base sm:text-sm focus:outline-none focus:border-amber-400 transition-colors [color-scheme:dark]"
          />
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
                <div className="text-[11px] text-stone-300 truncate">
                  <span className="text-emerald-400 font-semibold">
                    {formData.time ? `${formData.time} hôm nay:` : 'Trực tuyến:'}
                  </span>{' '}
                  <span>Còn 8 bàn đẹp (2 bàn ban công)</span>
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

      {/* Taste Preferences & Notes */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-stone-300">
            Yêu cầu khẩu vị riêng (nếu có)
          </label>
          <span className="text-[11px] text-stone-400">Chọn nhanh:</span>
        </div>

        {/* Taste Chips */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {TASTE_PREFERENCES.map((pref) => {
            const isSelected = selectedTasteSet.has(pref);
            return (
              <button
                key={pref}
                type="button"
                onClick={() => handleToggleTaste(pref)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all border ${
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
          className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-stone-500 text-base sm:text-sm focus:outline-none focus:border-amber-400 resize-none transition-colors"
        ></textarea>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-brand-red to-amber-600 hover:from-brand-redhover hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
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
    </form>
  );
}

import { memo } from 'react';

function BookingPartyInfo({
  orderType,
  branch,
  guestCount,
  address,
  onInputChange,
  onSetGuestCount
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      <div>
        <label className="block text-xs font-semibold text-stone-300 mb-1.5">
          Cơ sở phục vụ *
        </label>
        <select
          name="branch"
          value={branch}
          onChange={onInputChange}
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#2e1d15] border border-white/15 text-white text-base sm:text-sm focus:outline-none focus:border-amber-400 transition-colors [color-scheme:dark]"
        >
          <option value="hanoi-hangbac">Hà Nội: 45 Hàng Bạc, Hoàn Kiếm (Cơ sở gốc 1986)</option>
          <option value="hanoi-lyquocsu">Hà Nội: 10 Lý Quốc Sư, Hoàn Kiếm</option>
          <option value="hcm-quan1">TP.HCM: 88 Pasteur, Quận 1</option>
          <option value="hcm-quan3">TP.HCM: 152 Võ Thị Sáu, Quận 3</option>
        </select>
      </div>

      {orderType === 'dine-in' ? (
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
                onClick={() => onSetGuestCount(item.val)}
                className={`py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  guestCount === item.val
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
            value={address}
            onChange={onInputChange}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-stone-500 text-base sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
      )}
    </div>
  );
}

export default memo(BookingPartyInfo);

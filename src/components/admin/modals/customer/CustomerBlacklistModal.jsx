import { useState } from 'react';
import { Ban, X } from 'lucide-react';

export default function CustomerBlacklistModal({
  isOpen,
  onClose,
  summary,
  onBlacklist,
  actionLoading
}) {
  const [banPhone, setBanPhone] = useState(true);
  const [banDevice, setBanDevice] = useState(true);
  const [banIp, setBanIp] = useState(false);
  const [ipBanDays, setIpBanDays] = useState(7);
  const [blacklistReason, setBlacklistReason] = useState('Bom hàng / Phá hoại nhiều lần');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!summary || !onBlacklist) return;
    await onBlacklist(summary.id, {
      reason: blacklistReason || 'Vi phạm an ninh nghiêm trọng',
      banPhone,
      banDevice,
      banIp,
      ipBanDays: Number(ipBanDays)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#fcf9f2] rounded-2xl border-2 border-stone-800 p-4 sm:p-5 shadow-2xl space-y-3 text-xs text-[#22130b]">
        <div className="flex items-center justify-between text-stone-900 font-serif font-bold pb-2 border-b border-stone-200">
          <span className="flex items-center gap-2 text-rose-800 text-sm">
            <Ban className="w-4 h-4 text-rose-700" /> Kích hoạt Danh Sách Cấm (3 Lớp)
          </span>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-stone-600">
          Hệ thống sẽ khóa tài khoản vĩnh viễn, thu hồi toàn bộ phiên đăng nhập và kích hoạt tường lửa tự động:
        </p>

        {/* Thông tin đối tượng */}
        <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 space-y-1 font-mono text-[11px]">
          <div className="flex justify-between">
            <span className="text-stone-500 font-sans">Thực khách:</span>
            <span className="font-bold text-stone-800">{summary?.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 font-sans">Số điện thoại:</span>
            <span className="font-bold text-rose-800">{summary?.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 font-sans">IP gần nhất:</span>
            <span className="text-stone-700">{summary?.lastLoginIp || 'Chưa ghi nhận'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 font-sans">Thiết bị gần nhất:</span>
            <span className="text-stone-700 truncate max-w-[180px]">{summary?.lastDeviceId || 'Chưa ghi nhận'}</span>
          </div>
        </div>

        {/* 3 Checkboxes */}
        <div className="space-y-2 pt-1">
          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={banPhone}
              onChange={(e) => setBanPhone(e.target.checked)}
              className="mt-0.5 rounded border-stone-300 text-[#8a1e14] focus:ring-[#8a1e14]"
            />
            <div>
              <span className="font-bold text-stone-800 font-serif">1. Cấm Số Điện Thoại vĩnh viễn</span>
              <p className="text-[10px] text-stone-500">Khóa tài khoản vĩnh viễn, chặn đăng nhập và đăng ký mới bằng SĐT này.</p>
            </div>
          </label>

          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={banDevice}
              onChange={(e) => setBanDevice(e.target.checked)}
              className="mt-0.5 rounded border-stone-300 text-[#8a1e14] focus:ring-[#8a1e14]"
            />
            <div>
              <span className="font-bold text-stone-800 font-serif">2. Cấm Thiết Bị (Device ID) vĩnh viễn</span>
              <p className="text-[10px] text-stone-500">Chặn trực tiếp từ định danh phần cứng trình duyệt, đổi số khác vẫn bị chặn.</p>
            </div>
          </label>

          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-600/20 space-y-1.5">
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={banIp}
                onChange={(e) => setBanIp(e.target.checked)}
                className="mt-0.5 rounded border-stone-300 text-[#8a1e14] focus:ring-[#8a1e14]"
              />
              <div>
                <span className="font-bold text-amber-950 font-serif">3. Cấm Địa chỉ IP (Thời hạn linh hoạt)</span>
                <p className="text-[10px] text-amber-900/80">Lưu ý: Không nên cấm vĩnh viễn vì IP 4G dùng chung. Mạng WiFi quán đã được tự động bảo vệ.</p>
              </div>
            </label>

            {banIp && (
              <div className="pl-6 flex items-center gap-2">
                <span className="text-[10px] font-medium text-stone-600">Thời hạn cấm IP:</span>
                <select
                  value={ipBanDays}
                  onChange={(e) => setIpBanDays(Number(e.target.value))}
                  className="p-1 rounded border border-stone-300 bg-white text-[11px] text-stone-800 font-medium"
                >
                  <option value={3}>3 ngày</option>
                  <option value={7}>7 ngày (Khuyến nghị)</option>
                  <option value={14}>14 ngày</option>
                  <option value={30}>30 ngày</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Lý do cấm */}
        <div className="space-y-1 pt-1">
          <label className="text-[11px] font-serif font-bold text-stone-700">Lý do cấm:</label>
          <input
            type="text"
            value={blacklistReason}
            onChange={(e) => setBlacklistReason(e.target.value)}
            placeholder="Nhập lý do cấm..."
            className="w-full p-2 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs focus:outline-hidden focus:border-rose-700"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 font-serif text-xs text-stone-700"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={actionLoading || (!banPhone && !banDevice && !banIp)}
            className="px-4 py-1.5 rounded-lg bg-rose-800 hover:bg-rose-900 active:scale-95 text-white font-serif font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Kích hoạt cấm triệt để</span>
          </button>
        </div>
      </div>
    </div>
  );
}

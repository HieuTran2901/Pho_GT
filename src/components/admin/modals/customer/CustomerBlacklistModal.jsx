import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Ban, X, Phone, Smartphone, Globe } from 'lucide-react';

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

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-[24px] border border-stone-200 shadow-2xl p-5 sm:p-6 space-y-4 text-xs text-stone-900">
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5 text-rose-700 font-bold text-sm">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Ban className="w-4 h-4" />
            </div>
            <span>Kích hoạt Danh Sách Cấm (3 Lớp Phòng Thủ)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-stone-600 text-xs leading-relaxed">
          Hệ thống sẽ khóa tài khoản vĩnh viễn, lập tức thu hồi toàn bộ phiên đăng nhập và kích hoạt tường lửa an ninh tự động:
        </p>

        {/* THÔNG TIN ĐỐI TƯỢNG */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5 font-mono text-xs">
          <div className="flex justify-between">
            <span className="text-stone-500 font-sans">Thực khách:</span>
            <span className="font-bold text-stone-900">{summary?.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 font-sans">Số điện thoại:</span>
            <span className="font-bold text-[#e11d48]">{summary?.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 font-sans">IP gần nhất:</span>
            <span className="text-stone-700">{summary?.lastLoginIp || 'Chưa ghi nhận'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 font-sans">Thiết bị gần nhất:</span>
            <span className="text-stone-700 truncate max-w-[220px]">{summary?.lastDeviceId || 'Chưa ghi nhận'}</span>
          </div>
        </div>

        {/* 3 LỚP PHÒNG THỦ CHECKBOXES */}
        <div className="space-y-2.5 pt-1">
          <label className="flex items-start gap-3 p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50/80 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={banPhone}
              onChange={(e) => setBanPhone(e.target.checked)}
              className="mt-0.5 rounded border-stone-300 text-rose-600 focus:ring-rose-500"
            />
            <div>
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-rose-600" />
                1. Cấm Số Điện Thoại vĩnh viễn
              </span>
              <p className="text-[11px] text-stone-500 mt-0.5">Khóa vĩnh viễn, chặn hoàn toàn đăng nhập và tạo tài khoản mới bằng số này.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50/80 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={banDevice}
              onChange={(e) => setBanDevice(e.target.checked)}
              className="mt-0.5 rounded border-stone-300 text-rose-600 focus:ring-rose-500"
            />
            <div>
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-rose-600" />
                2. Cấm Thiết Bị (Device ID) vĩnh viễn
              </span>
              <p className="text-[11px] text-stone-500 mt-0.5">Chặn theo dấu vân tay phần cứng trình duyệt, dù đổi SIM hay dùng số khác vẫn bị chặn.</p>
            </div>
          </label>

          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={banIp}
                onChange={(e) => setBanIp(e.target.checked)}
                className="mt-0.5 rounded border-stone-300 text-rose-600 focus:ring-rose-500"
              />
              <div>
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-700" />
                  3. Cấm Địa chỉ IP (Thời hạn linh hoạt)
                </span>
                <p className="text-[11px] text-amber-900/80 mt-0.5">Lưu ý: Không nên cấm vĩnh viễn vì IP mạng 4G/5G dùng chung. Mạng WiFi quán đã được tự động bảo vệ.</p>
              </div>
            </label>

            {banIp && (
              <div className="pl-7 flex items-center gap-2 pt-1 border-t border-amber-200/60">
                <span className="text-xs font-medium text-amber-900">Thời hạn cấm IP:</span>
                <select
                  value={ipBanDays}
                  onChange={(e) => setIpBanDays(Number(e.target.value))}
                  className="px-2 py-1 rounded-lg border border-amber-300 bg-white text-xs text-stone-800 font-medium"
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

        {/* LÝ DO CẤM */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-bold text-stone-700">Lý do cấm an ninh:</label>
          <input
            type="text"
            value={blacklistReason}
            onChange={(e) => setBlacklistReason(e.target.value)}
            placeholder="Nhập lý do cấm..."
            className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-[#f9fafb] text-stone-900 text-xs focus:bg-white focus:outline-none focus:border-rose-400"
          />
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 font-medium text-xs text-stone-700 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={actionLoading || (!banPhone && !banDevice && !banIp)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-medium text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Kích hoạt cấm triệt để</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

import { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Gift,
  AlertTriangle,
  X,
  Ban
} from 'lucide-react';
import CustomerBlacklistModal from './CustomerBlacklistModal';

const QUICK_REASONS = [
  'Quên MK tại bàn',
  'Nghi vấn đơn ảo',
  'Khách yêu cầu',
  'Vi phạm quy chế'
];

const QUICK_POINTS = [50, 100, 200, -50, -100];
const QUICK_POINT_REASONS = [
  { label: '🎂 Sinh nhật', text: 'Quà sinh nhật khách quen' },
  { label: '⭐ Tri ân', text: 'Tri ân khách hàng thân thiết' },
  { label: '🥣 Bù món', text: 'Đền bù đơn chậm / Sai món' },
  { label: '🎁 Đổi quà', text: 'Đổi quà tri ân tại quầy' }
];

export default function CustomerActionsTab({
  summary,
  isSelfOrAdmin,
  actionLoading,
  onStatusUpdate,
  onPointsAdjustment,
  onUnlock,
  onBlacklist
}) {
  const [showLockForm, setShowLockForm] = useState(false);
  const [lockReasonDraft, setLockReasonDraft] = useState('');
  const [pointsDraft, setPointsDraft] = useState('');
  const [pointsReasonDraft, setPointsReasonDraft] = useState('');
  const [showDangerConfirm, setShowDangerConfirm] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);

  const isLocked = summary?.status === 'LOCKED';
  const isBlacklisted = summary?.lockType === 'BLACKLISTED';

  const handleConfirmLock = async (e) => {
    if (e) e.preventDefault();
    if (!summary) return;
    await onStatusUpdate(summary.id, 'LOCKED', lockReasonDraft || 'Khóa tài khoản bởi Quản trị viên');
    setShowLockForm(false);
    setLockReasonDraft('');
  };

  const handleAdjustPointsSubmit = async (e) => {
    e.preventDefault();
    const pts = parseInt(pointsDraft, 10);
    if (isNaN(pts) || pts === 0 || !summary) return;
    await onPointsAdjustment(summary.id, pts, pointsReasonDraft || 'Điều chỉnh điểm tri ân');
    setPointsDraft('');
    setPointsReasonDraft('');
  };

  const handlePermanentArchive = async () => {
    if (!summary) return;
    await onStatusUpdate(summary.id, 'LOCKED', 'Hủy tư cách hội viên và đưa vào danh sách lưu trữ an toàn');
    setShowDangerConfirm(false);
  };

  if (isSelfOrAdmin) {
    return (
      <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-600/35 text-xs text-[#22130b] flex items-center gap-2.5 animate-fadeIn">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
        <span className="font-bold text-amber-950 font-serif">
          Tài khoản Quản trị viên (Chế độ chỉ đọc an ninh)
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fadeIn text-xs">
      {/* 1. THẺ TRẠNG THÁI AN NINH COMPACT - NÚT BẤM NẢY */}
      <div className={`p-3 rounded-xl border transition-all duration-200 shadow-2xs ${
        isBlacklisted
          ? 'bg-stone-900 border-rose-600/60 text-white'
          : isLocked
          ? 'bg-rose-950/15 border-rose-500/40 text-rose-950'
          : 'bg-emerald-950/10 border-emerald-600/30 text-emerald-950'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${
              isBlacklisted ? 'bg-rose-700 text-white' : isLocked ? 'bg-rose-600 text-white' : 'bg-emerald-700 text-white'
            }`}>
              {isBlacklisted ? <Ban className="w-4 h-4" /> : isLocked ? <Lock className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-xs">
                  {isBlacklisted ? 'Đã Vào Danh Sách Cấm' : isLocked ? 'Đang Bị Khóa' : 'Đang Hoạt Động'}
                </span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-serif font-bold border ${
                  isBlacklisted ? 'bg-rose-950 text-rose-300 border-rose-700' : isLocked ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {isBlacklisted ? 'BLACKLISTED' : isLocked ? 'LOCKED' : 'ACTIVE'}
                </span>
              </div>
              <p className={`text-[10px] truncate mt-0.5 ${isBlacklisted ? 'text-stone-300' : 'text-stone-600'}`}>
                {isBlacklisted ? (summary?.lockReason || 'Cấm truy cập đa tầng') : isLocked ? (summary?.lockReason || 'Tạm dừng truy cập') : 'Đặt món & tích điểm thông suốt'}
              </p>
            </div>
          </div>

          {/* Nút Khóa / Mở Khóa với hiệu ứng nảy (Tactile Bounce) */}
          {isLocked ? (
            <button
              type="button"
              onClick={() => onUnlock(summary.id)}
              disabled={actionLoading}
              className={`px-3.5 py-1.5 rounded-lg font-serif font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1 shrink-0 ${
                isBlacklisted
                  ? 'bg-amber-600 hover:bg-amber-700 text-white active:scale-95'
                  : 'bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white'
              }`}
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>{isBlacklisted ? 'Gỡ cấm / Ân xá' : 'Mở khóa tại bàn'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowLockForm(!showLockForm)}
              className="px-3 py-1.5 rounded-lg border border-rose-800/40 text-rose-800 hover:bg-rose-50 active:scale-95 font-serif font-bold shadow-2xs transition-all flex items-center gap-1 shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{showLockForm ? 'Đóng lại' : 'Tạm khóa'}</span>
            </button>
          )}
        </div>

        {/* Chi tiết chặn 3 lớp khi đã bị blacklist */}
        {isBlacklisted && (
          <div className="mt-2.5 pt-2 border-t border-stone-800 text-[10px] space-y-1 font-mono text-stone-300">
            <div className="flex justify-between">
              <span className="text-stone-500 font-sans">Lý do cấm:</span>
              <span className="font-bold text-rose-300">{summary?.lockReason || 'Vi phạm an ninh'}</span>
            </div>
            {summary?.lastLoginIp && (
              <div className="flex justify-between">
                <span className="text-stone-500 font-sans">IP gần nhất:</span>
                <span>{summary.lastLoginIp}</span>
              </div>
            )}
            {summary?.lastDeviceId && (
              <div className="flex justify-between">
                <span className="text-stone-500 font-sans">Thiết bị gần nhất:</span>
                <span className="truncate max-w-[200px]">{summary.lastDeviceId}</span>
              </div>
            )}
          </div>
        )}

        {/* Form trượt chọn lý do nhanh */}
        {!isLocked && showLockForm && (
          <form onSubmit={handleConfirmLock} className="mt-2.5 pt-2.5 border-t border-emerald-600/20 space-y-2 animate-fadeIn">
            <div className="flex flex-wrap gap-1">
              {QUICK_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setLockReasonDraft(r)}
                  className={`px-2 py-0.8 rounded-md text-[10px] font-serif border active:scale-95 transition-all ${
                    lockReasonDraft === r
                      ? 'bg-[#8a1e14] text-white border-[#8a1e14]'
                      : 'bg-white text-[#22130b] border-stone-300 hover:border-[#8a1e14]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Hoặc nhập lý do khác..."
                value={lockReasonDraft}
                onChange={(e) => setLockReasonDraft(e.target.value)}
                className="flex-1 p-1.5 rounded-lg border border-stone-300 bg-white text-[#22130b] text-xs focus:outline-hidden focus:border-[#8a1e14]"
              />
              <button
                type="submit"
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-lg bg-[#8a1e14] hover:bg-[#70150d] active:scale-95 text-white font-serif font-bold shadow-2xs shrink-0 transition-all"
              >
                Xác nhận
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. KHUNG ĐIỀU CHỈNH ĐIỂM TRI ÂN GỌN GÀNG */}
      <form onSubmit={handleAdjustPointsSubmit} className="p-3 rounded-xl bg-white border border-[#d4af37]/25 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-serif font-bold text-[#22130b]">
          <span className="flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-[#8a1e14]" /> Điều chỉnh điểm thưởng
          </span>
          <span className="text-[11px] font-mono text-[#8a1e14]">{summary?.availablePoints || 0} pts</span>
        </div>

        {/* Quick Points Preset Buttons (Hiệu ứng nảy ngọc) */}
        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_POINTS.map((pts) => (
            <button
              key={pts}
              type="button"
              onClick={() => setPointsDraft(pts.toString())}
              className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs border active:scale-90 hover:scale-105 transition-all duration-150 ${
                pointsDraft === pts.toString()
                  ? 'bg-[#d4af37] text-[#190e08] border-[#d4af37] shadow-xs'
                  : 'bg-[#faf6ee] text-[#22130b] border-[#d4af37]/30 hover:border-[#d4af37]'
              }`}
            >
              {pts > 0 ? `+${pts}` : pts}
            </button>
          ))}
        </div>

        {/* Quick Reasons Chips */}
        <div className="flex flex-wrap gap-1">
          {QUICK_POINT_REASONS.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setPointsReasonDraft(r.text)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-serif border active:scale-95 transition-all ${
                pointsReasonDraft === r.text
                  ? 'bg-[#8a1e14] text-white border-[#8a1e14]'
                  : 'bg-[#faf6ee] text-[#22130b] border-stone-200 hover:border-stone-400'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
          <input
            type="number"
            placeholder="Số điểm (+ / -)"
            value={pointsDraft}
            onChange={(e) => setPointsDraft(e.target.value)}
            required
            className="p-1.5 rounded-lg border border-[#d4af37]/35 bg-[#faf6ee] text-[#22130b] font-mono text-xs focus:outline-hidden focus:border-[#8a1e14]"
          />
          <input
            type="text"
            placeholder="Ghi chú lý do..."
            value={pointsReasonDraft}
            onChange={(e) => setPointsReasonDraft(e.target.value)}
            required
            className="p-1.5 rounded-lg border border-[#d4af37]/35 bg-[#faf6ee] text-[#22130b] text-xs focus:outline-hidden focus:border-[#8a1e14]"
          />
        </div>

        <button
          type="submit"
          disabled={actionLoading}
          className="w-full py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#b8952b] active:scale-98 text-[#190e08] font-serif font-bold text-xs shadow-2xs hover:shadow-xs transition-all"
        >
          Lưu điểm thưởng
        </button>
      </form>

      {/* 3. VÙNG NGUY HIỂM COMPACT (DANGER ZONE THON GỌN) */}
      <div className="p-2.5 rounded-xl border border-dashed border-rose-400/40 bg-rose-500/5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-rose-800 font-serif text-[11px] font-bold min-w-0">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span className="truncate">Hủy hội viên & Lưu trữ hồ sơ</span>
        </div>
        <button
          type="button"
          onClick={() => setShowDangerConfirm(true)}
          className="px-2.5 py-1 rounded-md bg-rose-800 hover:bg-rose-900 active:scale-95 text-white font-serif font-bold text-[10px] shrink-0 transition-all"
        >
          Xóa / Hủy
        </button>
      </div>

      {/* 4. PHÒNG THỦ 3 LỚP: ĐƯA VÀO DANH SÁCH CẤM (BLACKLIST) */}
      {!isBlacklisted && (
        <div className="p-2.5 rounded-xl border border-dashed border-stone-400/40 bg-stone-900/5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-stone-900 font-serif text-[11px] font-bold min-w-0">
            <Ban className="w-3.5 h-3.5 text-rose-700 shrink-0" />
            <div className="min-w-0">
              <span className="truncate block text-rose-900 font-bold">Bộ ba phòng thủ: Cấm SĐT + Device + IP</span>
              <span className="text-[10px] text-stone-500 font-sans font-normal truncate block">Chặn triệt để kẻ xấu, bom hàng và phá hoại</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowBlacklistModal(true)}
            className="px-2.5 py-1 rounded-md bg-stone-900 hover:bg-black active:scale-95 text-rose-300 hover:text-white font-serif font-bold text-[10px] shrink-0 transition-all border border-rose-800/40 shadow-xs"
          >
            🚫 Đưa vào danh sách cấm
          </button>
        </div>
      )}

      {/* MODAL XÁC NHẬN 2 BƯỚC HỦY HỘI VIÊN */}
      {showDangerConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-[#fcf9f2] rounded-2xl border-2 border-rose-600 p-4 shadow-2xl space-y-3 text-xs text-[#22130b]">
            <div className="flex items-center justify-between text-rose-800 font-serif font-bold">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Xác nhận hủy hội viên
              </span>
              <button onClick={() => setShowDangerConfirm(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="leading-snug">
              Bạn có chắc chắn muốn hủy tư cách hội viên của <strong className="text-rose-900">{summary?.fullName}</strong> ({summary?.phone})?
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDangerConfirm(false)}
                className="px-3 py-1 rounded-lg border border-stone-300 hover:bg-stone-100 font-serif"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handlePermanentArchive}
                disabled={actionLoading}
                className="px-3.5 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 active:scale-95 text-white font-serif font-bold"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL BLACKLIST 3 LỚP PHÒNG THỦ */}
      <CustomerBlacklistModal
        isOpen={showBlacklistModal}
        onClose={() => setShowBlacklistModal(false)}
        summary={summary}
        onBlacklist={onBlacklist}
        actionLoading={actionLoading}
      />
    </div>
  );
}

import { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Clock,
  AlertTriangle,
  X,
  Ban,
  Trash2,
  Gift
} from 'lucide-react';
import CustomerBlacklistModal from './CustomerBlacklistModal';

const QUICK_POINTS = [50, 100, 200, -50, -100];

const QUICK_POINT_REASONS = [
  { label: '🎁 Sinh nhật', text: 'Quà sinh nhật khách quen' },
  { label: '⭐ Tri ân', text: 'Tri ân khách hàng thân thiết' },
  { label: '❤️ Bù món', text: 'Đền bù đơn chậm / Sai món' },
  { label: '🎁 Đổi quà', text: 'Đổi quà tri ân tại quầy' }
];

const QUICK_REASONS = [
  'Quên MK tại bàn',
  'Nghi vấn đơn ảo',
  'Khách yêu cầu',
  'Vi phạm quy chế'
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
  const [pointsDraft, setPointsDraft] = useState('50');
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
    if (e) e.preventDefault();
    const pts = parseInt(pointsDraft, 10);
    if (isNaN(pts) || pts === 0 || !summary) return;
    await onPointsAdjustment(summary.id, pts, pointsReasonDraft || 'Điều chỉnh điểm tri ân');
    setPointsReasonDraft('');
  };

  const handlePermanentArchive = async () => {
    if (!summary) return;
    await onStatusUpdate(summary.id, 'LOCKED', 'Hủy tư cách hội viên và đưa vào danh sách lưu trữ an toàn');
    setShowDangerConfirm(false);
  };

  if (isSelfOrAdmin) {
    return (
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-3 animate-fadeIn">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
        <span className="font-bold">
          Tài khoản Quản trị viên (Chế độ chỉ đọc an ninh)
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fadeIn text-xs">
      {/* 1. KHỐI TRẠNG THÁI KHÓA TÀI KHOẢN (BANNER TRẠNG THÁI) */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
            isBlacklisted
              ? 'bg-stone-900 text-rose-500'
              : isLocked
              ? 'bg-[#ff3b5c] text-white'
              : 'bg-emerald-600 text-white'
          }`}>
            {isBlacklisted ? (
              <Ban className="w-5 h-5" />
            ) : isLocked ? (
              <Lock className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900 text-sm">
                {isBlacklisted ? 'Đang vào danh sách cấm' : isLocked ? 'Đang bị khóa' : 'Đang hoạt động'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isBlacklisted
                  ? 'bg-stone-900 text-rose-400 border border-rose-700'
                  : isLocked
                  ? 'bg-rose-100 text-[#e11d48]'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {isBlacklisted ? 'BLACKLISTED' : isLocked ? 'LOCKED' : 'ACTIVE'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 truncate">
              {isBlacklisted
                ? (summary?.lockReason || 'Cấm truy cập đa tầng')
                : isLocked
                ? (summary?.lockReason || 'Tạm dừng truy cập hệ thống')
                : 'Tài khoản đặt món & tích điểm thông suốt'}
            </p>
          </div>
        </div>

        {/* Nút hành động trạng thái */}
        {isLocked ? (
          <button
            type="button"
            onClick={() => onUnlock(summary?.id)}
            disabled={actionLoading}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#0a5c43] hover:bg-[#084e37] active:scale-95 text-white text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isBlacklisted ? 'Gỡ cấm / Ân xá' : 'Mở khóa tài khoản'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowLockForm(!showLockForm)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 active:scale-95 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{showLockForm ? 'Đóng lại' : 'Tạm khóa tài khoản'}</span>
          </button>
        )}
      </div>

      {/* Form trượt chọn lý do khi bấm Tạm khóa tài khoản */}
      {!isLocked && showLockForm && (
        <form onSubmit={handleConfirmLock} className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2.5 animate-fadeIn">
          <div className="font-bold text-rose-900 text-xs">Chọn nhanh lý do khóa tài khoản:</div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setLockReasonDraft(r)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  lockReasonDraft === r
                    ? 'bg-rose-700 text-white border-rose-700'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-rose-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Hoặc nhập lý do khác..."
              value={lockReasonDraft}
              onChange={(e) => setLockReasonDraft(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-xs focus:outline-none focus:border-rose-400"
            />
            <button
              type="submit"
              disabled={actionLoading}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-xs shrink-0 cursor-pointer"
            >
              Xác nhận
            </button>
          </div>
        </form>
      )}

      {/* 2. KHỐI ĐIỀU CHỈNH ĐIỂM THƯỞNG (TINH GỌN KHÔNG GIAN) */}
      <form onSubmit={handleAdjustPointsSubmit} className="rounded-2xl border border-stone-200/80 bg-white p-4 space-y-2.5 shadow-2xs">
        {/* Header khối điểm */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
            <Clock className="w-4 h-4 text-stone-700" />
            <span>Điều chỉnh điểm thưởng</span>
          </div>
          <span className="text-sm font-bold text-[#e11d48] font-mono">
            {summary?.availablePoints ?? 0} pts
          </span>
        </div>

        {/* Quick Points Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_POINTS.map((pts) => {
            const isSelected = pointsDraft === pts.toString();
            return (
              <button
                key={pts}
                type="button"
                onClick={() => setPointsDraft(pts.toString())}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0a5c43] text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-800 hover:bg-stone-50'
                }`}
              >
                {pts > 0 ? `+${pts}` : pts}
              </button>
            );
          })}
        </div>

        {/* Quick Reasons Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_POINT_REASONS.map((r) => {
            const isSelected = pointsReasonDraft === r.text;
            return (
              <button
                key={r.label}
                type="button"
                onClick={() => setPointsReasonDraft(r.text)}
                className={`px-2.5 py-1 rounded-xl text-xs font-normal border transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-amber-100 border-amber-300 text-amber-900 font-medium'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Row: 2 Cột gọn gàng */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="relative flex items-center">
            <input
              type="number"
              placeholder="50"
              value={pointsDraft}
              onChange={(e) => setPointsDraft(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-[#f9fafb] text-xs text-stone-900 font-mono focus:bg-white focus:outline-none focus:border-stone-400"
            />
            <span className="absolute right-6 text-[11px] text-stone-400 pointer-events-none">
              điểm ( + / - )
            </span>
          </div>
          <input
            type="text"
            placeholder="Ghi chú lý do..."
            value={pointsReasonDraft}
            onChange={(e) => setPointsReasonDraft(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-[#f9fafb] text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-400"
          />
        </div>

        {/* Full-width Golden Yellow Submit Button */}
        <button
          type="submit"
          disabled={actionLoading}
          className="w-full py-2.5 rounded-xl bg-[#eeb53c] hover:bg-[#dfa62f] active:scale-[0.99] text-stone-900 font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Lưu điều thưởng</span>
        </button>
      </form>

      {/* 3. KHỐI HỦY HỘI VIÊN & TÍCH HỢP TÙY CHỌN DANH SÁCH CẤM */}
      <div className="rounded-2xl border border-rose-100 bg-[#fff5f5] p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <div>
            <div className="text-xs font-bold text-rose-900">
              Hủy hội viên & Lưu trữ hồ sơ
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Ngừng tư cách hội viên và lưu trữ dữ liệu khách hàng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {!isBlacklisted && (
            <button
              type="button"
              onClick={() => setShowBlacklistModal(true)}
              className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium transition-all cursor-pointer shrink-0"
              title="Kích hoạt 3 lớp bảo vệ (SĐT + Thiết bị + IP)"
            >
              🚫 DS Cấm
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowDangerConfirm(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#e11d48] hover:bg-[#cc163e] active:scale-95 text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Trash2 className="w-3 h-3" />
            <span>Xóa / Hủy</span>
          </button>
        </div>
      </div>

      {/* MODAL XÁC NHẬN HỦY HỘI VIÊN */}
      {showDangerConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-rose-200 p-5 shadow-2xl space-y-3 text-xs text-stone-900">
            <div className="flex items-center justify-between text-rose-700 font-bold">
              <span className="flex items-center gap-1.5 text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Xác nhận hủy hội viên
              </span>
              <button onClick={() => setShowDangerConfirm(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="leading-relaxed text-stone-600">
              Bạn có chắc chắn muốn hủy tư cách hội viên của <strong className="text-stone-900">{summary?.fullName}</strong> ({summary?.phone})? Toàn bộ điểm tích lũy sẽ được đóng băng.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowDangerConfirm(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handlePermanentArchive}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-medium shadow-xs"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DANH SÁCH CẤM (3 LỚP PHÒNG THỦ) */}
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

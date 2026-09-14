import React from 'react';

/**
 * [URBAN & RAVEN] GiftVaultLedgerTab
 * Phở Gia Truyền 1986
 *
 * Tab nhật ký điểm thưởng và giao dịch tích điểm của hội viên Tri Kỷ.
 */
function GiftVaultLedgerTab({ user, ledger = [], onClose, openAuthModal }) {
  if (!user) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl bg-black/30 border border-amber-900/40">
        <p className="text-xs text-stone-300 font-serif leading-relaxed">
          Vui lòng đăng nhập tài khoản để theo dõi lịch sử tích điểm và đổi quà của bạn.
        </p>
        <button
          type="button"
          onClick={() => {
            onClose();
            if (openAuthModal) openAuthModal('login');
          }}
          className="mt-3.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#8a1f18] to-[#6a150c] text-amber-100 font-serif font-bold text-xs cursor-pointer shadow-md hover:brightness-110 active:scale-95 transition-all"
        >
          Đăng nhập tài khoản ngay
        </button>
      </div>
    );
  }

  if (ledger.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400 font-serif text-xs rounded-2xl bg-black/30 border border-amber-900/30">
        Chưa có giao dịch tích điểm nào được ghi nhận.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {ledger.map((log) => (
        <div
          key={log.id}
          className="p-3.5 rounded-xl bg-gradient-to-r from-black/50 to-stone-900/40 border border-amber-900/30 flex items-center justify-between text-xs shadow-xs"
        >
          <div className="min-w-0 flex-1">
            <div className="font-serif font-bold text-stone-200 truncate">
              {log.description || log.transactionType}
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5 font-sans">
              {new Date(log.createdAt).toLocaleString('vi-VN')}
            </div>
          </div>
          <div className={`font-mono font-bold text-sm shrink-0 ml-3 ${
            (log.pointsChange || 0) >= 0 ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {(log.pointsChange || 0) >= 0 ? `+${log.pointsChange}` : log.pointsChange} điểm
          </div>
        </div>
      ))}
    </div>
  );
}

export default React.memo(GiftVaultLedgerTab);

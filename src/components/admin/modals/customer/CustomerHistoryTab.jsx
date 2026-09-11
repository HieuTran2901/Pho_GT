import { useState } from 'react';
import { ShoppingBag, Coins, CheckCircle2, Clock, XCircle, History } from 'lucide-react';

const STATUS_BADGES = {
  COMPLETED: { label: 'Hoàn thành', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CONFIRMED: { label: 'Đã nhận', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  PREPARING: { label: 'Đang nấu', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  PENDING: { label: 'Chờ duyệt', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  CANCELLED: { label: 'Đã hủy', bg: 'bg-rose-50 text-rose-700 border-rose-200' }
};

export default function CustomerHistoryTab({ orders = [], transactions = [] }) {
  const [subTab, setSubTab] = useState('orders'); // 'orders' | 'loyalty'

  return (
    <div className="space-y-4 animate-fadeIn text-xs">
      {/* NÚT CHUYỂN TIỂU TAB */}
      <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-xl">
        <button
          type="button"
          onClick={() => setSubTab('orders')}
          className={`flex-1 py-1.5 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'orders' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Đơn hàng ({orders.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('loyalty')}
          className={`flex-1 py-1.5 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'loyalty' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Biến động điểm ({transactions.length})</span>
        </button>
      </div>

      {subTab === 'orders' ? (
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {orders.length === 0 ? (
            <div className="py-12 text-center text-stone-400">
              <ShoppingBag className="w-8 h-8 mx-auto text-stone-300 mb-2" />
              <p className="font-medium text-stone-600">Chưa có lịch sử đơn hàng</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Khách chưa từng phát sinh đơn hàng tại quán.</p>
            </div>
          ) : (
            orders.map((o) => {
              const statusInfo = STATUS_BADGES[o.status] || {
                label: o.status || 'Đang xử lý',
                bg: 'bg-stone-50 text-stone-700 border-stone-200'
              };
              return (
                <div
                  key={o.id || o.orderCode}
                  className="p-3 rounded-xl border border-stone-200/80 bg-white hover:border-stone-300 transition-all flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono font-bold text-xs text-stone-900">
                      #{o.orderCode || (o.id ? o.id.substring(0, 8).toUpperCase() : 'PHO')}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusInfo.bg}`}>
                      {statusInfo.label}
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono hidden sm:inline">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : ''}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold font-mono text-rose-600">
                      {(o.finalAmount || 0).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {transactions.length === 0 ? (
            <div className="py-12 text-center text-stone-400">
              <History className="w-8 h-8 mx-auto text-stone-300 mb-2" />
              <p className="font-medium text-stone-600">Chưa có lịch sử biến động điểm</p>
            </div>
          ) : (
            transactions.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl border border-stone-200/80 bg-white hover:border-stone-300 transition-all flex items-center justify-between text-xs shadow-2xs"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-medium text-stone-800 text-xs truncate">{t.description}</div>
                  <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                    {new Date(t.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`font-mono font-bold text-xs ${
                      t.pointsChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {t.pointsChange >= 0 ? `+${t.pointsChange}` : t.pointsChange} pts
                  </span>
                  <div className="text-[10px] text-stone-400 font-mono">Dư: {t.balanceAfter}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

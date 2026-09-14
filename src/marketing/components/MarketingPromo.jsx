import React, { useState } from 'react';
import { Ticket, Copy, Check, Sparkles } from 'lucide-react';
import { MARKETING_PROMOS } from '../marketingConstants';

export default function MarketingPromo() {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev));
    }, 2500);
  };

  return (
    <section className="py-16 px-4 sm:px-6 bg-[#160804] border-t border-amber-950 text-amber-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-600/30 bg-amber-950/40 text-amber-300 text-xs font-serif uppercase tracking-widest mb-3">
            <Ticket className="w-3.5 h-3.5 text-amber-400" />
            <span>Đặc Quyền Hội Viên & Bạn Mới</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-amber-200">
            Voucher Thưởng Vị — Sưu Tầm Liền Tay
          </h2>
          <p className="text-stone-400 font-serif text-sm sm:text-base mt-2 max-w-xl mx-auto">
            Sao chép mã voucher bên dưới và áp dụng ngay khi tiến hành Đặt Món hoặc Đặt Bàn để hưởng ưu đãi độc quyền.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MARKETING_PROMOS.map((promo) => {
            const isCopied = copiedCode === promo.code;
            return (
              <div
                key={promo.code}
                className="relative overflow-hidden rounded-2xl border border-amber-600/30 bg-gradient-to-br from-stone-900/90 via-[#23120b]/80 to-stone-950/90 p-6 shadow-xl flex flex-col justify-between"
              >
                {/* Decorative border notch */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-serif font-black text-sm tracking-wide border border-amber-500/30 mb-2">
                      {promo.discount}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-amber-100">
                      {promo.title}
                    </h3>
                  </div>
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 opacity-80" />
                </div>

                <p className="text-sm text-stone-300 font-serif mb-6 leading-relaxed">
                  {promo.condition}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-amber-900/30">
                  <div className="text-xs text-stone-400 font-mono">
                    <span className="text-stone-500 block">Hạn dùng:</span>
                    <span className="text-amber-300/90">{promo.expiry}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-200 tracking-wider bg-stone-950/80 px-3 py-1.5 rounded-lg border border-amber-700/40 text-sm">
                      {promo.code}
                    </span>
                    <button
                      onClick={() => handleCopy(promo.code)}
                      aria-label={`Sao chép mã ${promo.code}`}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-serif text-xs font-bold transition-all duration-200 ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 hover:bg-amber-400 text-stone-950 active:scale-95'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã sao chép!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

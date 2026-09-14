import React from 'react';
import { MARKETING_FEATURES } from '../marketingConstants';

export default function MarketingFeatures() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-[#170a06] text-amber-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold mb-2">
            LÝ DO THỰC KHÁCH YÊU THÍCH
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-amber-100">
            Giá Trị Khác Biệt Của Phở Gia Truyền 1986
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MARKETING_FEATURES.map((feat) => (
            <div
              key={feat.id}
              className="relative p-6 sm:p-7 rounded-2xl border border-amber-900/40 bg-stone-900/50 hover:border-amber-500/60 hover:bg-stone-900/80 transition-all duration-300 group shadow-lg"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-700/40 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-950/60 text-amber-300 border border-amber-800/40">
                  {feat.badge}
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold text-amber-100 mb-2.5 group-hover:text-amber-300 transition-colors">
                {feat.title}
              </h3>

              <p className="text-sm font-serif text-stone-300 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

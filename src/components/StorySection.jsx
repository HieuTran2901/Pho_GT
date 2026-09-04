import React from 'react';
import { Clock } from 'lucide-react';
import { HERITAGE_FEATURES } from '../data/menuData';
import useScrollReveal from '../hooks/useScrollReveal';

function StorySection() {
  const [sectionRef, isVisible] = useScrollReveal({ threshold: 0.15 });

  return (
    <section id="story" ref={sectionRef} className="py-20 bg-[#1e130c] text-white relative overflow-hidden">
      {/* Texture & decorative circles */}
      <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Story / Collage */}
          <div className={`lg:col-span-6 relative transition-all duration-700 ${isVisible ? 'reveal-slide-left' : 'opacity-0'}`}>
            <div className="grid grid-cols-2 gap-4">
              {/* Image 1: Cooking Pho Pot */}
              <div className="rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-900/40">
                <img
                  src="https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80"
                  alt="Nồi nước dùng phở ninh liên tục ngày đêm"
                  className="w-full h-64 sm:h-80 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Image 2: Fresh noodles & herbs */}
              <div className="rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-900/40 mt-8">
                <img
                  src="https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=800&q=80"
                  alt="Rau thơm, ớt và quế hoa hồi gia vị phở"
                  className="w-full h-64 sm:h-80 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Experience badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#2c1810] border-2 border-amber-500/50 p-6 rounded-3xl shadow-2xl text-center max-w-xs w-full backdrop-blur-md">
              <div className="text-3xl sm:text-4xl font-serif font-bold text-amber-300">40 Năm</div>
              <div className="text-xs uppercase tracking-widest text-stone-300 mt-1 font-semibold">
                Gìn Giữ Hồn Phở Việt
              </div>
              <p className="text-[11px] text-stone-400 mt-2 italic">
                "Nước dùng ngọt từ tủy, thơm từ thảo mộc, trong vắt như sương sớm hồ Tây."
              </p>
            </div>
          </div>

          {/* Right Column: Narrative Content */}
          <div className={`lg:col-span-6 space-y-6 transition-all duration-700 ${isVisible ? 'reveal-slide-right' : 'opacity-0'}`}>
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              Câu Chuyện Kế Thừa
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-100 leading-tight">
              Bí Quyết Nồi Nước Dùng Không Đổi Suốt 4 Thập Kỷ
            </h2>

            <p className="text-stone-300 text-base leading-relaxed">
              Khởi nguồn từ một gánh phở rong nép mình góc phố cổ Hà Nội năm 1986, trải qua bốn mùa mưa nắng, công thức nấu phở của cụ tổ vẫn được con cháu gìn giữ nguyên vẹn như một lời thề son sắt.
            </p>

            <p className="text-stone-400 text-sm leading-relaxed">
              Chúng tôi không dùng bột ngọt hay hương liệu tạo mùi nhân tạo. Nước dùng được ninh từ xương ống bò tươi cùng quế chi, hoa hồi sao thơm hạ thổ, kết hợp hành gừng nướng cháy xém cạnh trên than hoa.
            </p>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {HERITAGE_FEATURES.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition-all duration-300 ${
                    isVisible ? 'reveal-fade-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${250 + idx * 100}ms` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center text-xs font-bold shrink-0">
                      0{idx + 1}
                    </span>
                    <h3 className="font-serif text-base font-bold text-amber-200">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default React.memo(StorySection);

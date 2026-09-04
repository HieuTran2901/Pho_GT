import React from 'react';
import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../data/menuData';
import useScrollReveal from '../hooks/useScrollReveal';

function Testimonials() {
  const [sectionRef, isVisible] = useScrollReveal({ threshold: 0.12 });

  return (
    <section id="reviews" ref={sectionRef} className="py-20 bg-[#faf6f0] border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className={`text-center max-w-2xl mx-auto mb-14 transition-all duration-700 ${isVisible ? 'reveal-fade-up' : 'opacity-0'}`}>
          <span className="text-brand-red font-bold text-xs uppercase tracking-widest block mb-2">
            Thực Khách Nói Về Chúng Tôi
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
            Tri Kỷ Qua Từng Muỗng Nước Dùng
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Hơn 15.000 lượt đánh giá 5 sao từ thực khách địa phương, văn nghệ sĩ và bạn bè quốc tế.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((review, index) => (
            <div
              key={review.id}
              className={`bg-white rounded-3xl p-8 shadow-md border border-stone-200/70 hover:shadow-2xl hover:-translate-y-1.5 hover:border-amber-400/40 transition-all duration-300 relative flex flex-col justify-between ${
                isVisible ? 'reveal-fade-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${150 + index * 140}ms` }}
            >
              <div>
                {/* Stars */}
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-stone-700 text-sm sm:text-base italic leading-relaxed mb-6">
                  "{review.content}"
                </p>
              </div>

              {/* Reviewer info */}
              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-brand-red/30"
                />
                <div>
                  <h4 className="font-serif font-bold text-stone-900 text-sm">
                    {review.name}
                  </h4>
                  <span className="text-xs text-stone-500">
                    {review.role}
                  </span>
                </div>
              </div>

              {/* Watermark Quote Icon */}
              <Quote className="w-12 h-12 text-stone-100 absolute top-6 right-6 -z-0 pointer-events-none" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default React.memo(Testimonials);

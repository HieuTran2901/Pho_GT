import React from 'react';
import { Calendar, ShieldCheck, Leaf, Soup, ArrowRight } from 'lucide-react';
import SteamEffect from './SteamEffect';

function Hero({ onExploreMenu, onBookTable }) {
  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-[#faf6ef]"
    >
      {/* ========================================================= */}
      {/* --- A. MOBILE & TABLET LAYOUT (< lg: Vertical Heritage Stack) --- */}
      {/* ========================================================= */}
      <div className="lg:hidden w-full pt-[68px] sm:pt-[76px]">
        {/* 1. Top Visual Hero Showcase (Focus on steaming Phở Bowl) */}
        <div className="relative w-full h-[36vh] sm:h-[42vh] min-h-[250px] max-h-[360px] overflow-hidden bg-stone-900 shadow-inner">
          <img
            src="/hero-bg-art.jpg"
            alt="Bát phở bò gia truyền 1986 trên nền phố cổ Hà Nội"
            className="w-full h-full object-cover object-[72%_center] sm:object-[70%_center] select-none"
          />
          {/* Subtle vignette gradient fade towards bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#faf6ef] via-black/15 to-black/30 pointer-events-none" />

          {/* Floating Prestige Seal Stamp 1986 on Image */}
          <div className="absolute top-3.5 right-3.5 z-10 w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#18291e]/90 backdrop-blur-xs border-2 border-amber-400 text-amber-200 flex flex-col items-center justify-center text-center shadow-lg select-none">
            <span className="text-[7px] font-serif uppercase tracking-widest text-amber-300/90 font-medium leading-none">
              GIA TRUYỀN
            </span>
            <span className="text-[7px] text-amber-400/80 italic leading-none my-0.5">— từ —</span>
            <span className="text-xs sm:text-sm font-serif font-black text-amber-100 tracking-wider leading-none">
              1986
            </span>
          </div>
        </div>

        {/* 2. Vintage Parchment Letter Card (Bức Thư Tay Giấy Dó Cổ Điển) */}
        <div className="relative z-10 -mt-7 sm:-mt-9 mx-3 sm:mx-6 rounded-3xl bg-[#faf6ef] border border-amber-900/15 shadow-[0_-8px_25px_rgba(0,0,0,0.06),0_15px_35px_rgba(0,0,0,0.08)] p-5 sm:p-7 space-y-3.5 mb-8">
          
          {/* Heading Group */}
          <div className="space-y-1">
            <div className="font-serif italic text-base sm:text-lg text-[#96281b] font-bold tracking-wide leading-none pl-0.5">
              Nước Dùng Ninh
            </div>
            <div className="flex items-center gap-2.5 my-1">
              <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#1b3425] tracking-tight leading-none italic select-none">
                24 GIỜ
              </h1>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#96281b] flex items-center justify-center text-white shadow-md shadow-red-950/20 shrink-0">
                <Soup className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <h2 className="font-serif text-sm sm:text-base font-black tracking-wider text-[#1b3425] uppercase leading-tight pt-0.5">
              ĐẬM ĐÀ HƯƠNG VỊ PHỞ XƯA
            </h2>
            
            {/* Decorative separator */}
            <div className="flex items-center gap-2 pt-1.5 pb-0.5">
              <span className="w-8 h-px bg-stone-300"></span>
              <span className="w-1.5 h-1.5 rotate-45 bg-[#96281b]"></span>
              <span className="w-8 h-px bg-stone-300"></span>
            </div>
          </div>

          {/* Authentic Story Paragraph */}
          <div className="text-[#3a3028] text-xs sm:text-sm leading-relaxed space-y-1">
            <p>Chúng tôi không làm phở công nghiệp.</p>
            <p>
              Từng tô phở dâng lên thực khách là sự chắt chiu từ{' '}
              <strong className="text-[#96281b] font-bold">100% xương ống bò tươi</strong> hầm cùng quế hoa hồi thảo quả, bánh phở tươi tráng thủ công mỗi sớm mai.
            </p>
          </div>

          {/* 3 Pillars of Quality (Bento 3 Cột Co Giãn Linh Hoạt 100% Không Tràn) */}
          <div className="grid grid-cols-3 gap-1.5 py-2.5 px-2 my-2 rounded-2xl bg-amber-50/70 border border-amber-900/10 text-stone-800">
            {/* Pillar 1 */}
            <div className="flex flex-col items-center text-center p-1">
              <div className="w-8 h-8 rounded-full border border-stone-300/80 bg-white flex items-center justify-center text-[#96281b] shadow-xs mb-1">
                <Soup className="w-4 h-4" />
              </div>
              <div className="text-[10px] sm:text-xs font-black text-[#1b3425] uppercase tracking-tight">
                HẦM 24H
              </div>
              <div className="text-[9px] sm:text-[10px] text-stone-600 leading-tight mt-0.5">
                Ngọt tủy xương
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex flex-col items-center text-center p-1 border-x border-stone-300/60">
              <div className="w-8 h-8 rounded-full border border-stone-300/80 bg-white flex items-center justify-center text-emerald-700 shadow-xs mb-1">
                <Leaf className="w-4 h-4" />
              </div>
              <div className="text-[10px] sm:text-xs font-black text-[#1b3425] uppercase tracking-tight">
                BÁNH PHỞ TƯƠI
              </div>
              <div className="text-[9px] sm:text-[10px] text-stone-600 leading-tight mt-0.5">
                Tráng trong ngày
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex flex-col items-center text-center p-1">
              <div className="w-8 h-8 rounded-full border border-stone-300/80 bg-white flex items-center justify-center text-stone-700 shadow-xs mb-1">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-[10px] sm:text-xs font-black text-[#1b3425] uppercase tracking-tight">
                KHÔNG BỘT NGỌT
              </div>
              <div className="text-[9px] sm:text-[10px] text-stone-600 leading-tight mt-0.5">
                Vị ngọt tự nhiên
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <button
              onClick={onExploreMenu}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#96281b] hover:bg-[#7e1f14] text-white font-bold text-xs tracking-wider shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Soup className="w-4 h-4" />
              <span>XEM THỰC ĐƠN TINH HOA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onBookTable}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs tracking-wider border border-stone-300 shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Calendar className="w-4 h-4 text-stone-700" />
              <span>ĐẶT BÀN GIỮ CHỖ</span>
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* --- B. DESKTOP LAYOUT (hidden lg:block: Aspect-16:9 Composite) --- */}
      {/* ========================================================= */}
      <div className="hidden lg:block relative w-full lg:aspect-[16/9] lg:max-h-[980px]">
        {/* 1. Authentic artistic background with smooth Entrance Zoom-Fade */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none animate-bg-entrance">
          <img
            src="/hero-bg-art.jpg"
            alt="Bát phở bò gia truyền trên nền tranh phố cổ Hà Nội"
            className="w-full h-full object-fill"
          />
        </div>

        {/* 2. REALISTIC STEAM VAPOR CLOUDS FROM BOWL */}
        <SteamEffect />

        {/* 3. Fluid & Percentage-Locked Interactive Text Container */}
        <div className="relative z-20 lg:absolute lg:left-[8%] lg:top-[31%] lg:w-[36%] lg:max-w-[470px] text-left">
          {/* Heading Group */}
          <div className="space-y-1 sm:space-y-1.5">
            <div
              className="font-serif italic text-[clamp(1.15rem,1.7vw,1.7rem)] text-[#96281b] font-bold tracking-wide leading-none pl-1 mb-1 animate-fade-down"
              style={{ animationDelay: '150ms' }}
            >
              Nước Dùng Ninh
            </div>

            <div
              className="flex items-center gap-[clamp(0.5rem,0.85vw,0.85rem)] my-[clamp(0.2rem,0.4vw,0.5rem)] animate-hero-pop"
              style={{ animationDelay: '350ms' }}
            >
              <h1 className="font-serif text-[clamp(2.5rem,4.8vw,5rem)] font-black text-[#1b3425] tracking-tight leading-none italic select-none">
                24 GIỜ
              </h1>
              <div className="w-[clamp(2rem,3vw,3.1rem)] h-[clamp(2rem,3vw,3.1rem)] rounded-full bg-[#96281b] flex items-center justify-center text-white shadow-md shadow-red-950/20 shrink-0">
                <Soup className="w-[56%] h-[56%]" />
              </div>
            </div>

            <div className="animate-fade-up" style={{ animationDelay: '550ms' }}>
              <h2 className="font-serif text-[clamp(1rem,1.75vw,1.75rem)] font-black tracking-wider text-[#1b3425] uppercase leading-tight pt-1">
                ĐẬM ĐÀ HƯƠNG VỊ PHỞ XƯA
              </h2>
              <div className="flex items-center gap-2 pt-3 pb-1.5">
                <span className="w-12 lg:w-[clamp(2rem,3.2vw,3.2rem)] h-px bg-stone-300"></span>
                <span className="w-1.5 h-1.5 rotate-45 bg-[#96281b]"></span>
                <span className="w-12 lg:w-[clamp(2rem,3.2vw,3.2rem)] h-px bg-stone-300"></span>
              </div>
            </div>
          </div>

          {/* Paragraph description */}
          <div
            className="text-[#3a3028] text-[clamp(0.72rem,0.9vw,0.9rem)] font-normal leading-relaxed space-y-1.5 pt-1.5 animate-fade-up"
            style={{ animationDelay: '750ms' }}
          >
            <p>Chúng tôi không làm phở công nghiệp.</p>
            <p>Từng tô phở dâng lên thực khách là sự chắt chiu từ</p>
            <p>
              <strong className="text-[#96281b] font-bold">100% xương ống bò tươi</strong> hầm cùng quế hoa hồi thảo quả,
            </p>
            <p>bánh phở tươi tráng thủ công mỗi sớm mai.</p>
          </div>

          {/* 3 Pillars of quality */}
          <div
            className="flex items-center justify-between gap-1.5 sm:gap-2.5 py-[clamp(0.55rem,0.9vw,0.95rem)] px-1 my-[clamp(0.55rem,0.9vw,1rem)] border-t border-b border-stone-300/80 text-stone-800 animate-fade-up"
            style={{ animationDelay: '950ms' }}
          >
            <div className="flex items-center gap-2 flex-1 min-w-max">
              <div className="w-[clamp(1.5rem,1.9vw,1.9rem)] h-[clamp(1.5rem,1.9vw,1.9rem)] rounded-full border border-stone-300/80 bg-white/70 flex items-center justify-center text-stone-700 shrink-0">
                <Soup className="w-[50%] h-[50%] text-[#96281b]" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[clamp(0.55rem,0.72vw,0.72rem)] font-black text-[#1b3425] uppercase tracking-wide whitespace-nowrap">
                  HẦM 24H
                </div>
                <div className="text-[clamp(0.5rem,0.64vw,0.64rem)] text-stone-600 leading-none whitespace-nowrap">
                  Ngọt từ tủy xương
                </div>
              </div>
            </div>

            <div className="w-px h-[clamp(1.1rem,1.6vw,1.6rem)] bg-stone-300/80 shrink-0 mx-1"></div>

            <div className="flex items-center gap-2 flex-1 min-w-max">
              <div className="w-[clamp(1.5rem,1.9vw,1.9rem)] h-[clamp(1.5rem,1.9vw,1.9rem)] rounded-full border border-stone-300/80 bg-white/70 flex items-center justify-center text-stone-700 shrink-0">
                <Leaf className="w-[50%] h-[50%] text-emerald-700" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[clamp(0.55rem,0.72vw,0.72rem)] font-black text-[#1b3425] uppercase tracking-wide whitespace-nowrap">
                  BÁNH PHỞ TƯƠI
                </div>
                <div className="text-[clamp(0.5rem,0.64vw,0.64rem)] text-stone-600 leading-none whitespace-nowrap">
                  Tráng tay trong ngày
                </div>
              </div>
            </div>

            <div className="w-px h-[clamp(1.1rem,1.6vw,1.6rem)] bg-stone-300/80 shrink-0 mx-1"></div>

            <div className="flex items-center gap-2 flex-1 min-w-max">
              <div className="w-[clamp(1.5rem,1.9vw,1.9rem)] h-[clamp(1.5rem,1.9vw,1.9rem)] rounded-full border border-stone-300/80 bg-white/70 flex items-center justify-center text-stone-700 shrink-0">
                <ShieldCheck className="w-[50%] h-[50%] text-stone-700" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[clamp(0.55rem,0.72vw,0.72rem)] font-black text-[#1b3425] uppercase tracking-wide whitespace-nowrap">
                  KHÔNG BỘT NGỌT
                </div>
                <div className="text-[clamp(0.5rem,0.64vw,0.64rem)] text-stone-600 leading-none whitespace-nowrap">
                  Vị ngọt tự nhiên
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center gap-[clamp(0.6rem,0.9vw,1rem)] pt-2.5 sm:pt-3 animate-fade-up"
            style={{ animationDelay: '1150ms' }}
          >
            <button
              onClick={onExploreMenu}
              className="w-full sm:w-auto px-[clamp(0.85rem,1.3vw,1.4rem)] py-[clamp(0.42rem,0.65vw,0.68rem)] rounded-full bg-[#96281b] hover:bg-[#7e1f14] text-white font-bold text-[clamp(0.62rem,0.78vw,0.78rem)] tracking-wider shadow-md shadow-red-950/20 transition-all flex items-center justify-center gap-1.5 group shrink-0"
            >
              <Soup className="w-[clamp(0.8rem,1vw,1rem)] h-[clamp(0.8rem,1vw,1rem)]" />
              <span>XEM THỰC ĐƠN TINH HOA</span>
              <ArrowRight className="w-[clamp(0.7rem,0.85vw,0.85rem)] h-[clamp(0.7rem,0.85vw,0.85rem)] group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onBookTable}
              className="w-full sm:w-auto px-[clamp(0.85rem,1.3vw,1.4rem)] py-[clamp(0.42rem,0.65vw,0.68rem)] rounded-full bg-white/80 hover:bg-white text-stone-800 font-bold text-[clamp(0.62rem,0.78vw,0.78rem)] tracking-wider border border-stone-400 shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0 backdrop-blur-xs"
            >
              <Calendar className="w-[clamp(0.8rem,1vw,1rem)] h-[clamp(0.8rem,1vw,1rem)] text-stone-700" />
              <span>ĐẶT BÀN GIỮ CHỖ</span>
            </button>
          </div>
        </div>

        {/* 4. Floating Traditional Seal */}
        <div
          className="absolute bottom-[4%] right-[3%] z-20 w-[clamp(4.5rem,7.5vw,7.5rem)] h-[clamp(4.5rem,7.5vw,7.5rem)] rounded-full bg-[#18291e] border-3 border-amber-400/80 text-amber-200 flex flex-col items-center justify-center text-center select-none animate-stamp-drop"
        >
          <div className="text-[clamp(0.45rem,0.65vw,0.65rem)] font-serif uppercase tracking-widest text-amber-300/90 font-medium leading-none">
            GIA TRUYỀN
          </div>
          <div className="text-[clamp(0.45rem,0.65vw,0.65rem)] text-amber-400/70 italic leading-none my-0.5">— từ —</div>
          <div className="text-[clamp(1rem,1.8vw,1.8rem)] font-serif font-black text-amber-100 tracking-wider leading-none">
            1986
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(Hero);

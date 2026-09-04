import React from 'react';
import { Calendar, ShieldCheck, Leaf, Soup, ArrowRight } from 'lucide-react';
import SteamEffect from './SteamEffect';

function Hero({ onExploreMenu, onBookTable }) {
  return (
    <section
      id="hero"
      className="relative w-full min-h-screen lg:min-h-0 lg:aspect-[16/9] lg:max-h-[980px] flex items-center lg:block overflow-hidden bg-[#faf6ef] pt-32 sm:pt-36 lg:pt-0"
    >
      {/* 1. Authentic artistic background with smooth Entrance Zoom-Fade (Proposal 1) */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none animate-bg-entrance">
        <img
          src="/hero-bg-art.jpg"
          alt="Bát phở bò gia truyền trên nền tranh phố cổ Hà Nội"
          className="w-full h-full object-cover object-left-top lg:object-fill"
        />
        {/* Soft parchment gradient on small mobile screens to ensure legibility */}
        <div className="absolute inset-0 bg-[#faf6ef]/90 lg:hidden pointer-events-none"></div>
      </div>

      {/* 2. REALISTIC STEAM VAPOR CLOUDS FROM BOWL */}
      <SteamEffect />

      {/* 3. Fluid & Percentage-Locked Interactive Text Container with Staggered Entrance */}
      <div className="relative z-20 w-full px-6 sm:px-10 lg:px-0 lg:absolute lg:left-[8%] lg:top-[31%] lg:w-[36%] lg:max-w-[470px] text-left">
        
        {/* Heading Group with comfortable vertical breathing room */}
        <div className="space-y-1 sm:space-y-1.5">
          {/* Script Heading (Step 1: Staggered Fade-Down) */}
          <div
            className="font-serif italic text-[clamp(1.15rem,1.7vw,1.7rem)] text-[#96281b] font-bold tracking-wide leading-none pl-1 mb-1 animate-fade-down"
            style={{ animationDelay: '150ms' }}
          >
            Nước Dùng Ninh
          </div>

          {/* Huge 24 GIỜ with red steaming bowl icon (Step 2: Pop-In Entrance) */}
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

          {/* Sub-heading & Divider (Step 3: Fade-Up Entrance) */}
          <div className="animate-fade-up" style={{ animationDelay: '550ms' }}>
            <h2 className="font-serif text-[clamp(1rem,1.75vw,1.75rem)] font-black tracking-wider text-[#1b3425] uppercase leading-tight pt-1">
              ĐẬM ĐÀ HƯƠNG VỊ PHỞ XƯA
            </h2>
            
            {/* Decorative separator line with diamond */}
            <div className="flex items-center gap-2 pt-3 pb-1.5">
              <span className="w-12 lg:w-[clamp(2rem,3.2vw,3.2rem)] h-px bg-stone-300"></span>
              <span className="w-1.5 h-1.5 rotate-45 bg-[#96281b]"></span>
              <span className="w-12 lg:w-[clamp(2rem,3.2vw,3.2rem)] h-px bg-stone-300"></span>
            </div>
          </div>
        </div>

        {/* Paragraph description (Step 4: Fade-Up Entrance) */}
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

        {/* 3 Pillars of quality (Step 5: Fade-Up Entrance) */}
        <div
          className="flex items-center justify-between gap-1.5 sm:gap-2.5 py-[clamp(0.55rem,0.9vw,0.95rem)] px-1 my-[clamp(0.55rem,0.9vw,1rem)] border-t border-b border-stone-300/80 text-stone-800 animate-fade-up"
          style={{ animationDelay: '950ms' }}
        >
          {/* Pillar 1: Hầm 24H */}
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

          {/* Vertical Divider 1 */}
          <div className="w-px h-[clamp(1.1rem,1.6vw,1.6rem)] bg-stone-300/80 shrink-0 mx-1"></div>

          {/* Pillar 2: Bánh Phở Tươi */}
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

          {/* Vertical Divider 2 */}
          <div className="w-px h-[clamp(1.1rem,1.6vw,1.6rem)] bg-stone-300/80 shrink-0 mx-1"></div>

          {/* Pillar 3: Không Bột Ngọt */}
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

        {/* Call To Action Buttons (Step 6: Staggered Fade-Up) */}
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

      {/* 4. Floating Traditional Seal with Stamp Impression Drop & Gold Aura Pulse (Proposal 2) */}
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
    </section>
  );
}

export default React.memo(Hero);

import { memo } from 'react';
import { Utensils } from 'lucide-react';

function NavbarBrandLogo() {
  return (
    <a href="#hero" className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0 group">
      <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border border-[#9b2a1f] sm:border-2 p-0.5 flex items-center justify-center bg-white shadow-sm group-hover:scale-105 transition-transform shrink-0">
        <div className="w-full h-full rounded-full border border-dashed border-[#9b2a1f] flex flex-col items-center justify-center text-[#9b2a1f] leading-none py-0.5 sm:py-1">
          <span className="text-[6px] sm:text-[7px] md:text-[8px] font-bold uppercase tracking-tighter">SINCE</span>
          <Utensils className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 my-0.5" />
          <span className="text-[6px] sm:text-[7px] md:text-[8px] font-bold">1986</span>
        </div>
      </div>

      <div className="text-left shrink-0">
        <div className="font-serif text-base sm:text-xl md:text-2xl 2xl:text-3xl font-black tracking-tight text-[#223326] leading-none whitespace-nowrap">
          PHỞ GIA TRUYỀN
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[10px] md:text-[11px] font-serif text-[#9b2a1f] tracking-wide uppercase font-semibold mt-0.5 sm:mt-1 whitespace-nowrap">
          <span className="hidden min-[1680px]:inline-block w-2.5 md:w-4 h-px bg-[#9b2a1f]/60" />
          <span className="min-[1680px]:hidden">TINH HOA TỪ 1986</span>
          <span className="hidden min-[1680px]:inline">TINH HOA PHỞ VIỆT TỪ NĂM 1986</span>
          <span className="hidden min-[1680px]:inline-block w-2.5 md:w-4 h-px bg-[#9b2a1f]/60" />
        </div>
      </div>
    </a>
  );
}

export default memo(NavbarBrandLogo);

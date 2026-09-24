import { memo } from 'react';
import { Clock, Gift, MapPin } from 'lucide-react';

function NavbarAnnouncementBar() {
  return (
    <div className="bg-[#1b261d] text-amber-100/90 text-xs py-1.5 sm:py-2 px-3 sm:px-8 border-b border-amber-900/30 overflow-hidden w-full max-w-full">
      <div className="max-w-[1700px] mx-auto flex justify-between items-center gap-2">
        {/* Mobile view */}
        <div className="sm:hidden flex items-center justify-between w-full text-[10px]">
          <span className="flex items-center gap-1 font-medium truncate">
            <Clock className="w-3 h-3 text-amber-400 shrink-0" />
            <span>06:00 – 22:30</span>
          </span>
          <span className="text-amber-300 font-medium truncate flex items-center gap-1">
            <Gift className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Tặng 1 đĩa quẩy giòn</span>
          </span>
        </div>

        {/* Desktop/Tablet view */}
        <div className="hidden sm:flex items-center space-x-6">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            06:00 – 22:30 mỗi ngày
          </span>
          <span className="flex items-center gap-1.5 text-stone-300">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            10 Chi nhánh tại Hà Nội & TP. Hồ Chí Minh
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-amber-300 text-xs font-medium">
          <Gift className="w-3.5 h-3.5 text-amber-400" />
          <span>Ưu đãi hôm nay: Tặng 1 đĩa quẩy giòn khi đặt qua website</span>
        </div>
      </div>
    </div>
  );
}

export default memo(NavbarAnnouncementBar);

import React from 'react';
import { ChevronRight } from 'lucide-react';

function HeritageBookMascotFloat({ onClick }) {
  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    // Fallback: trigger chat launcher or tour
    const chatLauncher = document.getElementById('heritage-chat-launcher');
    if (chatLauncher) {
      chatLauncher.click();
    }
  };

  return (
    <div className="flex justify-end mt-4 sm:mt-6">
      <button
        type="button"
        onClick={handleClick}
        className="group inline-flex items-center gap-2.5 px-3.5 sm:px-4 py-2 rounded-full bg-white/95 hover:bg-white text-stone-800 shadow-xl border border-stone-200/80 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
      >
        {/* Chibi Avatar Head */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#fef3c7] border border-amber-300 flex items-center justify-center text-base sm:text-lg overflow-hidden shadow-xs">
          <span>👨‍🍳</span>
        </div>

        <span className="font-serif text-xs sm:text-sm font-semibold text-stone-700 group-hover:text-[#96281b] transition-colors">
          Bạn muốn thử món nào hôm nay?
        </span>

        <div className="w-5 h-5 rounded-full bg-stone-100 group-hover:bg-[#96281b] group-hover:text-white flex items-center justify-center text-stone-500 transition-colors">
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </button>
    </div>
  );
}

export default React.memo(HeritageBookMascotFloat);

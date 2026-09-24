import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function BookPagination({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onSelectPage,
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 mt-3 sm:mt-4">
      <div className="inline-flex items-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#fbf6ee]/90 backdrop-blur-md border border-[#e2d4c0] shadow-md">
        {/* Previous Button */}
        <button
          type="button"
          onClick={onPrevPage}
          disabled={currentPage === 1}
          aria-label="Trang trước"
          className="w-8 h-8 rounded-full flex items-center justify-center text-stone-700 hover:bg-[#eadecc] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#3e1f14]" />
        </button>

        {/* Dots / Page Indicators */}
        <div className="flex items-center gap-1.5 px-2">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={`page-dot-${pageNum}`}
                type="button"
                onClick={() => onSelectPage(pageNum)}
                aria-label={`Tới trang ${pageNum}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'w-6 sm:w-8 bg-[#96281b]'
                    : 'w-2 bg-stone-300 hover:bg-stone-400'
                }`}
              />
            );
          })}
        </div>

        {/* Subtitle */}
        <span className="text-[11px] sm:text-xs font-serif font-medium text-stone-600 hidden xs:inline-block px-1">
          Khám phá thêm món ngon
        </span>

        {/* Next Button */}
        <button
          type="button"
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          aria-label="Trang tiếp theo"
          className="w-8 h-8 rounded-full flex items-center justify-center text-stone-700 hover:bg-[#eadecc] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#3e1f14]" />
        </button>
      </div>
    </div>
  );
}

export default React.memo(BookPagination);

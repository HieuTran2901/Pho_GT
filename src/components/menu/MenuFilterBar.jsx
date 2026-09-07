import React from 'react';
import {
  Search,
  Heart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CATEGORY_MOBILE_CONFIG } from './menuConstants';

function MenuFilterBar({
  controlsRef,
  isControlsVisible,
  scrollCategories,
  canScrollLeft,
  canScrollRight,
  scrollContainerRef,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  allCategories,
  activeCategory,
  handleCategoryClick,
  favTabJiggle,
  favoriteIds,
  mobileSearchOpen,
  setMobileSearchOpen,
  searchQuery,
  setSearchQuery,
  mobileSearchInputRef
}) {
  return (
    <div
      ref={controlsRef}
      className={`sticky top-[78px] sm:top-[104px] lg:top-[112px] z-30 bg-[#faf6ef]/95 backdrop-blur-md py-2.5 sm:py-3.5 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 sm:mb-12 border-b border-stone-300/60 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-2.5 lg:gap-5 transition-all duration-700 ${
        isControlsVisible ? 'reveal-fade-up' : 'opacity-0'
      }`}
    >
      {/* Category Carousel Container */}
      <div className="relative flex items-center flex-1 w-full min-w-0 gap-1.5 sm:gap-2">
        {/* Left Scroll Arrow (Desktop only) */}
        <button
          type="button"
          onClick={() => scrollCategories('left')}
          disabled={!canScrollLeft}
          aria-label="Cuộn danh mục sang trái"
          className="hidden lg:flex w-9 h-9 rounded-full bg-white border border-stone-200 shadow-sm items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-50 hover:shadow transition-all duration-200 shrink-0 active:scale-95 disabled:opacity-20 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Categories List */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1 px-0.5 scroll-smooth select-none cursor-grab active:cursor-grabbing min-w-0 flex-1 touch-pan-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {allCategories.map((cat) => {
            const mobileConfig = CATEGORY_MOBILE_CONFIG[cat.id];
            const isFav = cat.id === 'favorites';
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                id={`category-tab-${cat.id}`}
                onClick={() => handleCategoryClick(cat.id)}
                className={`whitespace-nowrap px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 flex items-center shrink-0 active:scale-95 ${
                  isFav && favTabJiggle
                    ? 'animate-heart-tab-jiggle ring-2 ring-rose-400/80 shadow-[0_0_16px_rgba(225,29,72,0.4)]'
                    : ''
                } ${
                  isActive
                    ? 'bg-[#96281b] text-white shadow-md shadow-red-950/25'
                    : 'bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 border border-stone-300/80 shadow-2xs'
                }`}
              >
                {isFav && (
                  <Heart
                    className={`w-3.5 h-3.5 mr-1 sm:mr-1.5 transition-colors ${
                      isActive
                        ? 'fill-white text-white'
                        : 'fill-[#ff2e63] text-[#ff2e63]'
                    }`}
                  />
                )}
                {/* Mobile concise label with icon */}
                <span className="sm:hidden flex items-center gap-1">
                  {mobileConfig?.icon && <span>{mobileConfig.icon}</span>}
                  <span>{mobileConfig?.shortName || cat.name}</span>
                </span>
                {/* Desktop full name */}
                <span className="hidden sm:inline">{cat.name}</span>

                {isFav && favoriteIds.length > 0 && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-rose-100 text-[#96281b]'
                    }`}
                  >
                    {favoriteIds.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow (Desktop only) */}
        <button
          type="button"
          onClick={() => scrollCategories('right')}
          disabled={!canScrollRight}
          aria-label="Cuộn danh mục sang phải"
          className="hidden lg:flex w-9 h-9 rounded-full bg-white border border-stone-200 shadow-sm items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-50 hover:shadow transition-all duration-200 shrink-0 active:scale-95 disabled:opacity-20 disabled:pointer-events-none"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Mobile Inline Search Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileSearchOpen((prev) => !prev)}
          aria-label={mobileSearchOpen ? 'Đóng ô tìm kiếm' : 'Mở ô tìm kiếm'}
          className={`lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 active:scale-90 ${
            mobileSearchOpen || searchQuery
              ? 'bg-[#96281b] text-white shadow-md'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-300/80 shadow-2xs'
          }`}
        >
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Collapsible Mobile Search Input */}
      {(mobileSearchOpen || searchQuery) && (
        <div className="lg:hidden w-full pt-1 sm:pt-2">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              ref={mobileSearchInputRef}
              type="text"
              placeholder="Tìm món phở, nguyên liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-14 py-2 text-xs bg-white rounded-full border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#96281b]/30 focus:border-[#96281b] transition-all shadow-inner"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#96281b] hover:text-[#781f15]"
              >
                Xóa
              </button>
            ) : (
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-stone-400 hover:text-stone-600 font-medium"
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      )}

      {/* Desktop Search Input Bar */}
      <div className="hidden lg:block relative w-72 shrink-0">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Tìm món phở, nguyên liệu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white rounded-full border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#96281b]/30 focus:border-[#96281b] transition-all shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 font-semibold"
          >
            Xóa
          </button>
        )}
      </div>
    </div>
  );
}

export default React.memo(MenuFilterBar);

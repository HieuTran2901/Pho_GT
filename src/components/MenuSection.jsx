import React from 'react';
import {
  Sparkles,
  Search,
  AlertCircle,
  Heart,
  Soup
} from 'lucide-react';
import FlyingHeart from './FlyingHeart';
import MenuCard from './menu/MenuCard';
import MenuFilterBar from './menu/MenuFilterBar';
import DishDetailModal from './menu/DishDetailModal';
import { useMenuSectionState } from './menu/useMenuSectionState';
import { FOOD_GROUPS, GROUP_HEADER_CONFIG, INITIAL_GROUP_LIMIT } from './menu/menuConstants';

function MenuSection({ onAddToCart }) {
  const {
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    favoriteIds,
    favoriteIdsSet,
    addedItemIdsSet,
    flyingHearts,
    handleFlyHeartComplete,
    favTabJiggle,
    mobileSearchOpen,
    setMobileSearchOpen,
    selectedDetailItem,
    setSelectedDetailItem,
    expandedGroups,
    toggleGroupExpand,
    dishSyncTime,
    groupedItems,
    filteredItems,
    toggleFavorite,
    handleAdd,
    headerRef,
    isHeaderVisible,
    controlsRef,
    isControlsVisible,
    scrollContainerRef,
    mobileSearchInputRef,
    canScrollLeft,
    canScrollRight,
    allCategories,
    scrollCategories,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleCategoryClick,
  } = useMenuSectionState(onAddToCart);

  return (
    <section id="menu" className="py-8 sm:py-16 lg:py-24 bg-[#faf6ef] relative border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div ref={headerRef} className={`text-center max-w-3xl mx-auto mb-6 sm:mb-10 lg:mb-14 transition-all duration-700 ${isHeaderVisible ? 'reveal-fade-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-[#96281b]/10 text-[#96281b] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3 border border-[#96281b]/20">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Thực Đơn Tinh Hoa</span>
            {dishSyncTime && (
              <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-medium lowercase tracking-normal flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                trực tiếp từ bếp
              </span>
            )}
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-[#1b3425] mb-2 sm:mb-4 leading-tight">
            Bát Phở Chuẩn Vị — Ấm Lòng Thực Khách
          </h2>
          <p className="text-stone-600 text-xs leading-relaxed sm:hidden px-2">
            Phục vụ nóng bỏng tay, giữ trọn vị ngọt tủy xương & bánh phở tráng tươi mỗi sớm mai.
          </p>
          <p className="hidden sm:block text-stone-600 text-sm sm:text-base leading-relaxed">
            Mỗi bát phở được phục vụ nóng bỏng tay, giữ trọn vẹn vị ngọt đậm đà từ tủy xương, thịt bò mềm mại cùng bánh phở dai mướt tráng thủ công mỗi sớm mai.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <MenuFilterBar
          controlsRef={controlsRef}
          isControlsVisible={isControlsVisible}
          scrollCategories={scrollCategories}
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          scrollContainerRef={scrollContainerRef}
          handleMouseDown={handleMouseDown}
          handleMouseMove={handleMouseMove}
          handleMouseUp={handleMouseUp}
          allCategories={allCategories}
          activeCategory={activeCategory}
          handleCategoryClick={handleCategoryClick}
          favTabJiggle={favTabJiggle}
          favoriteIds={favoriteIds}
          mobileSearchOpen={mobileSearchOpen}
          setMobileSearchOpen={setMobileSearchOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          mobileSearchInputRef={mobileSearchInputRef}
        />

        {/* Main Food Catalog / Search / Favorites Views */}
        {searchQuery ? (
          /* Search Results View */
          filteredItems.length > 0 ? (
            <div className="animate-fadeIn">
              <div className="mb-5 sm:mb-7 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#96281b]" />
                  <h3 className="font-serif text-base sm:text-xl font-bold text-[#1b3425]">
                    Kết quả tìm kiếm cho "{searchQuery}"
                  </h3>
                </div>
                <span className="text-xs font-bold text-[#96281b] bg-[#96281b]/10 px-2.5 py-1 rounded-full border border-[#96281b]/20">
                  {filteredItems.length} món
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8">
                {filteredItems.map((item, index) => (
                  <MenuCard
                    key={`search-${item.id}`}
                    item={item}
                    index={index}
                    isAdded={addedItemIdsSet.has(item.id)}
                    onAdd={handleAdd}
                    isLiked={favoriteIdsSet.has(item.id)}
                    onToggleLike={toggleFavorite}
                    onOpenDetail={setSelectedDetailItem}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-stone-300 max-w-lg mx-auto animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-800 mb-2">
                Không tìm thấy món phù hợp
              </h3>
              <p className="text-stone-500 text-sm mb-6">
                Rất tiếc không có món nào khớp với từ khóa "{searchQuery}". Bạn có thể thử tìm theo tên khác hoặc đặt lại bộ lọc.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-2.5 rounded-full bg-[#96281b] text-white text-sm font-semibold shadow-md hover:bg-[#7e1f14] transition-colors cursor-pointer"
              >
                Xem Toàn Bộ Thực Đơn
              </button>
            </div>
          )
        ) : activeCategory === 'favorites' ? (
          /* Favorites View */
          filteredItems.length > 0 ? (
            <div className="animate-fadeIn">
              <div className="mb-5 sm:mb-7 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                  <h3 className="font-serif text-base sm:text-xl font-bold text-[#1b3425]">
                    Món Ăn Yêu Thích Của Bạn
                  </h3>
                </div>
                <span className="text-xs font-bold text-[#96281b] bg-[#96281b]/10 px-2.5 py-1 rounded-full border border-[#96281b]/20">
                  {filteredItems.length} món
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8">
                {filteredItems.map((item, index) => (
                  <MenuCard
                    key={`fav-${item.id}`}
                    item={item}
                    index={index}
                    isAdded={addedItemIdsSet.has(item.id)}
                    onAdd={handleAdd}
                    isLiked={favoriteIdsSet.has(item.id)}
                    onToggleLike={toggleFavorite}
                    onOpenDetail={setSelectedDetailItem}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-rose-200 max-w-lg mx-auto shadow-sm animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-[#96281b] flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-xs">
                <Heart className="w-8 h-8 fill-[#96281b]" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
                Chưa có món ăn yêu thích nào
              </h3>
              <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                Hãy nhấn vào biểu tượng trái tim ở góc mỗi thẻ món để lưu lại các bát phở hợp khẩu vị của bạn nhé!
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="px-6 py-2.5 rounded-full bg-[#96281b] text-white text-sm font-semibold shadow-md hover:bg-[#7e1f14] transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Khám Phá Toàn Bộ Thực Đơn</span>
              </button>
            </div>
          )
        ) : (
          /* Normal Continuous Catalog View: Grouped by Category with ScrollSpy & Progressive Load More */
          <div className="space-y-12 sm:space-y-16">
            {FOOD_GROUPS.map((grp) => {
              const headerConfig = GROUP_HEADER_CONFIG[grp.id];
              const groupItems = groupedItems[grp.id] || [];
              const isExpanded = !!expandedGroups[grp.id];
              const visibleItems = isExpanded ? groupItems : groupItems.slice(0, INITIAL_GROUP_LIMIT);

              return (
                <div
                  key={grp.id}
                  id={`category-section-${grp.id}`}
                  className="scroll-mt-36 transition-all duration-300"
                >
                  {/* Heritage Section Header */}
                  <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 pb-2.5 sm:pb-3 border-b border-stone-300/70">
                    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#96281b]/10 to-[#96281b]/5 border border-[#96281b]/20 flex items-center justify-center text-lg sm:text-xl shadow-2xs shrink-0">
                        {headerConfig.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-base sm:text-2xl font-bold text-[#1b3425] leading-snug truncate">
                            {headerConfig.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-[#96281b]/10 text-[#96281b] border border-[#96281b]/20 shrink-0">
                            {groupItems.length} món
                          </span>
                        </div>
                        <p className="text-stone-500 text-xs sm:text-sm truncate hidden sm:block mt-0.5">
                          {headerConfig.subtitle}
                        </p>
                      </div>
                    </div>

                    <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100/70 border border-amber-300/60 px-3 py-1 rounded-full uppercase tracking-wider">
                      <span>✨</span>
                      <span>{headerConfig.badge}</span>
                    </span>
                  </div>

                  {/* Dishes Grid */}
                  <div
                    id={`food-grid-${grp.id}`}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8"
                  >
                    {visibleItems.map((item, index) => (
                      <MenuCard
                        key={`${grp.id}-${item.id}`}
                        item={item}
                        index={index}
                        isAdded={addedItemIdsSet.has(item.id)}
                        onAdd={handleAdd}
                        isLiked={favoriteIdsSet.has(item.id)}
                        onToggleLike={toggleFavorite}
                        onOpenDetail={setSelectedDetailItem}
                      />
                    ))}
                  </div>

                  {/* Progressive Load More / Expand Button */}
                  {groupItems.length > INITIAL_GROUP_LIMIT && (
                    <div className="mt-4 sm:mt-6 text-center">
                      <button
                        type="button"
                        onClick={() => toggleGroupExpand(grp.id)}
                        className="inline-flex items-center gap-2 px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold bg-white hover:bg-stone-50 text-stone-700 border border-stone-300/80 shadow-2xs hover:shadow transition-all duration-200 active:scale-95 cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <span>Thu gọn bớt {headerConfig.title}</span>
                            <span className="text-[#96281b] font-bold">↑</span>
                          </>
                        ) : (
                          <>
                            <span>Xem thêm {groupItems.length - INITIAL_GROUP_LIMIT} món {headerConfig.title} khác</span>
                            <span className="text-[#96281b] font-bold">↓</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* View Full Menu CTA Button */}
            <div className="pt-6 sm:pt-10 text-center">
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                  const el = document.getElementById('menu');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#fbf6ee] hover:bg-[#f3e9dc] text-stone-800 font-bold text-sm border border-[#e8ddce] transition-all shadow-sm hover:shadow-md active:scale-95 group cursor-pointer"
              >
                <Soup className="w-4 h-4 text-[#96281b] group-hover:scale-110 transition-transform" />
                <span>Xem lại từ đầu thực đơn</span>
                <span className="text-[#96281b] font-bold group-hover:translate-x-1 transition-transform">↑</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Mobile Dish Detail Bottom Sheet */}
      <DishDetailModal
        selectedDetailItem={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        isLiked={selectedDetailItem ? favoriteIdsSet.has(selectedDetailItem.id) : false}
        onToggleLike={toggleFavorite}
        onAdd={handleAdd}
      />

      {/* Proposal 2: Parabolic Flying Hearts to Category Tab */}
      {flyingHearts.map((fly) => (
        <FlyingHeart
          key={fly.id}
          fly={fly}
          onComplete={handleFlyHeartComplete}
        />
      ))}
    </section>
  );
}

export default React.memo(MenuSection);

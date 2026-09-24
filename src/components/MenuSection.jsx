import React from 'react';
import { AlertCircle, Search } from 'lucide-react';
import FlyingHeart from './FlyingHeart';
import MenuCard from './menu/MenuCard';
import DishDetailModal from './menu/DishDetailModal';
import DishCustomizerModal from './menu/DishCustomizerModal';
import HeritageBookSection from './menu/heritageBook/HeritageBookSection';
import { useMenuSectionState } from './menu/useMenuSectionState';

function MenuSection({ onAddToCart }) {
  const {
    dishes,
    searchQuery,
    setSearchQuery,
    favoriteIdsSet,
    addedItemIdsSet,
    flyingHearts,
    handleFlyHeartComplete,
    selectedDetailItem,
    setSelectedDetailItem,
    filteredItems,
    toggleFavorite,
    handleAdd,
    customizingDish,
    setCustomizingDish,
    handleOpenCustomizer,
    handleCloseCustomizer,
  } = useMenuSectionState(onAddToCart);

  return (
    <section id="menu" className="relative bg-[#160e09] border-t border-[#3e2417] scroll-mt-24">
      {/* Defensive anchor alias for backwards compatibility */}
      <span id="menu-catalog" className="absolute -top-24 pointer-events-none" aria-hidden="true" />
      {/* 1. If user is actively searching with global search query: show search results view */}
      {searchQuery ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {filteredItems.length > 0 ? (
            <div className="animate-fadeIn">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#caa876]" />
                  <h3 className="font-serif text-lg sm:text-2xl font-bold text-[#fbf6ee]">
                    Kết quả tìm kiếm cho "{searchQuery}"
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#caa876] hover:underline cursor-pointer font-serif"
                >
                  Xóa tìm kiếm (Quay lại Sổ Tay)
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                    onOpenCustomizer={handleOpenCustomizer}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-[#23150e] rounded-3xl border border-stone-700 max-w-lg mx-auto animate-fadeIn text-stone-200">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-[#caa876]" />
              <h3 className="font-serif text-lg font-bold mb-2">Không tìm thấy món "{searchQuery}"</h3>
              <p className="text-xs text-stone-400 mb-5">
                Bác thử gõ "tái lăn", "gà đồi", "sốt vang", hoặc xem trọn vẹn trong Sổ Tay Thực Khách nhé!
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-6 py-2.5 rounded-full bg-[#96281b] hover:bg-[#7e1f14] text-white text-xs font-bold font-serif shadow-md transition-all cursor-pointer"
              >
                Trở lại Sổ Tay Thực Khách
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Primary View: Heritage Open-Book Showcase (Option 1) */
        <HeritageBookSection
          dishes={dishes}
          favoriteIdsSet={favoriteIdsSet}
          addedItemIdsSet={addedItemIdsSet}
          onToggleFavorite={toggleFavorite}
          onAddToCart={handleAdd}
          onOpenCustomizer={handleOpenCustomizer}
        />
      )}

      {/* Mobile Dish Detail Bottom Sheet */}
      <DishDetailModal
        selectedDetailItem={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        isLiked={selectedDetailItem ? favoriteIdsSet.has(selectedDetailItem.id) : false}
        onToggleLike={toggleFavorite}
        onAdd={handleAdd}
        onOpenCustomizer={handleOpenCustomizer}
      />

      {/* Heritage 1986 Gu Phở Customizer Modal */}
      <DishCustomizerModal
        isOpen={Boolean(customizingDish)}
        onClose={handleCloseCustomizer}
        dish={customizingDish}
        onConfirmAdd={handleAdd}
      />

      {/* Flying Hearts to Category Tab */}
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

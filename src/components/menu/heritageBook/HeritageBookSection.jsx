import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BookLeftPage from './BookLeftPage';
import BookRightPage from './BookRightPage';
import BookPagination from './BookPagination';
import HeritageBookMascotFloat from './HeritageBookMascotFloat';
import { useHeritageAudio } from './useHeritageAudio';

const BOOK_CATEGORIES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'favorites', name: 'Yêu thích' },
  { id: 'pho-bo', name: 'Phở bò' },
  { id: 'pho-ga', name: 'Phở gà' },
  { id: 'special', name: 'Đặc sản' },
  { id: 'sides', name: 'Đồ uống & Kèm' },
];

const ITEMS_PER_PAGE = 4;
const EMPTY_SET = new Set();

function HeritageBookSection({
  dishes = [],
  favoriteIdsSet = EMPTY_SET,
  addedItemIdsSet = EMPTY_SET,
  onToggleFavorite,
  onAddToCart,
  onOpenCustomizer,
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState(null);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'detail'

  const { isSoundEnabled, toggleSound, playFlipSound } = useHeritageAudio();

  // Filter dishes by active category & in-book search query
  const filteredDishes = useMemo(() => {
    if (!dishes || dishes.length === 0) return [];
    let list = dishes;
    if (activeCategory === 'favorites') {
      list = list.filter((d) => favoriteIdsSet.has(d.id));
    } else if (activeCategory !== 'all') {
      list = list.filter((d) => d.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (d) =>
          (d.name && d.name.toLowerCase().includes(q)) ||
          (d.description && d.description.toLowerCase().includes(q)) ||
          (d.tag && d.tag.toLowerCase().includes(q))
      );
    }
    return list;
  }, [dishes, activeCategory, searchQuery, favoriteIdsSet]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredDishes.length / ITEMS_PER_PAGE));
  }, [filteredDishes]);

  const totalPagesRef = useRef(totalPages);
  totalPagesRef.current = totalPages;
  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;

  // Current slice of dishes for the left page
  const pageDishes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDishes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredDishes, currentPage]);

  // Always compute active dish immediately so right page is never blank
  const activeDish = useMemo(() => {
    if (selectedDish && pageDishes.some((d) => d.id === selectedDish.id)) {
      return selectedDish;
    }
    return pageDishes[0] || filteredDishes[0] || null;
  }, [selectedDish, pageDishes, filteredDishes]);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setSelectedDish(null);
    setMobileView('list');
  }, []);

  const handleSelectCategory = useCallback((catId) => {
    setActiveCategory(catId);
    setSearchQuery('');
    setDirection(1);
    setCurrentPage(1);
    setSelectedDish(null);
    setMobileView('list');
    playFlipSound();
  }, [playFlipSound]);

  const handlePrevPage = useCallback(() => {
    if (currentPageRef.current > 1) {
      const prevPage = Math.max(1, currentPageRef.current - 1);
      currentPageRef.current = prevPage;
      setDirection(-1);
      setCurrentPage(prevPage);
      setSelectedDish(null);
      setMobileView('list');
      playFlipSound();
    }
  }, [playFlipSound]);

  const handleNextPage = useCallback(() => {
    if (currentPageRef.current < totalPagesRef.current) {
      const nextPage = Math.min(totalPagesRef.current, currentPageRef.current + 1);
      currentPageRef.current = nextPage;
      setDirection(1);
      setCurrentPage(nextPage);
      setSelectedDish(null);
      setMobileView('list');
      playFlipSound();
    }
  }, [playFlipSound]);

  const handleSelectPage = useCallback((pageNum) => {
    if (pageNum !== currentPageRef.current) {
      const dir = pageNum > currentPageRef.current ? 1 : -1;
      currentPageRef.current = pageNum;
      setDirection(dir);
      setCurrentPage(pageNum);
      setSelectedDish(null);
      setMobileView('list');
      playFlipSound();
    }
  }, [playFlipSound]);

  // Auto-clamp currentPage if totalPages shrinks below currentPage (e.g., un-favoriting dishes)
  useEffect(() => {
    if (currentPage > totalPages) {
      const clamped = Math.max(1, totalPages);
      currentPageRef.current = clamped;
      setCurrentPage(clamped);
    }
  }, [currentPage, totalPages]);

  const handleSelectDishOnMobile = useCallback((dish) => {
    setSelectedDish(dish);
    setMobileView('detail');
    playFlipSound();
  }, [playFlipSound]);

  const handleBackToList = useCallback(() => {
    setMobileView('list');
    playFlipSound();
  }, [playFlipSound]);

  // Keyboard Navigation: ArrowLeft / ArrowRight to flip pages
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept browser/OS shortcuts (e.g. Alt+Left for Back)
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      // Don't intercept when user is typing in inputs or contentEditable elements
      const activeTag = document.activeElement?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;
      if (document.activeElement?.isContentEditable) return;

      // Don't flip pages when focus is inside a modal dialog or drawer
      if (document.activeElement?.closest('[role="dialog"]') || document.activeElement?.closest('dialog')) return;

      if (e.key === 'ArrowLeft') {
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        handleNextPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevPage, handleNextPage]);

  const isSelectedLiked = useMemo(() => {
    return activeDish ? favoriteIdsSet.has(activeDish.id) : false;
  }, [activeDish, favoriteIdsSet]);

  const isSelectedAdded = useMemo(() => {
    return activeDish ? addedItemIdsSet.has(activeDish.id) : false;
  }, [activeDish, addedItemIdsSet]);

  return (
    <div
      id="menu-dish-showcase"
      data-tour="menu-dish-showcase"
      className="relative py-4 sm:py-6 lg:py-8 bg-[#160e09] text-stone-100 overflow-hidden"
    >
      {/* Warm Ambient Glowing Radial Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[700px] bg-gradient-to-tr from-[#96281b]/15 via-[#caa876]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Floating Botanical Leaves Motif */}
      <div className="absolute top-6 left-12 text-[#caa876]/20 text-2xl select-none pointer-events-none hidden lg:block animate-pulse">
        🍃
      </div>
      <div className="absolute bottom-10 right-16 text-[#caa876]/15 text-3xl select-none pointer-events-none hidden lg:block">
        🌿
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Showcase Layout: Open Heritage Book (Spacious & Compact Viewport Fit) */}
        <div className="w-full max-w-6xl mx-auto">
          {/* Central Open Book Container */}
          <div className="w-full bg-[#3e1f14] p-2.5 sm:p-3.5 rounded-[30px] shadow-2xl border-2 border-[#5c3523] relative">
            {/* Leather Stitching / Spine Visual Crease */}
            <div className="hidden md:block absolute top-3 bottom-3 left-1/2 -translate-x-1/2 w-7 bg-gradient-to-r from-black/20 via-black/40 to-black/20 z-20 pointer-events-none rounded-sm" />

            {/* Double Page Layout (Desktop >= md) */}
            <div className="hidden md:grid md:grid-cols-2 min-h-[500px] lg:min-h-[520px] rounded-[24px] overflow-hidden bg-[#fbf7ee]">
              {/* Left Page: Categories & Dishes List */}
              <BookLeftPage
                categories={BOOK_CATEGORIES}
                activeCategory={activeCategory}
                onSelectCategory={handleSelectCategory}
                dishes={pageDishes}
                selectedDish={activeDish}
                onSelectDish={setSelectedDish}
                currentPage={currentPage}
                totalPages={totalPages}
                direction={direction}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
                isSoundEnabled={isSoundEnabled}
                onToggleSound={toggleSound}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                favoriteIdsSet={favoriteIdsSet}
                onToggleFavorite={onToggleFavorite}
              />

              {/* Right Page: Active Selected Dish Detail */}
              <BookRightPage
                key={activeDish?.id || 'empty'}
                dish={activeDish}
                isLiked={isSelectedLiked}
                onToggleLike={onToggleFavorite}
                onAddToCart={onAddToCart}
                onOpenCustomizer={onOpenCustomizer}
                isAdded={isSelectedAdded}
              />
            </div>

            {/* Single Pocket Book Page with 3D Flip (Mobile < md) */}
            <div className="md:hidden min-h-[510px] rounded-[24px] overflow-hidden bg-[#fbf7ee] relative [perspective:1000px]">
              <AnimatePresence mode="wait" initial={false}>
                {mobileView === 'list' ? (
                  <motion.div
                    key="mobile-book-list"
                    initial={{ rotateY: -30, opacity: 0, scale: 0.97 }}
                    animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                    exit={{ rotateY: 30, opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="w-full h-full flex flex-col"
                  >
                    <BookLeftPage
                      categories={BOOK_CATEGORIES}
                      activeCategory={activeCategory}
                      onSelectCategory={handleSelectCategory}
                      dishes={pageDishes}
                      selectedDish={activeDish}
                      onSelectDish={handleSelectDishOnMobile}
                      onQuickAdd={onAddToCart}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      direction={direction}
                      onPrevPage={handlePrevPage}
                      onNextPage={handleNextPage}
                      isSoundEnabled={isSoundEnabled}
                      onToggleSound={toggleSound}
                      searchQuery={searchQuery}
                      onSearchChange={handleSearchChange}
                      favoriteIdsSet={favoriteIdsSet}
                      onToggleFavorite={onToggleFavorite}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="mobile-book-detail"
                    initial={{ rotateY: 30, opacity: 0, scale: 0.97 }}
                    animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                    exit={{ rotateY: -30, opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="w-full h-full flex flex-col"
                  >
                    <BookRightPage
                      key={activeDish?.id || 'empty'}
                      dish={activeDish}
                      isLiked={isSelectedLiked}
                      onToggleLike={onToggleFavorite}
                      onAddToCart={onAddToCart}
                      onOpenCustomizer={onOpenCustomizer}
                      isAdded={isSelectedAdded}
                      onBackToList={handleBackToList}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Book Pagination Controls (Visible on desktop; on mobile only when browsing list) */}
        <div className={mobileView === 'detail' ? 'hidden md:block' : 'block'}>
          <BookPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            onSelectPage={handleSelectPage}
          />
        </div>

        {/* Bottom Vintage Calligraphy Sketched Watermarks */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-800/40 text-stone-500 font-serif text-xs px-2">
          <div className="flex items-center gap-2">
            <span className="text-[#caa876] font-serif italic text-xs sm:text-sm">
              ~ Hương vị truyền thống ~
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#caa876] font-serif italic text-xs sm:text-sm">
              ~ Tinh hoa Ẩm thực Việt ~
            </span>
          </div>
        </div>

        {/* Mascot Suggestion Float */}
        <HeritageBookMascotFloat />
      </div>
    </div>
  );
}

export default React.memo(HeritageBookSection);

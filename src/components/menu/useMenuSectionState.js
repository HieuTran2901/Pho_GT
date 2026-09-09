import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { MENU_CATEGORIES, MENU_ITEMS } from '../../data/menuData';
import { dishApi } from '../../services/dishApi';
import useScrollReveal from '../../hooks/useScrollReveal';
import { normalizeBackendDish } from './normalizeDish';
import { FOOD_GROUPS, INITIAL_GROUP_LIMIT } from './menuConstants';

export function useMenuSectionState(onAddToCart) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItemIds, setAddedItemIds] = useState([]);

  // Persistent favorite dishes state
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const saved = localStorage.getItem('pho_favorites');
      return saved !== null ? JSON.parse(saved) : [1, 2];
    } catch {
      return [1, 2];
    }
  });

  const [flyingHearts, setFlyingHearts] = useState([]);
  const [favTabJiggle, setFavTabJiggle] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const favTabTimerRef = useRef(null);
  const addTimersRef = useRef({});
  const mobileSearchInputRef = useRef(null);
  const isManualScrollingRef = useRef(false);
  const scrollLockTimerRef = useRef(null);
  const activeCategoryRef = useRef('all');
  const searchQueryRef = useRef(searchQuery);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  const favoriteIdsSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const addedItemIdsSet = useMemo(() => new Set(addedItemIds), [addedItemIds]);

  // Live Database Dishes State with Fallback
  const [dishes, setDishes] = useState(() => MENU_ITEMS);
  const [isLoadingDishes, setIsLoadingDishes] = useState(false);
  const [dishSyncTime, setDishSyncTime] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadDishes = async () => {
      try {
        setIsLoadingDishes(true);
        const liveDishes = await dishApi.getDishes();
        if (isMounted && Array.isArray(liveDishes) && liveDishes.length > 0) {
          const normalized = liveDishes.map(normalizeBackendDish);
          setDishes(normalized);
          setDishSyncTime(Date.now());
        }
      } catch (err) {
        console.warn('[MenuSection] Không thể đồng bộ API thực đơn, sử dụng dữ liệu dự phòng:', err);
      } finally {
        if (isMounted) setIsLoadingDishes(false);
      }
    };

    loadDishes();

    const handleMenuUpdate = () => {
      loadDishes();
    };
    window.addEventListener('pho1986:menu-updated', handleMenuUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('pho1986:menu-updated', handleMenuUpdate);
    };
  }, []);

  const groupedItems = useMemo(() => {
    const map = {};
    FOOD_GROUPS.forEach((grp) => {
      map[grp.id] = dishes.filter((i) => i.category === grp.id);
    });
    return map;
  }, [dishes]);

  const toggleGroupExpand = useCallback((catId) => {
    const isCurrentlyExpanded = !!expandedGroups[catId];
    const sectionEl = document.getElementById(`category-section-${catId}`);

    isManualScrollingRef.current = true;
    if (scrollLockTimerRef.current) clearTimeout(scrollLockTimerRef.current);

    if (isCurrentlyExpanded) {
      if (sectionEl) {
        const yOffset = window.innerWidth >= 1024 ? -165 : -135;
        const targetY = sectionEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }

      setExpandedGroups((prev) => ({
        ...prev,
        [catId]: false,
      }));

      scrollLockTimerRef.current = setTimeout(() => {
        isManualScrollingRef.current = false;
      }, 650);
    } else {
      setExpandedGroups((prev) => ({
        ...prev,
        [catId]: true,
      }));

      requestAnimationFrame(() => {
        setTimeout(() => {
          const gridEl = document.getElementById(`food-grid-${catId}`);
          if (gridEl && gridEl.children.length > INITIAL_GROUP_LIMIT) {
            const firstNewCard = gridEl.children[INITIAL_GROUP_LIMIT];
            if (firstNewCard) {
              firstNewCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }
        }, 80);
      });

      scrollLockTimerRef.current = setTimeout(() => {
        isManualScrollingRef.current = false;
      }, 650);
    }
  }, [expandedGroups]);

  useEffect(() => {
    return () => {
      if (favTabTimerRef.current) clearTimeout(favTabTimerRef.current);
      Object.values(addTimersRef.current).forEach(clearTimeout);
      if (scrollLockTimerRef.current) clearTimeout(scrollLockTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (mobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  const toggleFavorite = useCallback((item, coords, isAdding) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id];
      try {
        localStorage.setItem('pho_favorites', JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });

    if (isAdding && coords) {
      const target = document.getElementById('category-tab-favorites');
      let endX = window.innerWidth / 2;
      let endY = 180;
      if (target) {
        const tRect = target.getBoundingClientRect();
        endX = tRect.left + tRect.width / 2;
        endY = tRect.top + tRect.height / 2;
      }

      const newFly = {
        id: Date.now() + Math.random(),
        startX: coords.startX,
        startY: coords.startY,
        endX,
        endY,
      };
      setFlyingHearts((prev) => [...prev, newFly]);
    }
  }, []);

  const handleFlyHeartComplete = useCallback((id) => {
    setFlyingHearts((prev) => prev.filter((f) => f.id !== id));
    setFavTabJiggle(true);
    if (favTabTimerRef.current) clearTimeout(favTabTimerRef.current);
    favTabTimerRef.current = setTimeout(() => setFavTabJiggle(false), 650);
  }, []);

  const [headerRef, isHeaderVisible] = useScrollReveal({ threshold: 0.1 });
  const [controlsRef, isControlsVisible] = useScrollReveal({ threshold: 0.1 });

  const scrollContainerRef = useRef(null);
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    hasDragged: false,
  });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const allCategories = useMemo(() => [
    ...MENU_CATEGORIES,
    { id: 'favorites', name: 'Món Yêu Thích', isFavoriteTab: true },
  ], []);

  const checkScrollLimits = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  useEffect(() => {
    checkScrollLimits();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollLimits);
      window.addEventListener('resize', checkScrollLimits);
      const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => checkScrollLimits()) : null;
      if (ro) ro.observe(el);

      return () => {
        el.removeEventListener('scroll', checkScrollLimits);
        window.removeEventListener('resize', checkScrollLimits);
        if (ro) ro.disconnect();
      };
    }
  }, [allCategories.length, checkScrollLimits]);

  const scrollCategories = useCallback((direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = 240;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  const handleMouseDown = useCallback((e) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    dragRef.current = {
      isDragging: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      hasDragged: false,
    };
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current.isDragging) return;
    e.preventDefault();
    const el = scrollContainerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragRef.current.startX) * 1.3;
    if (Math.abs(walk) > 4) {
      dragRef.current.hasDragged = true;
    }
    el.scrollLeft = dragRef.current.scrollLeft - walk;
  }, []);

  const handleMouseUp = useCallback(() => {
    dragRef.current.isDragging = false;
  }, []);

  const centerCategoryTab = useCallback((catId) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const tabEl = document.getElementById(`category-tab-${catId}`);
    if (!tabEl) return;
    const tabLeft = tabEl.offsetLeft;
    const tabWidth = tabEl.offsetWidth;
    const containerWidth = container.clientWidth;
    const targetScrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);
    container.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: 'smooth' });
  }, []);

  const scrollToCategorySection = useCallback((catId) => {
    const sectionEl = document.getElementById(`category-section-${catId}`);
    if (!sectionEl) return;
    const yOffset = window.innerWidth >= 1024 ? -165 : -135;
    const y = sectionEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, []);

  const handleCategoryClick = useCallback((catId) => {
    if (dragRef.current.hasDragged) {
      dragRef.current.hasDragged = false;
      return;
    }

    centerCategoryTab(catId);

    if (catId === 'favorites') {
      activeCategoryRef.current = 'favorites';
      setActiveCategory('favorites');
      return;
    }

    setSearchQuery((prev) => (prev ? '' : prev));

    isManualScrollingRef.current = true;
    activeCategoryRef.current = catId;
    setActiveCategory(catId);

    if (catId === 'all') {
      const menuEl = document.getElementById('menu');
      if (menuEl) {
        const yOffset = -75;
        const y = menuEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      scrollToCategorySection(catId);
    }

    if (scrollLockTimerRef.current) clearTimeout(scrollLockTimerRef.current);
    scrollLockTimerRef.current = setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 850);
  }, [scrollToCategorySection, centerCategoryTab]);

  useEffect(() => {
    const sectionIds = ['pho-bo', 'special', 'pho-ga', 'sides'];
    let rafId = null;

    const handleScroll = () => {
      if (isManualScrollingRef.current) return;
      if (activeCategoryRef.current === 'favorites' || searchQueryRef.current) return;

      const triggerOffset = window.innerWidth >= 1024 ? 180 : 155;
      let currentActive = 'all';

      const firstEl = document.getElementById(`category-section-${sectionIds[0]}`);
      if (firstEl) {
        const top = firstEl.getBoundingClientRect().top;
        if (top > triggerOffset + 60) {
          currentActive = 'all';
        } else {
          for (const catId of sectionIds) {
            const el = document.getElementById(`category-section-${catId}`);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= triggerOffset && rect.bottom > triggerOffset - 80) {
                currentActive = catId;
              }
            }
          }
        }
      }

      if (
        activeCategoryRef.current !== currentActive &&
        activeCategoryRef.current !== 'favorites' &&
        !searchQueryRef.current
      ) {
        activeCategoryRef.current = currentActive;
        setActiveCategory(currentActive);
        centerCategoryTab(currentActive);
      }
    };

    const onScrollThrottled = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        handleScroll();
        rafId = null;
      });
    };

    window.addEventListener('scroll', onScrollThrottled, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScrollThrottled);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [centerCategoryTab]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return dishes.filter((item) => {
      let matchesCategory = false;
      if (activeCategory === 'all') {
        matchesCategory = true;
      } else if (activeCategory === 'favorites') {
        matchesCategory = favoriteIdsSet.has(item.id);
      } else {
        matchesCategory = item.category === activeCategory;
      }

      if (!matchesCategory) return false;
      if (!query) return true;

      return (
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (Array.isArray(item.ingredients) && item.ingredients.some((i) => i.toLowerCase().includes(query)))
      );
    });
  }, [dishes, activeCategory, favoriteIdsSet, searchQuery]);

  const handleAdd = useCallback((item, e) => {
    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2;

    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    }

    onAddToCart(item, { startX, startY });
    setAddedItemIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));

    if (addTimersRef.current[item.id]) {
      clearTimeout(addTimersRef.current[item.id]);
    }
    addTimersRef.current[item.id] = setTimeout(() => {
      setAddedItemIds((prev) => prev.filter((id) => id !== item.id));
      delete addTimersRef.current[item.id];
    }, 1200);
  }, [onAddToCart]);

  return {
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
  };
}

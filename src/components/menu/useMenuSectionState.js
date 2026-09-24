import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { MENU_ITEMS } from '../../data/menuData';
import { dishApi } from '../../services/dishApi';
import { normalizeBackendDish } from './normalizeDish';

export function useMenuSectionState(onAddToCart) {
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
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [customizingDish, setCustomizingDish] = useState(null);

  const handleOpenCustomizer = useCallback((dish) => {
    setCustomizingDish(dish);
  }, []);

  const handleCloseCustomizer = useCallback(() => {
    setCustomizingDish(null);
  }, []);

  const addTimersRef = useRef({});

  const favoriteIdsSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const addedItemIdsSet = useMemo(() => new Set(addedItemIds), [addedItemIds]);

  // Live Database Dishes State with Fallback
  const [dishes, setDishes] = useState(() => MENU_ITEMS);

  useEffect(() => {
    let isMounted = true;
    const loadDishes = async () => {
      try {
        const liveDishes = await dishApi.getDishes();
        if (isMounted && Array.isArray(liveDishes) && liveDishes.length > 0) {
          const normalized = liveDishes.map(normalizeBackendDish);
          setDishes(normalized);
        }
      } catch (err) {
        console.warn('[MenuSection] Không thể đồng bộ API thực đơn, sử dụng dữ liệu dự phòng:', err);
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

  useEffect(() => {
    return () => {
      Object.values(addTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  const favoriteIdsSetRef = useRef(favoriteIdsSet);
  favoriteIdsSetRef.current = favoriteIdsSet;

  const toggleFavorite = useCallback((item, coords, isAdding) => {
    const dishId = typeof item === 'object' && item !== null ? item.id : item;
    const isCurrentlyLiked = favoriteIdsSetRef.current.has(dishId);
    const willAdd = typeof isAdding === 'boolean' ? isAdding : !isCurrentlyLiked;

    if (willAdd && coords) {
      const target =
        document.getElementById('category-tab-favorites') ||
        document.getElementById('navbar-gift-vault-btn');
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

    setFavoriteIds((prev) => {
      const next = prev.includes(dishId)
        ? prev.filter((id) => id !== dishId)
        : [...prev, dishId];
      try {
        localStorage.setItem('pho_favorites', JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  }, []);

  const handleFlyHeartComplete = useCallback((id) => {
    setFlyingHearts((prev) => prev.filter((f) => f.id !== id));
    const target = document.getElementById('category-tab-favorites');
    if (target) {
      target.classList.remove('animate-heart-tab-jiggle');
      void target.offsetWidth;
      target.classList.add('animate-heart-tab-jiggle');
      setTimeout(() => {
        target.classList.remove('animate-heart-tab-jiggle');
      }, 700);
    }
  }, []);

  // Filtered items when global search query is active
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return dishes;
    return dishes.filter(
      (item) =>
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.tag && item.tag.toLowerCase().includes(query))
    );
  }, [dishes, searchQuery]);

  const handleAdd = useCallback((item, quantityOrEvent, maybeEvent) => {
    let quantity = item.quantity || 1;
    let e = quantityOrEvent;
    if (typeof quantityOrEvent === 'number') {
      quantity = quantityOrEvent;
      e = maybeEvent;
    }

    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2;

    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    }

    onAddToCart({ ...item, quantity }, { startX, startY });
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
    dishes,
    searchQuery,
    setSearchQuery,
    favoriteIds,
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
  };
}

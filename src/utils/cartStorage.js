/**
 * Cart Storage Helpers - Phở Gia Truyền 1986
 * Isolates user-specific cart storage keys and safe hydration from localStorage.
 */

export const getCartStorageKey = (currentUser) => {
  if (currentUser?.id) return `pho1986_cart_usr_${currentUser.id}`;
  if (currentUser?.phone) return `pho1986_cart_phone_${String(currentUser.phone).replace(/\s+/g, '')}`;
  return 'pho1986_cart_guest';
};

export const loadCartFromStorage = (key) => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    if (key === 'pho1986_cart_guest') {
      const legacy = localStorage.getItem('pho1986_cart_items');
      if (legacy) return JSON.parse(legacy);
    }
  } catch {
    return [];
  }
  return [];
};

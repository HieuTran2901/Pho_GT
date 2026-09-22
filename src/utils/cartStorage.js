/**
 * Cart Storage Helpers - Phở Gia Truyền 1986
 * Isolates user-specific cart storage keys and safe hydration from localStorage.
 */

const hashPhone = (phone) => {
  const clean = String(phone).replace(/\s+/g, '');
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) - hash) + clean.charCodeAt(i);
    hash |= 0;
  }
  const masked = clean.length >= 7 ? `${clean.slice(0, 3)}****${clean.slice(-3)}` : 'usr';
  return `${masked}_${Math.abs(hash).toString(36)}`;
};

export const getCartStorageKey = (currentUser) => {
  if (currentUser?.id) return `pho1986_cart_usr_${currentUser.id}`;
  if (currentUser?.phone) return `pho1986_cart_ph_${hashPhone(currentUser.phone)}`;
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

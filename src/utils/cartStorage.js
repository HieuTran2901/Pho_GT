/**
 * Cart Storage Helpers - Phở Gia Truyền 1986
 * Isolates user-specific cart storage keys and safe hydration from localStorage.
 * Enforces non-PII, collision-resistant deterministic partition keys.
 */

const CART_SALT = 'pho1986_heritage_secure_cart_v2_salt';

/**
 * Normalizes Vietnamese phone number for consistent storage partitioning.
 * Maps +84... and 84... to standard 0... format, stripping non-digits.
 */
export const normalizePhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('84') && digits.length >= 10) {
    if (digits.startsWith('840')) {
      return digits.slice(2);
    }
    return '0' + digits.slice(2);
  }
  if (digits.length === 9 && !digits.startsWith('0')) {
    return '0' + digits;
  }
  return digits;
};

/**
 * Deterministic, collision-resistant salted alphanumeric hash.
 * Completely eliminates raw or masked phone digits (non-reversible, non-PII).
 */
export const hashUserIdentifier = (identifier) => {
  const raw = String(identifier || '').trim();
  if (!raw) return 'anonymous';

  const salted = `${CART_SALT}:${raw}`;
  let h1 = 0x811c9dc5 ^ 0x19860408;
  let h2 = 0xdeadbeef ^ 0x27d4eb2d;

  for (let i = 0; i < salted.length; i++) {
    const ch = salted.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 16777619);
    h2 = Math.imul(h2 ^ ch, 2246822519);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const part1 = (h1 >>> 0).toString(36).padStart(7, '0');
  const part2 = (h2 >>> 0).toString(36).padStart(7, '0');
  return `${part1}${part2}`;
};

/**
 * Legacy phone hash algorithm (for backwards compatibility migration only).
 */
export const getLegacyPhoneKey = (phone) => {
  if (!phone) return null;
  const clean = String(phone).replace(/\s+/g, '');
  if (!clean) return null;
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) - hash) + clean.charCodeAt(i);
    hash |= 0;
  }
  const masked = clean.length >= 7 ? `${clean.slice(0, 3)}****${clean.slice(-3)}` : 'usr';
  return `pho1986_cart_ph_${masked}_${Math.abs(hash).toString(36)}`;
};

/**
 * Generates deterministic non-PII storage partition key for the current user.
 */
export const getCartStorageKey = (currentUser) => {
  if (typeof currentUser === 'string') {
    const cleanPhone = normalizePhone(currentUser);
    if (cleanPhone) {
      return `pho1986_cart_usr_${hashUserIdentifier(`ph_${cleanPhone}`)}`;
    }
  }
  if (currentUser?.id !== undefined && currentUser?.id !== null) {
    const rawId = String(currentUser.id).trim();
    if (rawId) {
      return `pho1986_cart_usr_${hashUserIdentifier(`id_${rawId}`)}`;
    }
  }
  if (currentUser?.phone) {
    const cleanPhone = normalizePhone(currentUser.phone);
    if (cleanPhone) {
      return `pho1986_cart_usr_${hashUserIdentifier(`ph_${cleanPhone}`)}`;
    }
  }
  return 'pho1986_cart_guest';
};

/**
 * Merges two arrays of cart items preserving base items and appending new incoming items.
 */
const mergeCartItems = (base, incoming) => {
  if (!base || base.length === 0) return incoming || [];
  if (!incoming || incoming.length === 0) return base;
  const merged = [...base];
  const existingKeys = new Set(base.map((i) => i.cartItemId || i.id));
  for (const item of incoming) {
    const key = item.cartItemId || item.id;
    if (!existingKeys.has(key)) {
      merged.push(item);
      existingKeys.add(key);
    }
  }
  return merged;
};

/**
 * Safely parses JSON array of cart items.
 */
const parseCartData = (data) => {
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Safely reads the currently saved user session from localStorage if present.
 */
const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const session = localStorage.getItem('pho1986_customer_session');
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
};

/**
 * Safely retrieves all keys from localStorage.
 */
const getAllStorageKeys = () => {
  if (typeof window === 'undefined') return [];
  try {
    const keys = [];
    if (typeof localStorage.key === 'function' && typeof localStorage.length === 'number') {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) keys.push(k);
      }
    } else {
      keys.push(...Object.keys(localStorage));
    }
    return keys;
  } catch {
    return [];
  }
};

/**
 * Loads cart items from storage with seamless backwards compatibility and guest recovery.
 * Automatically migrates legacy carts to the new non-PII key and removes old leaking keys.
 */
export const loadCartFromStorage = (key, currentUser = null) => {
  if (typeof window === 'undefined') return [];
  try {
    // 1. Direct hit on current partition key
    const directHit = parseCartData(localStorage.getItem(key));
    let activeCart = (directHit && directHit.length > 0) ? directHit : null;

    // 2. Guest recovery from legacy 'pho1986_cart_items'
    if (key === 'pho1986_cart_guest') {
      const legacyGuest = parseCartData(localStorage.getItem('pho1986_cart_items'));
      if (!activeCart && legacyGuest && legacyGuest.length > 0) {
        activeCart = legacyGuest;
        localStorage.setItem(key, JSON.stringify(legacyGuest));
      }
      // Always purge unpartitioned legacy guest key
      localStorage.removeItem('pho1986_cart_items');
      return activeCart || directHit || [];
    }

    // 3. Authenticated user backwards compatibility migration & leak purging
    const user = currentUser || getStoredUser();
    if (user) {
      // 3a. Check unhashed legacy user id key: 'pho1986_cart_usr_<id>'
      if (user.id !== undefined && user.id !== null) {
        const legacyIdKey = `pho1986_cart_usr_${user.id}`;
        if (legacyIdKey !== key) {
          const legacyCart = parseCartData(localStorage.getItem(legacyIdKey));
          if (legacyCart && legacyCart.length > 0) {
            activeCart = mergeCartItems(activeCart, legacyCart);
            localStorage.setItem(key, JSON.stringify(activeCart));
          }
          localStorage.removeItem(legacyIdKey);
        }
      }

      // 3b. Migrate and purge from phone-hashed partition if user transitioned from phone-only session to id key
      if (user.phone) {
        const cleanPhone = normalizePhone(user.phone);
        if (cleanPhone) {
          const phoneKey = `pho1986_cart_usr_${hashUserIdentifier(`ph_${cleanPhone}`)}`;
          if (phoneKey !== key) {
            const phoneCart = parseCartData(localStorage.getItem(phoneKey));
            if (phoneCart && phoneCart.length > 0) {
              activeCart = mergeCartItems(activeCart, phoneCart);
              localStorage.setItem(key, JSON.stringify(activeCart));
            }
            localStorage.removeItem(phoneKey);
          }
        }

        const rawPhone = String(user.phone).replace(/\s+/g, '');
        const normPhone = cleanPhone;
        const legacyExactKey = getLegacyPhoneKey(rawPhone);
        const legacyNormKey = getLegacyPhoneKey(normPhone);

        const maskedRaw = rawPhone.length >= 7 ? `${rawPhone.slice(0, 3)}****${rawPhone.slice(-3)}` : null;
        const maskedNorm = normPhone.length >= 7 ? `${normPhone.slice(0, 3)}****${normPhone.slice(-3)}` : null;

        const allKeys = getAllStorageKeys();
        for (const k of allKeys) {
          if (!k || !k.startsWith('pho1986_cart_ph_')) continue;

          const isMatchingLegacy =
            k === legacyExactKey ||
            k === legacyNormKey ||
            (maskedRaw && k.includes(maskedRaw)) ||
            (maskedNorm && k.includes(maskedNorm));

          if (isMatchingLegacy) {
            const legacyCart = parseCartData(localStorage.getItem(k));
            if (legacyCart && legacyCart.length > 0) {
              activeCart = mergeCartItems(activeCart, legacyCart);
              localStorage.setItem(key, JSON.stringify(activeCart));
            }
            // Always purge any leaking phone key
            localStorage.removeItem(k);
          }
        }
      }
    }

    return activeCart || directHit || [];
  } catch {
    return [];
  }
};

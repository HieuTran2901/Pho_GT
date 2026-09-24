/**
 * Device Identification Utility
 * Persistent identifier stored in both localStorage and long-lived cookie.
 * Transmitted via X-Device-Id header to enforce 3-layer threat defense.
 */

const DEVICE_ID_KEY = 'pho1986_device_id';

function generateRandomDeviceId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return 'dev_' + crypto.randomUUID();
  }
  return 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

function setCookie(name, value, days = 3650) {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
}

export function getOrCreateDeviceId() {
  try {
    // 1. Try reading from localStorage
    let deviceId = null;
    if (typeof localStorage !== 'undefined') {
      deviceId = localStorage.getItem(DEVICE_ID_KEY);
    }

    // 2. If not in localStorage, fallback to cookie
    if (!deviceId) {
      deviceId = getCookie(DEVICE_ID_KEY);
    }

    // 3. If neither exists, generate new ID
    if (!deviceId || deviceId.trim().length === 0) {
      deviceId = generateRandomDeviceId();
    }

    // 4. Always sync back to both stores for redundancy & persistence
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    setCookie(DEVICE_ID_KEY, deviceId);

    return deviceId;
  } catch {
    return 'dev_fallback_' + Date.now();
  }
}

/**
 * Global Fetch Interceptor to attach X-Device-Id header on all API calls
 */
export function installGlobalDeviceInterceptor() {
  if (typeof window === 'undefined' || window.__pho1986_device_interceptor) return;
  const originalFetch = window.fetch;
  window.fetch = async function (resource, init = {}) {
    try {
      const url = typeof resource === 'string'
        ? resource
        : (resource && resource.url ? resource.url : '');

      // Chỉ gắn X-Device-Id cho API của hệ thống Phở 1986 (Backend nội bộ)
      // Tuyệt đối không gắn vào các dịch vụ bên thứ 3 (Google, Firebase, Cloudinary...) để tránh lỗi CORS Preflight
      const isInternalApi =
        (!url.startsWith('http://') && !url.startsWith('https://'))
        || url.includes('localhost:8080')
        || url.includes('127.0.0.1:8080')
        || (typeof window !== 'undefined' && url.startsWith(window.location.origin + '/api/'))
        || (import.meta?.env?.VITE_API_BASE_URL && url.startsWith(import.meta.env.VITE_API_BASE_URL));

      if (isInternalApi) {
        const devId = getOrCreateDeviceId();
        if (init.headers instanceof Headers) {
          if (!init.headers.has('X-Device-Id')) {
            init.headers.set('X-Device-Id', devId);
          }
        } else if (Array.isArray(init.headers)) {
          const hasHeader = init.headers.some(([k]) => k.toLowerCase() === 'x-device-id');
          if (!hasHeader) {
            init.headers.push(['X-Device-Id', devId]);
          }
        } else {
          init.headers = {
            'X-Device-Id': devId,
            ...init.headers,
          };
        }
      }
    } catch {
      // Ignore
    }
    return originalFetch.call(this, resource, init);
  };
  window.__pho1986_device_interceptor = true;
}

// Auto-install on client environment
if (typeof window !== 'undefined') {
  installGlobalDeviceInterceptor();
}


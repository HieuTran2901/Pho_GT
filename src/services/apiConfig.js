/**
 * Centralized API Base URL Resolver
 * Phở Gia Truyền 1986
 *
 * Tự động phát hiện môi trường:
 * - Khi chạy trên Vercel / Production: dùng relative path `/api/v1/<endpoint>` (Vercel Rewrite ngầm sang EC2)
 * - Khi chạy trên máy cá nhân (localhost): dùng `http://localhost:8080/api/v1/<endpoint>`
 * - Khi có biến VITE_API_BASE_URL: ưu tiên biến môi trường
 */
export const getApiBaseUrl = (endpoint) => {
  const cleanEndpoint = endpoint.replace(/^\//, '');

  if (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_BASE_URL) {
    const custom = String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, '');
    if (custom.endsWith('/auth') || custom.endsWith('/dishes') || custom.endsWith('/orders') || custom.endsWith('/payments') || custom.endsWith('/admin')) {
      return custom.replace(/\/(auth|dishes|orders|payments|admin)$/, `/${cleanEndpoint}`);
    }
    return `${custom}/${cleanEndpoint}`;
  }

  // Tự động nhận diện domain production (Vercel, custom domain)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `/api/v1/${cleanEndpoint}`;
  }

  // Fallback to configured backend host from environment or localhost
  const backendHost = import.meta?.env?.VITE_BACKEND_HOST || 'http://localhost:8080';
  return `${String(backendHost).replace(/\/$/, '')}/api/v1/${cleanEndpoint}`;
};

/**
 * Tự động phát hiện lỗi HTTP 423 / ACCOUNT_LOCKED và phát tín hiệu toàn cục
 */
export const notifyIfAccountLocked = (status, data) => {
  if (status === 423 || data?.code === 'ACCOUNT_LOCKED' || (data?.locked && data?.permanent)) {
    const reason = data?.message || data?.data?.lockReason || 'Tài khoản của quý khách hiện đang bị khóa bởi Quản trị viên Phở 1986.';
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pho1986:account-locked', { detail: { reason } }));
    }
    return true;
  }
  return false;
};

/**
 * Lọc sạch mọi thông báo kỹ thuật, lỗi cơ sở dữ liệu hoặc stack trace vô tình lọt ra production
 */
export const sanitizeErrorMessage = (message, fallback = 'Dạ, yêu cầu chưa thể thực hiện lúc này. Quý khách vui lòng thử lại sau nhé!') => {
  if (!message || typeof message !== 'string') return fallback;
  const isTechnicalLeak = /could not execute|statement|sql|exception|hibernate|jdbc|database|constraint|syntax|table|column|nullpointer|stacktrace|bad credentials/i.test(message);
  if (isTechnicalLeak) {
    return 'Dạ, quán đang bảo trì hoặc cập nhật dữ liệu. Quý khách vui lòng thử lại sau ít phút nhé!';
  }
  return message;
};


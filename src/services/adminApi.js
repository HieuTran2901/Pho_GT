/**
 * [REACT_AGENT & TITAN] Admin API Client for Phở Gia Truyền 1986
 * Connects frontend to Spring Boot Admin REST endpoints (/api/v1/admin)
 * Enforces HttpOnly Cookie credentials: include.
 * Equipped with Layer 2 Silent Refresh Interceptor & Transparent Request Retry.
 */

import { authApi } from './authApi';

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/auth\/?$/, '/admin')
  : 'http://localhost:8080/api/v1/admin';

async function handleAdminResponse(response) {
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = (json && (json.message || json.error))
      || (response.status === 401 ? 'Phiên làm việc quản trị viên đã hết hạn. Vui lòng đăng nhập lại.'
          : response.status === 403 ? 'Tài khoản của bạn không có quyền truy cập khu vực Quản Trị.'
          : response.status >= 500 ? 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau ít phút.'
          : 'Không thể xử lý yêu cầu lúc này.');
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = json;
    throw error;
  }

  return json?.data !== undefined ? json.data : json;
}

/**
 * [TITAN & RAVEN] Layer 2 Interceptor: Transparent Auto-Refresh & Retry.
 * Intercepts HTTP 401 Unauthorized errors on any admin endpoint,
 * triggers authApi.refreshToken() in the background, and seamlessly retries the original request.
 */
async function fetchAdminWithRetry(url, options = {}) {
  const defaultOptions = {
    credentials: 'include',
    ...options,
    headers: {
      'Accept': 'application/json',
      ...options.headers,
    },
  };

  let response = await fetch(url, defaultOptions);

  // Nếu gặp 401 hoặc 403 (Access Token 15 phút đã hết hạn khiến Spring Security chặn quyền), kích hoạt Silent Refresh ngầm và thử lại
  if (response.status === 401 || response.status === 403) {
    try {
      const refreshed = await authApi.refreshToken();
      if (refreshed) {
        // Gửi lại request ban đầu với Cookie đã được cập nhật
        response = await fetch(url, defaultOptions);
      } else {
        // Refresh token 7 ngày cũng đã hết hạn hoặc bị thu hồi
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('pho1986:admin-session-expired'));
        }
      }
    } catch {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pho1986:admin-session-expired'));
      }
    }
  }

  return await handleAdminResponse(response);
}

export const adminApi = {
  async getStats() {
    return await fetchAdminWithRetry(`${API_BASE_URL}/stats`, {
      method: 'GET',
    });
  },

  async getOrders(status = 'ALL') {
    const query = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
    return await fetchAdminWithRetry(`${API_BASE_URL}/orders${query}`, {
      method: 'GET',
    });
  },

  async updateOrderStatus(orderId, { status, paymentStatus }) {
    return await fetchAdminWithRetry(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, paymentStatus }),
    });
  },

  async getDishes() {
    return await fetchAdminWithRetry(`${API_BASE_URL}/dishes`, {
      method: 'GET',
    });
  },

  async getCategories() {
    return await fetchAdminWithRetry(`${API_BASE_URL}/categories`, {
      method: 'GET',
    });
  },

  async createDish(dishData) {
    return await fetchAdminWithRetry(`${API_BASE_URL}/dishes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dishData),
    });
  },

  async updateDish(dishId, dishData) {
    return await fetchAdminWithRetry(`${API_BASE_URL}/dishes/${dishId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dishData),
    });
  },

  async deleteDish(dishId) {
    return await fetchAdminWithRetry(`${API_BASE_URL}/dishes/${dishId}`, {
      method: 'DELETE',
    });
  }
};

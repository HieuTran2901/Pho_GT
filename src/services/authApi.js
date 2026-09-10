/**
 * [REACT_AGENT] Auth API Client for Phở Gia Truyền 1986
 * Connects frontend to Spring Boot backend (/api/v1/auth) with resilient fallback.
 */

import { getApiBaseUrl, notifyIfAccountLocked } from './apiConfig';

const API_BASE_URL = getApiBaseUrl('auth');

const FRIENDLY_NETWORK_ERROR = 'Dạ, quán đang tạm thời gián đoạn kết nối. Quý khách vui lòng kiểm tra lại đường truyền mạng hoặc thử lại sau ít phút nhé!';

/**
 * Handle API HTTP responses and error formatting
 */
async function handleResponse(response, isLoginAttempt = false) {
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    if (!isLoginAttempt) {
      notifyIfAccountLocked(response.status, json);
    }
    const errorMsg = (json && (json.message || json.error)) 
      || (response.status === 423
          ? 'Tài khoản của quý khách đã bị khóa bảo vệ. Vui lòng liên hệ Hotline quán để được hỗ trợ mở khóa.'
          : response.status === 401 
          ? 'Số điện thoại hoặc mật khẩu chưa chính xác. Quý khách vui lòng kiểm tra lại nhé!'
          : response.status === 429
          ? 'Hệ thống tạm khóa đăng nhập để bảo vệ an toàn. Quý khách vui lòng chờ một lát nhé!'
          : response.status === 404
          ? 'Không tìm thấy thông tin tài khoản. Quý khách vui lòng đăng ký mới nhé!'
          : response.status >= 500
          ? 'Dạ, quán đang bảo trì hệ thống một chút. Quý khách vui lòng quay lại sau ít phút nhé!'
          : 'Dạ, yêu cầu chưa thể thực hiện lúc này. Quý khách vui lòng thử lại sau nhé!');
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = json;
    error.isPermanent = response.status === 423 || Boolean(json?.data?.permanent);
    error.round = json?.data?.round ? Number(json.data.round) : undefined;
    error.maxRounds = json?.data?.maxRounds ? Number(json.data.maxRounds) : 5;
    error.failedAttemptsInRound = json?.data?.failedAttemptsInRound;

    if (json?.data?.retryAfterSeconds) {
      error.retryAfterSeconds = Number(json.data.retryAfterSeconds);
    } else {
      const retryHeader = response.headers?.get?.('Retry-After');
      if (retryHeader) {
        error.retryAfterSeconds = parseInt(retryHeader, 10);
      }
    }
    throw error;
  }

  return json?.data !== undefined ? json.data : json;
}

// [SECURITY_AGENT] Singleton Promise chống Double Refresh (Mutex / Request Deduplication)
// Đảm bảo tại một thời điểm chỉ có DUY NHẤT 1 request /refresh được gửi lên server,
// bảo vệ Refresh Token Rotation khỏi việc thu hồi token oan do React StrictMode hoặc race condition.
let refreshPromise = null;

export const authApi = {
  /**
   * Đăng ký tài khoản hội viên
   */
  async register({ phone, fullName, password, email = null, saveTasteProfile = true }) {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          phone,
          fullName,
          password,
          email,
          saveTasteProfile
        }),
      });

      return await handleResponse(response, true);
    } catch (err) {
      // Bắt lỗi mất kết nối mạng hoặc Backend chưa phản hồi với câu từ thân thiện
      if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('NetworkError')) {
        throw new Error(FRIENDLY_NETWORK_ERROR);
      }
      throw err;
    }
  },

  /**
   * Đăng nhập khách quen
   */
  async login({ phone, password }) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      return await handleResponse(response, true);
    } catch (err) {
      // Bắt lỗi mất kết nối mạng hoặc Backend chưa phản hồi với câu từ thân thiện
      if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('NetworkError')) {
        throw new Error(FRIENDLY_NETWORK_ERROR);
      }
      throw err;
    }
  },

  /**
   * Làm mới phiên đăng nhập ngầm qua Refresh Token Cookie (Silent Refresh)
   * Sử dụng Singleton Promise để chống race condition / double invocation
   */
  async refreshToken() {
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        return await handleResponse(response);
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  /**
   * Lấy thông tin tài khoản hiện tại từ JWT / Cookie
   */
  async getMe(token = null) {
    try {
      const headers = { 'Accept': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        credentials: 'include',
        headers,
      });

      // Nếu token hết hạn (401), kích hoạt silent refresh ngầm
      if (response.status === 401) {
        const refreshData = await this.refreshToken();
        if (refreshData && refreshData.user) {
          return refreshData.user;
        }
        return null;
      }

      return await handleResponse(response);
    } catch {
      return null;
    }
  },

  /**
   * Đăng xuất phiên và xóa sạch HttpOnly Cookie
   */
  async logout(token = null) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers,
      });
    } catch {
      // Bỏ qua lỗi mạng khi logout
    }
  }
};

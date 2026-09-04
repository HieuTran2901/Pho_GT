/**
 * [REACT_AGENT] Auth API Client for Phở Gia Truyền 1986
 * Connects frontend to Spring Boot backend (/api/v1/auth) with resilient fallback.
 */

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_BASE_URL) 
  || 'http://localhost:8080/api/v1/auth';

/**
 * Handle API HTTP responses and error formatting
 */
async function handleResponse(response) {
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = (json && (json.message || json.error)) 
      || `Lỗi máy chủ (${response.status}): Vui lòng thử lại sau.`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = json;
    throw error;
  }

  return json?.data !== undefined ? json.data : json;
}

export const authApi = {
  /**
   * Đăng ký tài khoản hội viên
   */
  async register({ phone, fullName, password, email = null, saveTasteProfile = true }) {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
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

      return await handleResponse(response);
    } catch (err) {
      // Fallback khi backend chưa bật: thông báo và giả lập an toàn
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        console.warn('[authApi] Backend chưa bật, kích hoạt chế độ giả lập cục bộ.');
        return {
          user: {
            id: 'usr_' + Date.now(),
            phone,
            fullName,
            role: 'CUSTOMER',
            loyaltyAccount: {
              totalPoints: 50,
              availablePoints: 50,
              membershipTier: 'DONG',
              totalOrdersCount: 0,
              totalSpent: 0
            },
            tasteProfile: saveTasteProfile ? {
              brothType: 'DAM_DA',
              onionStyle: 'NHIEU_HANH',
              herbStyle: 'DU_RAU',
              spicyLevel: 1,
              crullerPref: 'QUAY_GION',
              customNote: 'Chuẩn vị phở gia truyền 1986 (Đã lưu)'
            } : null
          },
          accessToken: 'mock_jwt_token_' + Date.now(),
          pointsEarned: 50
        };
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
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      return await handleResponse(response);
    } catch (err) {
      // Fallback khi backend chưa bật: thông báo và giả lập
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        console.warn('[authApi] Backend chưa bật, kích hoạt chế độ giả lập cục bộ.');
        return {
          user: {
            id: 'usr_' + Date.now(),
            phone,
            fullName: phone === '0988888888' ? 'Nguyễn Văn Hiếu' : 'Khách Quen 1986',
            role: 'CUSTOMER',
            loyaltyAccount: {
              totalPoints: 135,
              availablePoints: 135,
              membershipTier: 'DONG',
              totalOrdersCount: 2,
              totalSpent: 170000
            },
            tasteProfile: {
              favoriteDishName: 'Phở Bò Tái Nạm Gầu Giòn 1986',
              brothType: 'BEO_NGAY',
              onionStyle: 'HANH_TRAN',
              herbStyle: 'DU_RAU',
              spicyLevel: 2,
              crullerPref: 'QUAY_GION',
              customNote: 'Cho nhiều nước béo thơm và hành trần riêng'
            }
          },
          accessToken: 'mock_jwt_token_' + Date.now()
        };
      }
      throw err;
    }
  },

  /**
   * Lấy thông tin tài khoản hiện tại từ JWT
   */
  async getMe(token) {
    if (!token) return null;
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      return await handleResponse(response);
    } catch {
      return null;
    }
  },

  /**
   * Đăng xuất phiên
   */
  async logout(token) {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
    } catch {
      // Bỏ qua lỗi mạng khi logout
    }
  }
};

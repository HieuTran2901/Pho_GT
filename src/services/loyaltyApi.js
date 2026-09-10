/**
 * [REACT_AGENT & RAVEN] Loyalty API Client
 * Phở Gia Truyền 1986 - Kho Quà Tri Kỷ
 *
 * Kết nối REST API /api/v1/loyalty để tra cứu phần thưởng, điểm tích lũy và đổi quà.
 */

import { getApiBaseUrl, notifyIfAccountLocked } from './apiConfig';

const API_BASE_URL = getApiBaseUrl('loyalty');

async function handleResponse(response) {
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    notifyIfAccountLocked(response.status, json);
    const errorMsg = (json && (json.message || json.error))
      || (response.status === 401
          ? 'Phiên đăng nhập đã hết hạn. Quý khách vui lòng đăng nhập lại nhé!'
          : response.status === 400
          ? 'Yêu cầu không hợp lệ hoặc số điểm không đủ để đổi quà.'
          : 'Dạ, hệ thống đổi quà tạm thời gián đoạn. Quý khách thử lại sau ít phút nhé!');
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = json;
    throw error;
  }

  return json?.data !== undefined ? json.data : json;
}

export const loyaltyApi = {
  /**
   * Lấy danh sách phần thưởng khả dụng (Public)
   */
  async getAvailableRewards() {
    const response = await fetch(`${API_BASE_URL}/rewards`, {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    return handleResponse(response);
  },

  /**
   * Lấy thông tin điểm Tri Kỷ & tiến độ thăng hạng (Hỗ trợ HttpOnly Cookie & Bearer Token)
   */
  async getLoyaltySummary(token) {
    const headers = { 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/summary`, {
      credentials: 'include',
      headers
    });
    return handleResponse(response);
  },

  /**
   * Đổi quà bằng điểm Tri Kỷ
   */
  async redeemReward(rewardId, token) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/redeem`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify({ rewardId })
    });
    return handleResponse(response);
  },

  /**
   * Xem sổ nhật ký điểm thưởng (Lịch sử tích/tiêu)
   */
  async getLoyaltyLedger(token) {
    const headers = { 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/ledger`, {
      credentials: 'include',
      headers
    });
    return handleResponse(response);
  }
};

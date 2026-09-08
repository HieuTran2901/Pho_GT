/**
 * [BLADE / BACKEND_AGENT] Dish API Client for Pho Gia Truyen 1986
 * Connects frontend customer views to Spring Boot Public REST endpoints (/api/v1/dishes)
 */

import { getApiBaseUrl } from './apiConfig';

const API_BASE_URL = getApiBaseUrl('dishes');

async function handleResponse(response) {
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = (json && (json.message || json.error))
      || `Lỗi khi tải dữ liệu món ăn (Mã ${response.status}).`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = json;
    throw error;
  }

  return json?.data !== undefined ? json.data : json;
}

export const dishApi = {
  async getDishes(categorySlug = '') {
    const url = categorySlug
      ? `${API_BASE_URL}?category=${encodeURIComponent(categorySlug)}`
      : API_BASE_URL;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    return handleResponse(response);
  },

  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    return handleResponse(response);
  },

  async getDishBySlug(slug) {
    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(slug)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    return handleResponse(response);
  }
};

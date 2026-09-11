/**
 * [RAVEN & BLADE] Table API Client for Phở Gia Truyền 1986
 * Tích hợp đồng bộ trạng thái 22 bàn di sản và đơn hàng đang phục vụ trực tiếp từ backend.
 */

import { getApiBaseUrl, notifyIfAccountLocked } from './apiConfig';
import { MOCK_TABLES } from '../components/seatmap/mockTables';

const API_BASE_URL = getApiBaseUrl('tables');
const ADMIN_API_BASE_URL = getApiBaseUrl('admin/tables');

export const tableApi = {
  /**
   * Lấy danh sách toàn bộ bàn kèm trạng thái realtime & active order
   */
  async getTables() {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resData = await response.json();
      if (resData && resData.data && Array.isArray(resData.data)) {
        return resData.data;
      }
      return MOCK_TABLES;
    } catch (error) {
      console.warn('[TableApi] Không thể kết nối API bàn, sử dụng dữ liệu mặc định:', error.message);
      return MOCK_TABLES;
    }
  },

  /**
   * Cập nhật trạng thái bàn (dành cho Admin: AVAILABLE, RESERVED, MAINTENANCE)
   */
  async updateTableStatus(tableId, status, notes = '') {
    try {
      let token = null;
      if (typeof localStorage !== 'undefined') {
        token = localStorage.getItem('accessToken') || localStorage.getItem('pho1986_admin_token');
      }

      const response = await fetch(`${ADMIN_API_BASE_URL}/${tableId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status, notes }),
      });

      const resData = await response.json().catch(() => null);
      if (!response.ok) {
        notifyIfAccountLocked(response.status, resData);
        throw new Error(resData?.message || `Cập nhật trạng thái bàn thất bại (${response.status})`);
      }

      return resData?.data || resData;
    } catch (error) {
      console.error('[TableApi] Lỗi cập nhật trạng thái bàn:', error);
      throw error;
    }
  }
};

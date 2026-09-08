/**
 * [RAVEN & URBAN] Customer Order API Client for Phở Gia Truyền 1986
 * Tích hợp kết nối tới /api/v1/orders đồng thời hỗ trợ lưu trữ & đồng bộ cục bộ (Local Sync).
 */

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/auth\/?$/, '/orders')
  : 'http://localhost:8080/api/v1/orders';

const LOCAL_ORDERS_KEY = 'pho1986_customer_order_history';

const getLocalOrdersKey = () => {
  try {
    if (typeof localStorage === 'undefined') return LOCAL_ORDERS_KEY;
    const session = localStorage.getItem('pho1986_customer_session');
    if (session) {
      const parsed = JSON.parse(session);
      const uid = parsed?.id || (parsed?.phone ? String(parsed.phone).replace(/\s+/g, '') : null);
      if (uid) return `${LOCAL_ORDERS_KEY}_usr_${uid}`;
    }
  } catch {}
  return `${LOCAL_ORDERS_KEY}_guest`;
};

export const DEFAULT_CUSTOMER_ORDERS = [
  {
    id: 'ord_1986_01',
    orderCode: '#PHO-88219',
    tableNumber: 6,
    floor: 1,
    orderType: 'DINE_IN',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'COMPLETED',
    paymentMethod: 'Thanh toán online (SEPAY)',
    paymentStatus: 'PAID',
    totalAmount: 185000,
    finalAmount: 185000,
    guestName: 'Anh Nguyễn Văn Minh',
    guestPhone: '092 952 8509',
    items: [
      { 
        id: 1, 
        name: 'Phở Bò Tái Lăn Hà Nội', 
        quantity: 2, 
        unitPrice: 75000, 
        broth: 'Nước dùng trong',
        onion: 'Nhiều hành hoa',
        herb: 'Ngò gai thơm',
        image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80' 
      },
      { 
        id: 7, 
        name: 'Quẩy Giòn Chiên Phồng', 
        quantity: 1, 
        unitPrice: 15000,
        cruller: 'Quẩy giòn rụm',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80' 
      },
      { 
        id: 9, 
        name: 'Trà Sen Tây Hồ Thượng Hạng', 
        quantity: 2, 
        unitPrice: 10000,
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80' 
      }
    ],
    note: 'Nước dùng trong veo, nhiều hành hoa, ít bánh phở'
  },
  {
    id: 'ord_1986_02',
    orderCode: '#PHO-77312',
    tableNumber: null,
    orderType: 'DELIVERY',
    deliveryAddressText: 'Phố Cổ Hoàn Kiếm, Hà Nội',
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    status: 'COMPLETED',
    paymentMethod: 'Chuyển khoản VietQR',
    paymentStatus: 'PAID',
    totalAmount: 210000,
    finalAmount: 210000,
    guestName: 'Anh Nguyễn Văn Minh',
    guestPhone: '092 952 8509',
    items: [
      { 
        id: 14, 
        name: 'Phở Thố Đá Núi Lửa Sôi Sùng Sục', 
        quantity: 2, 
        unitPrice: 95000, 
        broth: 'Nước béo đậm đà',
        onion: 'Hành hoa & hành chần',
        image: 'https://images.unsplash.com/photo-1631709497146-a239ef373cf1?auto=format&fit=crop&w=800&q=80' 
      },
      { 
        id: 15, 
        name: 'Sữa Đậu Nành Lá Dứa Thơm Mát', 
        quantity: 2, 
        unitPrice: 10000,
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80' 
      }
    ],
    note: 'Giao nước dùng riêng trong âu giữ nhiệt'
  }
];

export const orderApi = {
  /**
   * Lấy lịch sử đơn hàng từ Backend hoặc Local Storage
   */
  async getOrderHistory() {
    let serverOrders = [];
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('pho1986_access_token') : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/history`, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.data && Array.isArray(json.data)) {
          serverOrders = json.data;
        }
      }
    } catch (err) {
      console.warn('[OrderApi] Không thể kết nối backend, sử dụng dữ liệu cục bộ:', err.message);
    }

    // Đọc đơn hàng đã lưu ở Local Storage
    const localOrders = this.getLocalOrders();

    // Hợp nhất dữ liệu: Đơn server + Đơn local (Loại bỏ trùng lặp mã đơn)
    const orderMap = new Map();

    // Nạp đơn từ server trước
    serverOrders.forEach(ord => {
      if (ord.orderCode) orderMap.set(ord.orderCode, ord);
    });

    // Nạp đơn từ local nếu chưa có trên server
    localOrders.forEach(ord => {
      if (ord.orderCode && !orderMap.has(ord.orderCode)) {
        orderMap.set(ord.orderCode, ord);
      }
    });

    // Nếu hoàn toàn chưa có đơn nào, trả về danh sách mẫu để khách hàng có trải nghiệm ban đầu
    if (orderMap.size === 0) {
      DEFAULT_CUSTOMER_ORDERS.forEach(ord => orderMap.set(ord.orderCode, ord));
      this.saveAllLocalOrders(DEFAULT_CUSTOMER_ORDERS);
    }

    const merged = Array.from(orderMap.values());
    // Sắp xếp đơn mới nhất lên đầu
    merged.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return merged;
  },
  /**
   * Đọc danh sách đơn từ LocalStorage
   */
  getLocalOrders() {
    try {
      if (typeof localStorage === 'undefined') return [];
      const key = getLocalOrdersKey();
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
      if (key === `${LOCAL_ORDERS_KEY}_guest`) {
        const legacy = localStorage.getItem(LOCAL_ORDERS_KEY);
        if (legacy) return JSON.parse(legacy);
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Lưu một đơn hàng mới vào LocalStorage
   */
  saveLocalOrder(newOrder) {
    try {
      if (typeof localStorage === 'undefined') return;
      const key = getLocalOrdersKey();
      const current = this.getLocalOrders();
      const exists = current.some(o => o.orderCode === newOrder.orderCode);
      const updated = exists
        ? current.map(o => o.orderCode === newOrder.orderCode ? { ...o, ...newOrder } : o)
        : [newOrder, ...current];
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.warn('[OrderApi] Lưu đơn cục bộ thất bại:', e);
    }
  },

  /**
   * Ghi đè toàn bộ danh sách đơn cục bộ
   */
  saveAllLocalOrders(orders) {
    try {
      if (typeof localStorage === 'undefined') return;
      const key = getLocalOrdersKey();
      localStorage.setItem(key, JSON.stringify(orders));
    } catch (e) {
      console.warn('[OrderApi] Ghi đè đơn cục bộ thất bại:', e);
    }
  },

  /**
   * Tra cứu chi tiết đơn hàng theo mã đơn
   */
  async getOrderByCode(orderCode) {
    try {
      const res = await fetch(`${API_BASE_URL}/${orderCode}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) return json.data;
      }
    } catch (e) {
      console.warn('[OrderApi] Tra cứu chi tiết đơn hàng thất bại:', e);
    }

    // Fallback tìm trong local orders
    const localOrders = this.getLocalOrders();
    return localOrders.find(o => o.orderCode === orderCode) || null;
  }
};

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { adminApi } from '../../services/adminApi';
import { formatOrderTime } from './adminConstants';
import { DEFAULT_DASHBOARD_PENDING_ORDERS } from './adminMockData';

export function useAdminPortalState() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderViewMode, setOrderViewMode] = useState('cards');

  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dishesLoading, setDishesLoading] = useState(false);
  const [dishCategoryFilter, setDishCategoryFilter] = useState('ALL');
  const [dishSearch, setDishSearch] = useState('');
  const [dishViewMode, setDishViewMode] = useState('cards');

  const [dishModalOpen, setDishModalOpen] = useState(false);
  const [dishSaving, setDishSaving] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [dishForm, setDishForm] = useState({
    categoryId: '',
    name: '',
    price: '',
    portion: 'Tô thường',
    tag: 'Best Seller',
    tagIcon: 'star',
    ingredients: '',
    description: '',
    imageUrl: '',
    isAvailable: true,
    isSignature: false,
  });
  const [notification, setNotification] = useState(null);
  const notifyTimerRef = useRef(null);

  const [storeOpen, setStoreOpen] = useState(true);
  const [soundAlertEnabled, setSoundAlertEnabled] = useState(true);

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [dashPendingViewMode, setDashPendingViewMode] = useState('compact');
  const [expandedDashOrderId, setExpandedDashOrderId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [tableExpandedOrderId, setTableExpandedOrderId] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  const [mobileDishPreviewOpen, setMobileDishPreviewOpen] = useState(false);
  const [showAdvancedDishFields, setShowAdvancedDishFields] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileDrawerOpen) {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileDrawerOpen]);

  useEffect(() => {
    return () => {
      if (notifyTimerRef.current) clearTimeout(notifyTimerRef.current);
    };
  }, []);

  const notify = useCallback((msg, type = 'success') => {
    if (notifyTimerRef.current) clearTimeout(notifyTimerRef.current);
    setNotification({ msg, type });
    notifyTimerRef.current = setTimeout(() => setNotification(null), 3500);
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setStatsLoading(false);
    }
  }, [notify]);

  const fetchOrders = useCallback(async (filter = 'ALL') => {
    setOrdersLoading(true);
    try {
      const data = await adminApi.getOrders(filter || 'ALL');
      setOrders(data || []);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setOrdersLoading(false);
    }
  }, [notify]);

  const fetchDishes = useCallback(async () => {
    setDishesLoading(true);
    try {
      const [dishesData, catsData] = await Promise.all([
        adminApi.getDishes(),
        adminApi.getCategories(),
      ]);
      setDishes(dishesData || []);
      setCategories(catsData || []);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setDishesLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchStats();
    fetchOrders('ALL');
    fetchDishes();
  }, [fetchStats, fetchOrders, fetchDishes]);

  const filteredDishes = useMemo(() => {
    const q = dishSearch ? dishSearch.trim().toLowerCase() : '';
    return dishes.filter(dish => {
      const matchCat = dishCategoryFilter === 'ALL' || 
        dish.category?.id === dishCategoryFilter || 
        dish.categoryId === dishCategoryFilter;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        (dish.name && dish.name.toLowerCase().includes(q)) ||
        (dish.description && dish.description.toLowerCase().includes(q)) ||
        (dish.portion && dish.portion.toLowerCase().includes(q))
      );
    });
  }, [dishes, dishCategoryFilter, dishSearch]);

  const filteredOrders = useMemo(() => {
    const q = orderSearch ? orderSearch.trim().toLowerCase() : '';
    return orders.filter(o => {
      const matchesStatus = orderFilter === 'ALL' || o.status === orderFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      return (
        (o.orderCode && o.orderCode.toLowerCase().includes(q)) ||
        (o.guestPhone && o.guestPhone.includes(q)) ||
        (o.guestName && o.guestName.toLowerCase().includes(q))
      );
    });
  }, [orders, orderFilter, orderSearch]);

  const orderCounts = useMemo(() => {
    const counts = { all: orders.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    for (let i = 0; i < orders.length; i++) {
      const status = orders[i].status;
      if (status === 'PENDING') counts.pending++;
      else if (status === 'CONFIRMED') counts.confirmed++;
      else if (status === 'COMPLETED') counts.completed++;
      else if (status === 'CANCELLED') counts.cancelled++;
    }
    return counts;
  }, [orders]);

  const ordersShiftRevenue = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < orders.length; i++) {
      if (orders[i].status !== 'CANCELLED') {
        sum += (orders[i].finalAmount || 0);
      }
    }
    return sum;
  }, [orders]);

  const handleUpdateOrderStatus = useCallback(async (orderId, newStatus) => {
    if (newStatus === 'CANCELLED') {
      const confirmCancel = window.confirm('Quản trị viên có chắc chắn muốn HỦY đơn hàng này không?');
      if (!confirmCancel) return;
    }
    try {
      await adminApi.updateOrderStatus(orderId, { status: newStatus });
      notify(`Đã chuyển trạng thái đơn sang ${newStatus}!`);
      fetchOrders(orderFilter);
      fetchStats();
    } catch (err) {
      notify(err.message, 'error');
    }
  }, [notify, fetchOrders, orderFilter, fetchStats]);

  const toggleSelectOrder = useCallback((orderId) => {
    setSelectedOrderIds(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  }, []);

  const toggleSelectAllOrders = useCallback(() => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    }
  }, [selectedOrderIds.length, filteredOrders]);

  const handleBulkUpdateStatus = useCallback(async (newStatus, statusLabel) => {
    if (!selectedOrderIds.length) return;
    try {
      for (const id of selectedOrderIds) {
        await adminApi.updateOrderStatus(id, { status: newStatus });
      }
      notify(`Đã cập nhật ${selectedOrderIds.length} đơn hàng sang ${statusLabel}!`);
      setSelectedOrderIds([]);
      fetchOrders(orderFilter);
      fetchStats();
    } catch (err) {
      notify(err.message, 'error');
    }
  }, [selectedOrderIds, notify, fetchOrders, orderFilter, fetchStats]);

  const resetDishForm = useCallback(() => {
    setEditingDish(null);
    setDishForm({
      categoryId: categories[0]?.id || '',
      name: '',
      price: '',
      portion: 'Tô thường',
      tag: 'Best Seller',
      tagIcon: 'star',
      ingredients: '',
      description: '',
      imageUrl: '',
      isAvailable: true,
      isSignature: false,
    });
  }, [categories]);

  const openCreateDish = useCallback(() => {
    resetDishForm();
    setActiveTab('add-dish');
  }, [resetDishForm]);

  const openEditDish = useCallback((dish) => {
    setEditingDish(dish);
    setDishForm({
      categoryId: dish.category?.id || categories[0]?.id || '',
      name: dish.name || '',
      price: dish.price || '',
      portion: dish.portion || 'Tô thường',
      tag: dish.tag || '',
      tagIcon: dish.tagIcon || 'star',
      ingredients: dish.ingredients || '',
      description: dish.description || '',
      imageUrl: dish.imageUrl || '',
      isAvailable: dish.isAvailable ?? true,
      isSignature: dish.isSignature ?? false,
    });
    setActiveTab('add-dish');
  }, [categories]);

  const handleSaveDish = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!dishForm.name?.trim()) {
      notify('Vui lòng nhập tên món ăn!', 'error');
      return;
    }
    const catId = dishForm.categoryId || categories[0]?.id;
    if (!catId) {
      notify('Vui lòng chọn danh mục món!', 'error');
      return;
    }
    const numPrice = parseFloat(dishForm.price);
    if (!dishForm.price || isNaN(numPrice) || numPrice <= 0) {
      notify('Vui lòng nhập giá bán hợp lệ (> 0 VNĐ)!', 'error');
      const priceEl = document.getElementById('dish-price-input') || document.getElementById('modal-dish-price-input');
      if (priceEl) {
        priceEl.focus();
        priceEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    if (numPrice < 1000) {
      notify('Số tiền tối thiểu phải từ 1.000đ trở lên!', 'error');
      const priceEl = document.getElementById('dish-price-input') || document.getElementById('modal-dish-price-input');
      if (priceEl) {
        priceEl.focus();
        priceEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setDishSaving(true);
    try {
      const payload = {
        ...dishForm,
        categoryId: catId,
        name: dishForm.name.trim(),
        price: numPrice,
        portion: dishForm.portion || 'Tô thường',
        tag: dishForm.tag || '',
        tagIcon: dishForm.tagIcon || 'star',
        ingredients: dishForm.ingredients || '',
        description: dishForm.description || '',
        imageUrl: dishForm.imageUrl?.trim() || 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
        isAvailable: dishForm.isAvailable ?? true,
        isSignature: dishForm.isSignature ?? false,
      };

      if (editingDish) {
        await adminApi.updateDish(editingDish.id, payload);
        notify(`Cập nhật món "${payload.name}" thành công!`);
        resetDishForm();
      } else {
        await adminApi.createDish(payload);
        notify(`Đã thêm món "${payload.name}" vào thực đơn quán!`);
        resetDishForm();
      }
      setDishModalOpen(false);
      setMobileDishPreviewOpen(false);
      setActiveTab('dishes');
      fetchDishes();
      fetchStats();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pho1986:menu-updated'));
      }
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setDishSaving(false);
    }
  }, [dishForm, categories, editingDish, notify, resetDishForm, fetchDishes, fetchStats]);

  const handleDeleteDish = useCallback(async (dishId) => {
    if (!window.confirm('Bạn có chắc chắn muốn chuyển món ăn này sang trạng thái Hết Hàng / Ngưng Phục Vụ?')) return;
    try {
      await adminApi.deleteDish(dishId);
      notify('Đã cập nhật trạng thái hết hàng cho món ăn!');
      fetchDishes();
      fetchStats();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pho1986:menu-updated'));
      }
    } catch (err) {
      notify(err.message, 'error');
    }
  }, [notify, fetchDishes, fetchStats]);

  const handleToggleDishAvailability = useCallback(async (dish) => {
    const newStatus = !dish.isAvailable;
    try {
      await adminApi.updateDish(dish.id, {
        categoryId: dish.category?.id || dish.categoryId || categories[0]?.id,
        name: dish.name,
        price: dish.price,
        portion: dish.portion || 'Tô thường',
        tag: dish.tag || 'Best Seller',
        tagIcon: dish.tagIcon || 'star',
        ingredients: dish.ingredients || '',
        description: dish.description || '',
        imageUrl: dish.imageUrl || '',
        isAvailable: newStatus,
        isSignature: dish.isSignature || false
      });
      notify(newStatus ? `Đã mở phục vụ lại món "${dish.name}"!` : `Đã chuyển món "${dish.name}" sang Tạm hết!`);
      fetchDishes();
      fetchStats();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pho1986:menu-updated'));
      }
    } catch (err) {
      notify(err.message, 'error');
    }
  }, [categories, notify, fetchDishes, fetchStats]);

  const dashboardPendingList = useMemo(() => {
    // Nếu đã nạp orders từ hệ thống (kể cả khi không có đơn PENDING)
    if (orders && orders.length > 0) {
      const pendingFromApi = orders.filter(o => o.status === 'PENDING');
      return pendingFromApi.map((o, idx) => ({
        id: o.id || idx + 1,
        orderCode: o.orderCode || `#PHO1986-HN-${2200 + idx}`,
        tableNumber: o.tableNumber || (idx === 0 ? 12 : idx === 1 ? 8 : 5),
        floor: o.floor || 1,
        orderType: o.orderType || (o.tableNumber ? 'DINE_IN' : 'DELIVERY'),
        guestName: o.guestName || (idx === 0 ? 'Anh Nguyễn Văn Minh' : idx === 1 ? 'Chị Trần Thị Mai' : 'Bác Lê Hoàng Long'),
        guestPhone: o.guestPhone || (idx === 0 ? '092 952 8509' : idx === 1 ? '098 765 4321' : '091 234 5678'),
        finalAmount: o.finalAmount || 150000,
        paymentMethod: o.paymentMethod || 'Thanh toán online (SEPAY)',
        orderTime: o.createdAt ? formatOrderTime(o.createdAt).ago : `${(idx + 1) * 2} phút trước`,
        items: o.items && o.items.length > 0 ? o.items : [
          { name: idx === 0 ? 'Phở bò tái lăn' : 'Phở bò tái', quantity: 2 },
          { name: idx === 0 ? 'Nước chanh' : 'Trà đá', quantity: 1 },
          { name: idx === 0 ? 'Nem rán' : 'Quẩy giòn', quantity: 1 }
        ],
        note: o.note || (idx === 0 ? 'Nước dùng trong, nhiều hành hoa' : 'Ít bánh, thêm quẩy nóng')
      }));
    }
    // Khi mới vào hoặc database hoàn toàn chưa có đơn: giữ mock data trực quan
    return DEFAULT_DASHBOARD_PENDING_ORDERS;
  }, [orders]);

  return {
    activeTab,
    setActiveTab,
    stats,
    statsLoading,
    fetchStats,
    orders,
    orderFilter,
    setOrderFilter,
    ordersLoading,
    orderSearch,
    setOrderSearch,
    orderViewMode,
    setOrderViewMode,
    dishes,
    categories,
    dishesLoading,
    dishCategoryFilter,
    setDishCategoryFilter,
    dishSearch,
    setDishSearch,
    dishViewMode,
    setDishViewMode,
    dishModalOpen,
    setDishModalOpen,
    dishSaving,
    editingDish,
    dishForm,
    setDishForm,
    notification,
    notify,
    storeOpen,
    setStoreOpen,
    soundAlertEnabled,
    setSoundAlertEnabled,
    mobileDrawerOpen,
    setMobileDrawerOpen,
    dashPendingViewMode,
    setDashPendingViewMode,
    expandedDashOrderId,
    setExpandedDashOrderId,
    expandedOrderId,
    setExpandedOrderId,
    tableExpandedOrderId,
    setTableExpandedOrderId,
    selectedOrderIds,
    setSelectedOrderIds,
    mobileDishPreviewOpen,
    setMobileDishPreviewOpen,
    showAdvancedDishFields,
    setShowAdvancedDishFields,
    fetchOrders,
    fetchDishes,
    handleUpdateOrderStatus,
    toggleSelectOrder,
    toggleSelectAllOrders,
    handleBulkUpdateStatus,
    resetDishForm,
    openCreateDish,
    openEditDish,
    handleSaveDish,
    handleDeleteDish,
    handleToggleDishAvailability,
    filteredDishes,
    filteredOrders,
    orderCounts,
    ordersShiftRevenue,
    dashboardPendingList
  };
}

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'pho1986_customer_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const openAuthModal = useCallback((tab = 'login') => {
    setAuthTab(tab);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const login = useCallback(async (phone, password) => {
    // Giả lập hoặc gọi API backend
    const mockUser = {
      id: 'usr_' + Date.now(),
      fullName: phone === '0988888888' ? 'Nguyễn Văn Hiếu' : 'Khách Quen 1986',
      phone,
      role: 'CUSTOMER',
      loyaltyAccount: {
        totalPoints: 135,
        availablePoints: 135,
        membershipTier: 'DONG',
        totalOrdersCount: 2,
        totalSpent: 170000,
      },
      tasteProfile: {
        favoriteDishName: 'Phở Bò Tái Nạm Gầu Giòn 1986',
        brothType: 'BEO_NGAY',
        onionStyle: 'HANH_TRAN',
        herbStyle: 'DU_RAU',
        spicyLevel: 2,
        crullerPref: 'QUAY_GION',
        customNote: 'Cho nhiều nước béo thơm và hành trần riêng',
      },
    };

    setUser(mockUser);
    setAuthModalOpen(false);
    return mockUser;
  }, []);

  const register = useCallback(async (phone, fullName, password, email = null, saveTasteProfile = true) => {
    const newUser = {
      id: 'usr_' + Date.now(),
      fullName: fullName || 'Thực Khách Tri Kỷ',
      phone,
      email: email || null,
      role: 'CUSTOMER',
      loyaltyAccount: {
        totalPoints: 50,
        availablePoints: 50,
        membershipTier: 'DONG',
        totalOrdersCount: 0,
        totalSpent: 0,
      },
      tasteProfile: saveTasteProfile ? {
        brothType: 'DAM_DA',
        onionStyle: 'NHIEU_HANH',
        herbStyle: 'DU_RAU',
        spicyLevel: 1,
        crullerPref: 'QUAY_GION',
        customNote: 'Chuẩn vị truyền thống 1986 (Đã lưu)',
      } : null,
    };

    setUser(newUser);
    setAuthModalOpen(false);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateTasteProfile = useCallback((newProfile) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasteProfile: {
          ...prev.tasteProfile,
          ...newProfile,
        },
      };
    });
  }, []);

  // Memoize contextValue to prevent redundant consumer re-renders
  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    authModalOpen,
    authTab,
    setAuthTab,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    logout,
    updateTasteProfile,
  }), [
    user,
    authModalOpen,
    authTab,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    logout,
    updateTasteProfile,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

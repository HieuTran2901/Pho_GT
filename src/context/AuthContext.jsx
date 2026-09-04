import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'pho1986_customer_session';
const AUTH_TOKEN_KEY = 'pho1986_access_token';

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

  // Đồng bộ session user vào localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }, [user]);

  // Kiểm tra và làm mới dữ liệu người dùng qua JWT khi mở app
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      authApi.getMe(token).then((profile) => {
        if (profile) {
          setUser(profile);
        }
      }).catch(() => {
        // Giữ phiên hiện tại nếu backend offline
      });
    }
  }, []);

  const openAuthModal = useCallback((tab = 'login') => {
    setAuthTab(tab);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const login = useCallback(async (phone, password) => {
    const data = await authApi.login({ phone, password });
    const authenticatedUser = data.user || data;
    if (data.accessToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
    }
    setUser(authenticatedUser);
    setAuthModalOpen(false);
    return authenticatedUser;
  }, []);

  const register = useCallback(async (phone, fullName, password, email = null, saveTasteProfile = true) => {
    const data = await authApi.register({
      phone,
      fullName,
      password,
      email,
      saveTasteProfile
    });
    const registeredUser = data.user || data;
    if (data.accessToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
    }
    setUser(registeredUser);
    setAuthModalOpen(false);
    return registeredUser;
  }, []);

  const logout = useCallback(async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      await authApi.logout(token);
    }
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
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

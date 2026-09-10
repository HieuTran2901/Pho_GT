import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { authApi } from '../services/authApi';
import AccountLockedNoticeModal from '../components/auth/AccountLockedNoticeModal';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'pho1986_customer_session';
const AUTH_TOKEN_KEY = 'pho1986_access_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      // [SECURITY_AGENT] Tự động dọn sạch token trần khỏi localStorage nếu còn sót lại từ trước
      localStorage.removeItem(AUTH_TOKEN_KEY);

      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id && String(parsed.id).startsWith('usr_')) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          return null;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [lockedNotice, setLockedNotice] = useState({ isOpen: false, reason: '' });
  const authModalOpenRef = useRef(authModalOpen);

  useEffect(() => {
    authModalOpenRef.current = authModalOpen;
  }, [authModalOpen]);

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // [SENTINEL & RAVEN] Lắng nghe sự kiện tài khoản bị khóa toàn cục (Session Termination)
  useEffect(() => {
    const handleAccountLocked = (e) => {
      const reason = e?.detail?.reason || 'Tài khoản của quý khách hiện đang bị khóa bởi Quản trị viên.';
      const hadActiveSession = Boolean(userRef.current || localStorage.getItem(AUTH_STORAGE_KEY));
      setUser(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);

      // [SENTINEL & RAVEN] Ép dọn sạch Cookie HttpOnly ở phía Backend ngay lập tức
      authApi.logout().catch(() => {});

      // Chỉ bật modal thông báo toàn cục khi người dùng thực sự có phiên đăng nhập VÀ KHÔNG đang ở màn hình AuthModal
      if (hadActiveSession && !authModalOpenRef.current) {
        setLockedNotice({ isOpen: true, reason });
      }
    };

    window.addEventListener('pho1986:account-locked', handleAccountLocked);
    return () => {
      window.removeEventListener('pho1986:account-locked', handleAccountLocked);
    };
  }, []);

  // Đồng bộ session user vào localStorage (Chỉ lưu profile hiển thị, KHÔNG lưu secret token)
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }, [user]);

  // Kiểm tra và làm mới dữ liệu người dùng qua HttpOnly Cookie khi mở app (Silent Refresh liền mạch)
  useEffect(() => {
    let isMounted = true;
    localStorage.removeItem(AUTH_TOKEN_KEY);

    authApi.getMe().then((profile) => {
      if (!isMounted) return;
      if (profile) {
        setUser(profile);
      } else {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }).catch((err) => {
      if (!isMounted) return;
      if (err?.status === 401 || err?.status === 403 || err?.status === 423) {
        const hadActiveSession = Boolean(localStorage.getItem(AUTH_STORAGE_KEY));
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        authApi.logout().catch(() => {});

        if (hadActiveSession && (err?.status === 423 || err?.data?.code === 'ACCOUNT_LOCKED')) {
          setLockedNotice({
            isOpen: true,
            reason: err?.data?.message || err?.message || 'Tài khoản của quý khách hiện đang bị tạm khóa.'
          });
        }
      }
    }).finally(() => {
      if (isMounted) {
        setIsInitialized(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const lastRefreshTimeRef = useRef(Date.now());

  // Hàm thực hiện Silent Refresh ngầm và đồng bộ trạng thái User
  const performSilentRefresh = useCallback(async () => {
    try {
      const refreshData = await authApi.refreshToken();
      if (refreshData?.user) {
        setUser(refreshData.user);
        lastRefreshTimeRef.current = Date.now();
        return refreshData.user;
      } else if (refreshData === null) {
        // Refresh token 7 ngày đã hết hạn hoặc bị thu hồi
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        return null;
      }
    } catch (err) {
      if (err?.status === 423 || err?.data?.code === 'ACCOUNT_LOCKED') {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setLockedNotice({
          isOpen: true,
          reason: err?.data?.message || err?.message || 'Tài khoản của quý khách hiện đang bị tạm khóa.'
        });
      }
      // Giữ phiên làm việc nếu chỉ là lỗi mạng tạm thời
      return null;
    }
  }, []);

  // [TITAN & RAVEN] Layer 1: Proactive Background Silent Refresh Heartbeat
  // Tự động gia hạn Access Token cứ mỗi 10 phút (trước mốc hết hạn 15 phút) khi người dùng đang đăng nhập
  useEffect(() => {
    if (!user) return;

    lastRefreshTimeRef.current = Date.now();

    // Chu kỳ 10 phút (600,000ms) - Token backend là 15 phút (900,000ms)
    const interval = setInterval(() => {
      performSilentRefresh();
    }, 10 * 60 * 1000);

    // Kích hoạt refresh khi người dùng quay lại tab sau một thời gian dài
    const handleVisibilityOrFocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        const timeSinceLastRefresh = Date.now() - lastRefreshTimeRef.current;
        // Nếu đã quá 9 phút kể từ lần refresh trước, refresh ngay lập tức
        if (timeSinceLastRefresh >= 9 * 60 * 1000) {
          performSilentRefresh();
        }
      }
    };

    const handleSessionExpired = () => {
      setUser(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    };

    window.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('pho1986:admin-session-expired', handleSessionExpired);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('pho1986:admin-session-expired', handleSessionExpired);
    };
  }, [user, performSilentRefresh]);

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
    // [SECURITY_AGENT] Tuân thủ chuẩn OWASP: KHÔNG lưu secret token vào localStorage!
    // Trình duyệt tự động nhận và bảo vệ accessToken trong HttpOnly Cookie.
    localStorage.removeItem(AUTH_TOKEN_KEY);
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
    // [SECURITY_AGENT] Tuân thủ chuẩn OWASP: KHÔNG lưu secret token vào localStorage!
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(registeredUser);
    setAuthModalOpen(false);
    return registeredUser;
  }, []);

  const logout = useCallback(async () => {
    // Gọi API logout để Backend đưa token vào Blacklist và xóa sạch HttpOnly Cookie
    await authApi.logout();
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
    isInitialized,
    isLoading: !isInitialized,
    authModalOpen,
    authTab,
    setAuthTab,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    logout,
    updateTasteProfile,
    refreshSession: performSilentRefresh,
  }), [
    user,
    isInitialized,
    authModalOpen,
    authTab,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    logout,
    updateTasteProfile,
    performSilentRefresh,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      <AccountLockedNoticeModal
        isOpen={lockedNotice.isOpen}
        reason={lockedNotice.reason}
        onClose={() => setLockedNotice({ isOpen: false, reason: '' })}
      />
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

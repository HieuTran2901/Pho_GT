import { useState, useEffect, useCallback } from 'react';

export function useAppRouting() {
  const [isAdminRoute, setIsAdminRoute] = useState(() => 
    typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin')
  );
  const [isMarketingRoute, setIsMarketingRoute] = useState(() => 
    typeof window !== 'undefined' && (window.location.pathname.startsWith('/marketing') || window.location.hash === '#marketing')
  );

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      setIsAdminRoute(path.startsWith('/admin') || hash === '#admin');
      setIsMarketingRoute(path.startsWith('/marketing') || hash === '#marketing');
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateToHome = useCallback(() => {
    window.history.pushState(null, '', '/');
    setIsAdminRoute(false);
    setIsMarketingRoute(false);
  }, []);

  return { isAdminRoute, isMarketingRoute, navigateToHome };
}

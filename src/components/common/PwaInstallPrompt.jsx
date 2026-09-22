import React, { useState, useEffect, useCallback } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Kiểm tra xem người dùng đã từng tắt trong phiên này chưa
    if (sessionStorage.getItem('pho1986_pwa_dismissed')) {
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    sessionStorage.setItem('pho1986_pwa_dismissed', '1');
  }, []);

  if (!isVisible) return null;

  return (
    <div
      role="banner"
      aria-label="Cài đặt ứng dụng Phở 1986"
      className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-40 max-w-sm bg-gradient-to-r from-[#2a170f] via-[#1f100a] to-[#2a170f] text-[#f7eedd] p-3.5 rounded-2xl shadow-2xl border border-[#d4af37]/40 backdrop-blur-md transition-all duration-300 transform translate-y-0"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8a1e14] to-[#591008] border border-[#d4af37]/50 flex items-center justify-center flex-shrink-0 shadow-inner">
          <Smartphone className="w-5 h-5 text-[#f6d892]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#d4af37] font-serif">Ứng Dụng Di Sản</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs font-medium text-stone-200 truncate">Cài Phở 1986 ra màn hình chính</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-gradient-to-r from-[#8a1e14] to-[#a3271b] hover:from-[#a3271b] hover:to-[#be2e20] text-[#fcf8f2] text-xs font-bold rounded-lg border border-[#d4af37]/40 shadow-sm flex items-center gap-1 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Cài đặt</span>
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Đóng thông báo"
            className="p-1 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

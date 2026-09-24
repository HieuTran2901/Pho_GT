import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './utils/deviceIdUtils'
import { AuthProvider } from './context/AuthContext'
import { OnboardingTourProvider } from './context/OnboardingTourContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <OnboardingTourProvider>
        <App />
      </OnboardingTourProvider>
    </AuthProvider>
  </React.StrictMode>,
);

// Đăng ký Service Worker hỗ trợ PWA và offline cache
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker đăng ký thành công:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker đăng ký thất bại:', err);
      });
  });
}


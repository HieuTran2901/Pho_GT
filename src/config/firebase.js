import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

/**
 * Cấu hình Firebase Client SDK cho Phở Gia Truyền 1986
 * Tự động nạp từ biến môi trường VITE_FIREBASE_*
 * Có cấu hình fallback an toàn để tránh crash app trong môi trường dev cục bộ
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyMockKeyForDevOnly1986',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'pho-viet-1986.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'pho-viet-1986',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'pho-viet-1986.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '198600000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:198600000000:web:mockappid1986'
};

// Khởi tạo Singleton Firebase App
export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Khởi tạo Firebase Auth instance
export const auth = getAuth(firebaseApp);

// Đặt ngôn ngữ hiển thị SMS / Captcha sang tiếng Việt
auth.languageCode = 'vi';

/**
 * Chuẩn hóa số điện thoại Việt Nam sang định dạng quốc tế E.164 (+84...)
 * Ví dụ: '0988 888 888' -> '+84988888888'
 */
export function formatVietnamPhoneE164(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return '+84' + digits.slice(1);
  }
  if (digits.startsWith('84')) {
    return '+' + digits;
  }
  return '+84' + digits;
}

/**
 * Khởi tạo hoặc tái sử dụng Invisible reCAPTCHA Verifier an toàn chống rò rỉ instance
 * Tránh lỗi 'Cannot read properties of null (reading then)' do xung đột vòng đời widget
 */
export async function createRecaptchaVerifier(buttonOrContainerId = 'recaptcha-container', onVerified) {
  if (typeof window === 'undefined') return null;

  // 1. Nếu verifier đã tồn tại và container vẫn còn trong DOM, tái sử dụng trực tiếp
  if (window.recaptchaVerifier) {
    return window.recaptchaVerifier;
  }

  // 2. Tìm container DOM và dọn dẹp các node iframe mồ côi nếu có
  const container = typeof buttonOrContainerId === 'string'
    ? document.getElementById(buttonOrContainerId)
    : buttonOrContainerId;

  if (container) {
    container.innerHTML = '';
  }

  // 3. Khởi tạo RecaptchaVerifier mới với container sạch
  const target = container || buttonOrContainerId;
  const verifier = new RecaptchaVerifier(auth, target, {
    size: 'invisible',
    callback: () => {
      if (typeof onVerified === 'function') onVerified();
    },
    'expired-callback': () => {
      console.warn('[FIREBASE_AUTH] reCAPTCHA hết hạn, reset verifier.');
      resetRecaptchaVerifier();
    }
  });

  // 4. Render trước để Google reCAPTCHA nạp sẵn widgetId và Promise nội bộ
  try {
    await verifier.render();
  } catch (err) {
    console.warn('[FIREBASE_AUTH] reCAPTCHA render warning:', err);
  }

  window.recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Reset reCAPTCHA khi gặp lỗi để người dùng có thể gửi lại mã ngay lập tức
 */
export function resetRecaptchaVerifier() {
  if (typeof window === 'undefined') return;
  if (window.recaptchaVerifier) {
    try {
      if (window.grecaptcha && typeof window.recaptchaVerifier._widgetId === 'number') {
        window.grecaptcha.reset(window.recaptchaVerifier._widgetId);
      } else {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } catch {
      window.recaptchaVerifier = null;
    }
  }
}

/**
 * Dọn dẹp hoàn toàn khi modal unmount
 */
export function clearRecaptchaVerifier() {
  if (typeof window === 'undefined') return;
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch {}
    window.recaptchaVerifier = null;
  }
}

export { signInWithPhoneNumber };

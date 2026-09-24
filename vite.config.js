import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

function getWindowsUserEnv(key) {
  if (process.env[key]) return process.env[key];
  if (process.platform === 'win32') {
    try {
      const output = execSync(`reg query "HKCU\\Environment" /v ${key}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      const match = output.match(new RegExp(`${key}\\s+REG_\\w+\\s+(.+)`, 'i'));
      if (match && match[1]) return match[1].trim();
    } catch {
      // Fallback nếu không có trong registry
    }
  }
  return '';
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const firebaseKeys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const defineEnv = {};
  for (const key of firebaseKeys) {
    let val = env[key] || process.env[key];
    if (!val || val.startsWith('${')) {
      val = getWindowsUserEnv(key);
    }
    if (val) {
      defineEnv[`import.meta.env.${key}`] = JSON.stringify(val);
    }
  }

  return {
    plugins: [react()],
    define: defineEnv,
    build: {
      target: 'es2020',
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-framer': ['framer-motion'],
            'vendor-icons': ['lucide-react'],
            'vendor-firebase': ['firebase/app', 'firebase/auth'],
          },
        },
      },
    },
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  };
});

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1c130d',
          wood: '#382213',
          red: '#a82c1f',
          redhover: '#8f2318',
          amber: '#e67e22',
          gold: '#f59e0b',
          cream: '#faf6f0',
          card: '#ffffff',
          accent: '#2f855a'
        }
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

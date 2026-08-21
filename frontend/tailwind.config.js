/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forge: {
          50: '#F0F1FE',
          100: '#DEE0FD',
          200: '#C4C7FC',
          300: '#9BA0F9',
          400: '#7178F6',
          500: '#5B5FEF',
          600: '#4448D9',
          700: '#373AB3',
          800: '#2C2E8E',
          900: '#1F2170',
        },
        aurora: {
          500: '#8B5CF6',
        },
        electric: {
          500: '#22D3EE',
        },
        mint: {
          500: '#34D399',
        },
        amber: {
          500: '#F59E0B',
        },
        rose: {
          500: '#F43F5E',
        },
        surface: {
          light: '#FFFFFF',
          'light-2': '#F1F3F9',
          dark: '#0F1424',
          'dark-2': '#151B2E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite linear',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
};

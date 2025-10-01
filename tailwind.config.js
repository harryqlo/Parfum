/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f4f7fc',
        primary: '#ffffff',
        secondary: '#eef2f9',
        accent: '#6366f1',
        'accent-hover': '#4f46e5',
        'text-primary': '#1f2937',
        'text-secondary': '#6b7280',
        border: '#e5e7eb',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
      },
      keyframes: {
        'toast-in': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'toast-in': 'toast-in 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.3s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pastel-blue': '#5DADE2',
        'mint-green': '#48C9B0',
        'sunshine-yellow': '#F4D03F',
        'coral-accent': '#EC7063',
        'lavender-accent': '#AF7AC5',
        'dark-slate': '#2C3E50',
        'medium-gray': '#95A5A6',
        'light-gray': '#ECF0F1',
      },
      animation: {
        'bounce-in': 'bounceIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'wave': 'wave 1.5s ease-in-out infinite',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(50px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        wave: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      animation: {
        'bounce-in': 'bounceIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(50px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0px 1px 3px rgba(0,0,0,0.1)',
        'modal': '0px 4px 8px rgba(0,0,0,0.15)',
        'fab': '0px 6px 12px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
}
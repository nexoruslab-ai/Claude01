/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Modo oscuro (default)
        dark: {
          bg: '#0a0a0f',
          bgSecondary: '#16161d',
          card: 'rgba(22, 22, 29, 0.6)',
          text: '#e8e8f0',
          textSecondary: '#a8a8b8',
        },
        // Modo claro
        light: {
          bg: '#fafafa',
          bgSecondary: '#ffffff',
          card: 'rgba(255, 255, 255, 0.7)',
          text: '#1a1a2e',
          textSecondary: '#6b6b7b',
        },
        // Acentos premium
        gold: {
          DEFAULT: '#d4af37',
          bright: '#ffd700',
          dark: '#b8941f',
        },
        silver: {
          DEFAULT: '#c0c0c0',
          bright: '#e8e8e8',
        },
        // Prioridades
        priority1: '#dc2626',
        priority2: '#ea580c',
        priority3: '#ca8a04',
        priority4: '#16a34a',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        'gradient-light': 'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 50%, #ffffff 100%)',
        'gradient-gold': 'linear-gradient(135deg, #d4af37, #ffd700)',
        'gradient-card-dark': 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(22,22,29,0.8) 100%)',
        'gradient-priority1': 'linear-gradient(90deg, #dc2626, #ef4444)',
        'gradient-priority2': 'linear-gradient(90deg, #ea580c, #fb923c)',
        'gradient-priority3': 'linear-gradient(90deg, #ca8a04, #fbbf24)',
        'gradient-priority4': 'linear-gradient(90deg, #16a34a, #22c55e)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.37)',
        'elevation-1': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'elevation-2': '0 10px 25px rgba(0, 0, 0, 0.2)',
        'elevation-3': '0 20px 50px rgba(0, 0, 0, 0.3)',
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.5)',
        'glow-silver': '0 0 20px rgba(192, 192, 192, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '20px',
      },
      borderRadius: {
        'premium': '16px',
        'button': '12px',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'bounce-soft': 'bounce-soft 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}

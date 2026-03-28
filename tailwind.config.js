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
        dark: {
          bg: '#0a0a0f',
          bgSecondary: '#16161d',
          card: 'rgba(22, 22, 29, 0.6)',
          text: '#e8e8f0',
          textSecondary: '#a8a8b8',
        },
        light: {
          bg: '#0a0a0f',
          bgSecondary: '#16161d',
          text: '#e8e8f0',
        },
        silver: {
          DEFAULT: '#c0c0c0',
          bright: '#e8e8e8',
          dark: '#a0a0a0',
          dim: '#808080',
          deep: '#606060',
          muted: '#404040',
        },
        priority1: '#e8e8e8',
        priority2: '#c0c0c0',
        priority3: '#a0a0a0',
        priority4: '#808080',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #16161d 0%, #0a0a0f 100%)',
        'gradient-silver': 'linear-gradient(135deg, #a0a0a0, #e8e8e8)',
        'gradient-silver-dim': 'linear-gradient(135deg, #606060, #a0a0a0)',
        'gradient-priority1': 'linear-gradient(90deg, #e8e8e8, #c0c0c0)',
        'gradient-priority2': 'linear-gradient(90deg, #c0c0c0, #a0a0a0)',
        'gradient-priority3': 'linear-gradient(90deg, #a0a0a0, #808080)',
        'gradient-priority4': 'linear-gradient(90deg, #808080, #606060)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.5)',
        'elevation-1': '0 4px 6px rgba(0, 0, 0, 0.2)',
        'elevation-2': '0 10px 25px rgba(0, 0, 0, 0.35)',
        'elevation-3': '0 20px 50px rgba(0, 0, 0, 0.5)',
        'glow-silver': '0 0 20px rgba(192, 192, 192, 0.2)',
        'glow-silver-lg': '0 0 40px rgba(192, 192, 192, 0.15)',
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
        'display': ['Cinzel', 'Georgia', 'serif'],
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'shimmer': 'shimmer 2.5s infinite',
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

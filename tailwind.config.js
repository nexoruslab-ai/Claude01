/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        priority1: '#dc2626',
        priority2: '#ea580c',
        priority3: '#ca8a04',
        priority4: '#16a34a',
      }
    },
  },
  plugins: [],
}

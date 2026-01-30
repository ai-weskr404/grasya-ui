/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'progress-indeterminate': 'progress-indeterminate 1.5s infinite linear',
      },
      keyframes: {
        'progress-indeterminate': {
          '0%': { left: '-100%', width: '50%' },
          '100%': { left: '100%', width: '50%' },
        }
      }
    },
  },
  plugins: [],
}
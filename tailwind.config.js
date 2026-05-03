/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Include Blueprint packages to avoid accidental purge of utility classes
    "./node_modules/@blueprintjs/core/**/*.js",
    "./node_modules/@blueprintjs/core/**/*.css",
    "./node_modules/@blueprintjs/icons/**/*.js",
    "./node_modules/@blueprintjs/icons/**/*.css",
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
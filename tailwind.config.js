/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#f8fafc',
        },
        night: {
          900: '#0c1424',
          800: '#111827',
          700: '#1a2540',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        'card-md': '0 4px 16px 0 rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        glow: '0 0 40px -10px rgb(139 92 246 / 0.35)',
      },
    },
  },
  plugins: [],
}

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
          DEFAULT: '#27272a',
          subtle: '#18181b',
          muted: '#111111',
        },
        night: {
          950: '#050505',
          900: '#0d0d0d',
          800: '#111111',
          700: '#1a1a1a',
          600: '#222222',
        },
        brand: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-md': '0 4px 16px 0 rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'card-lg': '0 10px 40px 0 rgb(0 0 0 / 0.12), 0 4px 8px -4px rgb(0 0 0 / 0.08)',
        glow: '0 0 40px -10px rgb(139 92 246 / 0.35)',
        'glow-sm': '0 0 20px -6px rgb(139 92 246 / 0.4)',
      },
      animation: {
        'fade-in':  'fadeIn 0.15s ease-out',
        'slide-up': 'slideUp 0.18s ease-out',
        'scale-in': 'scaleIn 0.18s cubic-bezier(0.16,1,0.3,1)',
        'slide-up-sm': 'slideUpSm 0.22s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.97) translateY(4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        slideUpSm: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

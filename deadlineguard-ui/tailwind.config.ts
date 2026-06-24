/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Theme variables
        'bg-base':    'var(--color-bg-base)',
        'bg-surface': 'var(--color-bg-surface)',
        'bg-card':    'var(--color-bg-card)',
        'bg-hover':   'var(--color-bg-hover)',
        'border':     'var(--color-border)',

        // Risk tier colors
        'risk-low':      { DEFAULT: '#10b981', bg: 'rgba(16,185,129,0.12)', text: '#34d399' },
        'risk-medium':   { DEFAULT: '#f59e0b', bg: 'rgba(245,158,11,0.12)', text: '#fbbf24' },
        'risk-high':     { DEFAULT: '#f97316', bg: 'rgba(249,115,22,0.12)', text: '#fb923c' },
        'risk-critical': { DEFAULT: '#ef4444', bg: 'rgba(239,68,68,0.12)',  text: '#f87171' },

        // Accent
        'accent': '#7c3aed',
        'accent-light': '#8b5cf6',

        // Text
        'text-primary':   'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted':     'var(--color-text-muted)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'slide-in-r':   'slideInRight 0.3s ease-out',
        'slide-in-up':  'slideInUp 0.25s ease-out',
        'fade-in':      'fadeIn 0.2s ease-out',
        'shimmer':      'shimmer 2s linear infinite',
      },
      keyframes: {
        slideInRight: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
        slideInUp: {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

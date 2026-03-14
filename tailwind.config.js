/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0eaff',
          200: '#c4d4ff',
          300: '#9db5ff',
          400: '#7090ff',
          500: '#4A6CF7',
          600: '#3355e8',
          700: '#2840d4',
          800: '#2234ac',
          900: '#1e2f88',
        },
        slate: {
          850: '#1a2235',
          950: '#0d1117',
        }
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        'glass-dark': 'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glass-lg': '0 20px 60px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.12)',
        'brand': '0 4px 24px rgba(74,108,247,0.35)',
        'brand-lg': '0 8px 40px rgba(74,108,247,0.45)',
      },
      animation: {
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-dot': 'pulseDot 2s infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        pulseDot: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.5, transform: 'scale(0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}

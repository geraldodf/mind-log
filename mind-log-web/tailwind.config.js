/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#060A14',
          900: '#0A0E1A',
          850: '#0C1220',
          800: '#0D1320',
          750: '#0F1826',
          700: '#111827',
          650: '#151E2E',
          600: '#1A2235',
          550: '#1C2640',
          500: '#1E2A3F',
          400: '#253050',
          300: '#2E3B5E',
          200: '#3B4D75',
          100: '#4D6190',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      backdropBlur: {
        '2xl': '40px',
        '3xl': '64px',
      },
      boxShadow: {
        'glow-indigo': '0 0 24px rgba(99, 102, 241, 0.35)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255,255,255,0.04) inset',
        'card-hover': '0 16px 48px rgba(0, 0, 0, 0.6)',
        'modal': '0 32px 80px rgba(0, 0, 0, 0.7)',
        'btn': '0 4px 12px rgba(99, 102, 241, 0.4)',
      },
      borderColor: {
        'glass': 'rgba(255, 255, 255, 0.06)',
        'glass-strong': 'rgba(255, 255, 255, 0.10)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'sidebar-glow': 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

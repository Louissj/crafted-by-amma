import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        earth: { DEFAULT: '#2D1B0E', light: '#3A2414' },
        forest: { DEFAULT: '#1A2A14', light: '#243420', dark: '#121E0E' },
        terra: { DEFAULT: '#B85C28', light: '#C46A30' },
        turmeric: { DEFAULT: '#D4942A', light: '#E0B040' },
        brass: { DEFAULT: '#B8913A', light: '#C8B44A' },
        sage: { DEFAULT: '#5A7A3A', light: '#6B8C42', dark: '#3D5A2C' },
        millet: { DEFAULT: '#8AA050', light: '#9AB060' },
        cream: { DEFAULT: '#FBF5EC', light: '#FFFEF9', warm: '#FAF3E6' },
        sand: { DEFAULT: '#E8D5B7', light: '#F0E6D0' },
        clay: { DEFAULT: '#9E6B4A' },
        jaggery: { DEFAULT: '#7A4A2A' },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['Outfit', 'sans-serif'],
        kannada: ['Noto Serif Kannada', 'serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'sway': 'sway 4s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'grind': 'grind 2s ease-in-out infinite',
        'scroll': 'scroll 35s linear infinite',
        'fade-up': 'fadeUp 0.7s ease forwards',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        sway: { '0%, 100%': { transform: 'rotate(3deg)' }, '50%': { transform: 'rotate(-3deg)' } },
        shimmer: { '0%': { left: '-100%' }, '50%': { left: '100%' }, '100%': { left: '100%' } },
        grind: { '0%, 100%': { transform: 'rotate(-8deg)' }, '25%': { transform: 'rotate(8deg)' }, '50%': { transform: 'rotate(-6deg)' }, '75%': { transform: 'rotate(10deg)' } },
        scroll: { to: { transform: 'translateX(-50%)' } },
        fadeUp: { from: { opacity: '0', transform: 'translateY(25px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 50px rgba(200,180,74,0.08)' }, '50%': { boxShadow: '0 0 70px rgba(200,180,74,0.14)' } },
      },
    },
  },
  plugins: [],
};

export default config;

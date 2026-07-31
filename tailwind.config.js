/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        base: {
          950: '#0B0F17',
          900: '#0E1320',
          850: '#101728',
          800: '#141C2E',
          700: '#1C2740',
          600: '#273349',
        },
        accent: {
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
        electric: {
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(34,211,238,0.35)',
        'glow-rose': '0 0 26px -4px rgba(244,63,94,0.45)',
        'glow-amber': '0 0 22px -4px rgba(251,191,36,0.4)',
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 10px 34px -14px rgba(0,0,0,0.65)',
        'card-light': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
};


module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        senac: {
          primary: '#015493',
          'primary-light': '#0066BB',
          'primary-dark': '#013A6B',
          secondary: '#F47920',
          'secondary-light': '#FF8C42',
          'secondary-dark': '#E85D00',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
        light: {
          background: '#F8FAFC',
          surface: '#FFFFFF',
          'surface-variant': '#F1F5F9',
          text: '#1E293B',
          'text-secondary': '#64748B',
          border: '#E2E8F0',
          disabled: '#94A3B8',
        },
        dark: {
          background: '#0F172A',
          surface: '#1E293B',
          'surface-variant': '#334155',
          text: '#F8FAFC',
          'text-secondary': '#CBD5E1',
          border: '#475569',
          disabled: '#64748B',
        }
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '50.01%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
      },
      animation: {
        flip: 'flip 2s infinite linear',
      },
    },
  },
  plugins: [],
}

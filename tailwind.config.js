/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        senac: {
          blue: '#0066CC',
          orange: '#FF6600',
          'blue-dark': '#004499',
          'orange-dark': '#CC5200',
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

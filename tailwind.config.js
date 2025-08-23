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
      }
    },
  },
  plugins: [],
}


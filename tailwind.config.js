/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        axim: {
          bg: '#111111',
          panel: '#1C1C1C',
          border: '#333333',
          text: {
            primary: '#FFFFFF',
            secondary: '#A9A9A9'
          }
        },
        power: {
          yellow: '#E8FC04',
          purple: '#7F00FF',
          green: '#44DDA0',
          red: '#FF1744'
        }
      }
    }
  },
  plugins: [],
  darkMode: 'class'
}
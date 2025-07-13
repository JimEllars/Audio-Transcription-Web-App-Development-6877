/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Foundation Colors
        axim: {
          bg: '#111111',
          panel: '#1C1C1C',
          border: '#333333',
          text: {
            primary: '#F5F5F5',
            secondary: '#A9A9A9'
          }
        },
        // Interactive Colors
        power: {
          yellow: '#E8FC04',
          purple: '#7F00FF',
          green: '#44DDA0',
          red: '#FF1744'
        }
      },
      boxShadow: {
        'neon-yellow': '0 0 15px rgba(232, 252, 4, 0.3)',
        'neon-purple': '0 0 15px rgba(127, 0, 255, 0.3)',
        'neon-green': '0 0 15px rgba(68, 221, 160, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          'from': {
            'box-shadow': '0 0 10px rgba(127, 0, 255, 0.3)',
          },
          'to': {
            'box-shadow': '0 0 20px rgba(68, 221, 160, 0.5)',
          }
        }
      },
      backgroundImage: {
        'gradient-power': 'linear-gradient(135deg, #7F00FF 0%, #44DDA0 100%)',
      }
    },
  },
  plugins: [],
}
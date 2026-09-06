/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./standalone.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        matcha: {
          light: '#E2F3CB',
          DEFAULT: '#BEE38B',
          dark: '#9AC662',
        },
        terracotta: {
          DEFAULT: '#FA6D53',
          hover: '#E5583E',
          soft: '#FDECE8',
        },
        sand: {
          50: '#FDFBF7',
          100: '#FAF5ED',
          200: '#F3ECE0',
        },
        dark: {
          DEFAULT: '#191C21',
          muted: '#5A6068',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px rgba(0, 0, 0, 0.05)',
        'card': '0 8px 24px rgba(25, 28, 33, 0.06)',
      }
    },
  },
  plugins: [],
}

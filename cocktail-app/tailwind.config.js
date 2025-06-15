// tailwind.config.js
import colors from 'tailwindcss/colors'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ...colors, // <-- belangrijk: behoudt alle standaardkleuren zoals pink-500
        'primary-pink': '#FF69B4',
        'primary-turquoise': '#00CED1',
        'primary-yellow': '#FFD700',
        'accent-green': '#39FF14',
        'deep-black': '#18122B',
      },
    },
  },
  plugins: [],
}

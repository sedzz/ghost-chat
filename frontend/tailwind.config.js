/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/ng-tw/**/*",
  ],
  theme: {
    extend: {
      colors: {
        primary: { ...colors.indigo, DEFAULT: colors.indigo[500] },
        secondary: { ...colors.pink, DEFAULT: colors.pink[500] },
        danger: { ...colors.red, DEFAULT: colors.red[500] },
      },
    },
  },
  variants: {
    extend: {
        opacity: ['disabled'],
        backgroundColor: ['disabled'],
    },
},
  plugins: [],
  
}


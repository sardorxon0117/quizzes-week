/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(0, 175, 166)",
        "primary-dark": "rgb(0, 140, 133)",
        secondary: "rgb(255, 199, 0)",
      },
      fontFamily: {
        sans: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
        DEFAULT: "0px",
      },
    },
  },
  plugins: [],
};

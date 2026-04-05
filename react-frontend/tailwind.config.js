/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#7c3aed',
        'primary-light': '#a855f7',
        'bg-dark': '#0d0f1a',
        'bg-card': '#151829',
        'bg-sidebar': '#111326',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
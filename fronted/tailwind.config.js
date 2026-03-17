/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef1ff",
          100: "#e1e6ff",
          500: "#6366f2",
          600: "#4b50e0",
          700: "#3f45c5",
          900: "#2b2f78",
        },
      },
    },
  },
  plugins: [],
}
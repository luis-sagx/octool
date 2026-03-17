/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0eeff",
          100: "#e0dbff",
          200: "#c4baff",
          300: "#a193f8",
          400: "#8272ee",
          500: "#6655e0",
          600: "#5244c8",
          700: "#3e33a0",
          800: "#2a2270",
          900: "#1a1548",
          950: "#130f24",
        },
        tomato: {
          50: "#fdf8f5", // Más cerca de un crema/hueso
          100: "#f9ede4", // Beige muy claro con matiz tomate
          200: "#f1dacc", // Tono arena suave
          300: "#e9b9a1", // Coral desaturado
          400: "#df9474", // Terracota claro
          500: "#d17352", // El tono base, ahora más orgánico
          600: "#b05d41",
          700: "#8f4b34",
        },
      },
    },
  },
  plugins: [],
}
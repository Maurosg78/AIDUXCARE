/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aidux: {
          slate: '#2C3E50',        // Azul pizarra - fondo sidebar, texto principal
          mint: '#A8E6CF',         // Verde menta suave - ficha clínica, elementos de salud
          coral: '#FF6F61',        // Coral suave - botones activos, alertas leves
          gray: '#BDC3C7',         // Gris neutro claro - campos inactivos, bordes
          bone: '#F7F7F7',         // Blanco hueso - fondo general
          teal: '#5DA5A3',         // Verde intersección - símbolo de unión, resaltes selectos
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Work Sans', 'Lato', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 
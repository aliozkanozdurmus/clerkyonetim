/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scan all JS/TS/JSX/TSX files in src
  ],
  theme: {
    extend: {
      // You can extend the default Tailwind theme here
      // For example, adding custom colors, fonts, etc.
      colors: {
        primary: '#007bff', // Example primary color
        secondary: '#6c757d', // Example secondary color
      },
      animation: {
        // Example: Adding a subtle fade-in animation
        'fade-in': 'fadeIn 0.5s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        }
      }
    },
  },
  plugins: [],
} 
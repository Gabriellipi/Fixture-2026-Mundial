/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#050816",
          900: "#0B1120",
          800: "#121A2F",
        },
        neon: {
          400: "#7CF29A",
          500: "#3CEB7B",
        },
        gold: {
          300: "#F7D67A",
          400: "#F2BF4A",
        },
      },
      boxShadow: {
        panel: "0 24px 80px rgba(5, 8, 22, 0.45)",
        glow: "0 0 0 1px rgba(124, 242, 154, 0.15), 0 20px 50px rgba(60, 235, 123, 0.15)",
      },
      fontFamily: {
        display: ["Barlow Condensed", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
      backgroundImage: {
        pitch:
          "radial-gradient(circle at top left, rgba(60,235,123,0.18), transparent 30%), radial-gradient(circle at top right, rgba(242,191,74,0.14), transparent 28%), linear-gradient(160deg, #050816 0%, #0b1120 55%, #121a2f 100%)",
      },
    },
  },
  plugins: [],
};

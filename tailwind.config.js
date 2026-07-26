/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        fondo: "#FBF3E7",
        "fondo-panel": "#FFFDF9",
        madera: "#3D2817",
        "madera-suave": "#6B4A34",
        ambar: "#C97B2E",
        "ambar-fuerte": "#A8621F",
        "ambar-suave": "#F0D9B5",
        dorado: "#E8B24D",
        "verde-botella": "#2F5233",
        "verde-suave": "#DCE8DD",
        vino: "#7A2E2E",
        "vino-suave": "#F1DCDC",
        linea: "#E7D9C4",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        cuerpo: ["Nunito", "system-ui", "-apple-system", "sans-serif"],
        datos: ["DM Mono", "Courier New", "monospace"],
      },
      borderRadius: {
        DEFAULT: "16px",
        chico: "10px",
      },
    },
  },
  plugins: [],
};

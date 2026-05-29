import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#22c55e",   // verde fitness moderno
        secondary: "#0f172a", // negro azulado (estética gym premium)
        accent: "#f97316",    // naranja energía
      },
      fontFamily: {
        gym: ["var(--font-geist-sans)"],
      },
    },
  },
  plugins: [],
};

export default config;

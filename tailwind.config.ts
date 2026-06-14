import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F8F7F5",
        ink: "#111110",
        muted: "#6B6860",
        amber: {
          DEFAULT: "#C17A2A",
          bg: "#FEF6EC",
          border: "#F0C88A",
          text: "#7A4F10",
        },
        hairline: "#e5e4e0",
      },
      fontFamily: {
        serif: ["var(--font-dm-serif)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "10px",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.85)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.2s ease-in-out infinite",
        fadeUp: "fadeUp 0.35s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;

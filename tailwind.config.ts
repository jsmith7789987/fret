import type { Config } from "tailwindcss";

/**
 * fret. design tokens.
 *
 * Two accents, kept strictly apart:
 *   action  blue, everything a person can click or submit
 *   match   amber, the match badge and the alert bar only, never a control
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ground
        canvas: "#FFFFFF",
        // Quiet band used to separate full width sections on a white page
        sand: "#F8F7F5",
        ink: "#111110",
        muted: "#6B6860",
        hairline: "#E5E4E0",

        // Action. Primary buttons, links, focus rings, active states
        action: {
          DEFAULT: "#224FF1",
          hover: "#1B3FC4",
          soft: "#EEF2FE",
          border: "#C3D0FB",
        },

        // Match signal only. Never used for a control
        match: {
          DEFAULT: "#C17A2A",
          bg: "#FEF6EC",
          border: "#F0C88A",
          text: "#7A4F10",
        },
      },
      fontFamily: {
        serif: ["var(--font-dm-serif)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "10px",
        tile: "4px",
      },
      maxWidth: {
        shell: "1680px",
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

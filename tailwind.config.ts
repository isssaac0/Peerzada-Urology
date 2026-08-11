import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "rgb(var(--color-navy) / <alpha-value>)",
          light: "rgb(var(--color-navy-light) / <alpha-value>)",
          deep: "rgb(var(--color-navy-deep) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "#FF6B35",
          light: "#FF8C61",
          dark: "#E5551F",
        },
        ink: {
          DEFAULT: "rgb(var(--color-ink) / <alpha-value>)",
          muted: "rgb(var(--color-ink-muted) / <alpha-value>)",
          faint: "rgb(var(--color-ink-faint) / <alpha-value>)",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        card: "1rem",
      },
      boxShadow: {
        glow: "0 0 60px -15px rgba(255, 107, 53, 0.35)",
      },
      backgroundImage: {
        "navy-radial":
          "radial-gradient(ellipse at top, rgb(var(--color-navy-light)) 0%, rgb(var(--color-navy)) 55%, rgb(var(--color-navy-deep)) 100%)",
      },
    },
  },
  plugins: [typography],
};

export default config;

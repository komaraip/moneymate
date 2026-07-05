import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "DM Sans Fallback", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "JetBrains Mono Fallback", "monospace"],
        display: ["Outfit", "Outfit Fallback", "system-ui", "sans-serif"],
      },
      colors: {
        app: "rgb(var(--bg-app) / <alpha-value>)",
        surface: "rgb(var(--bg-surface) / <alpha-value>)",
        "surface-hover": "rgb(var(--bg-surface-hover) / <alpha-value>)",
        subtle: "rgb(var(--border-subtle) / <alpha-value>)",
        main: "rgb(var(--text-main) / <alpha-value>)",
        muted: "rgb(var(--text-muted) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          hover: "rgb(var(--color-primary-hover) / <alpha-value>)",
        },
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        "fin-gain": "rgb(var(--fin-gain) / <alpha-value>)",
        "fin-loss": "rgb(var(--fin-loss) / <alpha-value>)",
        "fin-neutral": "rgb(var(--fin-neutral) / <alpha-value>)",
        "fin-surface": "rgb(var(--fin-surface) / <alpha-value>)",
        "fin-surface-hover": "rgb(var(--fin-surface-hover) / <alpha-value>)",
      },
    },
  },
  plugins: [],
} satisfies Config;

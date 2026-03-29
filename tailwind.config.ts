import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        surface: "hsl(var(--surface))",
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))"
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.5rem"
      },
      boxShadow: {
        glow: "0 12px 50px -24px rgba(0, 0, 0, 0.55)",
        panel: "0 16px 44px -28px rgba(22, 31, 25, 0.55)"
      },
      backgroundImage: {
        "page-gradient":
          "radial-gradient(circle at top left, rgba(125, 173, 145, 0.28), transparent 32%), radial-gradient(circle at top right, rgba(236, 198, 112, 0.22), transparent 28%), linear-gradient(180deg, rgba(248, 246, 239, 0.96), rgba(242, 238, 229, 0.96))"
      }
    }
  },
  plugins: []
};

export default config;


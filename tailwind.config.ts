import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Direct palette aliases
        "aura-light-lavender": "var(--aura-light-lavender)",
        "eye-glow-orange": "var(--eye-glow-orange)",
        "eye-flame-red": "var(--eye-flame-red)",
        "parchment-cream": "var(--parchment-cream)",
        "parchment-pale": "var(--parchment-pale)",
        "smoke-taupe": "var(--smoke-taupe)",
        "smoke-sepia": "var(--smoke-sepia)",
        "sun-warm-ochre": "var(--sun-warm-ochre)",
        "calligraphy-black": "var(--calligraphy-black)",
        // Gengar-inspired Design Palette
        gengar: {
          "ink-black": "var(--gengar-ink-black)",
          "calligraphy-black": "var(--calligraphy-black)",
          "shadow-charcoal": "var(--shadow-charcoal)",
          "tree-bark-brown": "var(--tree-bark-brown)",
          "deep-purple": "var(--gengar-deep-purple)",
          "base-purple": "var(--gengar-base-purple)",
          "mid-violet": "var(--gengar-mid-violet)",
          "bright-violet": "var(--gengar-bright-violet)",
          "aura-lavender": "var(--aura-light-lavender)",
          "eye-red": "var(--eye-flame-red)",
          "eye-orange": "var(--eye-glow-orange)",
          "accent-rust": "var(--accent-rust)",
          "parchment-cream": "var(--parchment-cream)",
          "parchment-pale": "var(--parchment-pale)",
          "sun-tan": "var(--sun-muted-tan)",
          "sun-ochre": "var(--sun-warm-ochre)",
          "sun-amber": "var(--sun-deep-amber)",
          "smoke-sepia": "var(--smoke-sepia)",
          "smoke-taupe": "var(--smoke-taupe)",
          "mist-grey": "var(--mist-grey-brown)",
        },
      },
      boxShadow: {
        "glow-violet": "0 0 25px -4px rgba(125, 89, 143, 0.45)",
        "glow-lavender": "0 0 30px -4px rgba(177, 147, 199, 0.5)",
        "glow-eye": "0 0 25px -4px rgba(234, 58, 34, 0.55)",
        "glow-orange": "0 0 25px -4px rgba(242, 97, 45, 0.55)",
        "unova-glass": "0 8px 32px 0 rgba(12, 9, 8, 0.6)",
      },
      keyframes: {
        pulseAura: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.08)" },
        },
        visorSweep: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
      },
      animation: {
        "pulse-aura": "pulseAura 3s ease-in-out infinite",
        "visor-sweep": "visorSweep 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

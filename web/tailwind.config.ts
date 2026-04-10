import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "375px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        rouge: {
          DEFAULT: "#E63946",
          dark: "#C1272D",
          light: "#FEF2F2",
          50: "#FFF5F5",
          100: "#FED7D7",
          200: "#FEB2B2",
          500: "#E63946",
          600: "#C1272D",
          700: "#9B2C2C",
        },
        vert: {
          DEFAULT: "#006B3C",
          light: "#E8F5E9",
          dark: "#004D2B",
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#006B3C",
          600: "#004D2B",
        },
        or: {
          DEFAULT: "#FCD116",
          vif: "#FFE04D",
          pale: "#FFF8E7",
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#FCD116",
          600: "#D4A90A",
        },
        terre: {
          DEFAULT: "#7C3B1E",
          light: "#A0522D",
          50: "#FDF8F6",
          500: "#7C3B1E",
        },
        sable: { DEFAULT: "#FAF7F2", 2: "#F0EDE8", 3: "#E8E5E0" },
        nuit: { DEFAULT: "#1A1A2E", light: "#2D2D44" },
        brun: "#484848",
        gris: {
          DEFAULT: "#555555",
          light: "#9CA3AF",
          lighter: "#D1D5DB",
          dark: "#374151",
        },
        blanc: "#FFFFFF",
        accent: { DEFAULT: "#6C63FF", light: "#8B83FF", dark: "#4F46E5" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        faso: "0 6px 20px rgba(0,0,0,.08)",
        card: "0 1px 3px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.04)",
        "card-hover": "0 4px 6px rgba(0,0,0,.07), 0 12px 28px rgba(0,0,0,.12)",
        sticky: "0 2px 8px rgba(0,0,0,.08)",
        modal: "0 12px 40px rgba(0,0,0,.15), 0 4px 12px rgba(0,0,0,.08)",
        glow: "0 0 20px rgba(230,57,70,.15)",
        "glow-or": "0 0 20px rgba(252,209,22,.2)",
        premium: "0 20px 60px rgba(0,0,0,.12), 0 8px 20px rgba(0,0,0,.06)",
        inner: "inset 0 2px 4px rgba(0,0,0,.06)",
      },
      borderRadius: {
        DEFAULT: "8px",
        card: "16px",
        pill: "100px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      transitionTimingFunction: {
        faso: "cubic-bezier(.4,0,.2,1)",
        bounce: "cubic-bezier(.68,-.55,.265,1.55)",
        smooth: "cubic-bezier(.25,.1,.25,1)",
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(.16,1,.3,1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        "slide-in": "slide-in 0.3s cubic-bezier(.16,1,.3,1) both",
        "slide-up": "slide-up 0.35s cubic-bezier(.16,1,.3,1) both",
        "modal-in": "modal-in 0.3s cubic-bezier(.16,1,.3,1) both",
        "scale-in": "scale-in 0.25s cubic-bezier(.16,1,.3,1) both",
        float: "float 4s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "gradient-x": "gradient-x 3s ease infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(100%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(100%)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "modal-in": {
          from: { opacity: "0", transform: "scale(0.95) translateY(10px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      height: {
        nav: "80px",
      },
      maxWidth: {
        container: "1280px",
      },
      fontSize: {
        display: [
          "4rem",
          { lineHeight: "1.05", fontWeight: "800", letterSpacing: "-0.03em" },
        ],
        "display-sm": [
          "2.5rem",
          { lineHeight: "1.1", fontWeight: "700", letterSpacing: "-0.02em" },
        ],
        "display-xs": [
          "1.875rem",
          { lineHeight: "1.15", fontWeight: "700", letterSpacing: "-0.02em" },
        ],
        "heading-1": [
          "2rem",
          { lineHeight: "1.2", fontWeight: "700", letterSpacing: "-0.02em" },
        ],
        "heading-2": [
          "1.5rem",
          { lineHeight: "1.25", fontWeight: "600", letterSpacing: "-0.01em" },
        ],
        "body-lg": ["1.125rem", { lineHeight: "1.7" }],
        "body-sm": ["0.875rem", { lineHeight: "1.6" }],
        caption: ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.02em" }],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-faso":
          "linear-gradient(135deg, #E63946 0%, #FCD116 50%, #006B3C 100%)",
        "gradient-premium": "linear-gradient(135deg, #1A1A2E 0%, #2D2D44 100%)",
        "gradient-warm": "linear-gradient(135deg, #FFF8E7 0%, #FAF7F2 100%)",
        "gradient-hero":
          "linear-gradient(180deg, rgba(26,26,46,0.7) 0%, rgba(26,26,46,0.3) 40%, rgba(26,26,46,0.8) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;

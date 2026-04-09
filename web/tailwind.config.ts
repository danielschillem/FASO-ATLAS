import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rouge: "#E63946",
        "rouge-dark": "#C1272D",
        vert: "#008751",
        "vert-light": "#E8F5E9",
        or: "#F0B429",
        "or-vif": "#FFD166",
        "or-pale": "#FFF8E7",
        terre: "#7C3B1E",
        sable: "#FAF7F2",
        "sable-2": "#F0EDE8",
        nuit: "#222222",
        brun: "#484848",
        gris: "#717171",
        "gris-light": "#B0B0B0",
        blanc: "#FFFFFF",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        faso: "0 6px 20px rgba(0,0,0,.08)",
        card: "0 1px 2px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.05)",
        "card-hover": "0 2px 4px rgba(0,0,0,.08), 0 8px 24px rgba(0,0,0,.12)",
        sticky: "0 2px 8px rgba(0,0,0,.08)",
        modal: "0 8px 28px rgba(0,0,0,.28)",
      },
      borderRadius: {
        DEFAULT: "8px",
        card: "12px",
        pill: "100px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      transitionTimingFunction: {
        faso: "cubic-bezier(.4,0,.2,1)",
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(.4,0,.2,1) both",
        "fade-in": "fade-in 0.3s ease-out both",
        "slide-in": "slide-in 0.25s cubic-bezier(.4,0,.2,1) both",
        "slide-up": "slide-up 0.3s cubic-bezier(.4,0,.2,1) both",
        "modal-in": "modal-in 0.25s cubic-bezier(.4,0,.2,1) both",
        "scale-in": "scale-in 0.2s cubic-bezier(.4,0,.2,1) both",
        float: "float 3s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
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
          from: { opacity: "0", transform: "scale(0.96) translateY(8px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      height: {
        nav: "80px",
      },
      maxWidth: {
        container: "1280px",
      },
      fontSize: {
        display: ["3.5rem", { lineHeight: "1.1", fontWeight: "800" }],
        "display-sm": ["2.25rem", { lineHeight: "1.15", fontWeight: "700" }],
      },
    },
  },
  plugins: [],
};

export default config;

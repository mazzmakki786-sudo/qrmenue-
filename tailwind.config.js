/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        urdu: ["var(--font-urdu)", "serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#000000",
          hover: "#1A1A1A",
        },
        accent: {
          DEFAULT: "#25D366",
          hover: "#1DA85C",
        },
        muted: {
          DEFAULT: "#F9FAFB",
          foreground: "#555555",
        },
        border: {
          DEFAULT: "#E8E8E8",
          strong: "#CCCCCC",
        },
        success: "#22C55E",
        error: "#EF4444",
        warning: "#D97706",
        info: "#2563EB",
        surface: { DEFAULT: "#F8F8F8", dark: "#F0F0F0" },
        "text-primary": "#111111",
        "text-secondary": "#555555",
        "text-muted": "#888888",
      },
      borderRadius: {
        card: "12px",
        button: "8px",
      },
      animation: {
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.2s ease-out",
        "scale-up": "scale-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "shimmer": "shimmer 1.5s linear infinite",
      },
      keyframes: {
        "slide-up": { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "slide-down": { "0%": { opacity: "0", transform: "translateY(-8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "scale-up": { "0%": { opacity: "0", transform: "scale(0.95)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "shimmer": { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
}

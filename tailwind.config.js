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
          DEFAULT: "#F0F0F0",
          strong: "#CCCCCC",
        },
        success: "#22C55E",
        error: "#EF4444",
        warning: "#D97706",
        info: "#2563EB",
      },
      borderRadius: {
        card: "12px",
        button: "8px",
      },
    },
  },
  plugins: [],
}

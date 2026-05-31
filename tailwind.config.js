/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        urdu: ["Noto Naskh Arabic", "serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#000000",
          hover: "#1A1A1A",
        },
        accent: {
          DEFAULT: "#FF6B35",
          hover: "#E55A25",
        },
        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#666666",
        },
        border: {
          DEFAULT: "#E5E5E5",
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

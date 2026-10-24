import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0B2D45",
        teal: "#42B7B9",
        aqua: "#EAF7F7",
        canvas: "#F5F8FA",
        ink: "#163449",
        muted: "#637786",
        line: "#DCE6EB"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(11, 45, 69, 0.08)",
        card: "0 8px 24px rgba(11, 45, 69, 0.06)"
      },
      fontFamily: { sans: ["var(--font-inter)", "Arial", "sans-serif"] }
    }
  },
  plugins: []
};

export default config;

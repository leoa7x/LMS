import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        sand: "#f6f3ed",
        copper: "#b45309",
        steel: "#334155",
      },
    },
  },
  plugins: [],
};

export default config;

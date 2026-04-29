import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#223246",
        sand: "#f4f6f8",
        copper: "#e37f3a",
        steel: "#50657f",
        navy: "#182b45",
        cyan: "#81b2d3",
        cloud: "#d4dde6",
        mist: "#ebeff3",
        success: "#2f7a4e",
        warning: "#c7922f",
        danger: "#b64545",
        info: "#2f6ea0",
      },
      fontFamily: {
        display: ['"Montserrat"', '"Segoe UI"', "Arial", "sans-serif"],
        body: ['"Open Sans"', '"Segoe UI"', "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

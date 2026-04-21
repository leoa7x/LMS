import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2a33",
        sand: "#f7f9fb",
        copper: "#b8743c",
        steel: "#44515f",
        navy: "#123b5d",
        cloud: "#d9e1e8",
        mist: "#eef3f7",
        success: "#2f7a4e",
        warning: "#c7922f",
        danger: "#b64545",
        info: "#2e6ea6",
      },
    },
  },
  plugins: [],
};

export default config;

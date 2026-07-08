import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FFF8F0",
        blush: "#FDE8E4",
        peach: "#F9C6B8",
        coral: "#F08A6C",
        terracotta: "#D96C4F",
        sage: "#A8C3A0",
        deepsage: "#5F7A5A",
        ink: "#3D3230",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;

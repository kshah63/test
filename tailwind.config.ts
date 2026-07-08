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
        // Dark enough for 4.5:1 white-text contrast (WCAG AA) on buttons.
        terracotta: "#C14A2B",
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

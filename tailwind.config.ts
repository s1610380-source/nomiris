import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nomiris: {
          bg: "#FAF6EE",
          orange: "#E8843B",
          orangeDark: "#C46A26",
          orangeLight: "#F4A86A",
          brown: "#7A4F2E",
          brownDark: "#4E3320",
          cream: "#FFF8EC",
          line: "#E9DFC8",
          textMain: "#3B2A1C",
          textSub: "#7A6B5C",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Hiragino Kaku Gothic ProN",
          "Hiragino Sans",
          "Noto Sans JP",
          "Yu Gothic",
          "Meiryo",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 6px 20px -10px rgba(122, 79, 46, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  presets: [require("@aragon/ods/tailwind.config")],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./plugins/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@aragon/ods/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "rgb(var(--ods-color-primary-50) / <alpha-value>)",
          100: "rgb(var(--ods-color-primary-100) / <alpha-value>)",
          200: "rgb(var(--ods-color-primary-200) / <alpha-value>)",
          300: "rgb(var(--ods-color-primary-300) / <alpha-value>)",
          400: "rgb(var(--ods-color-primary-400) / <alpha-value>)",
          500: "rgb(var(--ods-color-primary-500) / <alpha-value>)",
          600: "rgb(var(--ods-color-primary-600) / <alpha-value>)",
          700: "rgb(var(--ods-color-primary-700) / <alpha-value>)",
          800: "rgb(var(--ods-color-primary-800) / <alpha-value>)",
          900: "rgb(var(--ods-color-primary-900) / <alpha-value>)",
        },
      },
    },
  },
};
export default config;

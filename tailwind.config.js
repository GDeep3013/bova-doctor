/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        customBg: "#d6dee5",
        customBg2: "#3C96B5",
        customText: "var(--text-color)",
        primary: "var(--primary-color)"
      },
      fontFamily: {
        inter: "var(--theme-font)"
      },
    },
  },
  plugins: [],
};

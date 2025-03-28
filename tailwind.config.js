/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Note the addition of the `app` directory.
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        customBg: "#d6dee5",
        customBg2: "#3C96B5",
        customBg3: "#d6dee5",
        customText: "var(--text-color)",
        primary: "var(--primary-color)",
        textColor: "#898989",
        textColor2: "#373737",
        textColor3: "#52595b",
        inputBg: "#F9F9F9",
      },
      borderColor: {
        customBorder: "#b9b4b6",
      },
      fontFamily: {
        inter: "var(--theme-font)",
        fontSemibold: "var(--semibold-font)"
      },
    },
  },
  plugins: [],
};
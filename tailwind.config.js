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
        lightestBlue: '#f0faff',
        lighterBlue: '#d9f2fa',
        lightBlue: '#c2eaf5',
        blue: '#abe2f0',
        darkerBlue: '#94dae6',
        darkGray: '#333333',
        darkestBlue: '#1a3a5f',
      },
    },
  },
  plugins: [],
};

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
        primary: {
          DEFAULT: 'var(--primary-color)',
          foreground: '#ffffff',
          50: '#f4f6f9',
          100: '#e9edf2',
          200: '#c8d2df',
          300: '#a7b7cc',
          400: '#6481a5',
          500: 'var(--primary-color)',
          600: 'var(--primary-color)',
          700: 'var(--primary-color)',
          800: 'var(--primary-color)',
          900: 'var(--primary-color)',
        },
        background: '#f8fafc',
        foreground: '#0f172a',
      },
      fontFamily: {
        outfit: ['var(--font-outfit)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0f0',
          100: '#b3d1d1',
          200: '#80b3b3',
          300: '#4d9494',
          400: '#267a7a',
          500: '#006666',
          600: '#005252',
          700: '#003d3d',
          800: '#002929',
          900: '#001414',
        },
        accent: {
          50: '#e6f7f0',
          100: '#b3e8d0',
          200: '#80d9b0',
          300: '#4dc990',
          400: '#26bc78',
          500: '#00a36c',
          600: '#008255',
          700: '#006140',
          800: '#00412a',
          900: '#002015',
        },
        medical: {
          bg: '#f0f4f8',
          card: '#ffffff',
          muted: '#64748b',
          border: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

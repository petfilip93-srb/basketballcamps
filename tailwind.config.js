/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        basketball: {
          orange: '#FB923C',
          'deep-orange': '#C2410C',
          sand: '#D6D3D1',
          'dark-sand': '#A8A29E',
          cream: '#FEF7EE',
          charcoal: '#292524',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Work Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

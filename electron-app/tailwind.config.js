/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      filter: {
        'bw': 'grayscale(100%)',
        'bw-cool': 'grayscale(100%) brightness(110%) hue-rotate(180deg)',
        'bw-warm': 'grayscale(100%) brightness(110%) sepia(30%)',
        'film': 'contrast(120%) saturate(90%) sepia(10%)',
        'punch': 'contrast(150%) saturate(140%)',
      },
    },  
  },
  plugins: [require('tailwindcss-filters')],
}


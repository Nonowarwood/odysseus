/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#060d16',
        ocean: '#123047',
        gold: '#D9B441',
        ivory: '#F6F3EC',
        papyrus: '#DCCFB4',
      },
      fontFamily: {
        // Inter porte toute la structure ; Instrument Serif ne sert qu'aux
        // titres et aux citations, là où le contraste fait l'élégance.
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        title: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      transitionDuration: {
        400: '400ms',
      },
    },
  },
  plugins: [],
}

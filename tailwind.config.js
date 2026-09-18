/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        abyss: '#080808',
        titanium: '#EDEDED',
        ghost: 'rgba(237,237,237,0.08)',
      },
      fontFamily: {
        grotesk: ['"Archivo Expanded"', 'Archivo', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}

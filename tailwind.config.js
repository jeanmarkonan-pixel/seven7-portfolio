/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Résolus via CSS custom properties (voir index.css) pour supporter
        // le thème clair/sombre sans toucher chaque usage de bg-abyss/text-titanium.
        abyss: 'rgb(var(--abyss-rgb) / <alpha-value>)',
        titanium: 'rgb(var(--titanium-rgb) / <alpha-value>)',
        ghost: 'rgba(var(--titanium-rgb), 0.08)',
        accent: {
          100: '#ffedd5',
          200: '#fdba74',
          300: '#fb923c',
          400: '#f97316',
          500: '#ea580c',
        },
        cascade: {
          1: 'rgb(var(--accent-rgb) / <alpha-value>)',
          2: 'rgb(var(--accent2-rgb) / <alpha-value>)',
          3: 'rgb(var(--accent3-rgb) / <alpha-value>)',
        },
        surface: 'rgb(var(--surface-rgb) / <alpha-value>)',
        surface2: 'rgb(var(--surface2-rgb) / <alpha-value>)',
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

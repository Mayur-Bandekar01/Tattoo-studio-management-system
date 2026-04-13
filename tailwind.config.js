/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./frontend/templates/**/*.html",
    "./frontend/static/js/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cinzel', 'serif'],
      },
      colors: {
        apple: {
          bg: 'var(--bg)',
          text: 'var(--text)',
          muted: 'var(--muted)',
          card: 'var(--card-bg)',
          border: 'var(--border)',
          accent: 'var(--accent, #c8a040)',
          gold: '#c8a040',
          goldLt: '#e0b84a',
        }
      }
    },
  },
  plugins: [],
}

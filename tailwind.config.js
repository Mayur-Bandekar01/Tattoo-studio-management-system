/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./frontend/templates/**/*.html",
    "./frontend/static/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: 'var(--studio-bg)',
          surface: 'var(--studio-surface)',
          card: 'var(--studio-card)',
          sidebar: 'var(--studio-sidebar)',
          gold: 'var(--studio-gold)',
          'gold-soft': 'var(--studio-gold-soft)',
          'gold-dim': 'var(--studio-gold-dim)',
          selection: 'var(--studio-selection)',
          success: 'var(--studio-success)',
          danger: 'var(--studio-danger)',
          warning: 'var(--studio-warning)',
          info: 'var(--studio-info)',
          border: 'var(--studio-border)',
        },
        accent: 'var(--accent, var(--studio-gold))',
        text: 'var(--text, var(--studio-text-primary))',
        muted: 'var(--text-muted, var(--studio-text-muted))',
      },
      fontFamily: {
        display: ['var(--font-heading)', 'Outfit', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        tech: ['var(--font-tech)', 'Cinzel', 'serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      spacing: {
        '0.5': '0.125rem',
        // Existing Tailwind scale is usually sufficient, 
        // but we can add specific ones if missing in old utilities
      },
      borderRadius: {
        'studio': 'var(--studio-radius)',
        'studio-sm': 'var(--studio-radius-sm)',
        'studio-md': 'var(--studio-radius-md)',
      },
      boxShadow: {
        'studio': 'var(--studio-shadow)',
        'studio-glow': 'var(--studio-selection-glow)',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */

/**
 * Nenhuma cor é escrita neste arquivo.
 *
 * A fonte única da verdade são as variáveis `--ml-*` no `:root` de
 * `src/styles.scss` (e a redefinição em `html.dark`). Aqui só montamos as
 * rampas apontando para elas, no formato que o Tailwind precisa para suportar
 * modificadores de opacidade (`bg-primary-600/30`).
 *
 * Para trocar um tom do sistema, edite `src/styles.scss` — nunca este arquivo.
 */
const ramp = (name) =>
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].reduce((out, step) => {
    out[step] = `rgb(var(--ml-${name}-${step}) / <alpha-value>)`;
    return out;
  }, {});

const token = (name) => `rgb(var(--ml-${name}) / <alpha-value>)`;

module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Paleta fechada ────────────────────────────────────────────
        primary: ramp('primary'), // Ciano   — marca, ação, em progresso
        secondary: ramp('secondary'), // Violeta — destaque, gradiente da marca
        success: ramp('success'), // Esmeralda — concluído, positivo
        warning: ramp('warning'), // Âmbar   — pausado, atenção
        danger: ramp('danger'), // Rosa    — erro, destrutivo, abandonado
        neutral: ramp('neutral'), // Cinza frio — texto, bordas, fundos

        // ── Superfícies semânticas (viram claro/escuro sozinhas) ──────
        surface: {
          bg: token('surface-bg'),
          card: token('surface-card'),
          raised: token('surface-raised'),
          sunken: token('surface-sunken'),
          sidebar: token('surface-sidebar'),
          'sidebar-fg': token('surface-sidebar-fg'),
        },
        ink: {
          DEFAULT: token('ink'),
          muted: token('ink-muted'),
          subtle: token('ink-subtle'),
          invert: token('ink-invert'),
        },
        hairline: {
          DEFAULT: token('hairline'),
          strong: token('hairline-strong'),
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }], // 11px
      },

      // ── Elevação — 4 níveis, e só ─────────────────────────────────
      // O valor real vive em `--ml-shadow-*` porque no tema escuro a sombra
      // precisa ser mais funda que no claro. Card é sempre `shadow-md`.
      boxShadow: {
        sm: 'var(--ml-shadow-sm)',
        md: 'var(--ml-shadow-md)',
        lg: 'var(--ml-shadow-lg)',
        DEFAULT: 'var(--ml-shadow-md)',
        none: 'none',
      },

      // ── Bordas — escala semântica ─────────────────────────────────
      borderRadius: {
        chip: '10px', // badges, chips, tags
        control: '14px', // inputs, botões, selects
        card: '20px', // cards
        panel: '28px', // modais, containers grandes
        shell: '24px', // sidebar flutuante
        full: '9999px',
      },

      backgroundImage: {
        'grad-brand': 'linear-gradient(135deg, rgb(var(--ml-primary-500)) 0%, rgb(var(--ml-secondary-500)) 100%)',
        'grad-brand-soft':
          'linear-gradient(135deg, rgb(var(--ml-primary-500) / 0.14) 0%, rgb(var(--ml-secondary-500) / 0.14) 100%)',
        'grad-sidebar': 'var(--ml-grad-sidebar)',
        'grad-surface': 'var(--ml-grad-surface)',
        'grad-glow': 'radial-gradient(ellipse at 50% 0%, rgb(var(--ml-primary-500) / 0.16) 0%, transparent 70%)',
      },

      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in-up': 'fadeInUp 0.45s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        shimmer: 'shimmer 1.6s linear infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

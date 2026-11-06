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

        // Link: troca sozinho de tema, como as superfícies. `text-link`
        // dispensa o par `text-primary-600 dark:text-primary-400` no template
        // — par que, no claro, não alcançava o contraste mínimo.
        link: {
          DEFAULT: token('link'),
          hover: token('link-hover'),
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

      // ── Altura de controle — escala semântica ─────────────────────
      // `touch` é o mínimo de alvo de toque (WCAG 2.5.5). Botões, inputs e
      // botões de ícone saem daqui, em vez de `h-[44px]` solto no componente.
      minHeight: {
        'control-sm': '2.25rem', // 36px — controle denso, só com ponteiro por perto
        control: '2.75rem', // 44px — padrão
        'control-lg': '3.25rem', // 52px — CTA
        touch: '2.75rem', // 44px — alvo mínimo de toque
      },
      minWidth: {
        touch: '2.75rem',
      },
      height: {
        'control-sm': '2.25rem',
        control: '2.75rem',
        'control-lg': '3.25rem',
      },

      // ── Movimento — o valor vive em `--ml-dur-*` / `--ml-ease-*` ──
      transitionDuration: {
        fast: 'var(--ml-dur-fast)',
        base: 'var(--ml-dur-base)',
        slow: 'var(--ml-dur-slow)',
        enter: 'var(--ml-dur-enter)',
      },
      transitionTimingFunction: {
        enter: 'var(--ml-ease-enter)',
        exit: 'var(--ml-ease-exit)',
        inout: 'var(--ml-ease-inout)',
        spring: 'var(--ml-ease-spring)',
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

      // Duração e curva vêm dos tokens de movimento — ver `--ml-dur-*`.
      animation: {
        'fade-in': 'fadeIn var(--ml-dur-base) var(--ml-ease-enter) forwards',
        'fade-in-up': 'fadeInUp var(--ml-dur-enter) var(--ml-ease-enter) forwards',
        'scale-in': 'scaleIn var(--ml-dur-base) var(--ml-ease-spring) forwards',
        'slide-up': 'slideUp var(--ml-dur-slow) var(--ml-ease-enter) forwards',
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

export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

// Classes literais e completas — o scanner do Tailwind (JIT) só reconhece
// strings inteiras presentes no código-fonte, então nunca monte estas classes
// por interpolação (`bg-${tone}-50`). Mantenha os mapas aqui, num único lugar.

export const TONE_SOFT_CLASSES: Record<Tone, string> = {
  neutral: 'bg-neutral-100 text-neutral-600 border border-neutral-200 dark:bg-neutral-500/15 dark:text-neutral-400 dark:border-neutral-500/20',
  primary: 'bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-500/15 dark:text-primary-300 dark:border-primary-500/20',
  success: 'bg-success-50 text-success-700 border border-success-200 dark:bg-success-500/15 dark:text-success-300 dark:border-success-500/20',
  warning: 'bg-warning-50 text-warning-700 border border-warning-200 dark:bg-warning-500/15 dark:text-warning-300 dark:border-warning-500/20',
  danger: 'bg-danger-50 text-danger-700 border border-danger-200 dark:bg-danger-500/15 dark:text-danger-300 dark:border-danger-500/20',
};

export const TONE_SOLID_CLASSES: Record<Tone, string> = {
  neutral: 'bg-neutral-600 text-ink-invert',
  primary: 'bg-primary-600 text-ink-invert',
  success: 'bg-success-600 text-ink-invert',
  warning: 'bg-warning-600 text-ink-invert',
  danger: 'bg-danger-600 text-ink-invert',
};

export const TONE_ICON_CLASSES: Record<Tone, string> = {
  neutral: 'text-neutral-500 dark:text-neutral-400',
  primary: 'text-primary-600 dark:text-primary-400',
  success: 'text-success-600 dark:text-success-400',
  warning: 'text-warning-600 dark:text-warning-400',
  danger: 'text-danger-600 dark:text-danger-400',
};

export const TONE_TEXT_CLASSES: Record<Tone, string> = {
  neutral: 'text-ink-subtle',
  primary: 'text-primary-600 dark:text-primary-400',
  success: 'text-success-600 dark:text-success-400',
  warning: 'text-warning-600 dark:text-warning-400',
  danger: 'text-danger-600 dark:text-danger-400',
};

export interface ToneVisual {
  tone: Tone;
  icon: string;
}

// Mapa semântico de status — nomes dos status de sistema, ver 02-decisoes-design.md
const STATUS_VISUAL_MAP: Record<string, ToneVisual> = {
  planned: {tone: 'neutral', icon: 'fa-regular fa-clock'},
  'in progress': {tone: 'primary', icon: 'fa-solid fa-play'},
  completed: {tone: 'success', icon: 'fa-solid fa-circle-check'},
  paused: {tone: 'warning', icon: 'fa-solid fa-pause'},
  dropped: {tone: 'danger', icon: 'fa-solid fa-xmark'},
};

const DEFAULT_STATUS_VISUAL: ToneVisual = {tone: 'neutral', icon: 'fa-regular fa-circle'};

export function resolveStatusVisual(name: string | null | undefined): ToneVisual {
  if (!name) return DEFAULT_STATUS_VISUAL;
  return STATUS_VISUAL_MAP[name.trim().toLowerCase()] ?? DEFAULT_STATUS_VISUAL;
}

export type Recommendation = 'RECOMMEND' | 'NEUTRAL' | 'NOT_RECOMMEND';

const RECOMMENDATION_VISUAL_MAP: Record<Recommendation, ToneVisual> = {
  RECOMMEND: {tone: 'success', icon: 'fa-solid fa-thumbs-up'},
  NEUTRAL: {tone: 'neutral', icon: 'fa-solid fa-minus'},
  NOT_RECOMMEND: {tone: 'danger', icon: 'fa-solid fa-thumbs-down'},
};

export function resolveRecommendationVisual(value: Recommendation | null | undefined): ToneVisual {
  if (!value) return RECOMMENDATION_VISUAL_MAP.NEUTRAL;
  return RECOMMENDATION_VISUAL_MAP[value];
}

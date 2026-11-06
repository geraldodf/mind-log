import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgClass, NgIf, NgTemplateOutlet} from '@angular/common';
import {RouterLink} from '@angular/router';

export type BtnVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'soft' | 'danger' | 'danger-solid' | 'gradient' | 'sidebar';
export type BtnSize = 'sm' | 'md' | 'lg';

// Elevação no hover: sobe exatamente um nível de sombra e levanta 1px.
// `ghost` é o único sem sombra em repouso — é um controle inline, não uma peça
// elevada; ele ganha `sm` no hover para ainda responder ao mouse.
const VARIANT_CLASSES: Record<BtnVariant, string> = {
  primary: 'bg-primary-700 hover:bg-primary-800 text-ink-invert shadow-sm hover:shadow-md',
  secondary: 'bg-secondary-600 hover:bg-secondary-700 text-ink-invert shadow-sm hover:shadow-md',
  outline: 'bg-transparent border border-hairline text-ink-muted shadow-sm hover:shadow-md hover:border-hairline-strong hover:bg-surface-sunken',
  ghost: 'bg-transparent text-ink-muted hover:text-ink hover:bg-surface-sunken hover:shadow-sm',
  soft: 'bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-200 shadow-sm hover:shadow-md dark:bg-primary-500/10 dark:hover:bg-primary-500/20 dark:text-primary-400 dark:border-primary-500/20',
  danger: 'bg-danger-50 hover:bg-danger-100 text-danger-500 hover:text-danger-600 border border-danger-200 shadow-sm hover:shadow-md dark:bg-danger-500/10 dark:hover:bg-danger-500/20 dark:text-danger-400 dark:hover:text-danger-300 dark:border-danger-500/20',
  'danger-solid': 'bg-danger-600 hover:bg-danger-700 text-ink-invert shadow-sm hover:shadow-md',
  gradient: 'bg-grad-brand text-ink-invert shadow-sm hover:shadow-md hover:brightness-110',
  // CTA sobre a sidebar (escura nos dois temas): a aparência inteira vem de
  // `.sidebar-feedback-cta` em styles.scss; base e tamanho não se aplicam.
  sidebar: '',
};

const BASE_CLASSES =
  'rounded-control font-semibold inline-flex items-center justify-center ' +
  'transition-[box-shadow,transform,background-color,border-color,color] duration-base ease-inout ' +
  'hover:-translate-y-px active:translate-y-0 active:scale-95';

// A altura vem da escala semântica de controle, não de padding vertical: assim
// botão, input e select da mesma linha fecham na mesma altura, e `md`/`lg`
// respeitam o alvo mínimo de toque de 44px.
const SIZE_CLASSES: Record<BtnSize, string> = {
  sm: 'text-xs px-3 py-2 gap-2 min-h-control-sm',
  md: 'text-sm px-4 py-2 gap-2 min-h-control',
  lg: 'text-base px-6 py-3 gap-2 min-h-control-lg',
};

@Component({
  selector: 'app-btn',
  standalone: true,
  imports: [NgClass, NgIf, NgTemplateOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      *ngIf="routerLink; else buttonTpl"
      [routerLink]="routerLink"
      [class]="baseClasses"
      [ngClass]="[variantClass, sizeClass, fullWidth ? 'w-full' : '']"
      [class.pointer-events-none]="disabled"
      [class.opacity-40]="disabled"
    >
      <ng-container *ngTemplateOutlet="content"></ng-container>
    </a>
    <ng-template #buttonTpl>
      <button
        [type]="type"
        [disabled]="disabled || loading"
        [attr.aria-pressed]="pressed"
        [attr.aria-busy]="loading ? 'true' : null"
        [attr.aria-label]="ariaLabel || null"
        [class]="baseClasses + ' disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none'"
        [ngClass]="[variantClass, sizeClass, fullWidth ? 'w-full' : '']"
      >
        <ng-container *ngTemplateOutlet="content"></ng-container>
      </button>
    </ng-template>
    <ng-template #content>
      <i *ngIf="loading" class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
      <i *ngIf="!loading && icon && iconPosition === 'left'" [class]="icon" aria-hidden="true"></i>
      <ng-content></ng-content>
      <i *ngIf="!loading && icon && iconPosition === 'right'" [class]="icon" aria-hidden="true"></i>
    </ng-template>
  `,
})
export class BtnComponent {
  @Input() variant: BtnVariant = 'primary';
  @Input() size: BtnSize = 'md';
  @Input() icon?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() routerLink?: string | any[];
  /** Botão que age como alternador num grupo: emite `aria-pressed`. */
  @Input() pressed: boolean | null = null;
  @Input() ariaLabel = '';

  get baseClasses(): string {
    return this.variant === 'sidebar' ? 'sidebar-feedback-cta' : BASE_CLASSES;
  }

  get variantClass(): string {
    return VARIANT_CLASSES[this.variant];
  }

  get sizeClass(): string {
    return this.variant === 'sidebar' ? '' : SIZE_CLASSES[this.size];
  }
}

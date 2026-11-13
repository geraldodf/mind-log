import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgClass, NgIf, NgTemplateOutlet} from '@angular/common';
import {RouterLink} from '@angular/router';
import {IconComponent, IconName} from '../icon/icon.component';

export type BtnVariant = 'primary' | 'secondary' | 'danger' | 'danger-solid' | 'gradient' | 'sidebar';
export type BtnSize = 'sm' | 'md' | 'lg';

// Toda variante tem corpo e se destaca do fundo; nenhuma usa borda como
// visual (o anel de foco é estado, não desenho). Texto sobre preenchimento
// usa o degrau -700, que passa de 4,5:1. Hover sobe um nível de sombra.
const VARIANT_CLASSES: Record<BtnVariant, string> = {
  primary: 'bg-primary-700 hover:bg-primary-800 text-ink-invert shadow-sm hover:shadow-md',
  // Ação secundária: preenchimento suave da marca (ex.: Cancelar, Editar).
  secondary: 'bg-primary-50 hover:bg-primary-100 text-primary-700 shadow-sm hover:shadow-md ' +
    'dark:bg-primary-500/15 dark:hover:bg-primary-500/25 dark:text-primary-200',
  // Destrutiva fora de diálogo: suave; sólida só na confirmação.
  danger: 'bg-danger-50 hover:bg-danger-100 text-danger-700 shadow-sm hover:shadow-md ' +
    'dark:bg-danger-500/15 dark:hover:bg-danger-500/25 dark:text-danger-300',
  'danger-solid': 'bg-danger-700 hover:bg-danger-800 text-ink-invert shadow-sm hover:shadow-md',
  // CTA de destaque: gradiente da marca nos degraus que carregam texto branco.
  gradient: 'bg-grad-brand-strong text-ink-invert shadow-sm hover:shadow-md hover:brightness-110',
  // CTA sobre a sidebar (escura nos dois temas): a aparência inteira vem de
  // `.sidebar-feedback-cta` em styles.scss; base e tamanho não se aplicam.
  sidebar: '',
};

const BASE_CLASSES =
  'rounded-control font-semibold inline-flex items-center justify-center ' +
  'transition-[box-shadow,transform,background-color,border-color,color] duration-base ease-inout ' +
  'hover:-translate-y-px active:translate-y-0 active:scale-press ' +
  'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-bg';

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
  imports: [IconComponent, NgClass, NgIf, NgTemplateOutlet, RouterLink],
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
      <app-icon name="spinner" [spin]="true" *ngIf="loading"></app-icon>
      <app-icon *ngIf="!loading && icon && iconPosition === 'left'" [name]="icon"></app-icon>
      <ng-content></ng-content>
      <app-icon *ngIf="!loading && icon && iconPosition === 'right'" [name]="icon"></app-icon>
    </ng-template>
  `,
})
export class BtnComponent {
  @Input() variant: BtnVariant = 'primary';
  @Input() size: BtnSize = 'md';
  @Input() icon?: IconName;
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

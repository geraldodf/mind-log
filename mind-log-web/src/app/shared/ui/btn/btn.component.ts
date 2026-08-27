import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgClass, NgIf, NgTemplateOutlet} from '@angular/common';
import {RouterLink} from '@angular/router';

export type BtnVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
export type BtnSize = 'sm' | 'md' | 'lg';

// Elevação no hover: sobe exatamente um nível de sombra e levanta 1px.
// `ghost` é o único sem sombra em repouso — é um controle inline, não uma peça
// elevada; ele ganha `sm` no hover para ainda responder ao mouse.
const VARIANT_CLASSES: Record<BtnVariant, string> = {
  primary: 'bg-primary-600 hover:bg-primary-500 text-ink-invert shadow-sm hover:shadow-md',
  secondary: 'bg-secondary-600 hover:bg-secondary-500 text-ink-invert shadow-sm hover:shadow-md',
  outline: 'bg-transparent border border-hairline text-ink-muted shadow-sm hover:shadow-md hover:border-hairline-strong hover:bg-surface-sunken',
  ghost: 'bg-transparent text-ink-muted hover:text-ink hover:bg-surface-sunken hover:shadow-sm',
  danger: 'bg-danger-50 hover:bg-danger-100 text-danger-500 hover:text-danger-600 border border-danger-200 shadow-sm hover:shadow-md dark:bg-danger-500/10 dark:hover:bg-danger-500/20 dark:text-danger-400 dark:hover:text-danger-300 dark:border-danger-500/20',
  gradient: 'bg-grad-brand text-ink-invert shadow-sm hover:shadow-md hover:brightness-110',
};

const BASE_CLASSES =
  'rounded-control font-semibold inline-flex items-center justify-center ' +
  'transition-[box-shadow,transform,background-color,border-color,color] duration-200 ' +
  'hover:-translate-y-px active:translate-y-0 active:scale-95';

const SIZE_CLASSES: Record<BtnSize, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-5 py-3 gap-2.5',
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
        [class]="baseClasses + ' disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none'"
        [ngClass]="[variantClass, sizeClass, fullWidth ? 'w-full' : '']"
      >
        <ng-container *ngTemplateOutlet="content"></ng-container>
      </button>
    </ng-template>
    <ng-template #content>
      <i *ngIf="loading" class="fa-solid fa-spinner fa-spin"></i>
      <i *ngIf="!loading && icon && iconPosition === 'left'" [class]="icon"></i>
      <ng-content></ng-content>
      <i *ngIf="!loading && icon && iconPosition === 'right'" [class]="icon"></i>
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

  protected readonly baseClasses = BASE_CLASSES;

  get variantClass(): string {
    return VARIANT_CLASSES[this.variant];
  }

  get sizeClass(): string {
    return SIZE_CLASSES[this.size];
  }
}
